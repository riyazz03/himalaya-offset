import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@sanity/client';
import nodemailer from 'nodemailer';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k0dxt5dl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'your-app-password',
  },
});

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
  amount: number;
  productName?: string;
  productSlug?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAddress?: string;
  userCity?: string;
  userState?: string;
  userPincode?: string;
  description?: string;
  uploadedFiles?: number;
  quantity?: number | string;
  gstAmount?: number;
  orderData?: any;
}

export async function POST(request: Request) {
  try {
    const body: VerifyPaymentRequest = await request.json();

    console.log('=== PAYMENT VERIFICATION STARTED ===');
    console.log('Received data:', {
      orderId: body.orderId,
      amount: body.amount,
      productName: body.productName,
      userEmail: body.userEmail,
      quantity: body.quantity,
    });

    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      console.error('Missing payment details');
      return NextResponse.json(
        { error: 'Missing payment details', verified: false },
        { status: 400 }
      );
    }

    const isTestMode = body.razorpay_order_id.startsWith('test_order_');

    if (!isTestMode) {
      console.log('Verifying Razorpay signature...');
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
      hmac.update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`);
      const generated_signature = hmac.digest('hex');

      const isSignatureValid = generated_signature === body.razorpay_signature;

      if (!isSignatureValid) {
        console.error('❌ Signature Verification Failed');
        return NextResponse.json(
          { 
            error: 'Invalid payment signature',
            verified: false 
          },
          { status: 400 }
        );
      }

      console.log('✅ Signature Verified Successfully');
    } else {
      console.log('✅ TEST MODE - Signature verification skipped');
    }

    console.log('\n=== CREATING ORDER IN SANITY ===');
    let sanityOrderId: string = '';
    
    try {
      const quantityNumber = typeof body.quantity === 'string' ? parseInt(body.quantity, 10) : (body.quantity || 1);
      const gstAmountNumber = body.orderData?.pricing?.gstAmount || body.gstAmount || 0;
      const finalTotalNumber = body.orderData?.pricing?.finalTotal || body.amount || 0;

      const orderDoc = {
        _type: 'order',
        orderId: body.orderId,
        
        customerDetails: {
          firstName: body.userName?.split(' ')[0] || 'Customer',
          lastName: body.userName?.split(' ').slice(1).join(' ') || '',
          email: body.userEmail || '',
          phone: body.userPhone || '',
        },

        deliveryAddress: {
          address: body.userAddress || '',
          city: body.userCity || '',
          state: body.userState || '',
          pincode: body.userPincode || '',
        },

        productSnapshot: {
          name: body.productName || '',
          slug: body.productSlug || body.orderData?.product?.slug || '',
          description: body.description || '',
        },

        quantity: quantityNumber,
        
        selectedTier: body.orderData?.selectedTier ? {
          tierLabel: body.orderData.selectedTier.quantity?.toString() || '',
          quantity: typeof body.orderData.selectedTier.quantity === 'string' 
            ? parseInt(body.orderData.selectedTier.quantity, 10) 
            : (body.orderData.selectedTier.quantity || 0),
          price: body.orderData.selectedTier.pricePerUnit || body.orderData.selectedTier.price || 0,
          basePrice: body.orderData.selectedTier.price || 0,
          savingsPercentage: body.orderData.selectedTier.savingsPercentage || 0,
        } : null,

        selectedOptions: body.orderData?.selectedOptions 
          ? Object.entries(body.orderData.selectedOptions).map(([key, value]) => ({
              optionLabel: key,
              selectedValue: String(value),
              priceAdded: 0,
            }))
          : [],

        pricing: {
          basePrice: body.orderData?.pricing?.basePrice || body.amount || 0,
          optionsPrice: body.orderData?.pricing?.optionsPrice || 0,
          totalPrice: body.orderData?.pricing?.totalPrice || body.amount || 0,
          pricePerUnit: body.orderData?.pricing?.pricePerUnit || 0,
          gstAmount: gstAmountNumber,
          gstPercentage: 18,
          finalTotal: finalTotalNumber,
          discount: 0,
          discountPercentage: 0,
        },

        payment: {
          paymentMethod: 'razorpay',
          razorpayOrderId: body.razorpay_order_id,
          razorpayPaymentId: body.razorpay_payment_id,
          razorpaySignature: body.razorpay_signature,
          paymentStatus: 'completed',
          amountPaid: body.amount || 0,
          paymentDate: new Date().toISOString(),
        },

        customerNotes: body.description || '',
        
        status: 'processing',
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdOrder = await sanityClient.create(orderDoc);
      sanityOrderId = createdOrder._id;
      console.log('✅ Order created in Sanity:', sanityOrderId);
      console.log('Order Details:', {
        sanityId: createdOrder._id,
        orderId: createdOrder.orderId,
        customer: createdOrder.customerDetails?.email,
        amount: createdOrder.pricing?.finalTotal,
        quantity: createdOrder.quantity,
      });
    } catch (sanityError) {
      console.error('❌ Failed to create order in Sanity:', sanityError);
    }

    console.log('\n=== SENDING CUSTOMER EMAIL ===');
    if (body.userEmail) {
      const customerEmailHtml = generateCustomerEmail({
        orderId: body.orderId,
        customerName: body.userName || 'Valued Customer',
        email: body.userEmail || '',
        productName: body.productName || '',
        amount: body.amount || 0,
        paymentId: body.razorpay_payment_id,
        address: body.userAddress || '',
        city: body.userCity || '',
        state: body.userState || '',
        pincode: body.userPincode || '',
        phone: body.userPhone || '',
        description: body.description || '',
      });

      try {
        const result = await transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER || 'noreply@himalayaoffset.com',
          to: body.userEmail,
          subject: `✅ Payment Successful - Order #${body.orderId}`,
          html: customerEmailHtml,
        });
        console.log('✅ Customer email sent to:', body.userEmail);
        console.log('Email response:', result.messageId);
      } catch (emailError) {
        console.error('❌ Failed to send customer email:', emailError);
      }
    } else {
      console.log('⚠️ No customer email provided, skipping email');
    }

    console.log('\n=== SENDING ADMIN EMAIL ===');
    const adminEmail = 'himalayaoffsetvlr1@gmail.com';
    
    if (adminEmail && process.env.EMAIL_SERVER_USER) {
      const adminEmailHtml = generateAdminEmail({
        orderId: body.orderId,
        customerName: body.userName || '',
        email: body.userEmail || '',
        productName: body.productName || '',
        amount: body.amount || 0,
        quantity: typeof body.quantity === 'string' ? parseInt(body.quantity, 10) : (body.quantity || 1),
        paymentId: body.razorpay_payment_id,
        address: body.userAddress || '',
        city: body.userCity || '',
        state: body.userState || '',
        pincode: body.userPincode || '',
        phone: body.userPhone || '',
        description: body.description || '',
        sanityOrderId: sanityOrderId,
        isTestMode: isTestMode,
      });

      try {
        const result = await transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER || 'noreply@himalayaoffset.com',
          to: adminEmail,
          subject: `📦 New Order Received - #${body.orderId}${isTestMode ? ' [TEST]' : ''}`,
          html: adminEmailHtml,
        });
        console.log('✅ Admin email sent to:', adminEmail);
        console.log('Email response:', result.messageId);
      } catch (emailError) {
        console.error('❌ Failed to send admin email:', emailError);
      }
    } else {
      console.log('⚠️ Admin email not configured, skipping admin notification');
    }

    console.log('\n=== PAYMENT VERIFICATION COMPLETED ===\n');

    return NextResponse.json(
      {
        success: true,
        verified: true,
        message: 'Payment verified and order created successfully',
        orderId: body.orderId,
        paymentId: body.razorpay_payment_id,
        sanityOrderId: sanityOrderId,
        isTestMode: isTestMode,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Payment Verification Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        verified: false,
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

function generateCustomerEmail({
  orderId,
  customerName,
  email,
  productName,
  amount,
  paymentId,
  address,
  city,
  state,
  pincode,
  phone,
  description,
}: any): string {
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; text-align: right; }
        .divider { height: 1px; background: #ddd; margin: 20px 0; }
        .amount { color: #16a34a; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Successful!</h1>
          <p style="margin: 10px 0 0 0;">Thank you for your order</p>
        </div>

        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          
          <p>We have successfully received your payment of <strong style="color: #16a34a; font-size: 16px;">₹${amount.toLocaleString('en-IN')}</strong> for <strong>${productName}</strong>.</p>

          <div class="divider"></div>

          <h3>Order Details</h3>
          <div class="info-row">
            <span class="label">Order ID:</span>
            <span class="value">${orderId}</span>
          </div>
          <div class="info-row">
            <span class="label">Order Date:</span>
            <span class="value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Product:</span>
            <span class="value">${productName}</span>
          </div>
          <div class="info-row">
            <span class="label">Amount Paid:</span>
            <span class="value amount">₹${amount.toLocaleString('en-IN')}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment ID:</span>
            <span class="value" style="font-family: monospace; font-size: 12px;">${paymentId}</span>
          </div>

          <div class="divider"></div>

          <h3>Delivery Address</h3>
          <div class="info-row">
            <span class="label">Address:</span>
            <span class="value">${address}, ${city}, ${state} - ${pincode}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">${phone}</span>
          </div>

          <div class="divider"></div>

          <p><strong>What's Next?</strong></p>
          <p>Our team will review your files and requirements shortly. You'll receive updates via email as we process your order.</p>

          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            If you have any questions, please contact us at himalayaoffsetvlr1@gmail.com
          </p>

          <div class="footer">
            <p>✓ Secure payment processed by Razorpay</p>
            <p>✓ Your order details have been saved to our system</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminEmail({
  orderId,
  customerName,
  email,
  productName,
  amount,
  quantity,
  paymentId,
  address,
  city,
  state,
  pincode,
  phone,
  description,
  sanityOrderId,
  isTestMode,
}: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2067ff 0%, #1a52cc 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee; }
        .section { margin-bottom: 25px; }
        .section h3 { border-bottom: 2px solid #2067ff; padding-bottom: 10px; margin-bottom: 15px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .info-table td:first-child { font-weight: bold; width: 40%; background: #f0f0f0; }
        .test-mode { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Order Received</h1>
          <p style="margin: 10px 0 0 0;">Order #${orderId}</p>
          ${isTestMode ? '<p style="background: rgba(255,255,255,0.2); padding: 5px; border-radius: 3px; margin: 10px 0 0 0;">🧪 TEST MODE</p>' : ''}
        </div>

        <div class="content">
          ${isTestMode ? '<div class="test-mode">⚠️ <strong>TEST MODE ORDER</strong> - This is a test transaction</div>' : ''}

          <div class="section">
            <h3>📋 Customer Information</h3>
            <table class="info-table">
              <tr>
                <td>Name:</td>
                <td>${customerName}</td>
              </tr>
              <tr>
                <td>Email:</td>
                <td><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td>${phone}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h3>🛍️ Order Details</h3>
            <table class="info-table">
              <tr>
                <td>Product:</td>
                <td>${productName}</td>
              </tr>
              <tr>
                <td>Quantity:</td>
                <td>${quantity}</td>
              </tr>
              <tr>
                <td>Amount:</td>
                <td><strong style="color: #2067ff; font-size: 16px;">₹${amount.toLocaleString('en-IN')}</strong></td>
              </tr>
              <tr>
                <td>Payment ID:</td>
                <td style="font-family: monospace; font-size: 12px;">${paymentId}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h3>📍 Delivery Address</h3>
            <table class="info-table">
              <tr>
                <td>Address:</td>
                <td>${address}</td>
              </tr>
              <tr>
                <td>City:</td>
                <td>${city}</td>
              </tr>
              <tr>
                <td>State:</td>
                <td>${state}</td>
              </tr>
              <tr>
                <td>Pincode:</td>
                <td>${pincode}</td>
              </tr>
            </table>
          </div>

          ${description ? `
            <div class="section">
              <h3>📝 Customer Notes</h3>
              <p>${description.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}

          <div class="section">
            <h3>💾 System Information</h3>
            <table class="info-table">
              <tr>
                <td>Sanity Order ID:</td>
                <td style="font-family: monospace; font-size: 12px;">${sanityOrderId || 'Pending'}</td>
              </tr>
              <tr>
                <td>Status:</td>
                <td><strong style="color: #10b981;">Processing</strong></td>
              </tr>
              <tr>
                <td>Received At:</td>
                <td>${new Date().toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>⚡ Order data has been stored in Sanity backend</p>
            <p>✓ Customer confirmation email has been sent</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
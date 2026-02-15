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
    console.log('Verifying payment for order:', body.orderId);

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

      console.log('✅ Signature Verified');
    } else {
      console.log('✅ TEST MODE');
    }

    console.log('\n=== UPDATING ORDER WITH PAYMENT DETAILS ===');
    let sanityOrderId: string = '';
    
    try {
      // Find existing order
      const existingOrder = await sanityClient.fetch(
        `*[_type == "order" && orderId == $orderId][0]`,
        { orderId: body.orderId }
      );

      if (existingOrder) {
        console.log('✅ Found existing order:', existingOrder._id);
        sanityOrderId = existingOrder._id;

        // ✅ Update order with payment details
        const updatedOrder = await sanityClient
          .patch(sanityOrderId)
          .set({
            status: 'processing',
            payment: {
              paymentMethod: 'razorpay',
              razorpayOrderId: body.razorpay_order_id,
              razorpayPaymentId: body.razorpay_payment_id,
              razorpaySignature: body.razorpay_signature,
              paymentStatus: 'completed',
              amountPaid: body.amount || 0,
              paymentDate: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          })
          .commit();

        console.log('✅ Order updated with payment details!');
        console.log('✅ Files preserved from original order!');
        console.log('Order Details:', {
          orderId: updatedOrder.orderId,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.payment?.paymentStatus,
          filesCount: updatedOrder.designFiles?.length || 0,
        });
      } else {
        console.error(`❌ Order ${body.orderId} not found`);
        throw new Error(`Order ${body.orderId} not found`);
      }
    } catch (sanityError) {
      console.error('❌ Error updating order:', sanityError);
      throw sanityError;
    }

    console.log('\n=== SENDING EMAILS ===');
    
    // Send customer email
    if (body.userEmail) {
      const customerEmailHtml = generateCustomerEmail({
        orderId: body.orderId,
        customerName: body.userName || 'Valued Customer',
        email: body.userEmail || '',
        productName: body.productName || '',
        amount: body.amount || 0,
        paymentId: body.razorpay_payment_id,
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER || 'noreply@himalayaoffset.com',
          to: body.userEmail,
          subject: `✅ Payment Successful - Order #${body.orderId}`,
          html: customerEmailHtml,
        });
        console.log('✅ Customer email sent');
      } catch (emailError) {
        console.error('❌ Failed to send customer email:', emailError);
      }
    }

    // Send admin email
    const adminEmail = 'himalayaoffsetvlr1@gmail.com';
    if (adminEmail && process.env.EMAIL_SERVER_USER) {
      const adminEmailHtml = generateAdminEmail({
        orderId: body.orderId,
        customerName: body.userName || '',
        email: body.userEmail || '',
        productName: body.productName || '',
        amount: body.amount || 0,
        paymentId: body.razorpay_payment_id,
        sanityOrderId: sanityOrderId,
        isTestMode: isTestMode,
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER || 'noreply@himalayaoffset.com',
          to: adminEmail,
          subject: `📦 New Order Received - #${body.orderId}${isTestMode ? ' [TEST]' : ''}`,
          html: adminEmailHtml,
        });
        console.log('✅ Admin email sent');
      } catch (emailError) {
        console.error('❌ Failed to send admin email:', emailError);
      }
    }

    console.log('\n=== PAYMENT VERIFICATION COMPLETED ===\n');

    return NextResponse.json(
      {
        success: true,
        verified: true,
        message: 'Payment verified successfully',
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
        .label { font-weight: bold; color: #666; }
        .value { color: #333; text-align: right; }
        .divider { height: 1px; background: #ddd; margin: 20px 0; }
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
            <span class="value" style="color: #16a34a; font-weight: bold;">₹${amount.toLocaleString('en-IN')}</span>
          </div>

          <div class="divider"></div>

          <p><strong>What's Next?</strong></p>
          <p>Our team will review your files and requirements shortly. You'll receive updates via email as we process your order.</p>

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
  paymentId,
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
            <h3>💾 System Information</h3>
            <table class="info-table">
              <tr>
                <td>Sanity Order ID:</td>
                <td style="font-family: monospace; font-size: 12px;">${sanityOrderId}</td>
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
            <p>⚡ Order updated with payment details</p>
            <p>✓ All files preserved</p>
            <p>✓ Customer confirmation email sent</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
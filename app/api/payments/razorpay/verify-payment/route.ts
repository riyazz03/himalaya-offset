import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@sanity/client';
import nodemailer from 'nodemailer';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
  amount: number;
  productName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAddress?: string;
  userCity?: string;
  userState?: string;
  userPincode?: string;
  description?: string;
  uploadedFiles?: number;
}

export async function POST(request: Request) {
  try {
    const body: VerifyPaymentRequest = await request.json();

    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details', verified: false },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    const isSignatureValid = generated_signature === body.razorpay_signature;

    if (!isSignatureValid) {
      console.error('Signature Verification Failed');
      return NextResponse.json(
        { 
          error: 'Invalid payment signature',
          verified: false 
        },
        { status: 400 }
      );
    }

    console.log('✅ Payment Signature Verified Successfully');

    // Update order with payment details in Sanity
    console.log('Updating order in Sanity with payment details...');
    let sanityOrderId: string = '';
    
    try {
      // Find the order by orderId and update it with payment info
      const query = `*[_type == "order" && orderId == $orderId][0]._id`;
      const existingOrderId = await sanityClient.fetch(query, { orderId: body.orderId });

      if (existingOrderId) {
        // Update existing order with payment details
        const updatedOrder = await sanityClient
          .patch(existingOrderId)
          .set({
            'payment.razorpayOrderId': body.razorpay_order_id,
            'payment.razorpayPaymentId': body.razorpay_payment_id,
            'payment.razorpaySignature': body.razorpay_signature,
            'payment.paymentStatus': 'completed',
            'payment.amountPaid': body.amount,
            'payment.paymentDate': new Date().toISOString(),
            'status': 'processing', // Change order status to processing
            'updatedAt': new Date().toISOString(),
          })
          .commit();

        sanityOrderId = updatedOrder._id;
        console.log('✅ Order updated in Sanity:', sanityOrderId);
      } else {
        console.warn('⚠️ Order not found in Sanity with orderId:', body.orderId);
      }
    } catch (sanityError) {
      console.error('⚠️ Failed to update order in Sanity:', sanityError);
    }

    // Send admin email
    console.log('Sending admin email...');
    const adminEmail = process.env.ADMIN_EMAIL || 'himalayaoffsetvlr1@gmail.com';

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2067ff 0%, #1a52cc 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">💰 Payment Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${body.orderId}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          
          <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #2067ff; padding-bottom: 10px;">Payment Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: white;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600; width: 40%;"><strong>Razorpay Order ID:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a; font-family: monospace; background: #f0f4f8;">${body.razorpay_order_id}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Razorpay Payment ID:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a; font-family: monospace; background: #f0f4f8;">${body.razorpay_payment_id}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Amount:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;"><strong style="color: #2067ff; font-size: 18px;">₹${body.amount.toLocaleString('en-IN')}</strong></td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Status:</strong></td>
              <td style="padding: 12px 8px;"><span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-weight: 600;">✓ PAID</span></td>
            </tr>
          </table>

          <h2 style="color: #1a1a1a; border-bottom: 2px solid #2067ff; padding-bottom: 10px;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: white;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600; width: 40%;"><strong>Name:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;">${body.userName || 'N/A'}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Email:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;"><a href="mailto:${body.userEmail}" style="color: #2067ff; text-decoration: none;">${body.userEmail || 'N/A'}</a></td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Phone:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;">${body.userPhone || 'N/A'}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Address:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;">${body.userAddress || 'N/A'}, ${body.userCity || ''}, ${body.userState || ''} - ${body.userPincode || ''}</td>
            </tr>
          </table>

          <h2 style="color: #1a1a1a; border-bottom: 2px solid #2067ff; padding-bottom: 10px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: white;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600; width: 40%;"><strong>Product:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;">${body.productName || 'N/A'}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;"><strong>Files Uploaded:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a;">${body.uploadedFiles || 0} file(s)</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px 8px; color: #6b7280; font-weight: 600; vertical-align: top;"><strong>Description:</strong></td>
              <td style="padding: 12px 8px; color: #1a1a1a; max-width: 400px; word-wrap: break-word;">
                ${(body.description || 'No description provided').replace(/\n/g, '<br />')}
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `✅ Payment Received - Order #${body.orderId}`,
        html: adminEmailHtml,
      });
      console.log('✅ Admin email sent successfully');
    } catch (emailError) {
      console.warn('⚠️ Failed to send admin email:', emailError);
    }

    // Send customer confirmation email
    console.log('Sending customer confirmation email...');
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2067ff 0%, #1a52cc 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✅ Payment Successful!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your order</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <p style="color: #1a1a1a; font-size: 16px; margin-top: 0;">Hi <strong>${body.userName || 'Valued Customer'}</strong>,</p>
          
          <p style="color: #6b7280; line-height: 1.6;">
            We have successfully received your payment of <strong style="color: #2067ff;">₹${body.amount.toLocaleString('en-IN')}</strong> for <strong>${body.productName || 'your order'}</strong>. 
            Our team will review your files and requirements shortly.
          </p>

          <div style="background: white; padding: 20px; border-radius: 6px; margin-top: 20px; border: 2px solid #2067ff;">
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">📋 Order Details</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order ID:</td>
                <td style="padding: 8px 0; color: #1a1a1a; text-align: right; font-family: monospace; font-weight: 600;">${body.orderId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payment ID:</td>
                <td style="padding: 8px 0; color: #1a1a1a; text-align: right; font-family: monospace; font-weight: 600;">${body.razorpay_payment_id.substring(0, 16)}...</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Amount Paid:</td>
                <td style="padding: 8px 0; color: #2067ff; text-align: right; font-size: 18px; font-weight: 600;">₹${body.amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-weight: 600;">✓ PAID</span>
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; margin-top: 20px; line-height: 1.6;">
            Thank you for choosing us!
          </p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: body.userEmail || '',
        subject: `✅ Payment Confirmation - Order #${body.orderId}`,
        html: customerEmailHtml,
      });
      console.log('✅ Customer confirmation email sent');
    } catch (emailError) {
      console.warn('⚠️ Failed to send customer confirmation email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        verified: true,
        message: 'Payment verified and order updated successfully',
        orderId: body.orderId,
        paymentId: body.razorpay_payment_id,
        sanityOrderId: sanityOrderId,
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
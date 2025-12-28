import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
    amount: number;
}

export async function POST(request: Request) {
    try {
        const body: VerifyPaymentRequest = await request.json();

        // Validate input
        if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment details', verified: false },
                { status: 400 }
            );
        }

        // Verify Payment Signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
        hmac.update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`);
        const generated_signature = hmac.digest('hex');

        const isSignatureValid = generated_signature === body.razorpay_signature;

        if (!isSignatureValid) {
            console.error('Signature Verification Failed', {
                expected: generated_signature,
                received: body.razorpay_signature,
            });

            return NextResponse.json(
                { 
                    error: 'Invalid payment signature',
                    verified: false 
                },
                { status: 400 }
            );
        }

        // Signature is valid - Payment is authentic
        console.log('Payment Verified Successfully', {
            orderId: body.razorpay_order_id,
            paymentId: body.razorpay_payment_id,
            amount: body.amount,
        });

        // TODO: Save order to database here
        // TODO: Send confirmation email
        // TODO: Update order status to PAID

        return NextResponse.json(
            {
                success: true,
                verified: true,
                message: 'Payment verified successfully',
                orderId: body.razorpay_order_id,
                paymentId: body.razorpay_payment_id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Payment Verification Error:', error);
        
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
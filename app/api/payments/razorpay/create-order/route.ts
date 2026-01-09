import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

interface CreateOrderRequest {
    amount: number;
    productName: string;
    userEmail: string;
    userName: string;
}

export async function POST(request: Request) {
    try {
        // Validate environment variables
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error('Missing Razorpay credentials');
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            );
        }

        // Initialize Razorpay inside the handler
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const body: CreateOrderRequest = await request.json();

        // Validate input
        if (!body.amount || body.amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (!body.userEmail || !body.userName) {
            return NextResponse.json(
                { error: 'Missing user details' },
                { status: 400 }
            );
        }

        // Create Razorpay Order
        const options = {
            amount: Math.round(body.amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                product_name: body.productName,
                customer_name: body.userName,
                customer_email: body.userEmail,
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(
            {
                success: true,
                orderId: order.id,
                amount: body.amount,
                currency: 'INR',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
        
        return NextResponse.json(
            { 
                error: 'Failed to create order',
                details: errorMessage 
            },
            { status: 500 }
        );
    }
}
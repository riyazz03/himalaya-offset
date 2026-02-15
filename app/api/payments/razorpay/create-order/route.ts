import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@sanity/client';

interface CreateOrderRequest {
    amount: number;
    productName: string;
    userEmail: string;
    userName: string;
}

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k0dxt5dl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(request: Request) {
    try {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error('Missing Razorpay credentials');
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const body: CreateOrderRequest = await request.json();

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

        console.log('📋 Creating Razorpay order for:', body.productName, 'Amount:', body.amount);

        const options = {
            amount: Math.round(body.amount * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                product_name: body.productName,
                customer_name: body.userName,
                customer_email: body.userEmail,
            },
        };

        const order = await razorpay.orders.create(options);
        const orderId = order.id;

        console.log('✅ Razorpay order created:', orderId);
        console.log('📁 Creating Sanity order...');

        // ✅ Create Sanity order immediately
        try {
            const sanityOrder = await sanityClient.create({
                _type: 'order',
                orderId: orderId,
                status: 'pending',  // ← Will be updated to 'processing' after payment
                productSnapshot: {
                    name: body.productName,
                },
                quantity: 1,
                pricing: {
                    basePrice: body.amount,
                    optionsPrice: 0,
                    totalPrice: body.amount,
                    pricePerUnit: body.amount,
                    gstAmount: 0,
                    gstPercentage: 18,
                    finalTotal: body.amount,
                    discount: 0,
                    discountPercentage: 0,
                },
                customerDetails: {
                    email: body.userEmail,
                    firstName: body.userName.split(' ')[0] || 'Customer',
                    lastName: body.userName.split(' ')[1] || '',
                    phone: '',
                },
                deliveryAddress: {
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                },
                selectedOptions: [],
                payment: {
                    paymentMethod: 'razorpay',
                    razorpayOrderId: orderId,
                    paymentStatus: 'pending',
                    amountPaid: body.amount,
                },
                designFiles: [],
                customerNotes: '',
                createdAt: new Date().toISOString(),
            });

            console.log('✅ Sanity order created:', sanityOrder._id);
            console.log('✅ Ready for file uploads!');
        } catch (sanityError) {
            console.warn('⚠️ Could not create Sanity order:', sanityError);
        }

        return NextResponse.json(
            {
                success: true,
                orderId: orderId,
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
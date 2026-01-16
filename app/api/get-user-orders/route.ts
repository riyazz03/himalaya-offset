import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k0dxt5dl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required', orders: [] },
        { status: 400 }
      );
    }

    console.log('Fetching orders for email:', email);

    const query = `
      *[_type == "order" && customerDetails.email == $email] | order(createdAt desc) {
        _id,
        orderId,
        productSnapshot {
          name,
          slug,
          description
        },
        customerDetails {
          firstName,
          lastName,
          email,
          phone
        },
        quantity,
        pricing {
          totalPrice,
          finalTotal,
          gstAmount,
          pricePerUnit
        },
        payment {
          paymentStatus,
          paymentDate,
          razorpayPaymentId
        },
        status,
        createdAt,
        deliveryAddress {
          address,
          city,
          state,
          pincode
        },
        selectedOptions[] {
          optionLabel,
          selectedValue
        }
      }
    `;

    const orders = await sanityClient.fetch(query, { email });

    console.log(`Found ${orders.length} orders for ${email}`);

    return NextResponse.json(
      {
        success: true,
        orders: orders,
        count: orders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: errorMessage,
        orders: [],
      },
      { status: 500 }
    );
  }
}
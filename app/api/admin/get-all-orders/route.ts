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
    console.log('Fetching all orders for admin...');

    const query = `
      *[_type == "order"] | order(createdAt desc) {
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
          razorpayPaymentId,
          completedAt
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

    const orders = await sanityClient.fetch(query);

    console.log(`Found ${orders.length} total orders`);

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
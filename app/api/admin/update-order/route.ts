import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k0dxt5dl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

interface UpdateOrderRequest {
  orderId: string;
  status: string;
  completedAt?: string;
}

export async function PUT(request: Request) {
  try {
    const body: UpdateOrderRequest = await request.json();

    console.log('📝 Updating order:', {
      orderId: body.orderId,
      newStatus: body.status,
      completedAt: body.completedAt,
    });

    if (!body.orderId || !body.status) {
      console.error('❌ Missing orderId or status');
      return NextResponse.json(
        { error: 'orderId and status are required' },
        { status: 400 }
      );
    }

    // Try to find order by orderId
    console.log('🔍 Searching for order with orderId:', body.orderId);
    
    let query = `*[_type == "order" && orderId == $orderId][0]`;
    let order = await sanityClient.fetch(query, { orderId: body.orderId });

    console.log('Search result:', order ? 'Found' : 'Not found with orderId');

    // If not found, try searching with _id
    if (!order && body.orderId.includes('order_')) {
      console.log('🔍 Trying alternate search...');
      query = `*[_type == "order" && (orderId == $orderId || _id == $orderId)][0]`;
      order = await sanityClient.fetch(query, { orderId: body.orderId });
      console.log('Alternate search result:', order ? 'Found' : 'Still not found');
    }

    // If still not found, get first order to debug
    if (!order) {
      console.log('❌ Order not found, fetching all orders for debugging...');
      const allOrders = await sanityClient.fetch(
        `*[_type == "order"] | order(createdAt desc)[0:3] { orderId, _id }`
      );
      console.log('Sample orders in database:', allOrders);

      return NextResponse.json(
        { 
          error: 'Order not found',
          details: `Could not find order with ID: ${body.orderId}`,
          sampleOrders: (allOrders as Array<{orderId: string; _id: string}>).map((o: {orderId: string; _id: string}) => ({ orderId: o.orderId, _id: o._id }))
        },
        { status: 404 }
      );
    }

    console.log('✅ Found order:', order._id);

    // Prepare update data
    const updateData: any = {
      status: body.status,
    };

    // If marking as success and completedAt is provided, update payment info
    if (body.status === 'success') {
      updateData.payment = {
        ...(order.payment || {}),
        paymentStatus: 'completed',
        completedAt: body.completedAt || new Date().toISOString(),
      };
      console.log('📅 Setting completion date:', updateData.payment.completedAt);
    }

    // If marking as cancelled, update status
    if (body.status === 'cancel') {
      updateData.payment = {
        ...(order.payment || {}),
        paymentStatus: 'completed',
      };
    }

    console.log('🔄 Patching with data:', updateData);

    // Patch the order
    const updatedOrder = await sanityClient.patch(order._id).set(updateData).commit();

    console.log('✅ Order updated successfully:', {
      orderId: updatedOrder.orderId,
      newStatus: updatedOrder.status,
      completedAt: updatedOrder.payment?.completedAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating order:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
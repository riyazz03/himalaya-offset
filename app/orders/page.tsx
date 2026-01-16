'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/orders-page.css';

interface OrderItem {
  _id: string;
  orderId: string;
  productSnapshot?: {
    name: string;
    slug: string;
    description?: string;
  };
  customerDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  quantity?: number;
  pricing?: {
    totalPrice?: number;
    finalTotal?: number;
    gstAmount?: number;
    pricePerUnit?: number;
  };
  payment?: {
    paymentStatus?: string;
    paymentDate?: string;
    razorpayPaymentId?: string;
  };
  status?: string;
  createdAt?: string;
  deliveryAddress?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  selectedOptions?: Array<{
    optionLabel?: string;
    selectedValue?: string;
  }>;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/get-user-orders?email=${encodeURIComponent(session.user.email)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);

        if (data.orders.length === 0) {
          setError('No orders found');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="orders-subtitle">
            {session?.user?.email && `Orders for ${session.user.email}`}
          </p>
        </div>

        {/* Error State */}
        {error && orders.length === 0 && (
          <div className="orders-error">
            <div className="error-icon">📭</div>
            <h3>No Orders Yet</h3>
            <p>{error}</p>
            <Link href="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <>
            <div className="orders-stats">
              <div className="stat">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{orders.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value">
                  ₹{orders
                    .reduce((sum, order) => sum + (order.pricing?.finalTotal || order.pricing?.totalPrice || 0), 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  {/* Order Header */}
                  <div
                    className="order-header-section"
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order._id ? null : order._id
                      )
                    }
                  >
                    <div className="order-info">
                      <div className="order-id-section">
                        <h3>Order #{order.orderId}</h3>
                        <span className={`order-status status-${order.status || 'processing'}`}>
                          {(order.status || 'processing').charAt(0).toUpperCase() +
                            (order.status || 'processing').slice(1).replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Date unavailable'}
                      </p>
                    </div>

                    <div className="order-amount">
                      <span className="amount">
                        ₹{(order.pricing?.finalTotal || order.pricing?.totalPrice || 0).toLocaleString('en-IN')}
                      </span>
                      <span className={`expand-icon ${expandedOrderId === order._id ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Order Details (Expandable) */}
                  {expandedOrderId === order._id && (
                    <div className="order-details">
                      {/* Product Info */}
                      <div className="detail-section">
                        <h4>Product Details</h4>
                        <div className="detail-row">
                          <span className="detail-label">Product:</span>
                          <span className="detail-value">
                            {order.productSnapshot?.name || 'Product name unavailable'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{order.quantity || 0} units</span>
                        </div>

                        {order.selectedOptions && order.selectedOptions.length > 0 && (
                          <div className="detail-row">
                            <span className="detail-label">Options:</span>
                            <div className="options-list">
                              {order.selectedOptions.map((option, idx) => (
                                <div key={idx} className="option-item">
                                  <strong>{option.optionLabel || 'Option'}:</strong> {option.selectedValue || 'N/A'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="detail-section">
                        <h4>Pricing Breakdown</h4>
                        <div className="pricing-breakdown">
                          <div className="price-row">
                            <span>Unit Price:</span>
                            <span>
                              ₹{(order.pricing?.pricePerUnit || 0).toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="price-row">
                            <span>Subtotal ({order.quantity} × ₹{(order.pricing?.pricePerUnit || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}):</span>
                            <span>
                              ₹{(order.pricing?.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="price-row">
                            <span>GST (18%):</span>
                            <span>
                              ₹{(order.pricing?.gstAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="price-row total">
                            <span>Total:</span>
                            <span>
                              ₹{(order.pricing?.finalTotal || order.pricing?.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="detail-section">
                        <h4>Delivery Address</h4>
                        <div className="address-box">
                          <p>
                            {order.deliveryAddress?.address || 'N/A'}
                            <br />
                            {order.deliveryAddress?.city || ''}, {order.deliveryAddress?.state || ''}{' '}
                            {order.deliveryAddress?.pincode || ''}
                          </p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="detail-section">
                        <h4>Payment Information</h4>
                        <div className="detail-row">
                          <span className="detail-label">Payment Status:</span>
                          <span className={`payment-status status-${order.payment?.paymentStatus || 'pending'}`}>
                            {(order.payment?.paymentStatus || 'pending')
                              .charAt(0)
                              .toUpperCase() +
                              (order.payment?.paymentStatus || 'pending').slice(1)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Payment Date:</span>
                          <span className="detail-value">
                            {order.payment?.paymentDate 
                              ? new Date(order.payment.paymentDate).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Payment ID:</span>
                          <span className="detail-value payment-id">
                            {order.payment?.razorpayPaymentId || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="order-actions">
                        <button className="btn btn-secondary" onClick={() => {}}>
                          Download Invoice
                        </button>
                        {order.status === 'delivered' && (
                          <button className="btn btn-tertiary" onClick={() => {}}>
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Continue Shopping Button */}
        {orders.length > 0 && (
          <div className="continue-shopping">
            <Link href="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
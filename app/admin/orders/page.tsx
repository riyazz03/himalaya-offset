'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/admin-orders-page.css';

const ADMIN_EMAIL = 'mohammedriyaz12032003@gmail.com';

interface OrderItem {
  _id: string;
  orderId: string;
  productSnapshot?: {
    name?: string;
  };
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  quantity?: number;
  pricing?: {
    basePrice?: number;
    optionsPrice?: number;
    totalPrice?: number;
    finalTotal?: number;
    pricePerUnit?: number;
    gstAmount?: number;
    gstPercentage?: number;
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
  payment?: {
    paymentStatus?: string;
    paymentDate?: string;
    razorpayPaymentId?: string;
    completedAt?: string;
  };
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'processing' | 'success' | 'cancel'>('processing');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ [key: string]: string }>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      const userEmail = session?.user?.email || '';
      const adminCheck = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      console.log('🔍 Admin Check:');
      console.log('User Email:', userEmail);
      console.log('Admin Email:', ADMIN_EMAIL);
      console.log('Is Admin:', adminCheck);

      setIsAdmin(adminCheck);

      if (!adminCheck) {
        console.log('❌ Not admin user, redirecting to products...');
        router.push('/products');
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAdmin) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/get-all-orders');

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        const sortedOrders = data.orders?.sort(
          (a: OrderItem, b: OrderItem) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ) || [];
        setOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);

    try {
      console.log('🔄 Sending update request for order:', orderId);
      
      const requestBody = {
        orderId,
        status: newStatus,
        completedAt: newStatus === 'success' ? (selectedDate[orderId] || new Date().toISOString()) : undefined,
      };

      console.log('📤 Request body:', requestBody);

      const response = await fetch('/api/admin/update-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      const result = await response.json();

      console.log('📥 Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to update order');
      }

      if (result.data) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderId ? result.data : order
          )
        );

        setSelectedDate(prev => {
          const newDates = { ...prev };
          delete newDates[orderId];
          return newDates;
        });

        alert(`✅ Order status updated to ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('❌ Error updating order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      alert(`Error: ${errorMessage}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => (order.status || 'processing') === activeTab);

  if (status === 'loading') {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>📦 Orders Management</h1>
          <p className="admin-subtitle">Manage all customer orders</p>
        </div>

        {error && (
          <div className="admin-alert alert-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveTab('processing')}
          >
            <span className="tab-icon">⏳</span>
            Processing ({orders.filter(o => (o.status || 'processing') === 'processing').length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'success' ? 'active' : ''}`}
            onClick={() => setActiveTab('success')}
          >
            <span className="tab-icon">✅</span>
            Success ({orders.filter(o => o.status === 'success').length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'cancel' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancel')}
          >
            <span className="tab-icon">❌</span>
            Cancelled ({orders.filter(o => o.status === 'cancel').length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <p>No orders in this category</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map(order => (
              <div key={order._id} className={`admin-order-card status-${order.status || 'processing'}`}>
                <div
                  className="admin-order-header"
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                >
                  <div className="order-basic-info">
                    <h3>Order #{order.orderId}</h3>
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

                  <div className="order-summary">
                    <span className="customer-name">
                      {order.customerDetails?.firstName || 'Customer'}
                    </span>
                    <span className="order-total">
                      ₹{(order.pricing?.finalTotal || order.pricing?.totalPrice || order.pricing?.basePrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <span className={`expand-icon ${expandedOrderId === order._id ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>

                {expandedOrderId === order._id && (
                  <div className="admin-order-details">
                    <div className="details-grid">
                      <div className="detail-box">
                        <h4>Product</h4>
                        <p>{order.productSnapshot?.name || 'N/A'}</p>
                        <p className="quantity">Qty: {order.quantity || 0}</p>
                      </div>

                      <div className="detail-box">
                        <h4>Customer</h4>
                        <p>{order.customerDetails?.firstName || 'N/A'} {order.customerDetails?.lastName || ''}</p>
                        <p>{order.customerDetails?.email || 'N/A'}</p>
                        <p>{order.customerDetails?.phone || 'N/A'}</p>
                      </div>

                      <div className="detail-box">
                        <h4>Address</h4>
                        <p>
                          {order.deliveryAddress?.address || 'N/A'}
                          <br />
                          {order.deliveryAddress?.city || ''}, {order.deliveryAddress?.state || ''}
                          <br />
                          {order.deliveryAddress?.pincode || ''}
                        </p>
                      </div>

                      <div className="detail-box">
                        <h4>Amount</h4>
                        <p className="amount">₹{(order.pricing?.finalTotal || order.pricing?.totalPrice || 0).toLocaleString('en-IN')}</p>
                        <p className="payment-label">Payment ID:</p>
                        <p className="payment-id">{order.payment?.razorpayPaymentId || 'N/A'}</p>
                        <p className="payment-label">Status:</p>
                        <p className="payment-status">{(order.payment?.paymentStatus || 'completed').toUpperCase()}</p>
                      </div>
                    </div>

                    {order.selectedOptions && order.selectedOptions.length > 0 && (
                      <div className="selected-options">
                        <h4>Selected Options</h4>
                        <div className="options-grid">
                          {order.selectedOptions.map((option, idx) => (
                            <div key={idx} className="option-item">
                              <span className="option-label">{option.optionLabel || 'Option'}:</span>
                              <span className="option-value">{option.selectedValue || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="status-update-section">
                      <h4>Update Status</h4>
                      <div className="status-controls">
                        {activeTab !== 'success' && (
                          <div className="status-action">
                            <input
                              type="date"
                              value={selectedDate[order._id] || ''}
                              onChange={(e) =>
                                setSelectedDate(prev => ({
                                  ...prev,
                                  [order._id]: e.target.value,
                                }))
                              }
                              className="date-picker"
                            />
                            <button
                              onClick={() => handleStatusChange(order.orderId, 'success')}
                              disabled={updatingOrderId === order.orderId}
                              className="btn-success"
                            >
                              {updatingOrderId === order.orderId ? 'Updating...' : '✅ Mark Success'}
                            </button>
                          </div>
                        )}

                        {activeTab !== 'cancel' && (
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'cancel')}
                            disabled={updatingOrderId === order.orderId}
                            className="btn-cancel"
                          >
                            {updatingOrderId === order._id ? 'Updating...' : '❌ Mark Cancelled'}
                          </button>
                        )}

                        {activeTab === 'success' && (
                          <div className="completed-info">
                            <p className="completed-date">
                              Completed: {order.payment?.completedAt
                                ? new Date(order.payment.completedAt).toLocaleDateString('en-IN')
                                : 'N/A'}
                            </p>
                          </div>
                        )}

                        {activeTab === 'cancel' && (
                          <div className="cancelled-info">
                            <p className="cancelled-text">This order has been cancelled</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
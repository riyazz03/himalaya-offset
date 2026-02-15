'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/admin-orders-page.css';

const ADMIN_EMAIL = 'mohammedriyaz12032003@gmail.com';

interface DesignFile {
  _key?: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  fileType?: string;
  uploadedAt?: string;
}

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
  designFiles?: DesignFile[];
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
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const formatCurrency = (value: number): string => {
    return (value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '🎯',
      pptx: '🎯',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
      txt: '📃',
      csv: '📋',
    };
    return iconMap[ext] || '📎';
  };

  const handleDownloadFile = async (file: DesignFile) => {
    setDownloadingFile(file.fileName);
    try {
      const response = await fetch(file.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDownloadBill = async (order: OrderItem) => {
    setDownloadingPDF(order._id);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const invoiceHTML = createInvoiceHTML(order);
      const element = document.createElement('div');
      element.innerHTML = invoiceHTML;
      const options: any = {
        margin: 10,
        filename: `Invoice_${order.orderId}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };
      html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(null);
    }
  };

  const createInvoiceHTML = (order: OrderItem): string => {
    const basePrice = order.pricing?.basePrice || 0;
    const quantity = order.quantity || 1;
    const gstAmount = order.pricing?.gstAmount || 0;
    const finalTotal = order.pricing?.finalTotal || 0;
    const companyName = 'Himalaya Offset Printing';
    const companyGST = '33AAFCT5055K1Z0';
    const companyAddress = '123, Main Street, Vellore, Tamil Nadu 632001';
    const companyPhone = '+91-9876543210';
    const companyEmail = 'info@himalayaoffset.com';
    const companyWebsite = 'www.himalayaoffset.com';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .invoice-container { max-width: 900px; margin: 0 auto; padding: 40px; background: white; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
          .company-info h1 { color: #10b981; font-size: 28px; margin-bottom: 8px; }
          .company-details { font-size: 13px; color: #666; line-height: 1.8; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { color: #10b981; font-size: 24px; margin-bottom: 10px; }
          .invoice-meta { font-size: 13px; color: #666; text-align: right; }
          .invoice-meta p { margin-bottom: 5px; }
          .billing-shipping { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .billing-info, .shipping-info { width: 48%; }
          .billing-info h3, .shipping-info h3 { color: #10b981; font-size: 14px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; }
          .billing-info p, .shipping-info p { font-size: 13px; margin-bottom: 5px; line-height: 1.8; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table thead { background: #f0fdf4; border-top: 2px solid #10b981; border-bottom: 2px solid #10b981; }
          .items-table th { padding: 15px; text-align: left; font-weight: 700; color: #059669; font-size: 13px; text-transform: uppercase; }
          .items-table td { padding: 15px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          .amount-right { text-align: right; }
          .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-box { width: 400px; }
          .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
          .total-row.final { border-bottom: 2px solid #10b981; padding-top: 15px; padding-bottom: 15px; font-weight: 700; font-size: 16px; color: #10b981; }
          .total-row.header { font-weight: 700; color: #333; border-bottom: 2px solid #e5e7eb; }
          .payment-info { background: #f0fdf4; padding: 15px; border-radius: 6px; margin-bottom: 30px; border-left: 4px solid #10b981; }
          .payment-info h4 { color: #059669; font-size: 13px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; }
          .payment-info p { font-size: 13px; margin-bottom: 4px; color: #374151; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>${companyName}</h1>
              <div class="company-details">
                <p>${companyAddress}</p>
                <p>Phone: ${companyPhone}</p>
                <p>Email: ${companyEmail}</p>
                <p>GST: ${companyGST}</p>
              </div>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <div class="invoice-meta">
                <p><strong>Invoice #:</strong> ${order.orderId}</p>
                <p><strong>Invoice Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div class="billing-shipping">
            <div class="billing-info">
              <h3>Bill To</h3>
              <p><strong>${order.customerDetails?.firstName || 'N/A'} ${order.customerDetails?.lastName || ''}</strong></p>
              <p>${order.deliveryAddress?.address || 'N/A'}</p>
              <p>${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} ${order.deliveryAddress?.pincode || ''}</p>
              <p>Email: ${order.customerDetails?.email || 'N/A'}</p>
              <p>Phone: ${order.customerDetails?.phone || 'N/A'}</p>
            </div>
            <div class="shipping-info">
              <h3>Ship To</h3>
              <p><strong>${order.customerDetails?.firstName || 'N/A'} ${order.customerDetails?.lastName || ''}</strong></p>
              <p>${order.deliveryAddress?.address || 'N/A'}</p>
              <p>${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} ${order.deliveryAddress?.pincode || ''}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 100px;">Unit Price</th>
                <th style="text-align: right; width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${order.productSnapshot?.name || 'N/A'}</strong></td>
                <td style="text-align: center;">${quantity}</td>
                <td class="amount-right">₹${formatCurrency(basePrice / quantity)}</td>
                <td class="amount-right">₹${formatCurrency(basePrice)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row header">
                <span>Subtotal</span>
                <span>₹${formatCurrency(basePrice)}</span>
              </div>
              <div class="total-row">
                <span>GST (18%)</span>
                <span>₹${formatCurrency(gstAmount)}</span>
              </div>
              <div class="total-row final">
                <span>Total Amount</span>
                <span>₹${formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          <div class="payment-info">
            <h4>Payment Information</h4>
            <p><strong>Payment ID:</strong> ${order.payment?.razorpayPaymentId || 'N/A'}</p>
            <p><strong>Status:</strong> Completed</p>
          </div>

          <div class="footer">
            <p><strong>${companyName}</strong></p>
            <p>${companyWebsite}</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

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
            Processing ({orders.filter((o: OrderItem) => (o.status || 'processing') === 'processing').length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'success' ? 'active' : ''}`}
            onClick={() => setActiveTab('success')}
          >
            <span className="tab-icon">✅</span>
            Success ({orders.filter((o: OrderItem) => o.status === 'success').length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'cancel' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancel')}
          >
            <span className="tab-icon">❌</span>
            Cancelled ({orders.filter((o: OrderItem) => o.status === 'cancel').length})
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

                    {/* ✅ NEW: Display uploaded files */}
                    {order.designFiles && order.designFiles.length > 0 && (
                      <div className="uploaded-files-section">
                        <h4>📁 Uploaded Files ({order.designFiles.length})</h4>
                        <div className="files-list">
                          {order.designFiles.map((file, idx) => (
                            <div key={idx} className="file-item">
                              <div className="file-info">
                                <span className="file-icon">{getFileIcon(file.fileName)}</span>
                                <div className="file-details">
                                  <p className="file-name">{file.fileName}</p>
                                  <p className="file-meta">
                                    {formatFileSize(file.fileSize * 1024 * 1024)} • {file.fileType || 'File'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                disabled={downloadingFile === file.fileName}
                                className="btn-download-file"
                              >
                                {downloadingFile === file.fileName ? '⏳' : '⬇️ Download'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

                    <div className="bill-download-section">
                      <button
                        onClick={() => handleDownloadBill(order)}
                        disabled={downloadingPDF === order._id}
                        className="btn-download-bill"
                      >
                        {downloadingPDF === order._id ? '⏳ Generating PDF...' : '📄 Download Bill as PDF'}
                      </button>
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
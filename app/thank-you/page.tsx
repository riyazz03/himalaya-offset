'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import '@/styles/thank-you-page.css';

interface OrderData {
    orderId: string;
    productName: string;
    amount: number;
    userEmail: string;
    userName: string;
    userPhone?: string;
    userAddress?: string;
    userCity?: string;
    userState?: string;
    userPincode?: string;
    description?: string;
    uploadedFiles?: number;
    quantity?: number;
    gstAmount?: number;
    paymentId?: string;
    paymentDate?: string;
}

interface Html2PdfOptions {
    margin: number;
    filename: string;
    image: {
        type: 'jpeg' | 'png' | 'webp';
        quality: number;
    };
    html2canvas: {
        scale: number;
    };
    jsPDF: {
        orientation: 'portrait' | 'landscape';
        unit: 'mm' | 'cm' | 'in' | 'px';
        format: string;
    };
}

function ThankYouContent() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    useEffect(() => {
        const loadOrderData = () => {
            try {
                let data = null;
                
                const sessionData = sessionStorage.getItem('orderData');
                if (sessionData) {
                    data = JSON.parse(sessionData);
                } else {
                    const localData = localStorage.getItem('lastOrder');
                    if (localData) {
                        data = JSON.parse(localData);
                    }
                }

                if (data) {
                    setOrderData(data);
                } else {
                    setError('Order data not found');
                }
            } catch (err) {
                console.error('Error loading order data:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        loadOrderData();
    }, []);

    const downloadPDF = async () => {
        if (!orderData) return;
        
        setDownloading(true);
        try {
            // Dynamically import html2pdf
            const html2pdf = (await import('html2pdf.js')).default;
            
            const element = document.getElementById('order-invoice');
            if (!element) {
                alert('Could not find invoice to download');
                setDownloading(false);
                return;
            }

            const options: Html2PdfOptions = {
                margin: 10,
                filename: `Order_${orderData.orderId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
            };

            html2pdf().set(options).from(element).save();
        } catch (err) {
            console.error('Error downloading PDF:', err);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="thank-you-simple">
                <div className="thank-you-block">
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    if (error || !orderData) {
        return (
            <div className="thank-you-simple">
                <div className="thank-you-block">
                    <h1>Error</h1>
                    <p>{error || 'Unable to load order details'}</p>
                    <Link href="/products" className="link-btn">
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="thank-you-simple">
            <div className="thank-you-block">
                {/* Header */}
                <div className="order-header">
                    <h1>Order Confirmed</h1>
                    <p className="subtitle">Thank you for your order!</p>
                </div>

                {/* Invoice Section */}
                <div id="order-invoice" className="invoice-section">
                    {/* Order ID */}
                    <div className="info-row">
                        <span className="label">Order ID:</span>
                        <span className="value">{orderData.orderId}</span>
                    </div>

                    {/* Order Date */}
                    <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">{formattedDate}</span>
                    </div>

                    {/* Product Name */}
                    <div className="info-row">
                        <span className="label">Product:</span>
                        <span className="value">{orderData.productName}</span>
                    </div>

                    {/* Quantity */}
                    {orderData.quantity && (
                        <div className="info-row">
                            <span className="label">Quantity:</span>
                            <span className="value">{orderData.quantity}</span>
                        </div>
                    )}

                    {/* Customer Name */}
                    <div className="info-row">
                        <span className="label">Customer Name:</span>
                        <span className="value">{orderData.userName}</span>
                    </div>

                    {/* Email */}
                    <div className="info-row">
                        <span className="label">Email:</span>
                        <span className="value">{orderData.userEmail}</span>
                    </div>

                    {/* Phone */}
                    {orderData.userPhone && (
                        <div className="info-row">
                            <span className="label">Phone:</span>
                            <span className="value">{orderData.userPhone}</span>
                        </div>
                    )}

                    {/* Address */}
                    {orderData.userAddress && (
                        <div className="info-row">
                            <span className="label">Address:</span>
                            <span className="value">
                                {orderData.userAddress}
                                {orderData.userCity && `, ${orderData.userCity}`}
                                {orderData.userState && `, ${orderData.userState}`}
                                {orderData.userPincode && ` - ${orderData.userPincode}`}
                            </span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="divider"></div>

                    {/* Amount */}
                    <div className="info-row">
                        <span className="label">Amount:</span>
                        <span className="value amount">₹ {orderData.amount.toLocaleString('en-IN')}</span>
                    </div>

                    {/* GST */}
                    {orderData.gstAmount && orderData.gstAmount > 0 && (
                        <div className="info-row">
                            <span className="label">GST (18%):</span>
                            <span className="value">₹ {orderData.gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    {/* Payment ID */}
                    {orderData.paymentId && (
                        <div className="info-row">
                            <span className="label">Payment ID:</span>
                            <span className="value small">{orderData.paymentId}</span>
                        </div>
                    )}

                    {/* Status */}
                    <div className="info-row">
                        <span className="label">Status:</span>
                        <span className="value status">Placed</span>
                    </div>
                </div>

                {/* Message */}
                <div className="message">
                    <p>A confirmation email has been sent to <strong>{orderData.userEmail}</strong></p>
                    <p>Our team will review your files and requirements shortly.</p>
                </div>

                {/* Buttons */}
                <div className="button-group">
                    <button className="btn btn-primary" onClick={downloadPDF} disabled={downloading}>
                        {downloading ? 'Downloading...' : 'Download Invoice'}
                    </button>
                    <Link href="/products" className="btn btn-secondary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={
            <div className="thank-you-simple">
                <div className="thank-you-block">
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        }>
            <ThankYouContent />
        </Suspense>
    );
}
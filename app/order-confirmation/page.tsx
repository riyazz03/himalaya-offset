'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/order-confirmation.css';

interface OrderData {
    product: {
        id: string;
        name: string;
        slug: string;
        image: string;
    };
    quantity: number;
    selectedTier: {
        quantity: number;
        price: number;
        pricePerUnit: number;
    };
    selectedOptions: { [key: string]: string | number };
    pricing: {
        basePrice: number;
        optionsPrice: number;
        totalPrice: number;
        pricePerUnit: number;
    };
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('card');

    useEffect(() => {
        try {
            const data = searchParams.get('data');
            if (data) {
                const decoded = JSON.parse(decodeURIComponent(data));
                setOrderData(decoded);
            } else {
                setError('No order data found');
            }
        } catch (err) {
            console.error('Error parsing order data:', err);
            setError('Invalid order data');
        }
    }, [searchParams]);

    const handlePayment = async () => {
        if (!orderData) return;

        // TODO: Integrate Razorpay or your payment gateway here
        console.log('Processing payment with method:', paymentMethod);
        console.log('Order data:', orderData);
        
        alert(`Payment integration coming soon!\nTotal: ₹${orderData.pricing.totalPrice}`);
    };

    if (error || !orderData) {
        return (
            <div className="order-page">
                <div className="order-error">
                    <h2>Order Error</h2>
                    <p>{error || 'Something went wrong'}</p>
                    <Link href="/products" className="back-btn">Back to Products</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="order-page">
            <div className="order-container">
                <div className="order-layout">
                    {/* Left: Order Summary */}
                    <div className="order-left">
                        <h2>Order Summary</h2>

                        {/* Product Details */}
                        <div className="order-product">
                            {orderData.product.image && (
                                <div className="order-product-image">
                                    <Image
                                        src={orderData.product.image}
                                        alt={orderData.product.name}
                                        width={150}
                                        height={150}
                                        className="product-img"
                                    />
                                </div>
                            )}
                            <div className="order-product-info">
                                <h3>{orderData.product.name}</h3>
                                <p className="product-qty">Quantity: {orderData.quantity} units</p>
                            </div>
                        </div>

                        {/* Options Summary */}
                        {Object.keys(orderData.selectedOptions).length > 0 && (
                            <div className="order-options">
                                <h4>Customizations</h4>
                                {Object.entries(orderData.selectedOptions).map(([key, value]) => (
                                    <div key={key} className="option-summary">
                                        <span className="option-name">{key}</span>
                                        <span className="option-value">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="order-pricing">
                            <div className="pricing-row">
                                <span>Subtotal ({orderData.quantity} units)</span>
                                <span>₹{orderData.pricing.basePrice.toLocaleString()}</span>
                            </div>
                            {orderData.pricing.optionsPrice > 0 && (
                                <div className="pricing-row">
                                    <span>Customizations</span>
                                    <span>+₹{orderData.pricing.optionsPrice.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="pricing-total">
                                <span>Total Amount</span>
                                <span>₹{orderData.pricing.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment */}
                    <div className="order-right">
                        <h2>Payment Method</h2>

                        {/* Payment Options */}
                        <div className="payment-methods">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="payment-text">
                                    <span className="payment-icon">💳</span>
                                    Credit / Debit Card
                                </span>
                            </label>

                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="payment-text">
                                    <span className="payment-icon">📱</span>
                                    UPI (Google Pay, PhonePe, etc)
                                </span>
                            </label>

                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="netbanking"
                                    checked={paymentMethod === 'netbanking'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="payment-text">
                                    <span className="payment-icon">🏦</span>
                                    Net Banking
                                </span>
                            </label>

                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="payment-text">
                                    <span className="payment-icon">📦</span>
                                    Cash on Delivery
                                </span>
                            </label>
                        </div>

                        {/* Delivery Info */}
                        <div className="delivery-info">
                            <h4>Delivery Details</h4>
                            <p className="info-note">
                                We&apos;ll contact you at the number provided during order completion to confirm delivery address and timeline.
                            </p>
                        </div>

                        {/* Payment Button */}
                        <button 
                            className="payment-button"
                            onClick={handlePayment}
                        >
                            Proceed to {paymentMethod === 'cod' ? 'Order' : 'Payment'} - ₹{orderData.pricing.totalPrice.toLocaleString()}
                        </button>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="badge">🔒 Secure Payment</div>
                            <div className="badge">✓ SSL Encrypted</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="order-page"><div className="order-loading">Loading order...</div></div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
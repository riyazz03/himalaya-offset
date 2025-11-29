'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

interface UserDetails {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [description, setDescription] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    // Parse order data and user details
    useEffect(() => {
        try {
            const data = searchParams.get('data');
            if (data) {
                const decoded = JSON.parse(decodeURIComponent(data));
                setOrderData(decoded);
            } else {
                setError('No order data found');
            }

            // Fetch user details from session
            if (session?.user) {
                setUserDetails({
                    name: session.user.name || '',
                    email: session.user.email || '',
                    phone: (session.user as any)?.phone || '',
                    address: (session.user as any)?.address || '',
                });
            }
        } catch (err) {
            console.error('Error parsing data:', err);
            setError('Invalid order data');
        }
    }, [searchParams, session]);

    // Handle image upload
    const handleImageUpload = (index: number, file: File) => {
        if (file && file.type.startsWith('image/')) {
            const newImages = [...uploadedImages];
            newImages[index] = file;
            setUploadedImages(newImages);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPreviews = [...imagePreviews];
                newPreviews[index] = e.target?.result as string;
                setImagePreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file');
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleCheckout = async () => {
        if (!orderData || !userDetails) return;

        // Validate required fields
        if (!userDetails.name || !userDetails.email || !userDetails.phone || !userDetails.address) {
            setError('Please complete all user details');
            return;
        }

        if (uploadedImages.length === 0) {
            setError('Please upload at least one image');
            return;
        }

        if (!description.trim()) {
            setError('Please provide a description');
            return;
        }

        setLoading(true);

        try {
            // Create FormData for image upload
            const formData = new FormData();
            uploadedImages.forEach((image, index) => {
                formData.append(`image_${index}`, image);
            });
            formData.append('description', description);
            formData.append('orderId', `ORDER_${Date.now()}`);
            formData.append('productName', orderData.product.name);
            formData.append('userEmail', userDetails.email);
            formData.append('userName', userDetails.name);
            formData.append('userPhone', userDetails.phone);

            // Upload images and send email
            const emailResponse = await fetch('/api/orders/send-details', {
                method: 'POST',
                body: formData,
            });

            if (!emailResponse.ok) {
                throw new Error('Failed to send order details');
            }

            // Initiate Cashfree payment
            const paymentResponse = await fetch('/api/payments/cashfree/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderData,
                    userDetails,
                    amount: orderData.pricing.totalPrice,
                    imageCount: uploadedImages.length,
                }),
            });

            const paymentResult = await paymentResponse.json();

            if (paymentResult.success && paymentResult.paymentUrl) {
                // Redirect to Cashfree payment page
                window.location.href = paymentResult.paymentUrl;
            } else {
                setError(paymentResult.message || 'Failed to initiate payment');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to process order');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking auth
    if (status === 'loading') {
        return (
            <div className="checkout-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
        return null;
    }

if (error || !orderData) {
    return (
        <div className="checkout-page">
            <div className="checkout-error">
                <h1>Order Error</h1>
                <p>{error || 'Something went wrong'}</p>
                <Link href="/products" className="back-btn">Back to Products</Link>
            </div>
        </div>
    );
}

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-card">
                    {/* Header */}
                    <div className="checkout-header">
                        <h1>Checkout</h1>
                        <p>Review your order and complete payment</p>
                    </div>

                    {/* User Details */}
                    {userDetails && (
                        <div className="user-details-section">
                            <h3>Delivery Details</h3>
                            <div className="user-info">
                                <p><strong>Name:</strong> {userDetails.name}</p>
                                <p><strong>Email:</strong> {userDetails.email}</p>
                                <p><strong>Phone:</strong> {userDetails.phone}</p>
                                <p><strong>Address:</strong> {userDetails.address}</p>
                            </div>
                            <Link href="/profile" className="edit-details">Edit Details</Link>
                        </div>
                    )}

                    {/* Product Details */}
                    <div className="product-section">
                        <h3>Order Items</h3>
                        <div className="order-item">
                            {orderData.product.image && (
                                <div className="item-image">
                                    <Image
                                        src={orderData.product.image}
                                        alt={orderData.product.name}
                                        width={80}
                                        height={80}
                                    />
                                </div>
                            )}
                            <div className="item-details">
                                <h4>{orderData.product.name}</h4>
                                <p className="quantity">Qty: {orderData.quantity} units</p>
                                {Object.keys(orderData.selectedOptions).length > 0 && (
                                    <div className="customizations">
                                        {Object.entries(orderData.selectedOptions).map(([key, value]) => (
                                            <span key={key} className="custom-tag">
                                                {key}: {String(value)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="images-section">
                        <h3>Product Images / Samples</h3>
                        <p className="section-description">Upload up to 4 images of your design/samples</p>
                        
                        <div className="image-upload-grid">
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} className="image-upload-box">
                                    {imagePreviews[index] ? (
                                        <div className="image-preview">
                                            <img src={imagePreviews[index]} alt={`Preview ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="image-upload-label">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        handleImageUpload(index, e.target.files[0]);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="upload-placeholder">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                                <p>Click to upload</p>
                                                <span>Image {index + 1}</span>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="description-section">
                        <h3>Description / Notes</h3>
                        <p className="section-description">Describe your design, preferences, and any special requirements</p>
                        <textarea
                            className="description-input"
                            placeholder="Enter your design description, preferences, colors, sizes, special instructions, etc..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Price Breakdown */}
                    <div className="price-section">
                        <div className="price-row">
                            <span>Subtotal</span>
                            <span>₹{orderData.pricing.basePrice.toLocaleString()}</span>
                        </div>
                        {orderData.pricing.optionsPrice > 0 && (
                            <div className="price-row">
                                <span>Customizations</span>
                                <span>+₹{orderData.pricing.optionsPrice.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="price-row total">
                            <span>Total Amount</span>
                            <span>₹{orderData.pricing.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && <div className="error-message">{error}</div>}

                    {/* Checkout Button */}
                    <button
                        className="checkout-button"
                        onClick={handleCheckout}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Proceed to Payment - ₹${orderData.pricing.totalPrice.toLocaleString()}`}
                    </button>

                    {/* Trust Info */}
                    <div className="trust-info">
                        <p>🔒 Secure payment powered by Cashfree</p>
                        <p>Your images and details will be sent to us via email for processing</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="checkout-page"><div className="loading">Loading checkout...</div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
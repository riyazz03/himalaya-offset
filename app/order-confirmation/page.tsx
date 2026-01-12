'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import '@/styles/orderConfirmation.css';

// Declare Razorpay type globally
declare global {
    interface Window {
        Razorpay: any;
    }
}

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
        gstAmount?: number;
        gstPercentage?: number;
        finalTotal?: number;
    };
}

interface UserDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

interface ExtendedSessionUser {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

interface UploadedFile {
    file: File;
    preview?: string;
    name: string;
    size: string;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [description, setDescription] = useState('');
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    }>({});

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    // Load order data from URL
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

    // Load user details from profile API - only once when session is available
    useEffect(() => {
        if (session?.user?.email && !isInitialized) {
            loadUserProfile();
        }
    }, [session?.user?.email, isInitialized]);

    const loadUserProfile = async () => {
        try {
            const email = session?.user?.email;
            if (!email) return;

            const encodedEmail = encodeURIComponent(email);
            const response = await fetch(`/api/profile?email=${encodedEmail}`);
            const result = await response.json();

            if (result.data) {
                const newUserDetails: UserDetails = {
                    firstName: result.data.firstName && result.data.firstName !== 'undefined' 
                        ? String(result.data.firstName).trim() 
                        : '',
                    lastName: result.data.lastName && result.data.lastName !== 'undefined' 
                        ? String(result.data.lastName).trim() 
                        : '',
                    email: result.data.email && result.data.email !== 'undefined' 
                        ? String(result.data.email).trim() 
                        : '',
                    phone: result.data.phone && result.data.phone !== 'undefined' 
                        ? String(result.data.phone).trim() 
                        : '',
                    address: result.data.address && result.data.address !== 'undefined' 
                        ? String(result.data.address).trim() 
                        : '',
                    city: result.data.city && result.data.city !== 'undefined' 
                        ? String(result.data.city).trim() 
                        : '',
                    state: result.data.state && result.data.state !== 'undefined' 
                        ? String(result.data.state).trim() 
                        : '',
                    pincode: result.data.pincode && result.data.pincode !== 'undefined' 
                        ? String(result.data.pincode).trim() 
                        : '',
                };

                setUserDetails(newUserDetails);
                setIsInitialized(true);
            }
        } catch (err) {
            console.error('Error loading user profile:', err);
            setIsInitialized(true);
        }
    };

    const handleRazorpayScriptLoad = () => {
        console.log('Razorpay script loaded successfully');
        setRazorpayLoaded(true);
    };

    // ===== USER DETAILS VALIDATION =====
    const validateUserDetails = (): boolean => {
        const errors: typeof validationErrors = {};

        if (!userDetails.firstName || userDetails.firstName.trim() === '') {
            errors.firstName = 'First name is required';
        }

        if (!userDetails.lastName || userDetails.lastName.trim() === '') {
            errors.lastName = 'Last name is required';
        }

        if (!userDetails.email || userDetails.email.trim() === '') {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!userDetails.phone || userDetails.phone.trim() === '') {
            errors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(userDetails.phone.replace(/\D/g, ''))) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!userDetails.address || userDetails.address.trim() === '') {
            errors.address = 'Address is required';
        }

        if (!userDetails.city || userDetails.city.trim() === '') {
            errors.city = 'City is required';
        }

        if (!userDetails.state || userDetails.state.trim() === '') {
            errors.state = 'State is required';
        }

        if (!userDetails.pincode || userDetails.pincode.trim() === '') {
            errors.pincode = 'Pincode is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUserDetailChange = (field: keyof UserDetails, value: string) => {
        setUserDetails(prev => ({
            ...prev,
            [field]: value,
        }));

        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    // Sync user details to profile database
    const syncUserDetailsToProfile = async () => {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: userDetails.firstName,
                    lastName: userDetails.lastName,
                    phone: userDetails.phone,
                    company: '',
                    address: userDetails.address,
                    city: userDetails.city,
                    state: userDetails.state,
                    pincode: userDetails.pincode,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to sync profile:', errorData);
                return false;
            }

            console.log('Profile synced successfully');
            return true;
        } catch (err) {
            console.error('Error syncing profile:', err);
            return false;
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        const maxFiles = 5;
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        Array.from(files).forEach((file) => {
            if (file.size > maxFileSize) {
                setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }

            if (uploadedFiles.length >= maxFiles) {
                setError(`Maximum ${maxFiles} files allowed`);
                return;
            }

            if (uploadedFiles.some(f => f.file.name === file.name)) {
                setError(`File "${file.name}" already uploaded`);
                return;
            }

            const fileObject: UploadedFile = {
                file,
                name: file.name,
                size: formatFileSize(file.size),
            };

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedFiles(prev => {
                        const updated = [...prev];
                        const index = updated.findIndex(f => f.file === file);
                        if (index >= 0) {
                            updated[index].preview = e.target?.result as string;
                        }
                        return updated;
                    });
                };
                reader.readAsDataURL(file);
            }

            setUploadedFiles(prev => [...prev, fileObject]);
            setError(null);
        });
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCheckout = async () => {
        // Validate user details first
        if (!validateUserDetails()) {
            setError('Please complete all required fields correctly');
            return;
        }

        if (!orderData) {
            setError('Order data is missing');
            return;
        }

        if (uploadedFiles.length === 0) {
            setError('Please upload at least one file');
            return;
        }

        if (!description.trim()) {
            setError('Please provide a description');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Sync user details to profile
            console.log('Step 1: Syncing user details to profile...');
            await syncUserDetailsToProfile();

            // Use finalTotal if available (with GST), otherwise use totalPrice
            const amountToPay = orderData.pricing.finalTotal || orderData.pricing.totalPrice;

            // Step 2: Create Razorpay Order
            console.log('Step 2: Creating Razorpay order...');
            const orderResponse = await fetch('/api/payments/razorpay/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amountToPay,
                    productName: orderData.product.name,
                    userEmail: userDetails.email,
                    userName: `${userDetails.firstName} ${userDetails.lastName}`,
                    // Include all order details for backend
                    orderData: orderData,
                    userDetails: userDetails,
                    uploadedFilesCount: uploadedFiles.length,
                    description: description,
                }),
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const { orderId, amount } = await orderResponse.json();
            console.log('✅ Razorpay order created:', orderId);

            // Step 3: Upload files
            console.log('Step 3: Uploading files...');
            const formData = new FormData();
            uploadedFiles.forEach((fileObj, index) => {
                console.log(`Adding file ${index}: ${fileObj.name}`);
                formData.append(`file_${index}`, fileObj.file);
            });
            formData.append('description', description);
            formData.append('orderId', orderId);
            formData.append('productName', orderData.product.name);
            formData.append('userEmail', userDetails.email);
            formData.append('userName', `${userDetails.firstName} ${userDetails.lastName}`);
            formData.append('userPhone', userDetails.phone);
            formData.append('userAddress', userDetails.address);
            formData.append('userCity', userDetails.city);
            formData.append('userState', userDetails.state);
            formData.append('userPincode', userDetails.pincode);
            formData.append('totalAmount', amountToPay.toString());

            console.log('Sending upload request to /api/orders/send-details');
            const uploadResponse = await fetch('/api/orders/send-details', {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', uploadResponse.status);
            
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Upload error response:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || `Upload failed: ${uploadResponse.status}`);
                } catch (e) {
                    throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
                }
            }

            const uploadResult = await uploadResponse.json();
            console.log('✅ Files uploaded successfully:', uploadResult);

            // Step 4: Check if Razorpay is loaded
            console.log('Step 4: Checking Razorpay...');
            if (typeof window === 'undefined' || !window.Razorpay) {
                throw new Error('Razorpay payment gateway is not available. Please refresh the page.');
            }

            // Step 5: Open Razorpay Payment Gateway
            console.log('Step 5: Opening Razorpay payment modal...');
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount * 100,
                currency: 'INR',
                name: process.env.NEXT_PUBLIC_APP_NAME || 'Himalaya Offset',
                description: `Order for ${orderData.product.name}`,
                order_id: orderId,
                handler: async (response: RazorpayResponse) => {
                    try {
                        console.log('Payment successful, verifying...');
                        const verifyResponse = await fetch('/api/payments/razorpay/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: orderId,
                                amount: amountToPay,
                                productName: orderData.product.name,
                                userName: `${userDetails.firstName} ${userDetails.lastName}`,
                                userEmail: userDetails.email,
                                userPhone: userDetails.phone,
                                userAddress: userDetails.address,
                                userCity: userDetails.city,
                                userState: userDetails.state,
                                userPincode: userDetails.pincode,
                                description: description,
                                uploadedFiles: uploadedFiles.length,
                                orderData: orderData,
                            }),
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('Payment verification failed');
                        }

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.verified) {
                            console.log('✅ Payment verified, redirecting to thank you page');
                            // FIXED: Redirect to /thank-you instead of /order-success
                            router.push(`/thank-you?orderId=${orderId}`);
                        } else {
                            setError('Payment verification failed. Please contact support.');
                            setLoading(false);
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        setError(err instanceof Error ? err.message : 'Payment verification failed');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: `${userDetails.firstName} ${userDetails.lastName}`,
                    email: userDetails.email,
                    contact: userDetails.phone,
                },
                theme: {
                    color: '#2067ff',
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setError('Payment cancelled by user');
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error('❌ Checkout error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process order');
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="checkout-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    if (error && !orderData) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="checkout-card">
                        <div className="checkout-error">
                            <h1>Order Error</h1>
                            <p>{error || 'Something went wrong'}</p>
                            <Link href="/products" className="back-btn">Back to Products</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const finalPrice = orderData?.pricing.finalTotal || orderData?.pricing.totalPrice || 0;
    const gstAmount = orderData?.pricing.gstAmount || 0;

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={handleRazorpayScriptLoad}
                strategy="lazyOnload"
            />

            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="checkout-card">
                        <div className="checkout-header">
                            <h1>Checkout</h1>
                            <p>Review your order and complete payment</p>
                        </div>

                        {/* User Details Section */}
                        <div className="user-details-section">
                            <h3>Delivery Details</h3>

                            <div className="user-details-grid">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={userDetails.firstName}
                                        onChange={(e) => handleUserDetailChange('firstName', e.target.value)}
                                        placeholder="Enter your first name"
                                        className={validationErrors.firstName ? 'input-error' : ''}
                                    />
                                    {validationErrors.firstName && (
                                        <span className="field-error">{validationErrors.firstName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={userDetails.lastName}
                                        onChange={(e) => handleUserDetailChange('lastName', e.target.value)}
                                        placeholder="Enter your last name"
                                        className={validationErrors.lastName ? 'input-error' : ''}
                                    />
                                    {validationErrors.lastName && (
                                        <span className="field-error">{validationErrors.lastName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={userDetails.email}
                                        onChange={(e) => handleUserDetailChange('email', e.target.value)}
                                        placeholder="Enter your email"
                                        className={validationErrors.email ? 'input-error' : ''}
                                    />
                                    {validationErrors.email && (
                                        <span className="field-error">{validationErrors.email}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={userDetails.phone}
                                        onChange={(e) => handleUserDetailChange('phone', e.target.value)}
                                        placeholder="Enter 10-digit phone number"
                                        className={validationErrors.phone ? 'input-error' : ''}
                                    />
                                    {validationErrors.phone && (
                                        <span className="field-error">{validationErrors.phone}</span>
                                    )}
                                </div>

                                <div className="form-group full-width">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        value={userDetails.address}
                                        onChange={(e) => handleUserDetailChange('address', e.target.value)}
                                        placeholder="Enter your street address"
                                        className={validationErrors.address ? 'input-error' : ''}
                                    />
                                    {validationErrors.address && (
                                        <span className="field-error">{validationErrors.address}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={userDetails.city}
                                        onChange={(e) => handleUserDetailChange('city', e.target.value)}
                                        placeholder="Enter your city"
                                        className={validationErrors.city ? 'input-error' : ''}
                                    />
                                    {validationErrors.city && (
                                        <span className="field-error">{validationErrors.city}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={userDetails.state}
                                        onChange={(e) => handleUserDetailChange('state', e.target.value)}
                                        placeholder="Enter your state"
                                        className={validationErrors.state ? 'input-error' : ''}
                                    />
                                    {validationErrors.state && (
                                        <span className="field-error">{validationErrors.state}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input
                                        type="text"
                                        value={userDetails.pincode}
                                        onChange={(e) => handleUserDetailChange('pincode', e.target.value)}
                                        placeholder="Enter your pincode"
                                        className={validationErrors.pincode ? 'input-error' : ''}
                                    />
                                    {validationErrors.pincode && (
                                        <span className="field-error">{validationErrors.pincode}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Section */}
                        <div className="product-section">
                            <h3>Order Items</h3>
                            <div className="order-item">
                                {orderData?.product.image && (
                                    <div className="item-image">
                                        <Image
                                            src={orderData.product.image}
                                            alt={orderData.product.name}
                                            width={100}
                                            height={100}
                                        />
                                    </div>
                                )}
                                <div className="item-details">
                                    <h4>{orderData?.product.name}</h4>
                                    <p className="quantity">Qty: {orderData?.quantity} units</p>
                                    {orderData && Object.keys(orderData.selectedOptions).length > 0 && (
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

                        {/* Files Section */}
                        <div className="files-section">
                            <h3>Upload Files / Samples</h3>
                            <p className="section-description">Upload up to 5 files (images, PDFs, documents, etc.). Max 10MB per file.</p>

                            <div className="file-upload-box">
                                <label className="file-upload-label">
                                    <input
                                        type="file"
                                        multiple
                                        accept="*"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="upload-placeholder">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p>Click to upload or drag and drop</p>
                                        <span>Images, PDFs, Documents, etc.</span>
                                    </div>
                                </label>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="uploaded-files-list">
                                    <h4>Uploaded Files ({uploadedFiles.length}/5)</h4>
                                    {uploadedFiles.map((fileObj, index) => (
                                        <div key={index} className="file-item">
                                            {fileObj.preview && (
                                                <div className="file-preview-thumb">
                                                    <Image
                                                        src={fileObj.preview}
                                                        alt={fileObj.name}
                                                        width={60}
                                                        height={60}
                                                    />
                                                </div>
                                            )}
                                            <div className="file-info">
                                                <p className="file-name">{fileObj.name}</p>
                                                <p className="file-size">{fileObj.size}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-file-btn"
                                                onClick={() => removeFile(index)}
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
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

                        {/* Price Section */}
                        <div className="price-section">
                            <div className="price-row">
                                <span>Subtotal</span>
                                <span>₹{Math.round(orderData?.pricing.totalPrice || 0).toLocaleString()}</span>
                            </div>
                            {gstAmount > 0 && (
                                <div className="price-row">
                                    <span>GST (18%)</span>
                                    <span>₹{Math.round(gstAmount).toLocaleString()}</span>
                                </div>
                            )}
                            {orderData && orderData.pricing.optionsPrice > 0 && (
                                <div className="price-row">
                                    <span>Customizations</span>
                                    <span>+₹{orderData.pricing.optionsPrice.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="price-row total">
                                <span>Total Amount</span>
                                <span>₹{Math.round(finalPrice).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && <div className="error-message">{error}</div>}

                        {/* Checkout Button */}
                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                            disabled={loading || !razorpayLoaded}
                        >
                            {loading ? 'Processing...' : `Proceed to Payment - ₹${Math.round(finalPrice).toLocaleString()}`}
                        </button>

                        {/* Trust Info */}
                        <div className="trust-info">
                            <p>Secure payment powered by Razorpay</p>
                            <p>Your files and details will be sent to us via email for processing</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="checkout-page"><div className="loading">Loading checkout...</div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
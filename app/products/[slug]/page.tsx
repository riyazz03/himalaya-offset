'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SanityService, Subcategory } from '@/lib/sanity';
import { renderBlockContent } from '@/lib/sanity-block-renderer';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import '@/styles/single-product-page.css';

interface SelectedOptions {
    [key: string]: string | number;
}

export default function ProductPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<Subcategory | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
    const [quantity, setQuantity] = useState(0);
    const [activeTab, setActiveTab] = useState<'details' | 'instructions'>('details');
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const fetchProductData = async (productSlug: string) => {
            try {
                const { data } = await SanityService.getProduct(productSlug);

                if (data) {
                    setProduct(data);
                    if (data.pricingTiers && data.pricingTiers.length > 0) {
                        setQuantity(data.pricingTiers[0].quantity);
                    }
                    setError(null);
                } else {
                    setError('Product not found');
                    setProduct(null);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData(slug);
    }, [slug]);

    if (loading) {
        return <div className="product-page"></div>;
    }

    if (error || !product) {
        return (
            <div className="product-page">
                <div className="product-error">
                    <h1>Product Not Found</h1>
                    <p>{error || 'The product you are looking for does not exist.'}</p>
                    <Link href="/products" className="back-home-btn">Go Back</Link>
                </div>
            </div>
        );
    }

    const handleTierSelection = (tierIndex: number, tierQuantity: number) => {
        setSelectedTier(tierIndex);
        setQuantity(tierQuantity);
    };

    const handleOptionChange = (optionLabel: string, value: string | number) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionLabel]: value
        }));
    };

    const calculateTotalPrice = () => {
        if (!product.pricingTiers || product.pricingTiers.length === 0) {
            return { basePrice: 0, optionsPrice: 0, totalPrice: 0 };
        }

        const basePriceData = product.pricingTiers[selectedTier];
        const basePrice = basePriceData.price;

        let optionsPrice = 0;

        if (product.productOptions) {
            product.productOptions.forEach(option => {
                const selectedValue = selectedOptions[option.label];

                if (option.optionType === 'number' && option.numberConfig) {
                    const numValue = Number(selectedValue) || 0;
                    optionsPrice += numValue * (option.numberConfig.pricePerUnit || 0) * quantity;
                } else if (selectedValue && option.values) {
                    const selectedOptionValue = option.values.find(v => v.value === selectedValue);
                    if (selectedOptionValue && selectedOptionValue.priceModifier) {
                        optionsPrice += selectedOptionValue.priceModifier * quantity;
                    }
                }
            });
        }

        const totalPrice = basePrice + optionsPrice;

        return { basePrice, optionsPrice, totalPrice, pricePerUnit: basePriceData.pricePerUnit };
    };

    const handlePlaceOrder = () => {
        const priceData = calculateTotalPrice();
        
        const orderData = {
            product: {
                id: product._id,
                name: product.name,
                slug: product.slug,
                image: product.image_url
            },
            quantity: quantity,
            selectedTier: product.pricingTiers?.[selectedTier],
            selectedOptions: selectedOptions,
            pricing: priceData
        };

        // Encode order data and redirect to confirmation page
        const encodedData = encodeURIComponent(JSON.stringify(orderData));
        window.location.href = `/order-confirmation?data=${encodedData}`;
    };

    const priceBreakdown = calculateTotalPrice();
    const currentTier = product.pricingTiers?.[selectedTier];

    // Build image list - use multi images if available, fallback to single image
    const imageList = product.images && product.images.length > 0 
        ? product.images.map(img => ({ url: img.asset, alt: img.alt || product.name }))
        : product.image_url 
            ? [{ url: product.image_url, alt: product.image_alt || product.name }]
            : [];

    return (
        <div className="product-page">
            {/* Product Container */}
            <div className="product-container">
                <div className="product-layout">
                    {/* Left: Image Gallery */}
                    <div className="product-left">
                        {imageList.length > 0 ? (
                            <div className="product-gallery">
                                {/* Main Swiper */}
                                {isMounted && (
                                    <>
                                        <Swiper
                                            modules={[Navigation, Thumbs, Autoplay]}
                                            thumbs={{ swiper: thumbsSwiper }}
                                            navigation
                                            autoplay={{
                                                delay: 5000,
                                                disableOnInteraction: false,
                                            }}
                                            loop
                                            className="product-swiper-main"
                                        >
                                            {imageList.map((image, index) => (
                                                <SwiperSlide key={index}>
                                                    <div className="product-image-wrapper">
                                                        <Image
                                                            src={image.url}
                                                            alt={image.alt}
                                                            fill
                                                            className="product-image"
                                                            priority={index === 0}
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>

                                        {/* Thumbnail Swiper - Only show if multiple images */}
                                        {imageList.length > 1 && (
                                            <Swiper
                                                onSwiper={setThumbsSwiper}
                                                modules={[Navigation, Thumbs]}
                                                spaceBetween={10}
                                                slidesPerView={4}
                                                freeMode
                                                watchSlidesProgress
                                                className="product-swiper-thumbs"
                                            >
                                                {imageList.map((image, index) => (
                                                    <SwiperSlide key={index}>
                                                        <div className="thumbnail-wrapper">
                                                            <Image
                                                                src={image.url}
                                                                alt={image.alt}
                                                                fill
                                                                className="thumbnail-image"
                                                            />
                                                        </div>
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="image-placeholder">
                                <div className="placeholder-text">No Image</div>
                            </div>
                        )}

                        {/* Tabs Section Below Image */}
                        <div className="product-tabs">
                            <div className="tabs-header">
                                <button
                                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Details
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('instructions')}
                                >
                                    Instructions
                                </button>
                            </div>

                            <div className="tabs-content">
                                {/* Details Tab */}
                                <div className={`tab-pane ${activeTab === 'details' ? 'active' : ''}`}>
                                    {/* Description */}
                                    {product.description && (
                                        <div className="tab-description">
                                            <h3>Product Description</h3>
                                            {renderBlockContent(product.description)}
                                        </div>
                                    )}

                                    {/* Specifications */}
                                    {product.specifications && product.specifications.length > 0 && (
                                        <div className="tab-specs">
                                            <h3>Specifications</h3>
                                            <ul className="product-specs-list">
                                                {product.specifications.map((spec, index) => (
                                                    <li key={index}>
                                                        <strong>{spec.label}:</strong> {spec.value}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Instructions Tab */}
                                <div className={`tab-pane ${activeTab === 'instructions' ? 'active' : ''}`}>
                                    <div className="tab-instructions">
                                        <h3>Instructions</h3>
                                        {product.instructions ? (
                                            renderBlockContent(product.instructions)
                                        ) : (
                                            <p className="no-instructions">Instructions coming soon...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="product-right">
                        {/* Title */}
                        <h1 className="product-title">{product.name}</h1>

                        {/* Price Display */}
                        <div className="price-header">
                            <div className="price-main">₹{priceBreakdown.totalPrice.toLocaleString()}</div>
                            <div className="price-sub">
                                ₹{currentTier?.pricePerUnit || 0} each / {quantity} units
                            </div>
                        </div>

                        {/* Quantity Selection - Dropdown */}
                        {product.pricingTiers && product.pricingTiers.length > 0 && (
                            <div className="option-section">
                                <label className="option-label">Quantity</label>
                                <select
                                    className="option-select"
                                    value={selectedTier}
                                    onChange={(e) => {
                                        const index = parseInt(e.target.value);
                                        handleTierSelection(index, product.pricingTiers![index].quantity);
                                    }}
                                >
                                    {product.pricingTiers.map((tier, index) => (
                                        <option key={index} value={index}>
                                            {tier.quantity} units - ₹{tier.price} (₹{tier.pricePerUnit}/unit)
                                            {tier.isRecommended ? ' (Recommended)' : ''}
                                            {tier.savingsPercentage ? ` - ${tier.savingsPercentage}% OFF` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Product Options - Dropdown Only */}
                        {product.productOptions && product.productOptions.length > 0 && (
                            <>
                                {product.productOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-section">
                                        <label className="option-label">
                                            {option.label}
                                            {option.isRequired && <span className="required">*</span>}
                                        </label>

                                        <select
                                            className="option-select"
                                            value={selectedOptions[option.label] || ''}
                                            onChange={(e) => handleOptionChange(option.label, e.target.value)}
                                        >
                                            <option value="">Select {option.label}...</option>
                                            {option.values && option.values.map((value, valueIndex) => (
                                                <option key={valueIndex} value={value.value}>
                                                    {value.label}
                                                    {value.priceModifier ? ` (+₹${value.priceModifier}/unit)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Price Breakdown */}
                        {priceBreakdown.optionsPrice > 0 && (
                            <div className="price-summary">
                                <div className="summary-row">
                                    <span>Base Price ({quantity} units)</span>
                                    <span>₹{priceBreakdown.basePrice.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Customizations</span>
                                    <span>+₹{priceBreakdown.optionsPrice.toLocaleString()}</span>
                                </div>
                                <div className="summary-total">
                                    <span>Total</span>
                                    <span>₹{priceBreakdown.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {/* Place Order Button */}
                        <button 
                            className="order-button"
                            onClick={handlePlaceOrder}
                        >
                            Continue to Order - ₹{priceBreakdown.totalPrice.toLocaleString()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
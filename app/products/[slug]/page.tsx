'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SanityService, Subcategory } from '@/lib/sanity';
import '@/styles/single-product-page.css';

interface SelectedOptions {
    [key: string]: string | number;
}

export default function ProductPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<Subcategory | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
    const [quantity, setQuantity] = useState(0);

    useEffect(() => {
        if (!slug) return;

        const fetchProductData = async (productSlug: string) => {
            try {
                const { data } = await SanityService.getProduct(productSlug);

                if (data) {
                    setProduct(data);
                    if (data.pricingTiers && data.pricingTiers.length > 0) {
                        setQuantity(data.pricingTiers[0].quantity);
                    }
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product');
            }
        };

        fetchProductData(slug);
    }, [slug]);

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

    return (
        <div className="product-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="breadcrumb-container">
                    <Link href="/" className="breadcrumb-link">Home</Link>
                    <span className="breadcrumb-separator">/</span>
                    {product.category && (
                        <>
                            <Link href={`/categories/${product.category.slug}`} className="breadcrumb-link">
                                {product.category.name}
                            </Link>
                            <span className="breadcrumb-separator">/</span>
                        </>
                    )}
                    <span className="breadcrumb-current">{product.name}</span>
                </div>
            </div>

            {/* Product Container */}
            <div className="product-container">
                <div className="product-layout">
                    {/* Left: Image */}
                    <div className="product-left">
                        <div className="product-image-wrapper">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="product-image"
                                    priority
                                />
                            ) : (
                                <div className="image-placeholder">
                                    <div className="placeholder-text">No Image</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="product-right">
                        {/* Title */}
                        <h1 className="product-title">{product.name}</h1>

                        {/* Category */}
                        {product.category && (
                            <div className="product-category">
                                <Link href={`/categories/${product.category.slug}`}>
                                    {product.category.name}
                                </Link>
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div className="product-description">
                                {Array.isArray(product.description) 
                                    ? product.description.map((item, index) => (
                                        <p key={index}>{String(item)}</p>
                                    ))
                                    : <p>{String(product.description)}</p>
                                }
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications && product.specifications.length > 0 && (
                            <ul className="product-specs">
                                {product.specifications.map((spec, index) => (
                                    <li key={index}>{spec.label}: {spec.value}</li>
                                ))}
                            </ul>
                        )}

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

                        {/* Footer Notes */}
                        <div className="footer-notes">
                            <div className="note-item">✓ Multiple payment options available</div>
                            <div className="note-item">✓ Price inclusive of all taxes</div>
                            {product.minOrderQuantity && (
                                <div className="note-item">
                                    ✓ Minimum order: {product.minOrderQuantity} units
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
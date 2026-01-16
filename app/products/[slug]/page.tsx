'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SanityService, Subcategory, ProductOption, OptionValue } from '@/lib/sanity';
import { renderBlockContent } from '@/lib/sanity-block-renderer';
import Title from '@/component/Title-Block-Rounded';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import '@/styles/single-product-page.css';


interface SelectedOptions {
    [key: string]: string | number;
}

interface PriceData {
    basePrice: number;
    optionsPrice: number;
    totalPrice: number;
    pricePerUnit: number;
    gstAmount: number;
    gstPercentage: number;
    finalTotal: number;
}

export default function ProductPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<Subcategory | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
    const [quantity, setQuantity] = useState(0);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [showAllQuantities, setShowAllQuantities] = useState(false);
    const [priceBreakdown, setPriceBreakdown] = useState<PriceData>({
        basePrice: 0,
        optionsPrice: 0,
        totalPrice: 0,
        pricePerUnit: 0,
        gstAmount: 0,
        gstPercentage: 18,
        finalTotal: 0
    });
    const [showOptionTooltip, setShowOptionTooltip] = useState(false);

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
        setSelectedTier(null);
        setQuantity(0);
        setSelectedOptions({});

        const fetchProductData = async (productSlug: string) => {
            try {
                const { data } = await SanityService.getProduct(productSlug);

                if (data) {
                    setProduct(data);
                    
                    if (data.pricingTiers && data.pricingTiers.length > 0) {
                        const sortedTiers = [...data.pricingTiers].sort((a, b) => a.quantity - b.quantity);
                        const firstTier = sortedTiers[0];
                        
                        setSelectedTier(0);
                        setQuantity(firstTier.quantity);
                    } else {
                        setSelectedTier(null);
                        setQuantity(0);
                    }
                    
                    if (data.productOptions && data.productOptions.length > 0) {
                        const initialOptions: SelectedOptions = {};
                        data.productOptions.forEach((option: ProductOption) => {
                            if (option.values && option.values.length > 0) {
                                initialOptions[option.label] = option.values[0].value;
                            }
                        });
                        setSelectedOptions(initialOptions);
                    }
                } else {
                    setError('Product not found');
                    setProduct(null);
                }
            } catch (err) {
                setError('Failed to load product');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData(slug);
    }, [slug]);

    const getOptionPriceModifier = (optionLabel: string, optionValue: string, tierIndex: number): number => {
        if (!product?.productOptions || !product?.pricingTiers) return 0;

        const option = product.productOptions.find(opt => opt.label === optionLabel);
        if (!option?.values) return 0;

        const selectedOptionValue = option.values.find(val => val.value === optionValue);
        if (!selectedOptionValue) return 0;

        const sortedTiers = [...product.pricingTiers].sort((a, b) => a.quantity - b.quantity);
        
        if (tierIndex < 0 || tierIndex >= sortedTiers.length) {
            return selectedOptionValue.basePrice || 0;
        }

        const currentTier = sortedTiers[tierIndex];
        const tierLabel = currentTier?.quantity?.toString();

        if (selectedOptionValue.priceByTier && tierLabel) {
            const tierPrice = selectedOptionValue.priceByTier.find(t => t.tierLabel === tierLabel);
            if (tierPrice) {
                return tierPrice.price || 0;
            }
        }

        return selectedOptionValue.basePrice || 0;
    };

    const calculatePricePerUnitModifier = (tierIndex: number): number => {
        let modifier = 0;

        if (product?.productOptions) {
            product.productOptions.forEach((option: ProductOption) => {
                const selectedValue = selectedOptions[option.label];
                if (selectedValue) {
                    const optionModifier = getOptionPriceModifier(option.label, selectedValue as string, tierIndex);
                    modifier += optionModifier;
                }
            });
        }

        return modifier;
    };

    const calculateTotalPrice = (tierIndex: number, qty: number): PriceData => {
        if (!product?.pricingTiers || product.pricingTiers.length === 0) {
            return { 
                basePrice: 0, 
                optionsPrice: 0, 
                totalPrice: 0, 
                pricePerUnit: 0,
                gstAmount: 0,
                gstPercentage: 18,
                finalTotal: 0
            };
        }

        if (tierIndex < 0 || tierIndex >= product.pricingTiers.length) {
            return { 
                basePrice: 0, 
                optionsPrice: 0, 
                totalPrice: 0, 
                pricePerUnit: 0,
                gstAmount: 0,
                gstPercentage: 18,
                finalTotal: 0
            };
        }

        const sortedTiers = [...product.pricingTiers].sort((a, b) => a.quantity - b.quantity);
        const selectedTierData = sortedTiers[tierIndex];
        
        const basePricePerUnit = selectedTierData.pricePerUnit || selectedTierData.price || 0;
        const tierQuantity = selectedTierData.quantity || 1;
        
        const optionPricePerUnit = calculatePricePerUnitModifier(tierIndex);
        
        const finalPricePerUnit = basePricePerUnit + optionPricePerUnit;
        
        const subtotal = finalPricePerUnit * qty;
        
        const gstPercentage = 18;
        const gstAmount = Math.round(subtotal * (gstPercentage / 100) * 100) / 100;
        
        const finalTotal = Math.round((subtotal + gstAmount) * 100) / 100;

        return { 
            basePrice: subtotal,
            optionsPrice: optionPricePerUnit * qty,
            totalPrice: subtotal, 
            pricePerUnit: finalPricePerUnit,
            gstAmount,
            gstPercentage,
            finalTotal
        };
    };

    useEffect(() => {
        if (product && selectedTier !== null && selectedTier >= 0) {
            setPriceBreakdown(calculateTotalPrice(selectedTier, quantity));
        }
    }, [selectedTier, selectedOptions, product, quantity]);

    const getAdjustedTierPrice = (tierIndex: number, tierData: any): number => {
        const pricePerUnit = tierData.pricePerUnit || tierData.price || 0;
        const tierQuantity = tierData.quantity || 1;
        
        const optionPricePerUnit = calculatePricePerUnitModifier(tierIndex);
        
        const adjustedPrice = (pricePerUnit + optionPricePerUnit) * tierQuantity;
        
        return adjustedPrice;
    };

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

    const areAllOptionsSelected = (): boolean => {
        if (!product?.productOptions || product.productOptions.length === 0) {
            return true;
        }

        return product.productOptions.every((option: ProductOption) => {
            return selectedOptions[option.label] && selectedOptions[option.label] !== '';
        });
    };

    const handlePlaceOrder = () => {
        if (!product?.pricingTiers || selectedTier === null) return;
        
        if (!areAllOptionsSelected()) {
            setShowOptionTooltip(true);
            setTimeout(() => setShowOptionTooltip(false), 3000);
            return;
        }

        const sortedTiers = [...product.pricingTiers].sort((a, b) => a.quantity - b.quantity);

        const orderData = {
            product: {
                id: product._id,
                name: product.name,
                slug: product.slug,
                image: product.image_url
            },
            quantity: quantity,
            selectedTier: sortedTiers[selectedTier],
            selectedOptions: selectedOptions,
            pricing: priceBreakdown
        };

        const encodedData = encodeURIComponent(JSON.stringify(orderData));
        window.location.href = `/order-confirmation?data=${encodedData}`;
    };

    if (loading) {
        return <div className="product-page"></div>;
    }

    if (error || !product) {
        return (
            <div className="product-page">
                <div className="product-error">
                    <h2>Product Not Found</h2>
                    <p>{error || 'The product you are looking for does not exist.'}</p>
                    <Link href="/products" className="back-home-btn">Go Back</Link>
                </div>
            </div>
        );
    }

    const imageList = product.images && product.images.length > 0 
        ? product.images.map(img => ({ url: img.asset, alt: img.alt || product.name }))
        : product.image_url 
            ? [{ url: product.image_url, alt: product.image_alt || product.name }]
            : [];

    const sortedTiers = product.pricingTiers ? [...product.pricingTiers].sort((a, b) => a.quantity - b.quantity) : [];
    const displayedTiers = showAllQuantities ? sortedTiers : sortedTiers.slice(0, 3);
    const hasMoreTiers = sortedTiers.length > 3;
    const hasPricingTiers = sortedTiers.length > 0;

    return (
        <div className="product-page">
            <div className="product-container">
                <div className="product-layout">
                    <div className="product-left">
                        {imageList.length > 0 ? (
                            <div className="product-gallery">
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
                                            loop={imageList.length > 1}
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

                        {product.instructions && (
                            <div className="instructions-card">
                                <div className="instructions-title">Instructions</div>
                                <div className="instructions-content">
                                    {renderBlockContent(product.instructions)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="product-right">
                        <div className="category-tag-container">
                            <Title title={product.category?.name || 'Product'} />
                        </div>

                        <h1 className="product-title">{product.name}</h1>

                        {product.description && (
                            <div className="product-description-card">
                                <div className="description-label">Description</div>
                                <div className="product-description">
                                    {renderBlockContent(product.description)}
                                </div>
                            </div>
                        )}

                        {!hasPricingTiers ? (
                            <div className="no-pricing-message">
                                <p>Pricing information not available. Please contact us for a quote.</p>
                                <Link href="/contact-us" className="contact-button">
                                    Contact Us
                                </Link>
                            </div>
                        ) : (
                            <>
                                {selectedTier !== null && (
                                    <div className="price-header">
                                        <div className="price-main">₹{priceBreakdown.finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                        <div className="price-sub">
                                            ({quantity} units)
                                        </div>
                                    </div>
                                )}

                                {product.productOptions && product.productOptions.length > 0 && (
                                    <>
                                        {product.productOptions.map((option: ProductOption, optionIndex: number) => (
                                            <div key={optionIndex} className="option-section">
                                                <label className="option-label">
                                                    {option.label}
                                                    <span className="required">*</span>
                                                </label>

                                                <select
                                                    className="option-select"
                                                    value={selectedOptions[option.label] || ''}
                                                    onChange={(e) => handleOptionChange(option.label, e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select {option.label}...</option>
                                                    {option.values && option.values.map((value: OptionValue, valueIndex: number) => {
                                                        return (
                                                            <option key={valueIndex} value={value.value}>
                                                                {value.label}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {sortedTiers.length > 0 && (
                                    <div className="quantity-section">
                                        <label className="quantity-label">SELECT QUANTITY</label>
                                        <div className="quantity-list">
                                            {displayedTiers.map((tier, displayIndex) => {
                                                const actualIndex = sortedTiers.indexOf(tier);
                                                const adjustedPrice = getAdjustedTierPrice(actualIndex, tier);
                                                const isSelected = selectedTier === actualIndex;
                                                
                                                return (
                                                    <div 
                                                        key={displayIndex} 
                                                        className={`quantity-item ${isSelected ? 'active' : ''}`}
                                                        onClick={() => handleTierSelection(actualIndex, tier.quantity)}
                                                    >
                                                        <div className="qty-left">
                                                            <span className="qty-number">{tier.quantity}</span>
                                                        </div>
                                                        <div className="qty-right">
                                                            <span className="qty-price">₹{adjustedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                            {tier.savingsPercentage && (
                                                                <span className="qty-savings">{tier.savingsPercentage}% savings</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {hasMoreTiers && !showAllQuantities && (
                                            <button 
                                                className="show-more-button"
                                                onClick={() => setShowAllQuantities(true)}
                                            >
                                                Show More Options
                                            </button>
                                        )}

                                        {showAllQuantities && hasMoreTiers && (
                                            <button 
                                                className="show-more-button show-less"
                                                onClick={() => setShowAllQuantities(false)}
                                            >
                                                Show Less Options
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="price-calculation">
                                    <div className="calc-row">
                                        <span className="calc-label">
                                            {quantity} units × ₹{priceBreakdown.pricePerUnit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="calc-value">₹{priceBreakdown.totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="calc-row gst">
                                        <span className="calc-label">GST (18%)</span>
                                        <span className="calc-value">₹{priceBreakdown.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="calc-row total">
                                        <span className="calc-label">Total Amount</span>
                                        <span className="calc-value">₹{priceBreakdown.finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>

                                {showOptionTooltip && (
                                    <div style={{
                                        backgroundColor: '#ff6b6b',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        marginBottom: '16px',
                                        width: '100%'
                                    }}>
                                        ⚠️ Please select all options before continuing
                                    </div>
                                )}
                                <button 
                                    className="order-button"
                                    onClick={handlePlaceOrder}
                                >
                                    CONTINUE TO CHECKOUT
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
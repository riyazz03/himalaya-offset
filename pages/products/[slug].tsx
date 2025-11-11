// pages/products/[slug].tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { SanityService, Subcategory } from '../../lib/sanity'
import '@/styles/single-product-page.css'
import Providers from '@/component/Providers'

interface ProductPageProps {
    product: Subcategory | null
}

interface SelectedOptions {
    [key: string]: string | number
}

const ProductPage = ({ product: initialProduct }: ProductPageProps) => {
    const router = useRouter()
    const [product, setProduct] = useState<Subcategory | null>(initialProduct)
    const [loading, setLoading] = useState(!initialProduct)
    const [selectedTier, setSelectedTier] = useState(0)
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
    const [quantity, setQuantity] = useState(0)

    const { slug } = router.query

    useEffect(() => {
        if (!initialProduct && slug && typeof slug === 'string') {
            fetchProductData(slug)
        }
    }, [slug, initialProduct])

    useEffect(() => {
        if (product?.pricingTiers && product.pricingTiers.length > 0) {
            setQuantity(product.pricingTiers[0].quantity)
        }
    }, [product])

    const fetchProductData = async (productSlug: string) => {
        try {
            setLoading(true)
            const { data, error } = await SanityService.getProduct(productSlug)

            if (!error && data) {
                setProduct(data)
            }
        } catch (err) {
            console.error('Error fetching product:', err)
        } finally {
            setLoading(false)
        }
    }

    if (router.isFallback || loading) {
        return (
            <div className="product-loading">
                <div className="loading-spinner"></div>
                <p>Loading product details...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-error">
                <h1>Product Not Found</h1>
                <p>The product you are looking for does not exist.</p>
                <Link href="/" className="back-link">Go Back Home</Link>
            </div>
        )
    }

    const handleTierSelection = (tierIndex: number, tierQuantity: number) => {
        setSelectedTier(tierIndex)
        setQuantity(tierQuantity)
    }

    const handleOptionChange = (optionLabel: string, value: string | number) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionLabel]: value
        }))
    }

    const calculateTotalPrice = () => {
        if (!product.pricingTiers || product.pricingTiers.length === 0) {
            return { basePrice: 0, optionsPrice: 0, totalPrice: 0 }
        }

        const basePriceData = product.pricingTiers[selectedTier]
        const basePrice = basePriceData.price

        let optionsPrice = 0

        if (product.productOptions) {
            product.productOptions.forEach(option => {
                const selectedValue = selectedOptions[option.label]

                if (option.optionType === 'number' && option.numberConfig) {
                    const numValue = Number(selectedValue) || 0
                    optionsPrice += numValue * (option.numberConfig.pricePerUnit || 0)
                } else if (selectedValue && option.values) {
                    const selectedOptionValue = option.values.find(v => v.value === selectedValue)
                    if (selectedOptionValue && selectedOptionValue.priceModifier) {
                        optionsPrice += selectedOptionValue.priceModifier
                    }
                }
            })
        }

        const totalPrice = basePrice + optionsPrice

        return { basePrice, optionsPrice, totalPrice, pricePerUnit: basePriceData.pricePerUnit }
    }

    const handlePlaceOrder = () => {
        const priceData = calculateTotalPrice()
        
        const orderData = {
            product: {
                id: product._id,
                name: product.name,
                slug: product.slug
            },
            quantity: quantity,
            selectedTier: product.pricingTiers?.[selectedTier],
            selectedOptions: selectedOptions,
            pricing: priceData
        }

        console.log('Order Data for Razorpay:', orderData)
        
        // TODO: Integrate Razorpay here
        alert(`Order Total: ₹${priceData.totalPrice}\n\nRazorpay integration pending...`)
    }

    const priceBreakdown = calculateTotalPrice()
    const currentTier = product.pricingTiers?.[selectedTier]

    return (
        <Providers>
            <>
                <Head>
                    <title>{product.name} - Himalaya Offset</title>
                    <meta name="description" content={`Order ${product.name} with custom specifications. Minimum order: ${product.minOrderQuantity} units.`} />
                </Head>

                <div className="product-page">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        {product.category && (
                            <>
                                <Link href={`/categories/${product.category.slug}`}>
                                    {product.category.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="current">{product.name}</span>
                    </div>

                    {/* Product Content */}
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

                                {/* Rating - if you have it */}
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
                                    <div className="price-main">₹{currentTier?.price || 0}</div>
                                    <div className="price-sub">
                                        ₹{currentTier?.pricePerUnit || 0} each / {quantity} units
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                {product.deliveryOptions && product.deliveryOptions.length > 0 && (
                                    <div className="delivery-info">
                                        {product.deliveryOptions.map((option, index) => (
                                            <div key={index} className="delivery-item">
                                                <div className="delivery-type">
                                                    {option.type.replace('_', ' ').toUpperCase()}
                                                </div>
                                                <div className="delivery-desc">{option.description}</div>
                                                {option.locations && (
                                                    <div className="delivery-location">{option.locations}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Delivery Speed */}
                                {product.deliveryOptions && product.deliveryOptions.length > 0 && (
                                    <div className="option-section">
                                        <label className="option-label">Delivery Speed</label>
                                        <div className="delivery-options">
                                            {product.deliveryOptions.map((option, index) => (
                                                <div key={index} className="delivery-option-card">
                                                    <div className="delivery-option-type">
                                                        {option.type === 'standard' ? 'Standard' : 
                                                         option.type === 'same_day' ? 'Same Day Delivery' : 
                                                         'Express'}
                                                    </div>
                                                    {option.locations && (
                                                        <div className="delivery-option-info">
                                                            {option.locations}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Product Options */}
                                {product.productOptions && product.productOptions.length > 0 && (
                                    <>
                                        {product.productOptions.map((option, optionIndex) => (
                                            <div key={optionIndex} className="option-section">
                                                <label className="option-label">
                                                    {option.label}
                                                    {option.isRequired && <span className="required">*</span>}
                                                </label>

                                                {/* Dropdown */}
                                                {option.optionType === 'dropdown' && option.values && (
                                                    <select
                                                        className="option-select"
                                                        value={selectedOptions[option.label] || ''}
                                                        onChange={(e) => handleOptionChange(option.label, e.target.value)}
                                                    >
                                                        <option value="">Select...</option>
                                                        {option.values.map((value, valueIndex) => (
                                                            <option key={valueIndex} value={value.value}>
                                                                {value.label}
                                                                {value.priceModifier ? ` (+₹${value.priceModifier})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Radio Buttons */}
                                                {option.optionType === 'radio' && option.values && (
                                                    <div className="radio-options">
                                                        {option.values.map((value, valueIndex) => (
                                                            <label key={valueIndex} className="radio-option">
                                                                <input
                                                                    type="radio"
                                                                    name={option.label}
                                                                    value={value.value}
                                                                    checked={selectedOptions[option.label] === value.value}
                                                                    onChange={(e) => handleOptionChange(option.label, e.target.value)}
                                                                />
                                                                <span className="radio-text">
                                                                    {value.label}
                                                                    {value.priceModifier ? ` (+₹${value.priceModifier})` : ''}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Number Input */}
                                                {option.optionType === 'number' && option.numberConfig && (
                                                    <div className="number-option">
                                                        <input
                                                            type="number"
                                                            className="number-input"
                                                            min={option.numberConfig.min}
                                                            max={option.numberConfig.max}
                                                            step={option.numberConfig.step}
                                                            value={selectedOptions[option.label] || option.numberConfig.min || 0}
                                                            onChange={(e) => handleOptionChange(option.label, Number(e.target.value))}
                                                        />
                                                        {option.numberConfig.pricePerUnit && selectedOptions[option.label] && (
                                                            <div className="number-total">
                                                                = ₹{(Number(selectedOptions[option.label]) * option.numberConfig.pricePerUnit).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Quantity Selection */}
                                {product.pricingTiers && product.pricingTiers.length > 0 && (
                                    <div className="option-section">
                                        <label className="option-label">Quantity</label>
                                        <div className="quantity-tiers">
                                            {product.pricingTiers.map((tier, index) => (
                                                <div
                                                    key={index}
                                                    className={`quantity-tier ${selectedTier === index ? 'selected' : ''}`}
                                                    onClick={() => handleTierSelection(index, tier.quantity)}
                                                >
                                                    <div className="tier-qty">{tier.quantity}</div>
                                                    <div className="tier-price">
                                                        ₹{tier.price} 
                                                        <span className="tier-unit">₹{tier.pricePerUnit} / unit</span>
                                                    </div>
                                                    {tier.isRecommended && (
                                                        <div className="tier-badge">Recommended</div>
                                                    )}
                                                    {tier.savingsPercentage && (
                                                        <div className="tier-savings">{tier.savingsPercentage}% savings</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="see-more">See more quantities</div>
                                    </div>
                                )}

                                {/* Price Summary */}
                                {priceBreakdown.optionsPrice > 0 && (
                                    <div className="price-summary">
                                        <div className="summary-row">
                                            <span>Base Price ({quantity} units @ ₹{priceBreakdown.pricePerUnit}/unit)</span>
                                            <span>₹{priceBreakdown.basePrice.toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Customizations</span>
                                            <span>+₹{priceBreakdown.optionsPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Place Order Button */}
                                <button 
                                    className="order-button"
                                    onClick={handlePlaceOrder}
                                >
                                    Place Order - ₹{priceBreakdown.totalPrice.toLocaleString()}
                                </button>

                                {/* Footer Notes */}
                                <div className="footer-notes">
                                    <div className="note-item">Cash on Delivery available</div>
                                    <div className="note-item">Price below is MRP (inclusive of all taxes)</div>
                                    {product.minOrderQuantity && (
                                        <div className="note-item">
                                            Minimum order quantity: {product.minOrderQuantity} units
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </Providers>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: true
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    try {
        const slug = params?.slug as string

        if (!slug) {
            return { notFound: true }
        }

        const { data: product, error } = await SanityService.getProduct(slug)

        if (error || !product) {
            return { notFound: true }
        }

        return {
            props: {
                product
            },
            revalidate: 60
        }
    } catch (err) {
        console.error('Error in getStaticProps:', err)
        return { notFound: true }
    }
}

export default ProductPage
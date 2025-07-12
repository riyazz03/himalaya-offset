// pages/products/[slug].tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { SanityService, Subcategory } from '../../lib/sanity'
import '../../styles/product-page.css'
import Providers from '@/component/Providers'

interface ProductPageProps {
    product: Subcategory | null
}

const ProductPage = ({ product: initialProduct }: ProductPageProps) => {
    const router = useRouter()
    const [product, setProduct] = useState<Subcategory | null>(initialProduct)
    const [loading, setLoading] = useState(!initialProduct)
    const [selectedQuantity, setSelectedQuantity] = useState(1)
    const [selectedTier, setSelectedTier] = useState(0)

    const { slug } = router.query

    useEffect(() => {
        if (!initialProduct && slug && typeof slug === 'string') {
            fetchProductData(slug)
        }
    }, [slug, initialProduct])

    const fetchProductData = async (productSlug: string) => {
        try {
            setLoading(true)
            const { data, error } = await SanityService.getProduct(productSlug)

            if (!error && data) {
                setProduct(data)
                if (data.pricingTiers && data.pricingTiers.length > 0) {
                    setSelectedQuantity(data.pricingTiers[0].quantity)
                }
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
                <div className="loading-content">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-error">
                <h1>Product Not Found</h1>
                <p>The product you are looking for does not exist.</p>
                <Link href="/" className="back-btn">Go Back Home</Link>
            </div>
        )
    }

    const handleQuantityChange = (quantity: number, tierIndex: number) => {
        setSelectedQuantity(quantity)
        setSelectedTier(tierIndex)
    }

    const getCurrentPrice = () => {
        if (!product.pricingTiers || product.pricingTiers.length === 0) {
            return null
        }
        return product.pricingTiers[selectedTier]
    }

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

                    {/* Product Details */}
                    <div className="product-details">
                        <div className="product-container">
                            <div className="product-grid">
                                {/* Product Image */}
                                <div className="product-image-section">
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
                                            <div className="product-placeholder">
                                                <div className="placeholder-icon">
                                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21,15 16,10 5,21" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="product-info-section">
                                    <div className="product-info">
                                        <h1 className="product-title">{product.name}</h1>

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
                                                <p>{product.description}</p>
                                            </div>
                                        )}

                                        {/* Pricing Tiers */}
                                        {product.pricingTiers && product.pricingTiers.length > 0 && (
                                            <div className="pricing-section">
                                                <h3>Pricing Options</h3>
                                                <div className="pricing-tiers">
                                                    {product.pricingTiers.map((tier, index) => (
                                                        <div
                                                            key={index}
                                                            className={`pricing-tier ${selectedTier === index ? 'selected' : ''} ${tier.isRecommended ? 'recommended' : ''}`}
                                                            onClick={() => handleQuantityChange(tier.quantity, index)}
                                                        >
                                                            {tier.isRecommended && (
                                                                <div className="recommended-badge">Recommended</div>
                                                            )}
                                                            <div className="tier-quantity">{tier.quantity}+ units</div>
                                                            <div className="tier-price">₹{tier.pricePerUnit}/unit</div>
                                                            <div className="tier-total">Total: ₹{tier.price}</div>
                                                            {tier.savingsPercentage && (
                                                                <div className="tier-savings">Save {tier.savingsPercentage}%</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Specifications */}
                                        {product.specifications && product.specifications.length > 0 && (
                                            <div className="specifications-section">
                                                <h3>Specifications</h3>
                                                <div className="specifications-grid">
                                                    {product.specifications.map((spec, index) => (
                                                        <div key={index} className="specification-item">
                                                            <span className="spec-label">{spec.label}:</span>
                                                            <span className="spec-value">{spec.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Delivery Options */}
                                        {product.deliveryOptions && product.deliveryOptions.length > 0 && (
                                            <div className="delivery-section">
                                                <h3>Delivery Options</h3>
                                                <div className="delivery-options">
                                                    {product.deliveryOptions.map((option, index) => (
                                                        <div key={index} className="delivery-option">
                                                            <div className="delivery-type">{option.type.replace('_', ' ').toUpperCase()}</div>
                                                            <div className="delivery-description">{option.description}</div>
                                                            {option.locations && (
                                                                <div className="delivery-locations">Available in: {option.locations}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="product-actions">
                                            <div className="action-buttons">
                                                <Link href="/contact" className="btn btn-primary">
                                                    Get Quote
                                                </Link>
                                                <Link href="/contact" className="btn btn-secondary">
                                                    Contact Us
                                                </Link>
                                            </div>
                                            <div className="min-order-note">
                                                Minimum order quantity: {product.minOrderQuantity} units
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        </Providers>

    )
}

// Static Generation
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
    } catch (error) {
        return { notFound: true }
    }
}

export default ProductPage
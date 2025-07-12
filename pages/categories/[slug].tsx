// pages/categories/[slug].tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '../../component/ProductCard'
import { SanityService, Category, Subcategory } from '../../lib/sanity'
import '../../styles/category-page.css'
import Providers from '@/component/Providers'

interface CategoryPageProps {
  category: Category | null
  subcategories: Subcategory[]
}

const CategoryPage: React.FC<CategoryPageProps> = ({ 
  category: initialCategory, 
  subcategories: initialSubcategories 
}) => {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(initialCategory)
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories)
  const [loading, setLoading] = useState<boolean>(!initialCategory)
  const [error, setError] = useState<string | null>(null)

  const { slug } = router.query

  useEffect(() => {
    if (!initialCategory && slug && typeof slug === 'string') {
      fetchCategoryData(slug)
    }
  }, [slug, initialCategory])

  const fetchCategoryData = async (categorySlug: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await SanityService.getCategoryWithProducts(categorySlug)
      
      if (fetchError) {
        setError('Failed to load category')
        console.error('Error fetching category:', fetchError)
        return
      }

      if (!data) {
        setError('Category not found')
        return
      }

      setCategory(data)
      setSubcategories(data.subcategories || [])
    } catch (err) {
      console.error('Error in fetchCategoryData:', err)
      setError('An error occurred while loading the category')
    } finally {
      setLoading(false)
    }
  }

  if (router.isFallback || loading) {
    return (
      <div className="category-page">
        <div className="category-loading">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p>Loading category...</p>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="category-page">
        <div className="category-error">
          <h1>Category Not Found</h1>
          <p>{error || 'The category you are looking for does not exist.'}</p>
          <Link href="/" className="back-home-btn">
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Providers>

  <>
      <Head>
        <title>{category.name} - Himalaya Offset</title>
        <meta name="description" content={category.description || `Explore ${category.name} products at Himalaya Offset`} />
        <meta property="og:title" content={`${category.name} - Himalaya Offset`} />
        <meta property="og:description" content={category.description || `Explore ${category.name} products`} />
        {category.image_url && <meta property="og:image" content={category.image_url} />}
      </Head>
      <div className="category-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <div className="breadcrumb-container">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/#categories" className="breadcrumb-link">Categories</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{category.name}</span>
          </div>
        </div>

        {/* Category Header */}
        <div className="category-header">
          <div className="category-header-container">
            <div className="category-header-content">
              <div className="category-header-text">
                <h1 className="category-title">{category.name}</h1>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <div className="category-stats">
                  <span className="products-count">
                    {subcategories.length} Product{subcategories.length !== 1 ? 's' : ''} Available
                  </span>
                </div>
              </div>
              
              {category.image_url && (
                <div className="category-header-image">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    width={400}
                    height={300}
                    className="category-hero-image"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="category-products">
          <div className="category-products-container">
            {subcategories.length > 0 ? (
              <>
                <div className="products-grid-header">
                  <h2>Available Products</h2>
                  <p>Choose from our wide range of {category.name.toLowerCase()} products</p>
                </div>
                
                <div className="products-grid">
                  {subcategories.map((subcategory: Subcategory) => (
                    <div key={subcategory._id} className="product-card-wrapper">
                      <Link href={`/products/${subcategory.slug}`}>
                        <ProductCard
                          image={subcategory.image_url || '/placeholder-product.jpg'}
                          title={subcategory.name}
                          pricing={subcategory.startingPrice 
                            ? `Starting from ₹${subcategory.startingPrice}` 
                            : `Min Order: ${subcategory.minOrderQuantity} units`
                          }
                          buttonText="View Details"
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-products">
                <div className="no-products-content">
                  <div className="no-products-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <h3>Products Coming Soon</h3>
                  <p>We&apos;re working on adding products to this category. Please check back later!</p>
                  <Link href="/" className="back-home-btn">
                    Explore Other Categories
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="category-cta">
          <div className="category-cta-container">
            <div className="cta-content">
              <h3>Need Custom {category.name}?</h3>
              <p>Get in touch with our experts for customized solutions and bulk orders.</p>
              <div className="cta-buttons">
                <Link href="/contact" className="cta-button primary">
                  Contact Us
                </Link>
                <Link href="/quote" className="cta-button secondary">
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    </Providers>
  
  )
}

// Static Site Generation
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { data: categories } = await SanityService.getCategories()
    
    const paths = (categories || []).map((category: Category) => ({
      params: { slug: category.slug }
    }))

    return {
      paths,
      fallback: true // Enable ISR for new categories
    }
  } catch (error) {
    console.error('Error in getStaticPaths:', error)
    return {
      paths: [],
      fallback: true
    }
  }
}

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  try {
    const slug = params?.slug as string
    
    if (!slug) {
      return { notFound: true }
    }

    const { data: category, error } = await SanityService.getCategoryWithProducts(slug)
    
    if (error || !category) {
      return { notFound: true }
    }

    return {
      props: {
        category,
        subcategories: category.subcategories || []
      },
      revalidate: 60 // Regenerate page every 60 seconds
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return { notFound: true }
  }
}

export default CategoryPage
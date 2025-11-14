'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/component/ProductCard';
import { SanityService, Category, Subcategory } from '@/lib/sanity';
import '@/styles/CategoryPageStyles/category-page.css';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategoryData = async (categorySlug: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await SanityService.getCategoryWithProducts(categorySlug);
        
        if (fetchError) {
          setError('Failed to load category');
          console.error('Error fetching category:', fetchError);
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        setCategory(data);
        setSubcategories(data.subcategories || []);
      } catch (err) {
        console.error('Error in fetchCategoryData:', err);
        setError('An error occurred while loading the category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData(slug);
  }, [slug]);

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-loading">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p>Loading category...</p>
        </div>
      </div>
    );
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
    );
  }

  return (
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
  );
}
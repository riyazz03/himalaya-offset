'use client';

import React, { useState, useEffect } from 'react';
import '@/styles/categories-page.css';
import ProductCard from '@/component/ProductCard';
import Image from 'next/image';
import { SanityService, Category } from '@/lib/sanity';

interface CategoryWithCount extends Category {
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setError(null);

      const { data: fetchedCategories, error: fetchError } = await SanityService.getCategories();

      if (fetchError || !fetchedCategories) {
        setError('Failed to load categories');
        return;
      }

      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('An error occurred while loading categories');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatCategoryForCard = (category: Category) => ({
    image: category.image_url || '/placeholder.png',
    title: category.name,
    pricing: category.description || 'Click to explore',
    buttonText: 'Explore Category',
    href: `/categories/${category.slug}`
  });

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div className="header-bg-left">
          <Image
            src="/allProducts/product-image-1.webp"
            alt="decoration"
            width={180}
            height={280}
            priority={false}
            className="header-image"
          />
        </div>
        <div className="header-content">
          <h1>All Categories</h1>
          <p>Browse our complete range of printing solutions and services</p>
        </div>
        <div className="header-bg-right">
          <Image
            src="/allProducts/product-image-2.webp"
            alt="decoration"
            width={180}
            height={280}
            priority={false}
            className="header-image"
          />
        </div>
      </div>

      <div className="categories-search-container">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="categories-search-input"
        />
      </div>

      <div className="categories-container">
        {error ? (
          <div className="categories-error">
            <p>❌ Error: {error}</p>
            <button onClick={() => fetchCategories()} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="categories-empty">
            <p></p>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((category) => {
              const cardData = formatCategoryForCard(category);
              return (
                <ProductCard
                  key={category._id}
                  image={cardData.image}
                  title={cardData.title}
                  pricing={cardData.pricing}
                  buttonText={cardData.buttonText}
                  href={cardData.href}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
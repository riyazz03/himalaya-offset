'use client';

import React, { useState, useEffect } from 'react';
import '@/styles/categories-page.css';
import ProductCard from '@/component/ProductCard';
import { SanityService, Category } from '@/lib/sanity';

interface CategoryWithCount extends Category {
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: fetchedCategories, error: fetchError } = await SanityService.getCategories();

      if (fetchError || !fetchedCategories) {
        setError('Failed to load categories');
        setLoading(false);
        return;
      }

      setCategories(fetchedCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('An error occurred while loading categories');
      setLoading(false);
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
    buttonText: 'Explore Category'
  });

  return (
      <div className="categories-page">
        <div className="categories-header">
          <div className="header-content">
            <h1>All Categories</h1>
            <p>Browse our complete range of printing solutions and services</p>
          </div>
        </div>

        <div className="categories-container">
          <div className="categories-search">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="categories-loading">
              <div className="spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : error ? (
            <div className="categories-error">
              <p>❌ Error: {error}</p>
              <button onClick={() => fetchCategories()} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="categories-empty">
              <p>No categories found. Try adjusting your search.</p>
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
                    productId={category.slug}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
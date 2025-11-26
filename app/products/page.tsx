'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '@/styles/products-page.css';
import ProductCard from '@/component/ProductCard';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    slug: string;
    image_url?: string;
    startingPrice?: number;
    minOrderQuantity?: number;
    _createdAt?: string;
    categoryName?: string;
}

interface ApiResponse {
    data: Product[];
}

interface CardData {
    image: string;
    title: string;
    pricing: string;
    buttonText: string;
    productId: string;
}

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const applyFilters = useCallback((
        productsToFilter: Product[],
        search: string,
        category: string
    ) => {
        let filtered = productsToFilter;

        if (search) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.categoryName?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category !== 'all') {
            filtered = filtered.filter(product => product.categoryName === category);
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, []);

    const fetchAllProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result: ApiResponse = await response.json();

            if (!result.data || result.data.length === 0) {
                setProducts([]);
                setFilteredProducts([]);
                setLoading(false);
                return;
            }

            setProducts(result.data);
            applyFilters(result.data, '', 'all');
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [applyFilters]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            fetchAllProducts();
        }
    }, [isClient, fetchAllProducts]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        applyFilters(products, query, selectedCategory);
    }, [products, selectedCategory, applyFilters]);

    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category);
        applyFilters(products, searchQuery, category);
    }, [products, searchQuery, applyFilters]);

    const categories = useMemo(() => 
        ['all', ...new Set(
            products
                .map(p => p.categoryName)
                .filter((cat): cat is string => Boolean(cat))
        )],
        [products]
    );

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = useMemo(
        () => filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE),
        [filteredProducts, startIndex]
    );

    const formatProductForCard = useCallback((product: Product): CardData => ({
        image: product.image_url || '/placeholder.png',
        title: product.name,
        pricing: product.startingPrice
            ? `${product.minOrderQuantity} starting at ₹${product.startingPrice}.00`
            : 'Price on request',
        buttonText: 'Choose Options',
        productId: product.slug || ''
    }), []);

    const closeFilter = useCallback(() => {
        setIsFilterOpen(false);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div className="all-products-page">
            <div className="products-header">
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
                    <h2>All Products</h2>
                    <p>Browse our complete collection of printing solutions</p>
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

            <div className="products-search-container">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="products-search-input"
                />
            </div>

            <div className="products-container">
                <div className="products-filters">
                    <div className="filter-section">
                        <h3>Category</h3>
                        <div className="filter-options">
                            {categories.map(category => (
                                <label key={category} className="filter-checkbox">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={category}
                                        checked={selectedCategory === category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                    />
                                    <span>{category === 'all' ? 'All Categories' : category}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="products-main">
                    {loading ? (
                        <div className="products-grid">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="product-skeleton"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="products-error">
                            <p>Error: {error}</p>
                            <button 
                                onClick={() => fetchAllProducts()} 
                                style={{ 
                                    marginTop: '1rem', 
                                    padding: '0.5rem 1rem', 
                                    cursor: 'pointer', 
                                    backgroundColor: '#2067ff', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '0.375rem' 
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="products-empty">
                            <p>No products found. Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {paginatedProducts.map((product) => {
                                    const cardData = formatProductForCard(product);
                                    return (
                                        <ProductCard
                                            key={product._id}
                                            image={cardData.image}
                                            title={cardData.title}
                                            pricing={cardData.pricing}
                                            buttonText={cardData.buttonText}
                                            productId={cardData.productId}
                                        />
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="pagination-btn"
                                    >
                                        Previous
                                    </button>

                                    <div className="pagination-numbers">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            const pageNum = Math.max(1, currentPage - 2) + i;
                                            return pageNum <= totalPages ? pageNum : null;
                                        }).filter(Boolean).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page as number)}
                                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="pagination-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="mobile-filter-button-container">
                <button
                    className="mobile-filter-button"
                    onClick={() => setIsFilterOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                    Filters
                </button>
            </div>

            {isFilterOpen && (
                <div className="mobile-filter-overlay" onClick={closeFilter}>
                    <div className="mobile-filter-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-filter-header">
                            <h2>Filters</h2>
                            <button
                                className="mobile-filter-close"
                                onClick={closeFilter}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mobile-filter-content">
                            <div className="filter-section">
                                <h3>Category</h3>
                                <div className="filter-options">
                                    {categories.map(category => (
                                        <label key={category} className="filter-checkbox">
                                            <input
                                                type="radio"
                                                name="category-mobile"
                                                value={category}
                                                checked={selectedCategory === category}
                                                onChange={(e) => {
                                                    handleCategoryChange(e.target.value);
                                                    closeFilter();
                                                }}
                                            />
                                            <span>{category === 'all' ? 'All Categories' : category}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
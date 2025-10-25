'use client';

import React, { useState, useEffect } from 'react';
import '@/styles/products-page.css';
import Providers from '@/component/Providers';
import ProductCard from '@/component/ProductCard';

interface Product {
    _id: string;
    name: string;
    image_url?: string;
    startingPrice?: number;
    minOrderQuantity?: number;
    _createdAt?: string;
    categoryName?: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('latest');

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Starting fetch...');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch('/api/products', { signal: controller.signal });
            clearTimeout(timeoutId);

            console.log('Response received:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Data parsed:', result.data?.length, 'products');

            if (!result.data || result.data.length === 0) {
                setLoading(false);
                setFilteredProducts([]);
                return;
            }

            setProducts(result.data);
            applyFilters(result.data, '', 'all', 'latest');
            setLoading(false);

        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products');
            setLoading(false);
        }
    };

    const applyFilters = (
        productsToFilter: Product[],
        search: string,
        category: string,
        sort: string
    ) => {
        let filtered = [...productsToFilter];

        if (search) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category !== 'all') {
            filtered = filtered.filter(product => product.categoryName === category);
        }

        switch (sort) {
            case 'price-low':
                filtered.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'latest':
            default:
                filtered.sort((a, b) => new Date(b._createdAt || 0).getTime() - new Date(a._createdAt || 0).getTime());
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFilters(products, query, selectedCategory, sortBy);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        applyFilters(products, searchQuery, category, sortBy);
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        applyFilters(products, searchQuery, selectedCategory, sort);
    };

    const categories = ['all', ...new Set(
        products
            .map(p => p.categoryName)
            .filter((cat): cat is string => Boolean(cat))
    )];

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const formatProductForCard = (product: Product) => ({
        image: product.image_url || '/placeholder.png',
        title: product.name,
        pricing: product.startingPrice 
            ? `${product.minOrderQuantity} starting at ₹${product.startingPrice}.00`
            : 'Price on request',
        buttonText: 'Choose Options'
    });

    return (
        <Providers>
            <div className="all-products-page">
                <div className="products-header">
                    <div className="header-content">
                        <h1>All Products</h1>
                        <p>Browse our complete collection of printing solutions</p>
                    </div>
                </div>

                <div className="products-container">
                    <div className="products-filters">
                        <div className="filter-section">
                            <h3>Search</h3>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>

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

                        <div className="filter-section">
                            <h3>Sort By</h3>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="sort-select"
                            >
                                <option value="latest">Latest</option>
                                <option value="name">Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="products-main">
                        <div className="products-info">
                            <p className="products-count">
                                {loading ? 'Loading...' : `Showing ${paginatedProducts.length > 0 ? startIndex + 1 : 0} - ${Math.min(startIndex + productsPerPage, filteredProducts.length)} of ${filteredProducts.length} products`}
                            </p>
                        </div>

                        {loading ? (
                            <div className="products-loading">
                                <div className="spinner"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : error ? (
                            <div className="products-error">
                                <p>❌ Error: {error}</p>
                                <button onClick={() => fetchAllProducts()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem' }}>
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
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
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
            </div>
        </Providers>
    );
}
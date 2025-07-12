'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SanityService, Category, Subcategory } from '../lib/sanity'; 
import '@/styles/MegaMenu.css'; 

interface MenuCategory extends Category {
    subcategories: Subcategory[];
}

interface MegaMenuProps {
    className?: string;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ className = '' }) => {
    const [allMenuData, setAllMenuData] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchMenuData();
        }
    }, [mounted]);

    // Calculate dropdown position
    useEffect(() => {
        const calculateDropdownPosition = () => {
            if (!menuRef.current || !dropdownRef.current) return;

            const menuRect = menuRef.current.getBoundingClientRect();
            const dropdownHeight = dropdownRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Calculate the top position based on menu position
            const topPosition = menuRect.bottom + 8; // 8px gap
            
            // Set CSS custom property for top position
            dropdownRef.current.style.setProperty('--dropdown-top', `${topPosition}px`);
            
            // Check if dropdown would be cut off at bottom
            if (topPosition + dropdownHeight > viewportHeight) {
                dropdownRef.current.style.setProperty('--dropdown-top', `${viewportHeight - dropdownHeight - 20}px`);
            }
        };

        if (mounted && allMenuData.length > 0) {
            // Calculate on mount and resize
            calculateDropdownPosition();
            window.addEventListener('resize', calculateDropdownPosition);
            window.addEventListener('scroll', calculateDropdownPosition);

            return () => {
                window.removeEventListener('resize', calculateDropdownPosition);
                window.removeEventListener('scroll', calculateDropdownPosition);
            };
        }
    }, [mounted, allMenuData]);

    const fetchMenuData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const { data: categories, error: fetchError } = await SanityService.getCategories();
            
            if (fetchError || !categories) {
                setError('Failed to load categories');
                return;
            }

            const categoriesWithSubcategories = await Promise.allSettled(
                categories.map(async (category: Category): Promise<MenuCategory> => {
                    try {
                        const { data: categoryData } = await SanityService.getCategoryWithProducts(category.slug);
                        return {
                            ...category,
                            subcategories: categoryData?.subcategories || []
                        };
                    } catch (err) {
                        console.warn(`Error fetching subcategories for ${category.name}:`, err);
                        return {
                            ...category,
                            subcategories: []
                        };
                    }
                })
            );

            const successfulCategories = categoriesWithSubcategories
                .filter((result): result is PromiseFulfilledResult<MenuCategory> => result.status === 'fulfilled')
                .map(result => result.value);

            setAllMenuData(successfulCategories);
        } catch (err) {
            console.error('Error in fetchMenuData:', err);
            setError('An error occurred while loading the menu');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLink = (categorySlug: string): string => `/categories/${categorySlug}`;
    const getSubcategoryLink = (subcategorySlug: string): string => `/products/${subcategorySlug}`;

    // Loading states
    if (!mounted) {
        return (
            <nav className={`mega-menu-loading ${className}`}>
                <div className="mega-menu-loading-content">
                    <div className="loading-text">Loading...</div>
                </div>
            </nav>
        );
    }

    if (loading) {
        return (
            <nav className={`mega-menu-loading ${className}`}>
                <div className="mega-menu-loading-content">
                    <div className="loading-text loading-animated">Loading menu...</div>
                </div>
            </nav>
        );
    }

    if (error || allMenuData.length === 0) {
        return (
            <nav className={`mega-menu-loading ${className}`}>
                <div className="mega-menu-loading-content">
                    <div className="loading-text error-text">Menu unavailable</div>
                </div>
            </nav>
        );
    }

    // Get 7 categories for main menu (since All Categories takes one spot)
    const mainMenuCategories = allMenuData.slice(0, 7);

    return (
        <div className="mega-menu-wrapper">
            <nav ref={menuRef} className={`mega-menu-nav ${className}`}>
                <ul className="mega-menu-list">
                    {/* All Categories Menu - First Position */}
                    <li className="mega-menu-item mega-menu-all-categories">
                        <div className="mega-menu-link mega-menu-all-link">
                            All Categories
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="mega-menu-chevron">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        
                        {/* All Categories Full Width Dropdown */}
                        <div ref={dropdownRef} className="mega-menu-all-dropdown">
                            <div className="mega-menu-all-container">
                                <div className="mega-menu-all-header">
                                    <h3 className="mega-menu-all-title">All Categories</h3>
                                    <p className="mega-menu-all-subtitle">Browse our complete range of printing services</p>
                                </div>
                                
                                <div className="mega-menu-all-grid">
                                    {allMenuData.map((category) => (
                                        <div key={category._id} className="mega-menu-category-column">
                                            <div className="mega-menu-category-header">
                                                <Link
                                                    href={getCategoryLink(category.slug)}
                                                    className="mega-menu-category-title"
                                                >
                                                    {category.name}
                                                </Link>
                                            </div>
                                            
                                            {category.subcategories && category.subcategories.length > 0 && (
                                                <div className="mega-menu-subcategory-list">
                                                    {category.subcategories.slice(0, 6).map((subcategory) => (
                                                        <Link
                                                            key={subcategory._id}
                                                            href={getSubcategoryLink(subcategory.slug)}
                                                            className="mega-menu-subcategory-link"
                                                        >
                                                            {subcategory.name}
                                                        </Link>
                                                    ))}
                                                    
                                                    {category.subcategories.length > 6 && (
                                                        <Link
                                                            href={getCategoryLink(category.slug)}
                                                            className="mega-menu-subcategory-more"
                                                        >
                                                            +{category.subcategories.length - 6} more
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mega-menu-all-footer">
                                    <Link
                                        href="/categories"
                                        className="mega-menu-all-button"
                                    >
                                        View All Categories
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </li>

                    {/* Main 7 categories */}
                    {mainMenuCategories.map((category) => (
                        <li key={category._id} className="mega-menu-item">
                            <Link 
                                href={getCategoryLink(category.slug)}
                                className="mega-menu-link"
                            >
                                {category.name}
                            </Link>
                            
                            {/* Dropdown for subcategories */}
                            {category.subcategories && category.subcategories.length > 0 && (
                                <div className="mega-menu-dropdown">
                                    <div className="mega-menu-dropdown-content">
                                        {/* Category header */}
                                        <div className="mega-menu-dropdown-header">
                                            <Link
                                                href={getCategoryLink(category.slug)}
                                                className="mega-menu-dropdown-title"
                                            >
                                                View All {category.name}
                                            </Link>
                                        </div>
                                        
                                        {/* Subcategories */}
                                        <div className="mega-menu-dropdown-list">
                                            {category.subcategories.slice(0, 8).map((subcategory) => (
                                                <Link
                                                    key={subcategory._id}
                                                    href={getSubcategoryLink(subcategory.slug)}
                                                    className="mega-menu-dropdown-link"
                                                >
                                                    {subcategory.name}
                                                </Link>
                                            ))}
                                        </div>
                                        
                                        {/* Show more if category has more than 8 subcategories */}
                                        {category.subcategories.length > 8 && (
                                            <div className="mega-menu-dropdown-footer">
                                                <Link
                                                    href={getCategoryLink(category.slug)}
                                                    className="mega-menu-dropdown-more"
                                                >
                                                    +{category.subcategories.length - 8} more products
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default MegaMenu;
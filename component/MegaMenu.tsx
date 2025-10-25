'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Category, Subcategory } from '../lib/sanity'; 
import '@/styles/MegaMenu.css'; 

interface MenuCategory extends Category {
    subcategories: Subcategory[];
}

interface MegaMenuClientProps {
    allMenuData: MenuCategory[];
    className?: string;
}

const MegaMenuClient: React.FC<MegaMenuClientProps> = ({ allMenuData = [], className = '' }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateDropdownPosition = () => {
            if (!menuRef.current || !dropdownRef.current) return;

            const menuRect = menuRef.current.getBoundingClientRect();
            const dropdownHeight = dropdownRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            const topPosition = menuRect.bottom + 8;
            
            dropdownRef.current.style.setProperty('--dropdown-top', `${topPosition}px`);
            
            if (topPosition + dropdownHeight > viewportHeight) {
                dropdownRef.current.style.setProperty('--dropdown-top', `${viewportHeight - dropdownHeight - 20}px`);
            }
        };

        if (allMenuData && allMenuData.length > 0) {
            calculateDropdownPosition();
            window.addEventListener('resize', calculateDropdownPosition);
            window.addEventListener('scroll', calculateDropdownPosition);

            return () => {
                window.removeEventListener('resize', calculateDropdownPosition);
                window.removeEventListener('scroll', calculateDropdownPosition);
            };
        }
    }, [allMenuData]);

    const getCategoryLink = (categorySlug: string): string => `/categories/${categorySlug}`;
    const getSubcategoryLink = (subcategorySlug: string): string => `/products/${subcategorySlug}`;

    if (!allMenuData || allMenuData.length === 0) {
        return null;
    }

    const mainMenuCategories = allMenuData.slice(0, 7);

    return (
        <div className="mega-menu-wrapper">
            <nav ref={menuRef} className={`mega-menu-nav ${className}`}>
                <ul className="mega-menu-list">
                    <li className="mega-menu-item mega-menu-all-categories">
                        <div className="mega-menu-link mega-menu-all-link">
                            All Categories
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="mega-menu-chevron">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        
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

                    {mainMenuCategories.map((category) => (
                        <li key={category._id} className="mega-menu-item">
                            <Link 
                                href={getCategoryLink(category.slug)}
                                className="mega-menu-link"
                            >
                                {category.name}
                            </Link>
                            
                            {category.subcategories && category.subcategories.length > 0 && (
                                <div className="mega-menu-dropdown">
                                    <div className="mega-menu-dropdown-content">
                                        <div className="mega-menu-dropdown-header">
                                            <Link
                                                href={getCategoryLink(category.slug)}
                                                className="mega-menu-dropdown-title"
                                            >
                                                View All {category.name}
                                            </Link>
                                        </div>
                                        
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

export default MegaMenuClient;
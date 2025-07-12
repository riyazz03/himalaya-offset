import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SanityService, Category, Subcategory } from '../lib/sanity'; // Adjust path as needed
import '../styles/footer.css';

interface MenuCategory extends Category {
    subcategories: Subcategory[];
}

interface ContactItem {
    icon: React.ReactElement;
    href: string;
    text: string;
    type: 'email' | 'phone' | 'address';
}

interface SocialLink {
    name: string;
    href: string;
    icon: React.ReactElement;
}

const ProductFooter: React.FC = () => {
    const [productCategories, setProductCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories on component mount
    useEffect(() => {
        fetchFooterData();
    }, []);

    const fetchFooterData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const { data: categories, error: fetchError } = await SanityService.getCategories();
            
            if (fetchError || !categories) {
                console.warn('Failed to load categories for footer, using fallback');
                return;
            }

            // Fetch subcategories for each category
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

            setProductCategories(successfulCategories.length > 0 ? successfulCategories : []);
        } catch (err) {
            console.error('Error in fetchFooterData:', err);
           
        } finally {
            setLoading(false);
        }
    };

    // Function to convert product name to URL slug (keep your existing logic)
    const createProductSlug = (productName: string): string => {
        return productName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    };

    const quickLinks: Array<{ name: string; href: string }> = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Services", href: "/services" },
        { name: "Products", href: "/products" },
        { name: "Contact", href: "/contact" },
        { name: "FAQ", href: "/faq" },
        { name: "Get Quote", href: "/quote" },
        { name: "Track Order", href: "/track-order" },
    ];

    const contactItems: ContactItem[] = [
        {
            icon: (
                <svg className="contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white" opacity="0.8" />
                </svg>
            ),
            href: "mailto:admin@himalayaoffset.com",
            text: "admin@himalayaoffset.com",
            type: "email"
        },
        {
            icon: (
                <svg className="contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" fill="white" opacity="0.8" />
                </svg>
            ),
            href: "tel:+919629158073",
            text: "+91 96291 58073",
            type: "phone"
        },
        {
            icon: (
                <svg className="contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="white" opacity="0.8" />
                </svg>
            ),
            href: "/contact#address",
            text: "123, Vellore Tamil Nadu",
            type: "address"
        }
    ];

    const socialLinks: SocialLink[] = [
        {
            name: "Facebook",
            href: "https://facebook.com/himalayaoffset",
            icon: (
                <svg className="social-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.564H7.078V12.073H10.125V9.41C10.125 6.387 11.917 4.716 14.658 4.716C15.97 4.716 17.344 4.952 17.344 4.952V7.922H15.83C14.34 7.922 13.875 8.853 13.875 9.808V12.073H17.203L16.671 15.564H13.875V24C19.612 23.094 24 18.1 24 12.073Z" fill="white" opacity="0.8" />
                </svg>
            )
        },
        {
            name: "Instagram",
            href: "https://instagram.com/himalayaoffset",
            icon: (
                <svg className="social-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12S8.597 18.163 12 18.163S18.162 15.404 18.162 12S15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM18.406 4.155C17.61 4.155 16.965 4.8 16.965 5.595C16.965 6.39 17.61 7.035 18.406 7.035C19.201 7.035 19.845 6.39 19.845 5.595C19.845 4.8 19.201 4.155 18.406 4.155Z" fill="white" opacity="0.8" />
                </svg>
            )
        },
        {
            name: "Twitter",
            href: "https://twitter.com/himalayaoffset",
            icon: (
                <svg className="social-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z" fill="white" opacity="0.8" />
                </svg>
            )
        },
        {
            name: "LinkedIn",
            href: "https://linkedin.com/company/himalayaoffset",
            icon: (
                <svg className="social-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.366C3.274 4.224 4.194 3.298 5.337 3.298C6.477 3.298 7.401 4.224 7.401 5.366C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z" fill="white" opacity="0.8" />
                </svg>
            )
        },
        {
            name: "YouTube",
            href: "https://youtube.com/@himalayaoffset",
            icon: (
                <svg className="social-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186C23.228 5.081 22.321 4.227 21.154 3.982C19.315 3.5 12 3.5 12 3.5S4.685 3.5 2.846 3.982C1.679 4.227 0.772 5.081 0.502 6.186C0 7.885 0 12 0 12S0 16.115 0.502 17.814C0.772 18.919 1.679 19.773 2.846 20.018C4.685 20.5 12 20.5 12 20.5S19.315 20.5 21.154 20.018C22.321 19.773 23.228 18.919 23.498 17.814C24 16.115 24 12 24 12S24 7.885 23.498 6.186ZM9.545 15.568V8.432L15.818 12L9.545 15.568Z" fill="white" opacity="0.8" />
                </svg>
            )
        },
        {
            name: "WhatsApp",
            href: "https://wa.me/919629158073",
            icon: (
                <svg className="social-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382C17.367 14.382 17.15 14.382 16.717 14.165C16.284 13.947 15.851 13.73 15.418 13.295C14.985 12.86 14.985 12.208 15.201 11.99C15.418 11.773 15.634 11.773 15.851 11.99C16.067 12.208 16.5 12.643 16.933 12.86C17.366 13.078 17.583 13.078 17.799 12.86C18.016 12.643 18.016 12.208 17.799 11.99C17.583 11.773 17.15 11.338 16.717 11.12C16.284 10.903 15.851 10.903 15.418 11.12C14.985 11.338 14.768 11.773 14.768 12.208C14.768 12.643 14.985 13.078 15.418 13.513C15.851 13.947 16.284 14.165 16.717 14.382C17.15 14.6 17.366 14.6 17.472 14.382ZM12.045 0C5.408 0 0 5.408 0 12.045C0 14.207 0.651 16.263 1.845 17.999L0 24L6.001 22.155C7.737 23.349 9.793 24 12.045 24C18.682 24 24.09 18.592 24.09 11.955C24.09 5.318 18.682 0 12.045 0ZM12.045 21.818C9.793 21.818 7.737 21.167 6.001 19.973L5.678 19.757L2.456 20.572L3.271 17.35L3.055 17.027C1.861 15.291 1.21 13.235 1.21 10.983C1.21 6.084 5.146 2.148 10.045 2.148C14.944 2.148 18.88 6.084 18.88 10.983C18.88 15.882 14.944 19.818 10.045 19.818Z" fill="white" opacity="0.8" />
                </svg>
            )
        }
    ];

    const legalLinks: Array<{ name: string; href: string }> = [
        { name: "Terms & Conditions", href: "/terms-conditions" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Refund Policy", href: "/refund-policy" },
        { name: "Shipping Policy", href: "/shipping-policy" },
        { name: "Sitemap", href: "/sitemap" },
    ];

    const renderContactItem = (item: ContactItem) => {
        if (item.type === 'address') {
            return (
                <Link href={item.href} className="contact-item">
                    {item.icon}
                    <span>{item.text}</span>
                </Link>
            );
        }
        return (
            <a href={item.href} className="contact-item">
                {item.icon}
                <span>{item.text}</span>
            </a>
        );
    };

    return (
        <footer className="product-footer">
            <div className="footer-container">
                <div className="footer-main">
                    {/* Left Side - Quick Links and Contact */}
                    <div className="footer-left">
                        <div className="quick-links-section">
                            <h3 className="section-title-footer">Quick Links</h3>
                            <ul className="quick-links">
                                {quickLinks.map((link, index) => (
                                    <li key={index} className="quick-link-item">
                                        <Link href={link.href}>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="contact-section">
                            <h3 className="section-title-footer">Contact Info</h3>
                            <div className="contact-info">
                                {contactItems.map((item, index) => (
                                    <div key={index}>
                                        {renderContactItem(item)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="social-section">
                            <h3 className="section-title-footer">Follow Us</h3>
                            <div className="social-links">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="social-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Follow us on ${social.name}`}
                                    >
                                        {social.icon}
                                        {social.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Dynamic Products */}
                    <div className="footer-right">
                        {loading ? (
                            <div className="footer-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {productCategories.map((category) => (
                                    <div key={category._id} className="product-category">
                                        <h3 className="category-title">
                                            <Link href={`/categories/${category.slug}`}>
                                                {category.name}
                                            </Link>
                                        </h3>
                                        <ul className="product-list">
                                            {category.subcategories.slice(0, 4).map((subcategory) => (
                                                <li key={subcategory._id} className="product-item">
                                                    <Link href={`/products/${subcategory.slug}`}>
                                                        {subcategory.name}
                                                    </Link>
                                                </li>
                                            ))}
                                            {category.subcategories.length > 4 && (
                                                <li className="product-item product-more">
                                                    <Link href={`/categories/${category.slug}`}>
                                                        +{category.subcategories.length - 4} more
                                                    </Link>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {error && !loading && (
                            <div className="footer-error">
                                <p>Unable to load latest products. Please try refreshing the page.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-legal">
                        <div className="legal-links">
                            {legalLinks.map((link, index) => (
                                <React.Fragment key={index}>
                                    <Link href={link.href}>{link.name}</Link>
                                    {index < legalLinks.length - 1 && (
                                        <span className="separator">|</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="copyright">
                            <p>&copy; {new Date().getFullYear()} Himalaya Offset. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ProductFooter;
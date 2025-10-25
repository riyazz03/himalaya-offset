'use client';

import React from 'react';
import Link from 'next/link';
import '../styles/footer.css';

export default function Footer() {
    return (
        <footer className="product-footer">
            <div className="main-container">
                <div className="footer-main">
                    <div className="footer-space-between">
                       <div>
                         <div className="quick-links-section">
                            <h3 className="section-title-footer">Quick Links</h3>
                            <ul className="quick-links">
                                <li><Link href="/products">All Products</Link></li>
                                <li><Link href="/categories">Categories</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                                <li><Link href="/faq">FAQ</Link></li>
                                <li><Link href="/quote">Get Quote</Link></li>
                                <li><Link href="/orders/track">Track Orders</Link></li>
                            </ul>
                        </div>
                       </div>

                    <div className="footer-left">
                            <div className="contact-section">
                            <h3 className="section-title-footer">Contact Info</h3>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <span className="contact-icon">📍</span>
                                    <span>Your Address Here</span>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">📞</span>
                                    <a href="tel:+1234567890">+1 (234) 567-890</a>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">✉️</span>
                                    <a href="mailto:info@yoursite.com">info@yoursite.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="social-section">
                            <h3 className="section-title-footer">Follow Us</h3>
                            <div className="social-links">
                                <a href="https://facebook.com" className="social-link">Facebook</a>
                                <a href="https://twitter.com" className="social-link">Twitter</a>
                                <a href="https://instagram.com" className="social-link">Instagram</a>
                                <a href="https://linkedin.com" className="social-link">LinkedIn</a>
                                <a href="https://youtube.com" className="social-link">YouTube</a>
                                <a href="https://pinterest.com" className="social-link">Pinterest</a>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-legal">
                        <div className="legal-links">
                            <Link href="/privacy">Privacy Policy</Link>
                            <span className="separator">|</span>
                            <Link href="/terms">Terms & Conditions</Link>
                            <span className="separator">|</span>
                            <Link href="/sitemap">Sitemap</Link>
                        </div>
                        <div className="copyright">
                            <p>&copy; 2024 Your Company. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
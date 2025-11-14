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
                                        <div className="contact-icon">
                                            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                        </div>
                                        <span>14, Chunnambukara Street, Vellore - 632 004</span>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon">
                                            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                        </div>
                                        <a href="tel:+918838435916">+91 88384 35916</a>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon">
                                            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                            </svg>
                                        </div>
                                        <a href="mailto:himalayaoffsetvlr1@gmail.com">himalayaoffsetvlr1@gmail.com</a>
                                    </div>
                                </div>
                            </div>

                            <div className="social-section">
                                <h3 className="section-title-footer">Follow Us</h3>
                                <div className="social-links">
                                    <a href="https://www.facebook.com/share/17PmkpzjAj/" className="social-link" target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                            <path d="M18 2h-3a6 6 0 0 0-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 0 1 2-2h3z"/>
                                        </svg>
                                        <span>Facebook</span>
                                    </a>
                                    <a href="https://www.instagram.com/himalaya_offset?igsh=MTVteGhxaHp3bmloMA==" className="social-link" target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                            <circle cx="17.5" cy="6.5" r="1.5"/>
                                        </svg>
                                        <span>Instagram</span>
                                    </a>
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
                            <p>&copy; 2025 Himalaya Offset. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
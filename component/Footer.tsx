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
                                    <span>14, Chunnambukara Street, Vellore - 632 004</span>
                                </div>
                                <div className="contact-item">
                                    <a href="tel:+918838435916">+91 88384 35916</a>
                                </div>
                                <div className="contact-item">
                                    <a href="mailto:himalayaoffsetvlr1@gmail.com">himalayaoffsetvlr1@gmail.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="social-section">
                            <h3 className="section-title-footer">Follow Us</h3>
                            <div className="social-links">
                                <a href="https://www.facebook.com/share/17PmkpzjAj/" className="social-link">Facebook</a>
                                <a href="https://www.instagram.com/himalaya_offset?igsh=MTVteGhxaHp3bmloMA==" className="social-link">Instagram</a>
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
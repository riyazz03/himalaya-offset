'use client';

import { useState, ChangeEvent } from 'react';
import '@/styles/contact.css';
import Image from 'next/image';

interface FormData {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  message: string;
}

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    message: ''
  });

  const [toast, setToast] = useState<Toast>({
    show: false,
    message: '',
    type: 'success'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEliYGLIFbXK1G3onVEZCZN1X1YALJS8mdMHp5jgjhcSnPpKKHY_I1ZH7IKw0-_lKX9w/exec';

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.purpose || !formData.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // Since mode is 'no-cors', we can't read the response
      // We'll assume success if no error is thrown
      showToast('Form submitted successfully! We\'ll get back to you soon.', 'success');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        purpose: '',
        message: ''
      });

    } catch (error) {
      console.error('Submission error:', error);
      showToast('Failed to submit form. Please try again or contact us directly.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => setToast({ ...toast, show: false })}
          >
            ✕
          </button>
        </div>
      )}

      <div className="contact-wrapper">
        <div className="contact-container">
          {/* Left Side */}
          <div className="contact-left">
            <h1 className="section-title">Contact <span>Us</span></h1> <br />
            <a href="mailto:himalayaoffsetvlr1@gmail.com" className="contact-email">
              himalayaoffsetvlr1@gmail.com
            </a>

            <div className="contact-address">
              <h3 className="address-label">ADDRESS:</h3>
              <p className="address-text">
                14, Chunnambukara St, Sripuram,<br />
                Arasamarapettai, Vellore,<br />
                Tamil Nadu 632004
              </p>
            </div>
            <div className="contact-address">
              <h3 className="address-label">PHONE NUMBER:</h3>
              <p className="address-text">
                <a href="tel:+918838435916">+91 88384 35916</a> <br />
                <a href="tel:0416-4051648">0416-4051648</a><br />
              </p>
            </div>

            <Image src="https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29udGFjdCUyMHVzfGVufDB8fDB8fHww" alt='contact image'  width={500} height={150} className='contact-us-image' />
          </div>

          {/* Right Side - Form */}
          <div className="contact-right">
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourgmail@example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Contact Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXXXXXXX"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="purpose" className="form-label">Purpose</label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select</option>
                  <option value="request-quote">Request a Quote</option>
                  <option value="general-inquiry">General Inquiry</option>
                  <option value="billing-payment">Billing or Payment Issue</option>
                  <option value="career-opportunity">Career / Job Opportunity</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status / Tracking</option>
                  <option value="return-refund">Return or Refund Request</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message..."
                  rows={5}
                  className="form-textarea"
                ></textarea>
              </div>

              <div className='submit-button-container'>
                <button
                  onClick={handleSubmit}
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  );
}
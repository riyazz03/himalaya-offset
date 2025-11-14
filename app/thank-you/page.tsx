'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/thank-you-page.css';

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/');
  };

  return (
      <div className="thank-you-page">
        <div className="thank-you-wrapper">
          <div className="thank-you-content">
            <div className="thank-you-icon-wrapper">
              <svg className="thank-you-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h1 className="thank-you-title">Thank You!</h1>
            
            <p className="thank-you-subtitle">
              We&apos;ve received your submission
            </p>

            <p className="thank-you-description">
              Thank you for reaching out to us. We appreciate your interest and will review your request carefully. Our team will get back to you shortly.
            </p>

            <div className="countdown-container">
              <p className="countdown-label">Redirecting in</p>
              <div className="countdown-display">{countdown}s</div>
            </div>

            <button onClick={handleRedirect} className="redirect-button">
              Return to Home
            </button>
          </div>
        </div>
      </div>
  );
}
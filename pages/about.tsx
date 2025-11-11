import React, { useState } from 'react';
import '@/styles/about.css';
import Providers from '@/component/Providers';
import Testimonial from '@/Sections/Testimonial';
import FaqSection from '@/Sections/FaqSection';
import Image from 'next/image';

export default function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const galleryImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const getSlideIndex = (offset: number) => {
    return (currentSlide + offset + galleryImages.length) % galleryImages.length;
  };

  return (
    <Providers>
      

      {/* Hero Section */}
      <section className="hero-section">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"
          alt="Hero"
          className="hero-image"
          width={100}
          height={100}
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Our Story</h1>
            <p className="hero-subtitle">Building the future, one step at a time</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-image-container">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
            alt="About Us"
            className="about-image"
          width={100}
          height={100}
          />
        </div>
        <div className="about-content">
          <h2 className="section-title">About <span>Us</span></h2>
          <p className="about-text about-para-top">
            We are a team of passionate individuals dedicated to creating exceptional experiences. 
            Our journey began with a simple idea: to make a difference in the world through innovation 
            and creativity.
          </p>
          <p className="about-text">
            Over the years, we&apos;sve grown into a diverse community of talented professionals who share 
            a common vision. We believe in the power of collaboration, continuous learning, and 
            pushing boundaries to achieve excellence.
          </p>
          <p className="about-text">
            Our commitment to quality and customer satisfaction drives everything we do. We&apos;sre not 
            just building products; we&apos;sre crafting solutions that empower people and transform businesses.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className='gallery-title-wrapper'>
            <h2 className="section-title"><span>Our</span> Gallery</h2>
        </div>
        <div className="slider-container">
          <div className="slider-wrapper">
            <div className="slide slide-left">
              <Image
                src={galleryImages[getSlideIndex(-1)]}
                alt="Previous slide"
                className="slide-image"
          width={600}
          height={100}
              />
            </div>
            <div className="slide slide-center">
              <Image
                src={galleryImages[getSlideIndex(0)]}
                alt="Current slide"
                className="slide-image"
          width={600}
          height={100}
              />
            </div>
            <div className="slide slide-right">
              <Image
                src={galleryImages[getSlideIndex(1)]}
                alt="Next slide"
                className="slide-image"
          width={600}
          height={100}
              />
            </div>
          </div>
          
          <button
            className="slider-button slider-button-prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <div className="arrow arrow-left"></div>
          </button>
          
          <button
            className="slider-button slider-button-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <div className="arrow arrow-right"></div>
          </button>
        </div>
      </section>
      <Testimonial />
      <FaqSection />
    </Providers>
  );
}
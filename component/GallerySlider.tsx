import React, { useRef, useEffect, useState } from 'react';
import "@/styles/gallery-slider.css";
import Title from '@/component/Title-Block-Rounded';

// Types
interface SliderImage {
  id: number;
  src: string;
  alt: string;
}

interface GallerySliderProps {
  images?: SliderImage[];
}

const GallerySlider: React.FC<GallerySliderProps> = ({ images }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const defaultImages: SliderImage[] = images || [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      alt: 'Team collaboration'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      alt: 'Modern office hallway'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
      alt: 'Conference room'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
      alt: 'Office workspace'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
      alt: 'Business meeting'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      alt: 'Team discussion'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
      alt: 'Creative workspace'
    }
  ];

  const totalSlides = defaultImages.length;

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  };

  const getSlideStyle = (index: number) => {
    const diff = index - currentIndex;
    const position = ((diff % totalSlides) + totalSlides) % totalSlides;
    
    // Center slide
    if (position === 0) {
      return {
        transform: 'translate(-50%, -50%) translateX(0) scale(1) translateY(0)',
        opacity: 1,
        zIndex: 10,
        width: '600px',
        height: '400px'
      };
    }
    
    // Right slide (only 1)
    if (position === 1) {
      return {
        transform: 'translate(-50%, -50%) translateX(480px) scale(0.75) translateY(0)',
        opacity: 0.6,
        zIndex: 5,
        width: '400px',
        height: '300px'
      };
    }
    
    // Left slide (only 1)
    if (position === totalSlides - 1) {
      return {
        transform: 'translate(-50%, -50%) translateX(-480px) scale(0.75) translateY(0)',
        opacity: 0.6,
        zIndex: 5,
        width: '400px',
        height: '300px'
      };
    }
    
    // Hidden slides
    return {
      transform: 'translate(-50%, -50%) translateX(0) scale(0.3)',
      opacity: 0,
      zIndex: 1,
      width: '300px',
      height: '200px',
      pointerEvents: 'none' as const
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="gallery-container">

      <div className="gallery-title-wrapper">
        <Title title='Gallery' />
        <h2 className="section-title gallery-title">
        A visual showcase of <span>our best moments.</span> 
        </h2><br />
      </div>

      <div className="slider-wrapper">
        <button 
          className="nav-button"
          onClick={prevSlide}
          aria-label="Previous slide"
          disabled={isAnimating}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="slider-track" ref={sliderRef}>
          {defaultImages.map((image, index) => (
            <div 
              key={image.id} 
              className="slide"
              style={getSlideStyle(index)}
              onClick={() => {
                if (index !== currentIndex) {
                  goToSlide(index);
                }
              }}
            >
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>

        <button 
          className="nav-button"
          onClick={nextSlide}
          aria-label="Next slide"
          disabled={isAnimating}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="dots-container">
        {defaultImages.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default GallerySlider;
'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import '@/styles/heroSlider.css';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  bg: string;
}

export default function HeroSlider(): JSX.Element {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slides: Slide[] = [
    {
      id: 1,
      title: 'Discover Innovation',
      subtitle: 'Transform your digital experience',
      bg: '/heroImages/banner-image-1.webp',
    },
    {
      id: 2,
      title: 'Create Excellence',
      subtitle: 'Design solutions that inspire',
      bg: '/heroImages/banner-image-2.webp',
    },
    {
      id: 3,
      title: 'Build Future',
      subtitle: 'Technology meets creativity',
      bg: '/heroImages/banner-image-3.webp',
    },
  ];

  const extendedSlides: Slide[] = [slides[slides.length - 1], ...slides, slides[0]];

  const resetAutoPlay = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      goToNext();
    }, 5000);
  };

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentSlide]);

  const goToNext = (): void => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  };

  const goToPrevious = (): void => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  };

  const handleTransitionEnd = (): void => {
    setIsTransitioning(false);
    if (currentSlide === 0) {
      setCurrentSlide(slides.length);
    } else if (currentSlide === slides.length + 1) {
      setCurrentSlide(1);
    }
  };

  const goToSlide = (index: number): void => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index + 1);
    resetAutoPlay();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = (): void => {
    if (touchStart - touchEnd > 75) {
      goToNext();
      resetAutoPlay();
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious();
      resetAutoPlay();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (touchStart) {
      setTouchEnd(e.clientX);
    }
  };

  const handleMouseUp = (): void => {
    if (touchStart) {
      if (touchStart - touchEnd > 75) {
        goToNext();
        resetAutoPlay();
      }
      if (touchStart - touchEnd < -75) {
        goToPrevious();
        resetAutoPlay();
      }
      setTouchStart(0);
      setTouchEnd(0);
    }
  };

  const handleMouseLeave = (): void => {
    setTouchStart(0);
    setTouchEnd(0);
  };

  const actualSlideIndex: number = currentSlide === 0 ? slides.length - 1 : currentSlide === slides.length + 1 ? 0 : currentSlide - 1;

  return (
    <>
      <style jsx>{`
        .fs-slider-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
          transition: ${isTransitioning ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'};
          transform: translateX(-${currentSlide * 100}%);
        }
      `}</style>

      <div
        className="fs-slider-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="fs-slider-wrapper"
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, index) => (
            <div
              key={`${slide.id}-${index}`}
              className="fs-slide"
              style={{ backgroundImage: `url(${slide.bg})` }}
            >
              <div className="fs-slide-content">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="fs-dots-container">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`fs-dot ${actualSlideIndex === index ? 'fs-active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>
    </>
  );
}
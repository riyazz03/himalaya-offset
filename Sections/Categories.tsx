'use client'
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../styles/categories.css';
import Title from '@/component/Title-Block-Rounded';
import { SanityService, Category } from '@/lib/sanity';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories using DatabaseService...');
      const { data, error } = await SanityService.getCategories();
      
      console.log('Categories data:', data);
      console.log('Categories error:', error);
      console.log('Data length:', data?.length);
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        console.log('Setting categories:', data);
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Catch block error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className='categories-section'>
        <div className='categories-content' style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className='categories-container'>
            <div className='categoeries-header'>
              <Title title='Categories' />
              <div className="section-title-wrapper">
                <h1 className='section-title'>Explore Our <span>Best Categories</span></h1>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='categories-section'>
        <div className='categories-content' style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className='categories-container'>
            <div className='categoeries-header'>
              <Title title='Categories' />
              <div className="section-title-wrapper">
                <h1 className='section-title'>Explore Our <span>Best Categories</span></h1>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className='categories-section'>
        <div className='categories-content' style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className='categories-container'>
            <div className='categoeries-header'>
              <Title title='Categories' />
              <div className="section-title-wrapper">
                <h1 className='section-title'>Explore Our <span>Best Categories</span></h1>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600">No categories available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='categories-section'>
      <div className='categories-content' style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div className='categories-container'>
          <div className='categoeries-header'>
            <Title title='Categories' />
            <div className="section-title-wrapper">
              <h1 className='section-title'>Explore Our <span>Best Categories</span></h1>
            </div>
          </div>
        </div>

        {/* Swiper Section */}
        <div style={{ position: 'relative' }}>
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={5}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              bulletClass: 'swiper-pagination-bullet-custom',
              bulletActiveClass: 'swiper-pagination-bullet-active-custom'
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom'
            }}
            loop={categories.length > 5}
            breakpoints={{
              640: {
                slidesPerView: 5,
                spaceBetween: 30
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 30
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 30
              },
              1200: {
                slidesPerView: 5,
                spaceBetween: 30
              }
            }}
            style={{
              paddingBottom: '50px'
            }}
          >
            {categories.map((category) => (
              <SwiperSlide key={category._id}>
                <Link href={`/categories/${category.slug}`}>
                  <div className='category-card'>
                    {/* Category Image Container */}
                    <div className='category-image-container'>
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className='category-image'
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                          onError={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-lg">
                          <span className="text-white text-2xl font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Title */}
                    <h3 className='category-card-title'>
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev-custom">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </div>

          <div className="swiper-button-next-custom">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Custom Pagination Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet-custom {
          width: 12px !important;
          height: 12px !important;
          background: #cbd5e0 !important;
          opacity: 1 !important;
          margin: 0 6px !important;
          transition: all 0.3s ease !important;
        }

        .swiper-pagination-bullet-active-custom {
          background: #3498db !important;
          transform: scale(1.2) !important;
        }

        .swiper-pagination {
          bottom: 20px !important;
        }

        @media (max-width: 768px) {
          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;
'use client';

import Title from '@/component/Title-Block-Rounded'
import React, { useState, useEffect } from 'react'
import "@/styles/homeProducts.css"
import ProductCard from '@/component/ProductCard'
import { SanityService, Subcategory } from '@/lib/sanity'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Products = () => {
  const [products, setProducts] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data: featuredProducts, error: fetchError } = await SanityService.getFeaturedProducts();
      
      setProducts(featuredProducts || []);
      if (fetchError) {
        setError('Failed to load featured products');
      }
    } catch (err) {
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  const formatProductForCard = (product: Subcategory) => ({
    image: product.image_url || "/placeholder.png",
    title: product.name,
    pricing: product.startingPrice 
      ? `${product.minOrderQuantity} starting at ₹${product.startingPrice}.00`
      : "Price on request",
    buttonText: "Choose Options"
  });

  const paginatedProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(products.length / itemsPerPage);

  if (loading) {
    return null;
  }

  return (
    <div className='products-section'>
      <div className="main-container">
        <div className="products-wrapper">
          <div className='product-left'>
            <div className='product-left-top'>
              <Title title='Our Products' />
              <h1 className='section-title'>Top <span>Selling Products</span></h1>
            </div>
            <div className='product-left-bottom'>
              <div className='product-left-bottom-card'>
                <h1 className='product-left-bottom-card-title'>Explore All Products</h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="101" height="101" viewBox="0 0 101 101" fill="none">
                  <circle cx="50.0085" cy="50.0085" r="50.0085" fill="white" />
                  <path d="M71.9684 37.1675C72.1451 35.7981 71.1783 34.5448 69.8089 34.3681L47.4939 31.4888C46.1245 31.3121 44.8712 32.2789 44.6945 33.6483C44.5178 35.0176 45.4847 36.271 46.8541 36.4477L66.6896 39.0071L64.1302 58.8426C63.9535 60.212 64.9203 61.4653 66.2897 61.642C67.6591 61.8187 68.9124 60.8519 69.0891 59.4825L71.9684 37.1675ZM32.6406 65.2734L34.1676 67.2529L71.016 38.827L69.489 36.8476L67.962 34.8681L31.1136 63.294L32.6406 65.2734Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          <div className='product-right'>
            {error ? (
              <div className="products-error">
                <p>Unable to load products. Please try again later.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty">
                <p>No featured products found.</p>
              </div>
            ) : (
              <>
                <div className='products-desktop'>
                  {paginatedProducts.map((product) => {
                    const cardData = formatProductForCard(product);
                    return (
                      <ProductCard 
                        key={product._id} 
                        image={cardData.image} 
                        title={cardData.title} 
                        pricing={cardData.pricing} 
                        buttonText={cardData.buttonText} 
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className='products-pagination-desktop'>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className='pagination-btn'
                    >
                      Previous
                    </button>
                    <div className='pagination-numbers'>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage === totalPages - 1}
                      className='pagination-btn'
                    >
                      Next
                    </button>
                  </div>
                )}

                <div className='products-mobile-slider' style={{ position: 'relative' }}>
                  <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={15}
                    slidesPerView={1.2}
                    autoplay={{
                      delay: 3000,
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
                      nextEl: '.swiper-button-next-products',
                      prevEl: '.swiper-button-prev-products'
                    }}
                    loop={products.length > 1}
                  >
                    {products.map((product) => {
                      const cardData = formatProductForCard(product);
                      return (
                        <SwiperSlide key={product._id}>
                          <div className='slider-item'>
                            <ProductCard 
                              image={cardData.image} 
                              title={cardData.title} 
                              pricing={cardData.pricing} 
                              buttonText={cardData.buttonText} 
                            />
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>

                  <div className="swiper-button-prev-products">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </div>

                  <div className="swiper-button-next-products">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
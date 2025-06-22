import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../styles/categories.css';
import Title from '@/component/Title';

const Categories = () => {
  const categoriesData = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      title: "Visiting Card",
      bgColor: "linear-gradient(135deg, #ff6b6b, #ee5a24)"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
      title: "Leather Head",
      bgColor: "linear-gradient(135deg, #2ed573, #1e8449)"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      title: "Visiting Card",
      bgColor: "linear-gradient(135deg, #ff6b6b, #ee5a24)"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      title: "Leather Head",
      bgColor: "linear-gradient(135deg, #2ed573, #1e8449)"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 9,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 10,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 11,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
    {
      id: 12,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      title: "T-Shirt",
      bgColor: "linear-gradient(135deg, #ffa502, #ff6348)"
    },
  ];

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
            <div className="categoerie-title">
              <h1 className='categoerie-title-text'>Explore Our <span>Best Categories</span></h1>
            </div>
          </div>
        </div>

        {/* Swiper Section */}
        <div style={{ position: 'relative' }}>
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            // centeredSlides={true}
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
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 25
              },
              1024: {
                slidesPerView: 4,
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
            {categoriesData.map((category) => (
              <SwiperSlide key={category.id}>
                <div className='category-card'
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(52, 152, 219, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  {/* Category Image Container */}
                  <div className='category-image-container' >
                    <img
                      src={category.image}
                      alt={category.title}
                      className='category-image'

                    />
                  </div>

                  {/* Category Title */}
                  <h3 className='category-card-title'>
                    {category.title}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div
            className="swiper-button-prev-custom"

            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E78741';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </div>

          <div
            className="swiper-button-next-custom"

            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E78741';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
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
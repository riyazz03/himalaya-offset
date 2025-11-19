'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import "@/styles/testimonial.css";
import "@/styles/homeProducts.css"
import Title from '@/component/Title-Block-Rounded';
import TestimonialCard from '@/component/TestimonialCard';

const Testimonial = () => {
    const testimonials = [
        {
            id: 1,
            review: "Outstanding print quality! Himalaya Offset handled our entire packaging project with professionalism and speed. The colors were perfect, and the finish was exactly what we wanted.",
            name: "Rahul S., Aarya Foods",
            image: "/testimonial-profile-pic.png",
            rating: 5
        },
        {
            id: 2,
            review: "Reliable service and excellent communication. They delivered our business cards and brochures on time with exceptional clarity. Highly recommended!",
            name: "Meena K., Creative Studio",
            image: "/testimonial-profile-pic.png",
            rating: 5
        },
        {
            id: 3,
            review: "Very impressed with the consistency and detail in their offset printing. They understand exactly what the customer needs and deliver the best results.",
            name: "Vikram P., Retail Owner",
            image: "/testimonial-profile-pic.png",
            rating: 5
        },
        {
            id: 4,
            review: "Professional, honest, and quality-focused. We've trusted Himalaya Offset for multiple print jobs, and the results have always exceeded expectations.",
            name: "Sanjay L., Event Management Company",
            image: "/testimonial-profile-pic.png",
            rating: 5
        },
        {
            id: 5,
            review: "One of the best printing services we've worked with. Fast turnaround, high-quality prints, and competitive pricing. Truly dependable.",
            name: "Priya N., Branding Consultant",
            image: "/testimonial-profile-pic.png",
            rating: 5
        },
        {
            id: 6,
            review: "Their commitment to quality is genuine. Every print comes out sharp, clean, and perfectly aligned. Great experience!",
            name: "Karthik R., Advertising Agency",
            image: "/testimonial-profile-pic.png",
            rating: 5
        }
    ];

    return (
        <div className='testimonial-section main-container'>
            <div className='flex-space-between'>
                <div className='testimonial-title-wrapper'>
                    <div className='title-wrapper'>
                        <Title title='Happy Clients' />
                    </div>
                    <h1 className='section-title'>Words From <span> Our Clients</span></h1>
                </div>
                <div className='product-left-bottom-card testimonial-card-right-card'>
                    <p className='product-left-bottom-card-title'>See All Reviews</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="101" viewBox="0 0 101 101" fill="none">
                        <circle cx="50.0085" cy="50.0085" r="50.0085" fill="white" />
                        <path d="M71.9684 37.1675C72.1451 35.7981 71.1783 34.5448 69.8089 34.3681L47.4939 31.4888C46.1245 31.3121 44.8712 32.2789 44.6945 33.6483C44.5178 35.0176 45.4847 36.271 46.8541 36.4477L66.6896 39.0071L64.1302 58.8426C63.9535 60.212 64.9203 61.4653 66.2897 61.642C67.6591 61.8187 68.9124 60.8519 69.0891 59.4825L71.9684 37.1675ZM32.6406 65.2734L34.1676 67.2529L71.016 38.827L69.489 36.8476L67.962 34.8681L31.1136 63.294L32.6406 65.2734Z" fill="black" />
                    </svg>
                </div>
            </div>
            <div className='testimonial-slider-wrapper'>
                <div className="testimonial-slider-container">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.testimonial-next',
                            prevEl: '.testimonial-prev',
                        }}
                        pagination={{
                            el: '.testimonial-pagination',
                            clickable: true,
                            type: 'bullets',
                        }}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={true}
                        speed={800}
                        breakpoints={{
                            640: {
                                slidesPerView: 1,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            1200: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                        }}
                        className="testimonial-swiper"
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial.id}>
                                <TestimonialCard
                                    review={testimonial.review}
                                    image={testimonial.image}
                                    name={testimonial.name}
                                    rating={testimonial.rating}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <button className="testimonial-prev swiper-nav-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button className="testimonial-next swiper-nav-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Testimonial;
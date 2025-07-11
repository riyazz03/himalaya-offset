import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import "../styles/testimonial.css";
import Title from '@/component/Title-Block-Rounded';
import TestimonialCard from '@/component/TestimonialCard';

const Testimonial = () => {
    // Testimonial data array
    const testimonials = [
        {
            id: 1,
            review: "Absolutely loved the quality and design! My visiting cards look super professional and have already impressed a few clients.",
            name: "- Rahul Mehta, Freelance Designer",
            image: "../public/testimonial-profile-pic.png"
        },
        {
            id: 2,
            review: "The process was smooth, the team was helpful, and I got exactly what I envisioned. Highly recommended!",
            name: "- Sneha Kapoor, Marketing Consultant",
            image: "../public/testimonial-profile-pic.png"
        },
        {
            id: 3,
            review: "Outstanding service and exceptional quality. The attention to detail in every aspect of the design was remarkable.",
            name: "- Arjun Sharma, Business Owner",
            image: "../public/testimonial-profile-pic.png"
        },
        {
            id: 4,
            review: "Professional work delivered on time. The team understood our requirements perfectly and exceeded expectations.",
            name: "- Priya Patel, Creative Director",
            image: "../public/testimonial-profile-pic.png"
        },
        {
            id: 5,
            review: "Amazing experience from start to finish. The quality of work and customer service is truly top-notch.",
            name: "- Vikram Singh, Entrepreneur",
            image: "../public/testimonial-profile-pic.png"
        }
    ];

    return (
        <div className='testimonial-section main-container'>
            <div className='testimonial-title-wrapper'>
                <div className='title-wrapper'>
                    <Title title='Happy Clients' />
                </div>
                <h1 className='testimonial-title'>Words From Our Clients</h1>
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
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1200: {
                                slidesPerView: 2,
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
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    
                    {/* Custom Navigation Buttons */}
                    <button className="testimonial-prev swiper-nav-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className="testimonial-next swiper-nav-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                
                {/* Custom Pagination */}
                <div className="testimonial-pagination"></div>
            </div>
        </div>
    );
};

export default Testimonial;
'use client';

import '@/styles/HomeLanding.css';
import Ticker from '@/component/Ticker';
import Categories from '@/Sections/Categories';
import Products from '@/Sections/Products';
import FaqSection from '@/Sections/FaqSection';
import Testimonial from '@/Sections/Testimonial';
import HeroSlider from '@/Sections/HeroSlider';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <Ticker text="Best Deals On Coupons" speedSeconds={50} />
      <Categories />
      <Products />
      <Testimonial />
      <FaqSection />
      <a href="https://wa.me/918838435916" target="_blank" rel="noopener" className='whatapp-icon-wrapper'>
        <Image src="/icons/whatsapp.webp" alt="whatsapp" height={60} width={60} />
      </a>
      <a href="/contact" 
        className="floating-enquiry-btn"  rel="noopener">
        For doubts & enquiry — Contact here
      </a>
    </>
  );
}
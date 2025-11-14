'use client';

import '@/styles/HomeLanding.css';
import Ticker from '@/component/Ticker';
import Categories from '@/Sections/Categories';
import Products from '@/Sections/Products';
import FaqSection from '@/Sections/FaqSection';
import Testimonial from '@/Sections/Testimonial';
import HeroSlider from '@/Sections/HeroSlider';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <Ticker text="Best Deals On Coupons" speedSeconds={50} />
      <Categories />
      <Products />
      <Testimonial />
      <FaqSection />
    </>
  );
}
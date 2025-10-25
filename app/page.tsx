'use client';

import '@/styles/HomeLanding.css';
import Ticker from '@/component/Ticker';
import Categories from '@/Sections/Categories';
import Products from '@/Sections/Products';
import FaqSection from '@/Sections/FaqSection';
import Testimonial from '@/Sections/Testimonial';
import Providers from '@/component/Providers';
import HeroSlider from '@/Sections/HeroSlider';

export default function Home() {
  return (
    <Providers>
      <HeroSlider />
      <Ticker text="Best Deals On Coupons" speedSeconds={50} />
      <div className="h-[50px] md:h-[80px]"></div>
      <Categories />
      <Products />
      <Testimonial />
      <FaqSection />
    </Providers>
  );
}
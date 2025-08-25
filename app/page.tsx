"use client";

import '../styles/HomeLanding.css';
import Button from '../component/Button';
import Ticker from '@/component/Ticker';
import ImageGrid from '@/Sections/ImageGrid';
import Categories from '@/Sections/Categories';
import Products from '@/Sections/Products';
import FaqSection from '@/Sections/FaqSection';
import Testimonial from '@/Sections/Testimonial';
import Providers from '@/component/Providers';


export default function Home() {
  return (
    <Providers>
      <>
        <section className="home-landing">
          <div className='left-side-images'>
            <img src="heroImages/image-1.webp" className='image-1-left' alt="" />
            <img src="heroImages/image-2.webp" className='image-2-left' alt="" />
            <img src="heroImages/image-3.webp" className='image-3-left' alt="" />
          </div>
          <div className='right-side-images'>
            <img src="heroImages/image-1.webp" className='image-1-right' alt="" />
            <img src="heroImages/image-2.webp" className='image-2-right' alt="" />
            <img src="heroImages/image-3.webp" className='image-3-right' alt="" />
          </div>
          <div className="gradient-div"></div>
          <div className="gradient-div-bottom"></div>
          <div className="hero-landing-content-wrapper">
            <h1 className='home-landing-title'>
              Printing with Passion and <span className='title-span'>Purpose</span>
            </h1>
            <p className='hero-landing-text'>
              Turning Every Thought Into Tangible Prints — With 30+ Years of Experience, We Help 10,000+ Clients Celebrate, Promote, and Inspire.
            </p>
            <Button text="Explore Products" link="/products" />
          </div>
        </section>
        <div className="h-[50px] md:h-[80px]"></div>
        <Categories />
        <Ticker text="Best Deals On Coupons" speedSeconds={50} />
        <div className="h-[50px] md:h-[80px]"></div>
        <Products />
        <Testimonial />
        <FaqSection />

      </>
    </Providers>

  );
}

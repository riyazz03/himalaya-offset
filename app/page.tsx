"use client";

import '../styles/HomeLanding.css';
import Button from '../component/Button';
import Ticker from '@/component/Ticker';
import ImageGrid from '@/Sections/ImageGrid';
import Categories from '@/Sections/Categories';
// import ProductCard from '@/component/ProductCard';
import Products from '@/Sections/Products';
import FaqSection from '@/Sections/FaqSection';


export default function Home() {
  return (
    <section className="home-landing">
      <div className="hero-landing-content-wrapper">
        <h1 className='home-landing-title'>
          Printing with Passion and <span className='title-span'>Purpose</span>
        </h1> 
        <p className='hero-landing-text'>
          Turning Every Thought Into Tangible Prints — With 30+ Years of Experience, We Help 10,000+ Clients Celebrate, Promote, and Inspire.
        </p>
        <Button text="Explore Products" link="/products" />
      </div>
      <div className="h-[50px] md:h-[80px]"></div>

      <ImageGrid />
      <Ticker text="Best Deals On Coupons" speedSeconds={50} />
      <div className="h-[50px] md:h-[80px]"></div>

      <Categories />
      <Products />
      <FaqSection />
    </section>
  );
}

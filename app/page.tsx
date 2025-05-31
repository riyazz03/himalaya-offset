"use client";

import '../styles/HomeLanding.css';
import Button from '../component/Button';


export default function Home() {
  const handleClick = () => {
    console.log('View Products clicked!');
  };

  return (
    <section className="home-landing">
      <h1 className='home-landing-title'>
        Printing with Passion and <span className='title-span'>Purpose</span>
      </h1>
      <p className='hero-landing-text'>
        Turning Every Thought Into Tangible Prints — With 30+ Years of Experience, We Help 10,000+ Clients Celebrate, Promote, and Inspire.
      </p>

      <Button text="Explore Products" link="/products" />

    </section>
  );
}

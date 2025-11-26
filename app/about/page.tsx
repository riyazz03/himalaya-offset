"use client";
import React from "react";
import "@/styles/about.css";
import Testimonial from "@/Sections/Testimonial";
import FaqSection from "@/Sections/FaqSection";
import Image from "next/image";
import GallerySlider from "@/component/GallerySlider";
import Title from '@/component/Title-Block-Rounded';

export default function AboutUs() {


  return (
    <>
      <section className="hero-section">
        <video
          src="/videos/aboutVideo.mp4"
          className="hero-image"
          autoPlay
          loop
          muted
          playsInline
        />  
        <div className="hero-overlay">
          <div className="hero-content">
            <h2 className="hero-title">Welcome to Our Story</h2>
            <p className="hero-subtitle">
              Building the future, one step at a time
            </p>
          </div>
        </div>
      </section>

      <div className="about-title-wrapper">
        <Title title='About Us' />
        <h2 className="section-title about-title">
          The Story Behind <span>Our Business</span> 
        </h2><br />
      </div>

      {/* About Section */}
      <section className="about-section">
        <div className="about-image-container">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
            alt="About Us"
            className="about-image"
            width={600}
            height={400}
          />
        </div>
        <div className="about-content">
        <p className="section-para about-para-top">
          Welcome to Himalaya Offset Printing Press — your trusted partner for premium-quality printing solutions.
          With years of experience and a passion for excellence, we specialize in delivering sharp, vibrant, and durable prints that help businesses and individuals stand out.
          <br /><br />
          Using advanced offset and digital printing technology, we produce a wide range of products including visiting cards, bill books, brochures, posters, flex banners, certificates, and elegant invitation cards. Every order goes through strict quality checks to ensure perfect color accuracy, clean finishing, and long-lasting results.
          <br /><br />
          What makes us special?
          We combine modern printing technology, skilled craftsmanship, fast delivery, and complete customization to turn your ideas into powerful printed materials. Whether you need business stationery, promotional prints, or personalized designs, we create each product with care, precision, and professionalism.
          <br /><br />
          Proudly serving local businesses, institutions, schools, and individuals, we are committed to providing reliable service, competitive pricing, and total customer satisfaction.
          <br />  <br />
          Your vision. Our craftsmanship. One perfect print — every time.
          </p>
        </div>
      </section>

      <GallerySlider />
      <Testimonial />
      <FaqSection /> 
    </>
  );
}

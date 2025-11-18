import React from 'react'
import "@/styles/productcard.css"
import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  image: string;
  title: string;
  pricing: string;
  buttonText: string;
  productId?: string;
  href?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ image, title, pricing, buttonText, productId, href }) => {
  const slug = productId || title.toLowerCase().replace(/\s+/g, '-');
  const defaultHref = href || `/products/${slug}`;
  
  return (
    <div className='product-card'>
      <div className='product-card-image-wrapper'>
        <Image 
          src={image} 
          alt={title} 
          className='product-card-image' 
          width={500} 
          height={500}
          priority={false}
          quality={85}
        />
      </div>
      <div className='product-card-content'>
        <h1 className='product-card-title'>{title}</h1>
        <p className='product-card-pricing'>{pricing}</p>
      </div>
      <Link className='product-card-button' href={defaultHref}>
          <p className='product-card-button-text'>{buttonText}</p>
          <Image 
            src="/icons/cards-plus.svg" 
            alt="cards plus" 
            width={24}
            height={24}
          />
      </Link>
    </div>
  )
}

export default ProductCard
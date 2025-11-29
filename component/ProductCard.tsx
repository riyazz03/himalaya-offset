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
    <Link href={defaultHref} className='product-card-link'>
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
          <p className='product-card-title'>{title}</p>
        </div>
        <div className='product-card-button'>
          <p className='product-card-button-text'>{buttonText}</p>
          <Image 
            src="/icons/cards-plus.svg" 
            alt="cards plus" 
            width={24}
            height={24}
          />
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
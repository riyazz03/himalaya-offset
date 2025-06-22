import React from 'react'
import "../styles/productcard.css"
import Image from 'next/image'

const ProductCard = ({ image, title, pricing, buttonText }: { image: string, title: string, pricing: string, buttonText: string }) => {
  return (
    <div className='product-card'>
      <div className='product-card-image-wrapper'>
        <img src={image} alt={title} className='product-card-image' width={500} height={500} />
      </div>
      <div className='product-card-content'>
        <h1 className='product-card-title'>{title}</h1>
        <p className='product-card-pricing'>{pricing}</p>
      </div>
      <div className='product-card-button'>
        <p className='product-card-button-text'>{buttonText}</p>
        <img src="/icons/cards-plus.svg" alt="cards plus" />
      </div>
    </div>
  )
}

export default ProductCard

import Title from '@/component/Title-Block-Rounded'
import React from 'react'
import "../styles/products.css"
import ProductCard from '@/component/ProductCard'

const Product = [
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
    {
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        title: "Visiting Card",
        pricing: "100 starting at ₹230.00",
        buttonText: "Choose Options"
    },
]

const Products = () => {
    return (
        <div className='products-section'>
            <div className="main-container">
                <div className="products-wrapper">
                    <div className='product-left'>
                        <div className='product-left-top'>
                            <Title title='Our Products' />
                            <h1 className='product-left-top-title'>Top <span>Selling Products</span></h1>
                        </div>
                        <div className='product-left-bottom'>
                            <div className='product-left-bottom-card'>
                                <h1 className='product-left-bottom-card-title'>Explore All Products</h1>
                                <svg xmlns="http://www.w3.org/2000/svg" width="101" height="101" viewBox="0 0 101 101" fill="none">
                                    <circle cx="50.0085" cy="50.0085" r="50.0085" fill="white" />
                                    <path d="M71.9684 37.1675C72.1451 35.7981 71.1783 34.5448 69.8089 34.3681L47.4939 31.4888C46.1245 31.3121 44.8712 32.2789 44.6945 33.6483C44.5178 35.0176 45.4847 36.271 46.8541 36.4477L66.6896 39.0071L64.1302 58.8426C63.9535 60.212 64.9203 61.4653 66.2897 61.642C67.6591 61.8187 68.9124 60.8519 69.0891 59.4825L71.9684 37.1675ZM32.6406 65.2734L34.1676 67.2529L71.016 38.827L69.489 36.8476L67.962 34.8681L31.1136 63.294L32.6406 65.2734Z" fill="black" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className='product-right'>
                        {Product.map(({ image, title, pricing, buttonText }, index) => (
                            <ProductCard key={index} image={image} title={title} pricing={pricing} buttonText={buttonText} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Products

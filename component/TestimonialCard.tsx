import React from 'react'
import "../styles/testimonialcard.css"

interface TestimonialCardProps {
  review: string
  image: string
  name: string
  rating?: number
}

const TestimonialCard = ({ review, image, name, rating = 5 }: TestimonialCardProps) => {
  return (
    <div className='testimonial-card'>
      {/* Star Rating */}
      <div className='testimonial-rating'>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={i < rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className="star-icon"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>

      {/* Review Content */}
      <div className='testimonial-card-content'>
        <p className='testimoninal-card-content-para'>{review}</p>
      </div>

      {/* Customer Info */}
      <div className='testimonial-card-customer'>
        <img src={image} alt={name} className='review-card-customer-image' width={50} height={50} />
        <h4 className='review-card-customer-name'>{name}</h4>
      </div>
    </div>
  )
}

export default TestimonialCard
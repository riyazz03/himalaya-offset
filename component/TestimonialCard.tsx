import React from 'react'
import "../styles/testimonialcard.css"

const TestimonialCard = ({review,image,name} : {review: string, image: string, name: string}) => {
    return (
        <div className='testimonial-card'>
            <div className='testimonial-card-content'>
                <p className='testimoninal-card-content-para'>{review}</p>
            </div>
            <div className='testimonial-card-customer'>
                <img src={image} alt="photo" className='review-card-customer-image' width={100} height={100} />
                <h4 className='review-card-customer-name'>{name}</h4>
            </div>
        </div>
    )
}

export default TestimonialCard

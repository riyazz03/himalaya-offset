import React from 'react'
import "../styles/reviewcard.css"

const ReviewCard = ({image, review, name} : {image: string, review: string, name: string}) => {
  return (
    <div className='review-card'>
      <div className='review-card-text'>{review}</div>
      <div className='review-card-customer'>
        <img src={image} alt="face" className='review-card-customer-image' width={100} height={100} />
        <h4 className='review-card-customer-name'>{name}</h4>
      </div>
    </div>
  )
}

export default ReviewCard

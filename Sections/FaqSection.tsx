import React from 'react'
import "../styles/faqsection.css"
import Title from '@/component/Title'

const FaqSection = () => {
  return (
    <div className='faq-section'>
        <div className="main-container">
            <div className='faq-wrapper'>
                <div className='faq-header'>
                    <Title title='Need Help?'/>
                    <h1 className='faq-header-title'>We&apos;ve got all the answers you need</h1>
                </div>
                <div className='faq-questions'></div>
            </div>
        </div>
    </div>
  )
}

export default FaqSection

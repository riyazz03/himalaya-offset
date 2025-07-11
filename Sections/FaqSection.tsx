import React from 'react'
import "../styles/faqsection.css"
import Title from '@/component/Title-Block-Rounded'
import FaqCards from '@/component/FaqCards' // Adjust path as needed

const FaqSection = () => {
  const faqQuestions = [
    {
      id: 1,
      question: "What information should I include on my visiting card?",
      answer: "Your visiting card should include essential contact information such as your full name, job title, company name, phone number, email address, and website. You may also include your physical address, social media handles, and a brief tagline that represents your brand or profession. Keep the information concise and relevant to your business needs."
    },
    {
      id: 2,
      question: "Can I customize the design of my visiting card?",
      answer: "Yes, we offer full customization options for your visiting card design. You can choose from our pre-designed templates or create a completely custom design. We provide options for colors, fonts, layouts, logos, and graphics. Our design team can also work with you to create a unique design that reflects your brand identity and professional image."
    },
    {
      id: 3,
      question: "What size is a standard visiting card?",
      answer: "The standard visiting card size is 3.5 × 2 inches (89 × 51 mm) in most countries including the US and Europe. However, we also offer other popular sizes like 3.3 × 2.1 inches (85 × 55 mm) which is common in many Asian countries. We can accommodate custom sizes based on your specific requirements and regional preferences."
    },
    {
      id: 4,
      question: "Do you provide digital versions of the card?",
      answer: "Yes, we provide high-resolution digital versions of your visiting card design in multiple formats including PNG, JPEG, and PDF. These digital versions can be used for email signatures, social media profiles, websites, or sharing via messaging apps. You'll receive both print-ready and web-optimized versions of your design."
    },
    {
      id: 5,
      question: "How long does printing take?",
      answer: "Standard printing typically takes 3-5 business days after design approval. Rush orders can be completed in 1-2 business days for an additional fee. Premium finishes like embossing, foil stamping, or special materials may require 5-7 business days. We'll provide you with an exact timeline when you place your order based on your specific requirements."
    },
    {
      id: 6,
      question: "How far in advance should I place an order?",
      answer: "We recommend placing your order at least 1-2 weeks before you need the cards, especially for large quantities or custom designs. This allows time for design revisions, proofing, and production. For urgent needs, we offer rush services, but advance planning ensures the best quality and gives you time to review and approve your design properly."
    },
    {
      id: 7,
      question: "Can I add photos or custom illustrations?",
      answer: "Absolutely! We can incorporate your photos, custom illustrations, logos, or any graphics you provide. We accept high-resolution images in various formats (PNG, JPEG, AI, PSD, etc.). Our design team can also create custom illustrations or enhance your existing images to ensure they look professional and print beautifully on your visiting cards."
    },
    {
      id: 8,
      question: "Do you offer envelope customization too?",
      answer: "Yes, we offer comprehensive envelope customization services. You can match your envelopes to your visiting card design with custom colors, fonts, and layouts. We provide options for different envelope sizes, paper types, and finishes. You can also add your return address, logo, or decorative elements to create a cohesive professional presentation."
    }
  ];

  return (
    <div className='faq-section'>
      <div className="main-container">
        <div className='faq-wrapper'>
          <div className='faq-header'>
            <div className='faq-header-title-wrapper'>
              <Title title='Need Help?' />
            </div>
            <h1 className='faq-header-title'>We&apos;ve got all the <span> Answers you need</span></h1>
          </div>
          <div className='faq-questions'>
            {faqQuestions.map((faq) => (
              <FaqCards
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FaqSection
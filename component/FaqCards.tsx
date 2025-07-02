
import React, { useState } from 'react';
import "../styles/faqcards.css";

interface FaqCardsProps {
    question: string;
    answer: string;
}

const FaqCards: React.FC<FaqCardsProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleFaq = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="faq-card-container">
            <div
                className="faq-card-question-wrapper"
                onClick={toggleFaq}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFaq();
                    }
                }}
                aria-expanded={isOpen}
                aria-controls="faq-answer"
            >
                <p className="faq-card-question">{question}</p>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="11"
                    viewBox="0 0 20 11"
                    fill="none"
                    className={`faq-chevron ${isOpen ? 'rotated' : ''}`}
                >
                    <path
                        d="M2 1.5L10 8.5L18 1.5"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <div
                className={`faq-answer-wrapper ${isOpen ? 'open' : ''}`}
                id="faq-answer"
                aria-hidden={!isOpen}
            >
                <div className="faq-answer-content">
                    <p className="faq-card-answer">{answer}</p>
                </div>
            </div>
        </div>
    );
};

export default FaqCards;
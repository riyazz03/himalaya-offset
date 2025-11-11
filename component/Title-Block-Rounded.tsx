import React from 'react'

interface TitleProps {
    title: string
}

const Title: React.FC<TitleProps> = ({ title }) => {
    return (
        <>
            <style>{`
                .title-container {
                    display: flex;
                    padding: 0.9375rem 2.1875rem;
                    align-items: center;
                    gap: 0.625rem;
                    border-radius: 6.25rem;
                    border: 1px solid #ccc;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .title-container:hover {
                    border-color: var(--blue, #2067ff);
                    background-color: rgba(32, 103, 255, 0.05);
                }

                .title-text {
                    color: #000;
                    font-size: 1rem;
                    font-style: normal;
                    font-weight: 600;
                    line-height: normal;
                    transition: all 0.3s ease;
                    margin: 0;
                    white-space: nowrap;
                }

                /* Tablet */
                @media (max-width: 1024px) {
                    .title-container {
                        padding: 0.875rem 1.875rem;
                    }

                    .title-text {
                        font-size: 0.95rem;
                    }
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .title-container {
                        padding: 0.75rem 1.5rem;
                    }

                    .title-text {
                        font-size: 0.9rem;
                    }
                }

                /* Small Mobile */
                @media (max-width: 480px) {
                    .title-container {
                        padding: 0.7rem 1.5rem;
                    }

                    .title-text {
                        font-size: 0.8rem;
                    }
                }

                /* Extra Small Mobile */
                @media (max-width: 360px) {
                    .title-container {
                        padding: 0.5rem 0.75rem;
                        gap: 0.5rem;
                    }

                    .title-text {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
            
            <div className="title-container">
                <p className="title-text">{title}</p>
            </div>
        </>
    )
}

export default Title
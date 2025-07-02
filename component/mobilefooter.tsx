"use client";

import React, { useRef, useEffect, useState } from "react";
import "../styles/mobilefooter.css"
import Link from "next/link";

const MobileFooter = ({
  question,
  answer,
  answer2,
  answer3,
  answer4,
  answer5,
  links,
  links2,
  links3,
  links4,
  links5,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  answer2: string;
  answer3: string;
  answer4?: string;
  answer5?: string;
  links: string;
  links2: string;
  links3: string;
  links4?: string;
  links5?: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div className="footer-card">
      <div className="footer-mobile">
        <div onClick={onClick} className="footer-questions">
          <h3 className="footer-question-h3">{question}</h3>
          <div className="footer-svg-outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`feather feather-plus text-black flex-shrink-0 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <line
                x1="12"
                y1="5"
                x2="12"
                y2="19"
                className={`transition-opacity duration-300 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              ></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </div>
        <div
          ref={contentRef}
          className="footer-answers overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isOpen ? `${contentHeight}px` : "0",
          }}
        >
          <div className="footer-answers-wrapper">
            <Link href={links} className="footer-link">
              {answer}
            </Link>
            <Link href={links2} className="footer-link">
              {answer2}
            </Link>
            <Link href={links3} className="footer-link">
              {answer3}
            </Link>
            {answer4 && links4 && (
              <Link href={links4} className="footer-link">
                {answer4}
              </Link>
            )}
            {answer5 && links5 && (
              <Link href={links5} className="footer-link">
                {answer5}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;
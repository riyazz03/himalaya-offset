'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  text: string;
  link: string;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, link, className = '', disabled = false }) => {
  return (
    <Link href={disabled ? '#' : link} passHref legacyBehavior>
      <a
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`
          relative inline-flex items-center justify-between
          bg-blue-600 text-white font-bold
          px-6 py-4 pr-15
          rounded-full
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-4 focus:ring-blue-300
          ${className}
        `}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        <span className="flex-1 text-center pr-2">{text}</span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="17.5" cy="17.5" r="17.5" fill="white" />
            <path
              d="M17.1817 25.0637C17.5722 25.4543 18.2054 25.4543 18.5959 25.0637L24.9599 18.6998C25.3504 18.3092 25.3504 17.6761 24.9599 17.2856C24.5693 16.895 23.9362 16.895 23.5456 17.2856L17.8888 22.9424L12.2319 17.2856C11.8414 16.895 11.2083 16.895 10.8177 17.2856C10.4272 17.6761 10.4272 18.3092 10.8177 18.6998L17.1817 25.0637ZM17.8888 11.6666H16.8888L16.8888 24.3566H17.8888H18.8888L18.8888 11.6666H17.8888Z"
              fill="black"
            />
          </svg>
        </span>
      </a>
    </Link>
  );
};

export default Button;

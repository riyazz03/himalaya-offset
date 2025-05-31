'use client';

import React from 'react';
import Link from 'next/link';
import '../styles/header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="logo">
                <Link href="/">
                    <img src="/logo.png" alt="Your Logo" className="logo-image" />
                    <div>HIMALAYA OFFSET</div>
                </Link>
            </div>

            <div className="nav-components flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm navbar-search">
                    <svg
                        className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M8.74996 16.3333C12.662 16.3333 15.8333 13.1621 15.8333 9.24999C15.8333 5.33791 12.662 2.16666 8.74996 2.16666C4.83788 2.16666 1.66663 5.33791 1.66663 9.24999C1.66663 13.1621 4.83788 16.3333 8.74996 16.3333Z"
                            stroke="#B8B8B8"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M11.107 6.47625C10.7977 6.16636 10.4303 5.92059 10.0258 5.75306C9.62131 5.58553 9.18772 5.49953 8.74991 5.5C8.31209 5.49953 7.8785 5.58553 7.47401 5.75306C7.06951 5.92059 6.70209 6.16636 6.39282 6.47625M13.8424 14.3425L17.3778 17.8779"
                            stroke="#B8B8B8"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    <input
                        className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-0 focus:border-transparent"
                        type="text"
                        placeholder="Search Products"
                    />
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-3 rounded-full px-5 py-1 bg-custom-blue">
                        <span className="text-white font-bold">Login</span>
                        <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#loginIconClip)">
                                <path
                                    d="M9.76 0.5C15.417 0.5 20 4.977 20 10.5C20 16.023 15.416 20.5 9.76 20.5C6.569 20.5 3.618 19.063 1.69 16.654C1.63595 16.5867 1.59598 16.5093 1.57246 16.4262C1.54894 16.3432 1.54234 16.2563 1.55307 16.1706C1.5638 16.085 1.59163 16.0024 1.6349 15.9277C1.67818 15.8531 1.73603 15.7879 1.805 15.736C1.94565 15.629 2.12243 15.5809 2.2979 15.602C2.47336 15.6231 2.63372 15.7117 2.745 15.849C3.58843 16.8972 4.65709 17.7421 5.87168 18.3208C7.08627 18.8995 8.41559 19.1973 9.761 19.192C14.676 19.192 18.661 15.3 18.661 10.5C18.661 5.7 14.676 1.808 9.761 1.808C8.4348 1.80283 7.12398 2.09213 5.92315 2.65502C4.72232 3.21791 3.66142 4.04035 2.817 5.063C2.70396 5.19904 2.54236 5.28569 2.36648 5.30454C2.19061 5.3234 2.01431 5.27299 1.875 5.164C1.80663 5.11123 1.74956 5.04524 1.70721 4.96997C1.66486 4.89469 1.63808 4.81167 1.62847 4.72583C1.61886 4.64 1.62662 4.55311 1.65127 4.47033C1.67593 4.38756 1.71699 4.31059 1.772 4.244C3.703 1.894 6.614 0.5 9.76 0.5ZM10.306 7.362L13.013 10.069C13.275 10.331 13.28 10.749 13.024 11.005L10.38 13.65C10.3179 13.7111 10.2444 13.7593 10.1636 13.7919C10.0828 13.8244 9.99632 13.8407 9.90921 13.8396C9.8221 13.8386 9.73606 13.8204 9.65605 13.7859C9.57603 13.7515 9.50362 13.7016 9.443 13.639C9.38051 13.5783 9.33065 13.5059 9.2963 13.4258C9.26195 13.3457 9.24379 13.2597 9.24286 13.1726C9.24193 13.0855 9.25825 12.9991 9.29089 12.9183C9.32352 12.8375 9.37182 12.764 9.433 12.702L10.98 11.154L0.67 11.155C0.582909 11.1563 0.496417 11.1404 0.415512 11.1081C0.334606 11.0759 0.260887 11.0279 0.198604 10.967C0.136321 10.9061 0.0867061 10.8335 0.0526197 10.7534C0.0185334 10.6732 0.000649822 10.5871 0 10.5C0 10.139 0.3 9.846 0.67 9.846H10.938L9.38 8.287C9.31751 8.22631 9.26765 8.15385 9.2333 8.0738C9.19895 7.99375 9.18079 7.90769 9.17986 7.82058C9.17893 7.73348 9.19525 7.64705 9.22789 7.56628C9.26052 7.48552 9.30882 7.41201 9.37 7.35C9.43204 7.28919 9.50547 7.24122 9.58609 7.20885C9.6667 7.17648 9.75292 7.16034 9.83978 7.16136C9.92665 7.16238 10.0125 7.18054 10.0923 7.2148C10.1721 7.24906 10.2444 7.29874 10.305 7.361"
                                    fill="white"
                                />
                            </g>
                            <defs>
                                <clipPath id="loginIconClip">
                                    <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </button>

                    <button className="flex items-center gap-3 border rounded-full px-3 py-1">
                        <span className="text-black font-bold">Contact Us</span>
                        <span className="bg-custom-blue text-white rounded-full p-2.5">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7 17l10-10m0 0H7m10 0v10"
                                />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}

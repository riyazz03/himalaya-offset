'use client';

import React from 'react';
import Link from 'next/link';

const menuData = [
    {
        name: 'Visiting Card',
        subcategories: ['Standard', 'Premium', 'Transparent'],
    },
    {
        name: 'Sticker Sheet',
        subcategories: ['Round', 'Square', 'Custom'],
    },
    {
        name: 'Letter Heads',
        subcategories: ['A4', 'A5'],
    },
    {
        name: 'Bill Books',
        subcategories: ['1 Copy', '2 Copy', '3 Copy'],
    },
    {
        name: 'Envelope',
        subcategories: ['Small', 'Medium', 'Large'],
    },
    {
        name: 'Brochures',
        subcategories: ['Bi-fold', 'Tri-fold', 'Z-fold'],
    },
    {
        name: 'Book Work',
        subcategories: ['Softcover', 'Hardcover'],
    },
    {
        name: 'Calendar',
        subcategories: ['Wall', 'Desk', 'Pocket'],
    },
    {
        name: 'Flyers',
        subcategories: ['A4', 'A5', 'DL'],
    },
];

const getSubcategoryLink = (category: string, subcategory: string) =>
    `/${category.toLowerCase().replace(/\s+/g, '-')}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`;

export default function MegaMenu() {
    return (
        <nav className="mt-3 px-8 border-t border-b border-gray-300 bg-transparent z-50 flex justify-center items-center">
            <ul className="flex gap-8 list-none p-0 m-0">
                {menuData.map((item) => (
                    <li
                        key={item.name}
                        className="relative cursor-pointer py-3.5 group menuItem"
                    >
                        <span className="font-medium">{item.name}</span>
                        <div
                            className="invisible opacity-0 pointer-events-none absolute top-[3rem] left-0 min-w-[200px] rounded-lg border border-white/20 bg-white/20
                          backdrop-blur-lg shadow-lg p-4
                          transition-opacity duration-200 ease-in-out
                          group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto"
                        >
                            <div className="flex flex-col">
                                {item.subcategories.map((sub, idx) => (
                                    <Link
                                        key={idx}
                                        href={getSubcategoryLink(item.name, sub)}
                                        className="py-2 px-4 text-sm cursor-pointer rounded-md hover:bg-blue-600 hover:text-white transition"
                                    >
                                        {sub}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

'use client';

import React from 'react';
import '../styles/MegaMenu.css';

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

export default function MegaMenu() {
  return (
    <nav className="megaMenu">
      <ul className="menuList">
        {menuData.map((item) => (
          <li className="menuItem" key={item.name}>
            <span className="menuTitle">{item.name}</span>
            <div className="dropdown">
              <div className="dropdownContent">
                {item.subcategories.map((sub, index) => (
                  <p key={index}>{sub}</p>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}

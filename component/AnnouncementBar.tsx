"use client";

import React, { useState } from 'react';
import '../styles/announcementbar.css';

export default function AnnouncementBar() {
    const [isVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="announcement-bar">
            🎉 Get 20% Off on Your First Order | 🖨️ Free Delivery for Orders Above ₹999 | 🪪 Visiting Cards Starting at Just ₹199
        </div>
    );
}

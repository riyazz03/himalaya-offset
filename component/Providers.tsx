'use client';

import { ReactNode } from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <div className="StickyComponent">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
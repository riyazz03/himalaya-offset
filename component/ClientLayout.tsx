'use client'

import { ReactNode } from "react";
import { SessionProvider } from 'next-auth/react';
import AnnouncementBar from "@/component/AnnouncementBar";
import Header from "@/component/Header";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <div className="app-layout">
        <AnnouncementBar />
        <Header />
        <main className="main-content">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    </SessionProvider>
  );
}
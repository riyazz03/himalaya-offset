'use client'

import { ReactNode } from "react";
import { SessionProvider } from 'next-auth/react';
import AnnouncementBar from "@/component/AnnouncementBar";
import Header from "@/component/Header";
import MegaMenu from "@/component/MegaMenu";
// import Footer from "@/component/Footer"; // Uncomment this if you have a Footer component

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <div className="app-layout">
        <AnnouncementBar />
        <Header />
        <MegaMenu />
        <main className="main-content">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    </SessionProvider>
  );
}
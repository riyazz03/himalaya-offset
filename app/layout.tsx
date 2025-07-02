import type { Metadata } from "next";
import "./globals.css";
import Home from "./page";
import AnnouncementBar from "@/component/AnnouncementBar";
import Header from "@/component/Header";
import MegaMenu from "@/component/MegaMenu";
// import Footer from "@/component/Footer";
export const metadata: Metadata = {
  title: "Himalaya Offset | Quality Visiting Cards, Banners & Wedding Cards",
  description:
    "Himalaya Offset offers premium printing services for visiting cards, banners, flyers, wedding cards, and more. Get vibrant, high-quality prints that make your brand or event stand out.",
};

export default function RootLayout({
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
        <AnnouncementBar />
        <Header />
        <MegaMenu />
        <Home />
        {/* <Footer /> */}
      </body>
    </html>
  );
}

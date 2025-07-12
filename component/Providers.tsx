'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import AnnouncementBar from './AnnouncementBar'
import Header from './Header'
import MegaMenu from './MegaMenu'
// import Footer from './Footer'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AnnouncementBar />
      <Header />
      <MegaMenu />
      {children}
      {/* <Footer /> */}
    </SessionProvider>
  )
}
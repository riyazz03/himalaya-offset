import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import ClientLayout from '@/component/ClientLayout'
import '../app/globals.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ClientLayout>
        <Component {...pageProps} />
      </ClientLayout>
    </SessionProvider>
  )
}
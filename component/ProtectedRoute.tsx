'use client'

import React, { useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Show children for authenticated users only
  // Unauthenticated users are redirected in useEffect
  if (status === 'authenticated') {
    return <>{children}</>
  }

  // Return null only when redirecting
  return null
}
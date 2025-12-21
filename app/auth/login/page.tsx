'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import PublicRoute from '@/component/PublicRoute'
import '@/styles/auth.css'

function LoginContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [googleLoading, setGoogleLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess('Registration successful! Please login.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error || 'Invalid credentials')
        setLoading(false)
      } else if (result?.ok) {
        const previousPage = document.referrer || '/'
        if (previousPage.includes('/auth/')) {
          router.replace('/')
        } else {
          router.replace(previousPage)
        }
      }
    } catch {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async (): Promise<void> => {
    setGoogleLoading(true)
    try {
      const result = await signIn('google', {
        redirect: false
      })
      if (result?.ok) {
        router.replace('/')
      } else if (result?.error) {
        setError('Google sign in failed. Please try again.')
        setGoogleLoading(false)
      }
    } catch {
      setError('Google sign in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Image
        src="/mountain-bg.webp"
        alt="Background"
        fill
        className="auth-bg-image"
        priority
        quality={80}
      />

      <div className="auth-card">
        <div className="auth-logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L28 8V16C28 24.8366 16 30 16 30C16 30 4 24.8366 4 16V8L16 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M11 16L14.5 19.5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="auth-header">
          <h2>Sign in with email</h2>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>

          <div className="form-footer">
            <a href="/auth/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className="auth-button primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Signing in...
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </form>

        <div className="divider">
          <span>Or sign in with</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="auth-button google"
          disabled={googleLoading}
        >
          <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Signing in...' : 'Google'}
        </button>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account?{' '}
            <a href="/auth/register" className="auth-link">
              Create a new account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage(): React.ReactElement {
  return (
    <PublicRoute>
      <LoginContent />
    </PublicRoute>
  )
}
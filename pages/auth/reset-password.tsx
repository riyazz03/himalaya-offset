import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AuthService } from '../../lib/sanity-auth'
import '../../styles/auth.css'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token as string)
    }
  }, [router.query.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const result = await AuthService.resetPassword(token, password)
      
      if (result.data) {
        setMessage('Password reset successful! You can now sign in with your new password.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Invalid Reset Link</h1>
            <p>This password reset link is invalid or has expired.</p>
          </div>
          <div className="auth-footer">
            <Link href="/auth/forgot-password" className="auth-link">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link href="/auth/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
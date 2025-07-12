import React, { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '../../lib/sanity-auth'
import '../../styles/auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await AuthService.generatePasswordResetToken(email)
      
      if (result.data) {
        setMessage('Password reset instructions have been sent to your email.')
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive password reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
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
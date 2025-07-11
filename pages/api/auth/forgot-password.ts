// pages/api/auth/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../../lib/sanity-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const result = await AuthService.generatePasswordResetToken(email)
    
    if (result.error) {
      return res.status(404).json({ message: result.error })
    }

    res.status(200).json({ 
      message: 'Password reset email sent successfully' 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}



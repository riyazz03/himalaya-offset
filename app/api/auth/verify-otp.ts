// pages/api/auth/verify-otp.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../../lib/sanity-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, otp, type = 'email_verification' } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  try {
    const result = await AuthService.verifyOTP(email, otp, type)
    
    if (result.error) {
      return res.status(400).json({ message: result.error })
    }

    res.status(200).json({ 
      message: 'OTP verified successfully',
      verified: true 
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}


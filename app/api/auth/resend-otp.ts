// pages/api/auth/resend-otp.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../../lib/sanity-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, phone, type = 'email_verification' } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const result = await AuthService.generateAndSendOTP(email, phone || '', type)
    
    if (result.error) {
      return res.status(500).json({ message: result.error })
    }

    res.status(200).json({ 
      message: 'OTP sent successfully' 
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
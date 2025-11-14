// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../../lib/sanity-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, phone, password } = req.body

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const userResult = await AuthService.createUser({
      name,
      email,
      phone,
      password
    })

    if (userResult.error) {
      return res.status(400).json({ message: userResult.error })
    }

    const otpResult = await AuthService.generateAndSendOTP(email, phone, 'email_verification')
    
    if (otpResult.error) {
      return res.status(500).json({ message: 'User created but failed to send OTP' })
    }

    res.status(201).json({ 
      message: 'User created successfully. Please verify your email.',
      user: userResult.data 
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}


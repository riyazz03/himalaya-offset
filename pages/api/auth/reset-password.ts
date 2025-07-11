// pages/api/auth/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../../lib/sanity-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' })
  }

  try {
    const result = await AuthService.resetPassword(token, password)
    
    if (result.error) {
      return res.status(400).json({ message: result.error })
    }

    res.status(200).json({ 
      message: 'Password reset successful' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

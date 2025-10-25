import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthService } from '@/lib/sanity-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, email } = req.body;

    if (!phone || !email) {
      return res.status(400).json({ error: 'Phone and email are required' });
    }

    const result = await AuthService.generateAndSendOTP(
      email,
      phone,
      'phone_verification'
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ 
      data: { sent: true },
      message: 'OTP sent to your phone'
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ 
      error: 'Failed to send OTP'
    });
  }
}
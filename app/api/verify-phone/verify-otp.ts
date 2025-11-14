import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthService } from '@/lib/sanity-auth';
import { client } from '@/lib/sanity';

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

    const { phone, email, code } = req.body;

    if (!phone || !email || !code) {
      return res.status(400).json({ error: 'Phone, email, and code are required' });
    }

    const result = await AuthService.verifyOTP(
      email,
      code,
      'phone_verification'
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Update user's phoneVerified status
    const user = await client
      .patch(session.user?.id as string)
      .set({ phoneVerified: true })
      .commit();

    return res.status(200).json({ 
      data: { verified: true },
      message: 'Phone verified successfully',
      user
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ 
      error: 'Failed to verify OTP'
    });
  }
}
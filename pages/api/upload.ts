import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { client } from '@/lib/sanity';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const asset = await client.assets.upload('image', buffer, {
      filename: 'profile-avatar.jpg'
    });

    return res.status(200).json({ assetId: asset._id });
  } catch (err) {
    console.error('Upload Error:', err);
    return res.status(500).json({ 
      error: 'Failed to upload avatar',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
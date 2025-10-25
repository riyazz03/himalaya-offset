import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    if (req.method === 'GET') {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await client.fetch(
        `*[_type == "user" && email == $email][0] {
          _id, 
          name, 
          email, 
          phone, 
          avatar {
            asset -> {
              _id,
              url
            }
          },
          isVerified, 
          phoneVerified, 
          role, 
          provider, 
          _createdAt
        }`,
        { email } as Record<string, unknown>
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ data: user });
    }

    if (req.method === 'PUT') {
      const { name, phone, avatarAssetId } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const updateData: Record<string, unknown> = {
        name,
        phone
      };

      if (avatarAssetId) {
        updateData.avatar = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: avatarAssetId
          }
        };
      }

      await client
        .patch(session.user?.id as string)
        .set(updateData)
        .commit();

      const updatedUser = await client.fetch(
        `*[_id == $id][0] {
          _id, 
          name, 
          email, 
          phone, 
          avatar {
            asset -> {
              _id,
              url
            }
          },
          isVerified, 
          phoneVerified, 
          role, 
          provider, 
          _createdAt
        }`,
        { id: session.user?.id }
      );

      return res.status(200).json({ 
        data: updatedUser,
        avatarUrl: updatedUser.avatar?.asset?.url 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ 
      error: 'Failed to process request'
    });
  }
}
import { client } from './sanity';

export const ProfileService = {
  async getProfileByEmail(email: string) {
    try {
      const user = await client.fetch(
        '*[_type == "user" && email == $email][0] { _id, name, email, phone, avatar, isVerified, phoneVerified, role, provider, _createdAt }',
        { email } as Record<string, unknown>
      );

      if (!user) {
        return { data: null, error: 'User not found' };
      }

      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch profile' };
    }
  },

  async getProfileById(userId: string) {
    try {
      const user = await client.fetch(
        '*[_type == "user" && _id == $id][0] { _id, name, email, phone, avatar, isVerified, phoneVerified, role, provider, _createdAt }',
        { id: userId } as Record<string, unknown>
      );

      if (!user) {
        return { data: null, error: 'User not found' };
      }

      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch profile' };
    }
  },

  async updateProfile(userId: string, updateData: Record<string, unknown>) {
    try {
      const user = await client
        .patch(userId)
        .set(updateData)
        .commit();

      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to update profile' };
    }
  },

  async uploadAvatar(imageFile: File): Promise<string | null> {
    try {
      const asset = await client.assets.upload('image', imageFile);
      return asset._id;
    } catch (err) {
      return null;
    }
  }
};
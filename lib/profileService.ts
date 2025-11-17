import { client } from './sanity'

interface SanityUser {
  _id: string
  name: string
  email: string
  phone: string
  avatar?: string | null
  isVerified: boolean
  phoneVerified: boolean
  role: string
  provider: string
  _createdAt: string
}

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export const ProfileService = {
  async getProfileByEmail(email: string): Promise<ApiResponse<SanityUser>> {
    try {
      const user = await client.fetch<SanityUser | null>(
        '*[_type == "user" && email == $email][0] { _id, name, email, phone, avatar, isVerified, phoneVerified, role, provider, _createdAt }',
        { email }
      )

      if (!user) {
        return { data: null, error: 'User not found' }
      }

      return { data: user, error: null }
    } catch {
      return { data: null, error: 'Failed to fetch profile' }
    }
  },

  async getProfileById(userId: string): Promise<ApiResponse<SanityUser>> {
    try {
      const user = await client.fetch<SanityUser | null>(
        '*[_type == "user" && _id == $id][0] { _id, name, email, phone, avatar, isVerified, phoneVerified, role, provider, _createdAt }',
        { id: userId }
      )

      if (!user) {
        return { data: null, error: 'User not found' }
      }

      return { data: user, error: null }
    } catch {
      return { data: null, error: 'Failed to fetch profile' }
    }
  },

  async updateProfile(userId: string, updateData: Record<string, unknown>): Promise<ApiResponse<SanityUser>> {
    try {
      const user = await client
        .patch(userId)
        .set(updateData)
        .commit()

      return { data: user as unknown as SanityUser, error: null }
    } catch {
      return { data: null, error: 'Failed to update profile' }
    }
  },

  async uploadAvatar(imageFile: File): Promise<string | null> {
    try {
      const asset = await client.assets.upload('image', imageFile)
      return asset._id
    } catch {
      return null
    }
  }
}
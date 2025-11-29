// lib/db.ts
import { client } from './sanity'
import { hash, compare } from 'bcryptjs'
import type { User, SessionUser } from './types'

interface SanityUserDocument {
  _id?: string
  _type: 'user'
  firstName: string
  lastName: string
  email: string
  phone: string
  password?: string
  image?: { asset: { _ref: string } } | null
  company: string
  address: string
  city: string
  state: string
  pincode: string
  emailVerified: boolean
  phoneVerified: boolean
  provider: 'credentials' | 'google'
  googleId?: string | null
  role: 'customer' | 'admin'
  createdAt?: string
  updatedAt?: string
}

interface SanityUser extends SanityUserDocument {
  _id: string
}

interface UserWithGoogle extends User {
  googleId?: string | null
}

/**
 * Database layer - Handles all user operations with Sanity
 * Simplified version WITHOUT OTP functionality
 */
class SanityDatabase {
  /**
   * Create a new user in Sanity
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email)
      if (existingUser) {
        throw new Error('User already exists')
      }

      const now = new Date().toISOString()

      const userDoc: SanityUserDocument = {
        _type: 'user',
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        phone: userData.phone,
        password: userData.password,
        company: userData.company || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        pincode: userData.pincode || '',
        phoneVerified: userData.phoneVerified ?? false,
        emailVerified: userData.emailVerified ?? false,
        provider: 'credentials',
        role: 'customer',
        createdAt: now,
        updatedAt: now
      }

      const created = await client.create(userDoc)

      return this.formatUserResponse(created as SanityUser)
    } catch (error) {
      console.error('[DB] Error creating user:', error)
      throw error
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await client.fetch(
        '*[_type == "user" && email == $email][0]',
        { email: email.toLowerCase() } as Record<string, unknown>
      )

      if (!user) return null
      return this.formatUserResponse(user as SanityUser)
    } catch (error) {
      console.error('[DB] Error fetching user by email:', error)
      return null
    }
  }

  /**
   * Get user by phone
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const user = await client.fetch(
        '*[_type == "user" && phone == $phone][0]',
        { phone } as Record<string, unknown>
      )

      if (!user) return null
      return this.formatUserResponse(user as SanityUser)
    } catch (error) {
      console.error('[DB] Error fetching user by phone:', error)
      return null
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await client.fetch(
        '*[_type == "user" && _id == $id][0]',
        { id } as Record<string, unknown>
      )

      if (!user) return null
      return this.formatUserResponse(user as SanityUser)
    } catch (error) {
      console.error('[DB] Error fetching user by ID:', error)
      return null
    }
  }

  /**
   * Update user
   */
  async updateUser(email: string, updates: Partial<UserWithGoogle>): Promise<UserWithGoogle | null> {
    try {
      const user = await this.getUserByEmail(email)
      if (!user) return null

      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: new Date().toISOString()
      }

      // Remove id and type fields
      delete updateData.id
      delete updateData.createdAt

      const updated = await client
        .patch(user.id)
        .set(updateData)
        .commit() as unknown as SanityUser

      return this.formatUserResponse(updated)
    } catch (error) {
      console.error('[DB] Error updating user:', error)
      return null
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email)
      if (!user || !user.password) return false

      return await compare(password, user.password)
    } catch (error) {
      console.error('[DB] Error verifying password:', error)
      return false
    }
  }

  /**
   * Get user by Google ID
   */
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      const user = await client.fetch(
        '*[_type == "user" && googleId == $googleId][0]',
        { googleId } as Record<string, unknown>
      )

      if (!user) return null
      return this.formatUserResponse(user as SanityUser)
    } catch (error) {
      console.error('[DB] Error fetching user by Google ID:', error)
      return null
    }
  }

  /**
   * Create or update Google user
   */
  async createOrUpdateGoogleUser(data: {
    email: string
    name: string
    googleId: string
    image?: string
  }): Promise<UserWithGoogle> {
    try {
      // Check if user exists by email
      let user = await this.getUserByEmail(data.email) as UserWithGoogle | null

      if (user) {
        // Link Google ID and update image if not already set
        const updateData: any = { emailVerified: true }
        if (!user.googleId) {
          updateData.googleId = data.googleId
        }
        if (data.image && !user.image) {
          updateData.image = data.image
        }
        
        if (Object.keys(updateData).length > 0) {
          user = await this.updateUser(data.email, updateData)
        }
        return user!
      }

      // Create new Google user
      const [firstName, ...lastNameParts] = data.name.split(' ')
      const lastName = lastNameParts.join(' ')

      const newUser = await this.createUser({
        firstName: firstName || 'User',
        lastName: lastName || '',
        email: data.email,
        phone: '',
        password: '',
        company: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phoneVerified: false,
        emailVerified: true,
        image: data.image || null
      })

      // Mark as Google provider
      const googleUser = await client
        .patch(newUser.id)
        .set({ 
          provider: 'google', 
          googleId: data.googleId
        })
        .commit() as unknown as SanityUser

      return this.formatUserResponse(googleUser) as UserWithGoogle
    } catch (error) {
      console.error('[DB] Error creating/updating Google user:', error)
      throw error
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, 10)
  }

  /**
   * Format Sanity user document to User type
   */
  private formatUserResponse(sanityUser: SanityUser): UserWithGoogle {
    return {
      id: sanityUser._id,
      firstName: sanityUser.firstName,
      lastName: sanityUser.lastName,
      email: sanityUser.email,
      phone: sanityUser.phone,
      password: sanityUser.password || '',
      image: sanityUser.image ? this.getImageUrl(sanityUser.image) : null,
      company: sanityUser.company || '',
      address: sanityUser.address || '',
      city: sanityUser.city || '',
      state: sanityUser.state || '',
      pincode: sanityUser.pincode || '',
      phoneVerified: sanityUser.phoneVerified ?? null,
      emailVerified: sanityUser.emailVerified ?? null,
      createdAt: sanityUser.createdAt ? new Date(sanityUser.createdAt) : new Date(),
      updatedAt: sanityUser.updatedAt ? new Date(sanityUser.updatedAt) : new Date(),
      googleId: sanityUser.googleId || null
    }
  }

  /**
   * Get image URL from Sanity image reference
   */
  private getImageUrl(image: { asset: { _ref: string } } | null): string | null {
    if (!image) return null
    try {
      const assetId = image.asset._ref
      const [, assetType, assetPath] = assetId.match(/^([^-]+)-(.+)-([a-z]+)$/) || []
      if (!assetType || !assetPath) return null
      return `https://cdn.sanity.io/images/k0dxt5dl/production/${assetPath}.${assetType}`
    } catch {
      return null
    }
  }
}

export const db = new SanityDatabase()
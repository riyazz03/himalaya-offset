// lib/db.ts
import { User } from './types'

// In-memory database (replace with MongoDB/PostgreSQL in production)
class Database {
  private users: Map<string, User> = new Map()
  private otps: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map()

  // USER OPERATIONS
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = Math.random().toString(36).substr(2, 9)
    const newUser: User = {
      ...user,
      id,
      image: user.image || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.users.set(user.email, newUser)
    return newUser
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.phone === phone) return user
    }
    return null
  }

  async updateUser(email: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(email)
    if (!user) return null
    
    const updated: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    }
    this.users.set(email, updated)
    return updated
  }

  // OTP OPERATIONS
  async saveOTP(phone: string, otp: string, expiresInMinutes: number = 10): Promise<void> {
    this.otps.set(phone, {
      code: otp,
      expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
      attempts: 0
    })
  }

  async getOTP(phone: string): Promise<{ code: string; expiresAt: number; attempts: number } | null> {
    const otp = this.otps.get(phone)
    if (!otp) return null
    
    if (Date.now() > otp.expiresAt) {
      this.otps.delete(phone)
      return null
    }
    
    return otp
  }

  async deleteOTP(phone: string): Promise<void> {
    this.otps.delete(phone)
  }

  async incrementOTPAttempts(phone: string): Promise<number> {
    const otp = this.otps.get(phone)
    if (!otp) return 0
    
    otp.attempts++
    return otp.attempts
  }
}

export const db = new Database()
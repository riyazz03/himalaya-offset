// lib/sanity-auth.ts
import { client } from './sanity'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Types for better type safety
interface UserData {
  name: string
  email: string
  phone: string
  password: string
}

interface GoogleUserData {
  email: string
  name: string
  googleId: string
  avatar?: string | null
}

interface SanityUser {
  _id: string
  name: string
  email: string
  phone: string
  password?: string
  provider: string
  isVerified: boolean
  phoneVerified: boolean
  role: string
  googleId?: string
  avatar?: {
    asset: {
      url: string
    }
  }
}

interface QueryParams {
  email?: string
  token?: string
  [key: string]: unknown
}

interface SanityUserDocument {
  _type: 'user'
  name: string
  email: string
  phone: string
  password?: string
  provider: string
  isVerified: boolean
  phoneVerified: boolean
  role: string
  googleId?: string
  avatar?: {
    _type: 'image'
    asset: {
      _type: 'reference'
      _ref: string
    }
  }
}

export const AuthService = {
  // Create new user
  async createUser(userData: UserData): Promise<{ data: SanityUser | null; error: string | null }> {
    try {
      // Check if user already exists
      const existingUser = await client.fetch(
        '*[_type == "user" && email == $email][0]',
        { email: userData.email } as Record<string, unknown>
      )

      if (existingUser) {
        return { data: null, error: 'User already exists' }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Create user in Sanity
      const newUserDoc: SanityUserDocument = {
        _type: 'user',
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        provider: 'credentials',
        isVerified: false,
        phoneVerified: false,
        role: 'customer'
      }

      const newUser = await client.create(newUserDoc)

      return { data: newUser as SanityUser, error: null }
    } catch (err) {
      console.error('Error creating user:', err)
      return { data: null, error: 'Failed to create user' }
    }
  },

  // Verify user credentials
  async verifyUser(email: string, password: string): Promise<{ data: SanityUser | null; error: string | null }> {
    try {
      const user = await client.fetch(
        '*[_type == "user" && email == $email && provider == "credentials"][0]',
        { email } as Record<string, unknown>
      )

      if (!user || !user.password) {
        return { data: null, error: 'Invalid credentials' }
      }

      const isValid = await bcrypt.compare(password, user.password)
      
      if (!isValid) {
        return { data: null, error: 'Invalid credentials' }
      }

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: userPassword, ...userWithoutPassword } = user
      return { data: userWithoutPassword as SanityUser, error: null }
    } catch (err) {
      console.error('Error verifying user:', err)
      return { data: null, error: 'Verification failed' }
    }
  },

  // Find or create Google user
  async findOrCreateGoogleUser(userData: GoogleUserData): Promise<{ data: SanityUser | null; error: string | null }> {
    try {
      // Check if user exists by email or googleId
      let user = await client.fetch(
        '*[_type == "user" && (email == $email || googleId == $googleId)][0]',
        { email: userData.email, googleId: userData.googleId } as Record<string, unknown>
      )

      if (!user) {
        // Create user data without avatar first
        const newUserData: SanityUserDocument = {
          _type: 'user',
          name: userData.name,
          email: userData.email,
          phone: '', // Will be updated later if needed
          googleId: userData.googleId,
          provider: 'google',
          isVerified: true, // Google accounts are pre-verified
          phoneVerified: false,
          role: 'customer'
        }

        // Try to upload avatar if provided
        if (userData.avatar) {
          try {
            const avatarAssetId = await this.uploadImageFromUrl(userData.avatar)
            if (avatarAssetId) {
              newUserData.avatar = {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: avatarAssetId
                }
              }
            }
          } catch (avatarError) {
            console.log('Avatar upload failed, creating user without avatar:', avatarError)
            // Continue without avatar - don't fail the entire user creation
          }
        }

        // Create new user
        user = await client.create(newUserData)
      } else if (!user.googleId) {
        // Link existing email account with Google
        user = await client
          .patch(user._id)
          .set({ 
            googleId: userData.googleId,
            isVerified: true 
          })
          .commit()
      }

      return { data: user as SanityUser, error: null }
    } catch (err) {
      console.error('Error with Google user:', err)
      return { data: null, error: 'Google authentication failed' }
    }
  },

  // Generate and send OTP
  async generateAndSendOTP(
    email: string, 
    phone: string, 
    type: 'email_verification' | 'phone_verification' | 'password_reset' = 'email_verification'
  ): Promise<{ data: { sent: boolean } | null; error: string | null }> {
    try {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Set expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      // Save OTP to Sanity
      await client.create({
        _type: 'otp',
        email,
        phone,
        code: otpCode,
        type,
        expiresAt,
        isUsed: false
      })

      // Send email
      if (type === 'email_verification' || type === 'password_reset') {
        await this.sendOTPEmail(email, otpCode, type)
      }

      // For phone verification, you would integrate with SMS service here
      if (type === 'phone_verification') {
        console.log(`SMS OTP for ${phone}: ${otpCode}`) // Replace with actual SMS service
      }

      return { data: { sent: true }, error: null }
    } catch (err) {
      console.error('Error generating OTP:', err)
      return { data: null, error: 'Failed to send OTP' }
    }
  },

  // Verify OTP
  async verifyOTP(
    email: string, 
    otpCode: string, 
    type: 'email_verification' | 'phone_verification' | 'password_reset' = 'email_verification'
  ): Promise<{ data: { verified: boolean } | null; error: string | null }> {
    try {
      const otpDoc = await client.fetch(
        '*[_type == "otp" && email == $email && code == $code && type == $type && isUsed == false && expiresAt > now()][0]',
        { email, code: otpCode, type } as Record<string, unknown>
      )

      if (!otpDoc) {
        return { data: null, error: 'Invalid or expired OTP' }
      }

      // Mark OTP as used
      await client
        .patch(otpDoc._id)
        .set({ isUsed: true })
        .commit()

      // If email verification, update user
      if (type === 'email_verification') {
        const users = await client.fetch(
          '*[_type == "user" && email == $email]',
          { email } as Record<string, unknown>
        )
        
        if (users.length > 0) {
          await client
            .patch(users[0]._id)
            .set({ isVerified: true })
            .commit()
        }
      }

      return { data: { verified: true }, error: null }
    } catch (err) {
      console.error('Error verifying OTP:', err)
      return { data: null, error: 'OTP verification failed' }
    }
  },

  // Generate password reset token
  async generatePasswordResetToken(email: string): Promise<{ data: { sent: boolean } | null; error: string | null }> {
    try {
      // Check if user exists
      const user = await client.fetch(
        '*[_type == "user" && email == $email][0]',
        { email } as Record<string, unknown>
      )

      if (!user) {
        return { data: null, error: 'User not found' }
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes

      // Save reset token
      await client.create({
        _type: 'passwordReset',
        email,
        token: resetToken,
        expiresAt,
        isUsed: false
      })

      // Send reset email
      await this.sendPasswordResetEmail(email, resetToken)

      return { data: { sent: true }, error: null }
    } catch (err) {
      console.error('Error generating reset token:', err)
      return { data: null, error: 'Failed to generate reset token' }
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ data: { reset: boolean } | null; error: string | null }> {
    try {
      // Verify token
      const resetDoc = await client.fetch(
        '*[_type == "passwordReset" && token == $token && isUsed == false && expiresAt > now()][0]',
        { token } as Record<string, unknown>
      )

      if (!resetDoc) {
        return { data: null, error: 'Invalid or expired reset token' }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Find and update user password
      const users = await client.fetch(
        '*[_type == "user" && email == $email]',
        { email: resetDoc.email } as Record<string, unknown>
      )

      if (users.length > 0) {
        await client
          .patch(users[0]._id)
          .set({ password: hashedPassword })
          .commit()
      }

      // Mark token as used
      await client
        .patch(resetDoc._id)
        .set({ isUsed: true })
        .commit()

      return { data: { reset: true }, error: null }
    } catch (err) {
      console.error('Error resetting password:', err)
      return { data: null, error: 'Password reset failed' }
    }
  },

  // Send OTP email
  async sendOTPEmail(email: string, otp: string, type: string): Promise<void> {
    const subject = type === 'password_reset' ? 'Password Reset OTP' : 'Verify Your Account'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2067ff; color: white; padding: 20px; text-align: center;">
          <h1>HIMALAYA OFFSET</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Your verification code is:</h2>
          <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2067ff; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject,
      html
    })
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2067ff; color: white; padding: 20px; text-align: center;">
          <h1>HIMALAYA OFFSET</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #2067ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link: ${resetUrl}</p>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject: 'Reset Your Password - HIMALAYA OFFSET',
      html
    })
  },

  // Helper function to upload image from URL (for Google avatars)
  async uploadImageFromUrl(imageUrl: string): Promise<string | null> {
    try {
      const response = await fetch(imageUrl)
      const buffer = await response.arrayBuffer()
      const asset = await client.assets.upload('image', Buffer.from(buffer))
      return asset._id
    } catch (err) {
      console.error('Error uploading image:', err)
      return null
    }
  }
}
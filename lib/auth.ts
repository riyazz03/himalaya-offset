// lib/auth.ts
import { type NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import type { SessionUser, User } from '@/lib/types'

// Extend NextAuth default types
declare module 'next-auth' {
  interface User extends SessionUser {}
  interface Session {
    user: SessionUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends SessionUser {}
}

/**
 * Validate required environment variables at startup
 */
const validateAuthEnvironment = (): void => {
  const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Helper to create consistent user object for session
 */
const mapUserToSession = (user: User): SessionUser => {
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim() || undefined,
    image: user.image || null,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    company: user.company,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    phoneVerified: user.phoneVerified,
    emailVerified: user.emailVerified
  }
}

// Validate environment on module load
validateAuthEnvironment()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          // Fetch user from database
          const user = await db.getUserByEmail(credentials.email)
          if (!user || !user.password) {
            throw new Error('Invalid email or password')
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.password)
          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          // Return mapped user
          return mapUserToSession(user) as any
        } catch (error) {
          console.error('[Auth] Credentials authorization error:', error)
          throw error
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },

  callbacks: {
    /**
     * SignIn callback - handle Google OAuth sign-in/sign-up
     */
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google') {
          const existingUser = await db.getUserByEmail(user.email!)

          if (!existingUser) {
            // Create new user from Google profile
            const [firstName, ...lastNameParts] = (user.name || 'User').split(' ')
            const lastName = lastNameParts.join(' ')

            await db.createUser({
              firstName: firstName || 'User',
              lastName: lastName || '',
              email: user.email!,
              phone: '',
              password: '',
              image: user.image || null,
              company: '',
              address: '',
              city: '',
              state: '',
              pincode: '',
              phoneVerified: false,
              emailVerified: true
            })
          }
        }
        return true
      } catch (error) {
        console.error('[Auth] SignIn callback error:', error)
        return false
      }
    },

    /**
     * JWT callback - called when JWT is created or updated
     */
    async jwt({ token, user, trigger, session }) {
      try {
        // On initial sign-in, populate token from user
        if (user) {
          const mappedUser = mapUserToSession(user as User)
          token = {
            ...token,
            ...mappedUser
          }
        }

        // Handle session update trigger (e.g., from update callback)
        if (trigger === 'update' && session) {
          token = {
            ...token,
            ...session.user
          }
        }

        return token
      } catch (error) {
        console.error('[Auth] JWT callback error:', error)
        return token
      }
    },

    /**
     * Session callback - called when session is requested
     */
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user = {
            id: token.id as string,
            email: token.email as string,
            name: token.name as string | undefined,
            image: token.image as string | null,
            firstName: token.firstName as string,
            lastName: token.lastName as string,
            phone: token.phone as string,
            company: token.company as string,
            address: token.address as string,
            city: token.city as string,
            state: token.state as string,
            pincode: token.pincode as string,
            phoneVerified: token.phoneVerified as boolean | null,
            emailVerified: token.emailVerified as boolean | null
          }
        }
        return session
      } catch (error) {
        console.error('[Auth] Session callback error:', error)
        return session
      }
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // Refresh token every 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  events: {
    async signIn({ user }) {
      console.log(`[Auth] User signed in: ${user.email}`)
    },
    async signOut() {
      console.log('[Auth] User signed out')
    }
  },

  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
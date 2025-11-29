import { type NextAuthOptions, type DefaultSession } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'
import type { SessionUser, User } from '@/lib/types'

declare module 'next-auth' {
  interface User extends SessionUser {}
  interface Session extends DefaultSession {
    user: SessionUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends SessionUser {}
}

const validateAuthEnvironment = (): void => {
  const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth not configured - Google sign-in will be disabled')
  }
}

const mapUserToSession = (user: User): SessionUser => {
  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email?.split('@')[0] || 'User'
  
  return {
    id: user.id,
    email: user.email,
    name: fullName,
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

validateAuthEnvironment()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true
    }),

    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password', placeholder: '••••••••' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          const user = await db.getUserByEmail(credentials.email)
          if (!user) {
            throw new Error('Invalid email or password')
          }

          const isPasswordValid = await db.verifyPassword(credentials.email, credentials.password)
          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          console.log(`[Auth] Credentials sign-in: ${user.email}`)

          return mapUserToSession(user) as SessionUser
        } catch (error) {
          console.error('[Auth] Credentials authorization error:', error)
          return null
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    newUser: '/auth/register'
  },

  callbacks: {
    /**
     * SignIn callback - Create Google user in Sanity
     */
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          // Create or update Google user in Sanity
          const googleProfile = profile as any
          await db.createOrUpdateGoogleUser({
            email: user.email || '',
            name: user.name || googleProfile?.name || 'User',
            googleId: user.id,
            image: user.image || undefined
          })
          
          console.log(`[Auth] Google user created/updated in Sanity: ${user.email}`)
          return true
        }

        // Allow credentials sign-in
        return true
      } catch (error) {
        console.error('[Auth] SignIn callback error:', error)
        return false
      }
    },

    /**
     * JWT callback - Called when JWT is created or updated
     */
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          const sessionUser = mapUserToSession(user as User)
          return {
            ...token,
            ...sessionUser
          }
        }

        if (trigger === 'update' && session) {
          return {
            ...token,
            ...session.user
          }
        }

        // Ensure name is always set
        if (!token.name && token.firstName && token.lastName) {
          token.name = `${token.firstName} ${token.lastName}`.trim()
        }
        if (!token.name && token.firstName) {
          token.name = token.firstName
        }

        return token
      } catch (error) {
        console.error('[Auth] JWT callback error:', error)
        return token
      }
    },

    /**
     * Session callback - Called when session is requested
     */
    async session({ session, token }) {
      try {
        if (session.user && token) {
          // Build name from firstName/lastName if name is not set
          let displayName = token.name as string
          if (!displayName && (token.firstName || token.lastName)) {
            displayName = `${token.firstName || ''} ${token.lastName || ''}`.trim()
          }
          if (!displayName && token.email) {
            displayName = (token.email as string).split('@')[0]
          }
          
          session.user = {
            id: token.id as string,
            email: token.email as string,
            name: displayName || 'User',
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
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60
  },

  secret: process.env.NEXTAUTH_SECRET,

  events: {
    async signIn({ user, account }) {
      const provider = account?.provider || 'unknown'
      console.log(`[Auth Event] User signed in via ${provider}: ${user.email}`)
    },

    async signOut({ token }) {
      console.log(`[Auth Event] User signed out: ${token.email}`)
    }
  },

  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
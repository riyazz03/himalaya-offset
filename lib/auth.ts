// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthService } from './sanity-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await AuthService.verifyUser(credentials.email, credentials.password)
          
          if (result.data) {
            return {
              id: result.data._id,
              email: result.data.email,
              name: result.data.name,
              phone: result.data.phone,
              role: result.data.role,
              image: result.data.avatar?.asset?.url || null
            }
          }
          return null
        } catch (err) {
          console.error('Auth error:', err)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.phone = (user as unknown as Record<string, unknown>).phone as string
        token.role = (user as unknown as Record<string, unknown>).role as string
      }
      
      if (account?.provider === 'google' && user) {
        try {
          const result = await AuthService.findOrCreateGoogleUser({
            email: user.email!,
            name: user.name!,
            googleId: account.providerAccountId,
            avatar: user.image
          })
          
          if (result.data) {
            token.id = result.data._id
            token.phone = result.data.phone
            token.role = result.data.role
          }
        } catch (err) {
          console.error('Google auth error:', err)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id as string
        ;(session.user as unknown as Record<string, unknown>).phone = token.phone as string || ''
        ;(session.user as unknown as Record<string, unknown>).role = token.role as string || 'customer'
      }
      return session
    }
  }
}
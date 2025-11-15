// app/api/auth/[...nextauth]/route.ts

import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await db.getUserByEmail(credentials.email)
        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: null,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          company: user.company,
          address: user.address,
          city: user.city,
          state: user.state,
          pincode: user.pincode
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        const existingUser = await db.getUserByEmail(user.email!)
        
        if (!existingUser) {
          // Create new user from Google
          const newUser = await db.createUser({
            firstName: user.name?.split(' ')[0] || 'User',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email!,
            phone: '',
            password: '', // Google users don't have passwords
            company: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            phoneVerified: false,
            emailVerified: true // Google emails are verified
          })
          user.id = newUser.id
        } else {
          user.id = existingUser.id
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.image = user.image || null
        token.firstName = (user as any).firstName || ''
        token.lastName = (user as any).lastName || ''
        token.phone = (user as any).phone || ''
        token.phoneVerified = (user as any).phoneVerified || false
        token.emailVerified = (user as any).emailVerified || false
        token.company = (user as any).company || ''
        token.address = (user as any).address || ''
        token.city = (user as any).city || ''
        token.state = (user as any).state || ''
        token.pincode = (user as any).pincode || ''
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.image = token.image as string | null
        ;(session.user as any).firstName = token.firstName
        ;(session.user as any).lastName = token.lastName
        ;(session.user as any).phone = token.phone
        ;(session.user as any).phoneVerified = token.phoneVerified
        ;(session.user as any).emailVerified = token.emailVerified
        ;(session.user as any).company = token.company
        ;(session.user as any).address = token.address
        ;(session.user as any).city = token.city
        ;(session.user as any).state = token.state
        ;(session.user as any).pincode = token.pincode
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
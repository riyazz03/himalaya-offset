// lib/auth.ts

import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from './db'
import { SessionUser } from './types'

declare module 'next-auth' {
  interface User extends SessionUser {}
  
  interface Session {
    user: SessionUser & {
      id: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await db.getUserByEmail(credentials.email)
        if (!user) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error('Incorrect password')
        }

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
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
    })
  ],
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.phone = user.phone
        token.company = user.company
        token.address = user.address
        token.city = user.city
        token.state = user.state
        token.pincode = user.pincode
        token.phoneVerified = user.phoneVerified
        token.emailVerified = user.emailVerified
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.phone = token.phone as string
        session.user.company = token.company as string
        session.user.address = token.address as string
        session.user.city = token.city as string
        session.user.state = token.state as string
        session.user.pincode = token.pincode as string
        session.user.phoneVerified = token.phoneVerified as boolean
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    }
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
  },
  
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email)
    }
  }
}
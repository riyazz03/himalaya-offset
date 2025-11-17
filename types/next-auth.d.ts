// types/next-auth.d.ts
import 'next-auth'
import type { SessionUser } from '@/lib/types'

declare module 'next-auth' {
  interface User extends SessionUser {}

  interface Session {
    user: SessionUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends SessionUser {}
}
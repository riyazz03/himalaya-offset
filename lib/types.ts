// types/auth.ts
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  image: string | null
  company: string
  address: string
  city: string
  state: string
  pincode: string
  phoneVerified: boolean | null
  emailVerified: boolean | null
  createdAt: Date
  updatedAt: Date
}

export interface SessionUser {
  id: string
  email: string
  name?: string
  image: string | null
  firstName: string
  lastName: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  pincode: string
  phoneVerified: boolean | null
  emailVerified: boolean | null
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword?: string
  company?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export interface OTPData {
  phone: string
  otp: string
  expiresAt: number
  attempts: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface OTPResponse {
  sent: boolean
}

export interface VerifyOTPResponse {
  verified: boolean
}

export interface PasswordResetResponse {
  reset: boolean
}
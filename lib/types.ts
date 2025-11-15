export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  image?: string | null
  company?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phoneVerified: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
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

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface SessionUser {
  id: string
  name?: string
  email?: string
  image?: string | null
  firstName: string
  lastName: string
  phone: string
  company?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phoneVerified: boolean
  emailVerified: boolean
}
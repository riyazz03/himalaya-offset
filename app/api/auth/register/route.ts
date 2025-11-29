// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { ApiResponse } from '@/lib/types'

const validators = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10
  },

  password: (password: string): boolean => {
    return password.length >= 8
  },

  firstName: (name: string): boolean => {
    return name.trim().length > 0 && name.trim().length <= 50
  },

  lastName: (name: string): boolean => {
    return name.trim().length > 0 && name.trim().length <= 50
  },

  passwordStrength: (password: string): { strong: boolean; issues: string[] } => {
    const issues: string[] = []

    if (password.length < 8) issues.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) issues.push('At least one uppercase letter')
    if (!/[a-z]/.test(password)) issues.push('At least one lowercase letter')
    if (!/[0-9]/.test(password)) issues.push('At least one number')

    return {
      strong: issues.length === 0,
      issues
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      company,
      address,
      city,
      state,
      pincode
    } = body

    // Detect if Google signup (password will be 'google-oauth-user')
    const isGoogleSignup = password === 'google-oauth-user'

    // ============================================
    // VALIDATION
    // ============================================

    // Required fields validation
    if (!firstName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Missing required fields',
          error: 'firstName, email, and phone are required'
        },
        { status: 400 }
      )
    }

    // Use first name as last name if not provided
    const finalLastName = lastName?.trim() || firstName?.trim() || ''

    // Password is required only for non-Google
    if (!isGoogleSignup && !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Missing password',
          error: 'Password is required'
        },
        { status: 400 }
      )
    }

    // First name validation
    if (!validators.firstName(firstName)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid first name',
          error: 'First name must be between 1 and 50 characters'
        },
        { status: 400 }
      )
    }

    // Last name validation (optional but if provided, validate)
    if (finalLastName && !validators.lastName(finalLastName)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid last name',
          error: 'Last name must be between 1 and 50 characters'
        },
        { status: 400 }
      )
    }

    // Email validation
    if (!validators.email(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid email format',
          error: 'Please provide a valid email address'
        },
        { status: 400 }
      )
    }

    // Phone validation
    if (!validators.phone(phone)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid phone number',
          error: 'Phone number must be 10 digits'
        },
        { status: 400 }
      )
    }

    // Password validation (only for non-Google)
    if (!isGoogleSignup) {
      if (!validators.password(password)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: 'Invalid password',
            error: 'Password must be at least 8 characters'
          },
          { status: 400 }
        )
      }

      const passwordStrength = validators.passwordStrength(password)
      if (!passwordStrength.strong) {
        console.warn(`[Register] Weak password from ${email}. Issues: ${passwordStrength.issues.join(', ')}`)
      }

      if (confirmPassword && password !== confirmPassword) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: 'Passwords do not match',
            error: 'Password and confirm password must match'
          },
          { status: 400 }
        )
      }
    }

    // ============================================
    // CHECK EXISTING USER
    // ============================================

    const existingUserByEmail = await db.getUserByEmail(email)
    
    // If user exists and it's a Google signup, update their profile
    if (existingUserByEmail && isGoogleSignup) {
      console.log(`[Register] Google user updating existing account: ${email}`)
      
      const updatedUser = await db.updateUser(email, {
        phone: phone.replace(/\D/g, ''),
        company: company?.trim() || existingUserByEmail.company || '',
        address: address?.trim() || existingUserByEmail.address || '',
        city: city?.trim() || existingUserByEmail.city || '',
        state: state?.trim() || existingUserByEmail.state || '',
        pincode: pincode?.trim() || existingUserByEmail.pincode || ''
      })
      
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message: 'Profile updated successfully',
          data: {
            id: updatedUser?.id,
            email: updatedUser?.email,
            firstName: updatedUser?.firstName,
            lastName: updatedUser?.lastName
          }
        },
        { status: 201 }
      )
    }
    
    // Check for duplicate email (new user)
    if (existingUserByEmail && !isGoogleSignup) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User already exists',
          error: 'An account with this email already exists'
        },
        { status: 409 }
      )
    }

    // Check for duplicate phone (only for new users)
    const existingUserByPhone = await db.getUserByPhone(phone.replace(/\D/g, ''))
    if (existingUserByPhone && !isGoogleSignup) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Phone number already registered',
          error: 'This phone number is already registered with another account'
        },
        { status: 409 }
      )
    }

    // ============================================
    // CREATE USER
    // ============================================

    let hashedPassword = ''
    
    // Only hash password for non-Google users
    if (!isGoogleSignup) {
      hashedPassword = await db.hashPassword(password)
    } else {
      // For Google users, use a placeholder
      hashedPassword = 'google-oauth'
    }

    const user = await db.createUser({
      firstName: firstName.trim(),
      lastName: finalLastName,
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\D/g, ''),
      password: hashedPassword,
      image: null,
      company: company?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      pincode: pincode?.trim() || '',
      phoneVerified: false,
      emailVerified: isGoogleSignup ? true : false
    })

    const logType = isGoogleSignup ? 'Google' : 'Email/Password'
    console.log(`[Register] ${logType} user created successfully: ${user.email}`)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Register] Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Registration failed',
        error: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
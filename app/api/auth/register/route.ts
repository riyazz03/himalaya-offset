// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import type { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      company,
      address,
      city,
      state,
      pincode
    } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Missing required fields',
          error: 'firstName, lastName, email, phone, and password are required'
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid email format',
          error: 'Please provide a valid email address'
        },
        { status: 400 }
      )
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/
    const cleanPhone = phone.replace(/\D/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid phone number',
          error: 'Phone number must be 10 digits'
        },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid password',
          error: 'Password must be at least 8 characters'
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User already exists',
          error: 'An account with this email already exists'
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await db.createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      password: hashedPassword,
      image: null,
      company: company?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      pincode: pincode?.trim() || '',
      phoneVerified: false,
      emailVerified: false
    })

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
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration'
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Registration failed',
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
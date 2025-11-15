// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { RegisterFormData, ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterFormData = await request.json()

    // Validate required fields
    const { firstName, lastName, email, phone, password } = body

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

    // Validate email format
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

    // Validate phone format (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid phone number',
          error: 'Phone number must be 10 digits'
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = await db.getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User already exists',
          error: 'A user with this email already exists'
        },
        { status: 400 }
      )
    }

    const existingUserByPhone = await db.getUserByPhone(phone)
    if (existingUserByPhone) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Phone number already registered',
          error: 'This phone number is already associated with an account'
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const newUser = await db.createUser({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      company: body.company || '',
      address: body.address || '',
      city: body.city || '',
      state: body.state || '',
      pincode: body.pincode || '',
      phoneVerified: false,
      emailVerified: false
    })

    console.log('User registered:', newUser.email)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User registered successfully. Please verify your phone number.',
        data: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    )
  }
}
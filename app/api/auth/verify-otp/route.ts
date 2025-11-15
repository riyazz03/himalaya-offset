// app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/lib/types'

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp } = body

    if (!phone || !otp) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Phone and OTP are required',
          error: 'Both phone and otp parameters are needed'
        },
        { status: 400 }
      )
    }

    // Get stored OTP
    const storedOTP = await db.getOTP(phone)

    if (!storedOTP) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'OTP not found or expired',
          error: 'Please request a new OTP'
        },
        { status: 400 }
      )
    }

    // Check attempts
    if (storedOTP.attempts >= MAX_ATTEMPTS) {
      await db.deleteOTP(phone)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Too many failed attempts',
          error: 'Please request a new OTP'
        },
        { status: 400 }
      )
    }

    // Check if OTP expired
    if (Date.now() > storedOTP.expiresAt) {
      await db.deleteOTP(phone)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'OTP expired',
          error: 'Please request a new OTP'
        },
        { status: 400 }
      )
    }

    // Verify OTP
    if (storedOTP.code !== otp.trim()) {
      const attempts = await db.incrementOTPAttempts(phone)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid OTP',
          error: `Incorrect OTP. ${MAX_ATTEMPTS - attempts} attempts remaining`
        },
        { status: 400 }
      )
    }

    // OTP verified successfully
    await db.deleteOTP(phone)

    // Update user's phoneVerified status
    const user = await db.getUserByPhone(phone)
    if (user) {
      await db.updateUser(user.email, { phoneVerified: true })
    }

    console.log(`Phone verified for: ${phone}`)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Phone number verified successfully',
        data: {
          verified: true,
          phone: phone
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Failed to verify OTP',
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    )
  }
}
// app/api/auth/send-otp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/lib/types'

// Generate random OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send SMS function (using Twilio or mock)
async function sendSMS(phone: string, otp: string): Promise<boolean> {
  try {
    // For development: just log the OTP
    console.log(`[SMS] Phone: ${phone}, OTP: ${otp}`)

    // For production with Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID
    // const authToken = process.env.TWILIO_AUTH_TOKEN
    // const fromPhone = process.env.TWILIO_PHONE
    // const client = twilio(accountSid, authToken)
    // await client.messages.create({
    //   body: `Your HIMALAYA OFFSET verification code is: ${otp}`,
    //   from: fromPhone,
    //   to: phone
    // })

    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email } = body

    if (!phone) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Phone number is required',
          error: 'Phone parameter is missing'
        },
        { status: 400 }
      )
    }

    // Validate phone format
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

    // Generate OTP
    const otp = generateOTP()

    // Save OTP to database (valid for 10 minutes)
    await db.saveOTP(phone, otp, 10)

    // Send SMS
    const smsSent = await sendSMS(phone, otp)

    if (!smsSent) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Failed to send OTP',
          error: 'Could not send OTP to your phone'
        },
        { status: 500 }
      )
    }

    console.log(`OTP sent to ${phone}`)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'OTP sent successfully',
        data: {
          phone: phone.replace(/(\d{6})/, '****'),
          // Remove in production
          _dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Failed to send OTP',
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    )
  }
}
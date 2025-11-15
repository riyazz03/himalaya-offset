// app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ 
        data: {
          _id: 'temp-id',
          name: session.user?.name || 'User',
          email: email,
          phone: '',
          isVerified: false,
          phoneVerified: false,
          role: 'customer',
          provider: 'email',
          _createdAt: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ 
      data: {
        _id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        isVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        role: 'customer',
        provider: 'email',
        _createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const nameParts = name.split(' ')
    const firstName = nameParts[0] || name
    const lastName = nameParts.slice(1).join(' ') || ''

    await db.updateUser(session.user.email, {
      firstName,
      lastName,
      phone
    })

    const updatedUser = await db.getUserByEmail(session.user.email)

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      data: {
        _id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        role: 'customer',
        provider: 'email',
        _createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
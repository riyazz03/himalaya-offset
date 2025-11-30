import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
          firstName: session.user?.firstName || '',
          lastName: session.user?.lastName || '',
          email: email,
          phone: '',
          company: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          image: null,
          emailVerified: false,
          createdAt: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ 
      data: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt || new Date().toISOString()
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
    const { firstName, lastName, phone, company, address, city, state, pincode } = body

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ 
        error: 'First name, last name, and phone are required' 
      }, { status: 400 })
    }

    await db.updateUser(session.user.email, {
      firstName,
      lastName,
      phone,
      company: company || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    })

    const updatedUser = await db.getUserByEmail(session.user.email)

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      data: {
        _id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        company: updatedUser.company,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt || new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
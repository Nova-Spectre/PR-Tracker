import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/db'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// POST /api/auth - Login or Signup
export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await connectMongo()

    if (action === 'signup') {
      // Signup logic
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required for signup' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
        )
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        isVerified: true // Auto-verify for now, can add email verification later
      })

      await user.save()

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      const response = NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          preferences: user.preferences
        }
      })

      // Set HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response

    } else if (action === 'login') {
      // Login logic
      const user = await User.findOne({ email })
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        }
      })

      // Set HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "login" or "signup"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('[api.auth][POST] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth - Verify token and get current user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    await connectMongo()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        lastLogin: user.lastLogin
      }
    })

  } catch (error) {
    console.error('[api.auth][GET] error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}

// DELETE /api/auth - Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })

  // Clear the auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })

  return response
}

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectMongo } from './db'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: {
    theme: string
    emailNotifications: boolean
    calendarIntegration: boolean
  }
}

export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    await connectMongo()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      preferences: user.preferences
    }
  } catch (error) {
    console.error('[auth] Token verification failed:', error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

import { NextRequest } from 'next/server'
import { verifyAuth, createAuthResponse } from '@/lib/auth'
import { getPRs } from '@/lib/queries'
import { connectMongo } from '@/lib/db'
import { Schema, models, model } from 'mongoose'
import { randomBytes } from 'crypto'

// ShareLink model for storing secure shareable links
const ShareLinkSchema = new Schema({
  token: { type: String, unique: true, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },
  title: { type: String, default: 'PR Board Report' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const ShareLink = models.ShareLink || model('ShareLink', ShareLinkSchema)

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return createAuthResponse('Authentication required')
    }

    await connectMongo()

    // Generate secure token
    const token = randomBytes(32).toString('hex')
    
    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create share link record
    const shareLink = await ShareLink.create({
      token,
      userId: user.id,
      expiresAt,
      title: `${user.name}'s PR Board Report`
    })

    console.log(`[api.share][POST] Created share link for user ${user.id}`)

    return Response.json({
      success: true,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${token}`,
      token,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('[api.share][POST] error:', error)
    return new Response('Failed to create share link', { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return new Response('Token required', { status: 400 })
    }

    await connectMongo()

    // Find and validate share link
    const shareLink = await ShareLink.findOne({ 
      token, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'name email')

    if (!shareLink) {
      return new Response('Invalid or expired share link', { status: 404 })
    }

    // Update access tracking
    shareLink.accessCount += 1
    shareLink.lastAccessedAt = new Date()
    await shareLink.save()

    // Get PRs for the user who created the share link
    const prs = await getPRs({ userId: shareLink.userId._id.toString() })

    console.log(`[api.share][GET] Accessed share link ${token}, found ${prs.length} PRs`)

    return Response.json({
      success: true,
      data: {
        title: shareLink.title,
        createdBy: shareLink.userId.name,
        createdAt: shareLink.createdAt,
        prs,
        accessCount: shareLink.accessCount
      }
    })

  } catch (error) {
    console.error('[api.share][GET] error:', error)
    return new Response('Failed to fetch shared data', { status: 500 })
  }
}

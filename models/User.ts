import { Schema, models, model } from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50
    },
    avatar: { 
      type: String,
      default: null
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    verificationToken: { 
      type: String,
      default: null
    },
    resetPasswordToken: { 
      type: String,
      default: null
    },
    resetPasswordExpires: { 
      type: Date,
      default: null
    },
    lastLogin: { 
      type: Date,
      default: null
    },
    preferences: {
      theme: { 
        type: String, 
        enum: ['light', 'dark', 'system'], 
        default: 'system' 
      },
      emailNotifications: { 
        type: Boolean, 
        default: true 
      },
      calendarIntegration: { 
        type: Boolean, 
        default: false 
      }
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete (ret as any).password
        delete (ret as any).verificationToken
        delete (ret as any).resetPasswordToken
        delete (ret as any).resetPasswordExpires
        return ret
      }
    }
  }
)

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate verification token
UserSchema.methods.generateVerificationToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.verificationToken = token
  return token
}

// Generate reset password token
UserSchema.methods.generateResetPasswordToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.resetPasswordToken = token
  this.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
  return token
}

// Index for performance (email index already created by unique: true)
UserSchema.index({ verificationToken: 1 })
UserSchema.index({ resetPasswordToken: 1 })

const collectionName = process.env.MONGODB_USER_COLLECTION || 'users'
const User = models.User || model('User', UserSchema, collectionName)

if (process.env.NODE_ENV !== 'production') {
  console.log('[model.User] using collection=', collectionName)
}

export default User

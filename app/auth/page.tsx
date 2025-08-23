"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeAwareThreeBackground from '@/components/ui/ThemeAwareThreeBackground'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth')
        if (response.ok) {
          router.push('/')
        }
      } catch (error) {
        // User is not authenticated, stay on auth page
      }
    }
    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!isLogin && !formData.name) {
        toast.error('Name is required for signup')
        return
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'signup',
          email: formData.email,
          password: formData.password,
          name: formData.name
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        // Immediate redirect without transition
        window.location.href = '/'
        return
      } else {
        toast.error(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeAwareThreeBackground intensity="medium" objectCount={20} />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              PR Tracker
            </h1>
            <p className="text-gray-300 text-sm sm:text-lg">
              Dashboard for Pull Request Management
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base">
                {isLogin ? 'Sign in to your account' : 'Join us today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Features preview */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-sm font-medium text-gray-200 mb-3">What you&apos;ll get:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Personal PR dashboard
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Email & calendar reminders
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Secure cloud sync
                </li>
              </ul>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}

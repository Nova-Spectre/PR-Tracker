"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Copy, Share2, Clock } from '@/components/icons'
import toast from 'react-hot-toast'

type ShareData = {
  shareUrl: string
  token: string
  expiresAt: string
}

export default function ShareButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [showModal, setShowModal] = useState(false)

  const generateShareLink = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      setShareData(data)
      setShowModal(true)
      toast.success('Share link generated successfully!')
    } catch (error) {
      console.error('Error generating share link:', error)
      toast.error('Failed to generate share link')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = async () => {
    if (!shareData) return
    
    try {
      await navigator.clipboard.writeText(shareData.shareUrl)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const openLink = () => {
    if (!shareData) return
    window.open(shareData.shareUrl, '_blank')
  }

  return (
    <>
      <button
        onClick={generateShareLink}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {isGenerating ? 'Generating...' : 'Share Board'}
      </button>

      {/* Share Modal */}
      {showModal && shareData && createPortal(
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" role="dialog">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Share2 className="w-5 h-5 text-green-600" />
                Share Your Board
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Share this secure link to give others read-only access to your PR board report.
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="bg-gray-50 dark:bg-muted/50 border border-gray-200 dark:border-border rounded-lg p-3 break-all text-sm font-mono text-gray-800 dark:text-foreground flex-1">
                    {shareData.shareUrl}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareData.shareUrl)
                      toast.success('Link copied to clipboard!')
                    }}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors flex items-center gap-1"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  Expires: {new Date(shareData.expiresAt).toLocaleDateString()} at {new Date(shareData.expiresAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">📋 What&apos;s included:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• All your PRs organized by status</li>
                  <li>• Project/Service names and details</li>
                  <li>• PR links and descriptions</li>
                  <li>• Copy-to-clipboard functionality</li>
                  <li>• Read-only access (secure)</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={openLink}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90 rounded-md text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Report
                </button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Links expire after 7 days for security
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

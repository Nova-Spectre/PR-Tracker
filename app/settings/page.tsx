"use client"

import { useState } from 'react'
import DailyRemindersManager from '@/components/scheduler/DailyRemindersManager'
import { Calendar, Mail, Settings } from '@/components/icons'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'reminders' | 'integrations'>('reminders')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <span className="text-xl font-semibold">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">PR Tracker Settings</h1>
          <p className="text-gray-600">Configure email notifications and calendar integrations</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === 'reminders'
                ? 'bg-accent/20 border-accent/40 text-accent'
                : 'bg-muted border-border hover:bg-border'
            }`}
            onClick={() => setActiveTab('reminders')}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Daily Reminders
          </button>
          <button
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === 'integrations'
                ? 'bg-accent/20 border-accent/40 text-accent'
                : 'bg-muted border-border hover:bg-border'
            }`}
            onClick={() => setActiveTab('integrations')}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Integrations
          </button>
        </div>

        {activeTab === 'reminders' && (
          <div className="card p-6">
            <DailyRemindersManager />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* MailerSend Integration */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">MailerSend Integration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <input
                    type="password"
                    className="input mt-1"
                    placeholder="Enter your MailerSend API key"
                    defaultValue={process.env.MAILERSEND_API_KEY || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set MAILERSEND_API_KEY in your .env file
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">From Email</label>
                    <input
                      type="email"
                      className="input mt-1"
                      placeholder="noreply@yourdomain.com"
                      defaultValue={process.env.MAILERSEND_FROM_EMAIL || ''}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set MAILERSEND_FROM_EMAIL in your .env file
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">From Name</label>
                    <input
                      type="text"
                      className="input mt-1"
                      placeholder="PR Tracker"
                      defaultValue={process.env.MAILERSEND_FROM_NAME || ''}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set MAILERSEND_FROM_NAME in your .env file
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">📧 Email Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Individual PR reminders</li>
                    <li>• Daily summary emails at 11:00 AM, 3:30 PM, 5:45 PM</li>
                    <li>• Beautiful HTML email templates</li>
                    <li>• Professional sender identity</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Google Calendar Integration */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold">Google Calendar Integration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client ID</label>
                  <input
                    type="text"
                    className="input mt-1"
                    placeholder="Enter your Google OAuth Client ID"
                    defaultValue={process.env.GOOGLE_CLIENT_ID || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set GOOGLE_CLIENT_ID in your .env file
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <input
                      type="password"
                      className="input mt-1"
                      placeholder="Enter your Google API Key"
                      defaultValue={process.env.GOOGLE_API_KEY || ''}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set GOOGLE_API_KEY in your .env file
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Calendar ID</label>
                    <input
                      type="text"
                      className="input mt-1"
                      placeholder="primary"
                      defaultValue={process.env.GOOGLE_CALENDAR_ID || 'primary'}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set GOOGLE_CALENDAR_ID in your .env file (default: primary)
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">📅 Calendar Features</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Individual PR review reminders</li>
                    <li>• Daily recurring reminders</li>
                    <li>• Automatic calendar event creation</li>
                    <li>• Email and popup notifications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Environment Variables Setup */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Environment Setup</h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Required .env Variables:</h4>
                <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`# MailerSend Configuration
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=PR Tracker

# Google Calendar Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=primary`}
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  Create a .env.local file in your project root with these variables
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

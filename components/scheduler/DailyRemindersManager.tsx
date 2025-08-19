"use client"

import { useState, useEffect } from 'react'
import { schedulerService, DailyReminderSchedule } from '@/lib/scheduler'
import { Calendar, Mail } from '@/components/icons'

export default function DailyRemindersManager() {
  const [reminders, setReminders] = useState<DailyReminderSchedule[]>([])
  const [showSetup, setShowSetup] = useState(false)
  const [email, setEmail] = useState('')
  const [teamName, setTeamName] = useState('')

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = () => {
    const loaded = schedulerService.getDailyReminders()
    setReminders(loaded)
  }

  const setupDailyReminders = () => {
    if (!email.trim()) {
      alert('Please enter an email address')
      return
    }

    try {
      schedulerService.setupDailyReminders(email, teamName || 'Team')
      loadReminders()
      setShowSetup(false)
      setEmail('')
      setTeamName('')
      alert('Daily reminders set up successfully! You will receive reminders at 11:00 AM, 3:30 PM, and 5:45 PM daily.')
    } catch (error) {
      console.error('Failed to setup daily reminders:', error)
      alert('Failed to setup daily reminders. Please try again.')
    }
  }

  const toggleReminder = (id: string) => {
    schedulerService.toggleDailyReminder(id)
    loadReminders()
  }

  const deleteReminder = (id: string) => {
    if (confirm('Are you sure you want to delete this daily reminder?')) {
      schedulerService.deleteDailyReminder(id)
      loadReminders()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Reminders
        </h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowSetup(true)}
        >
          <Mail className="w-4 h-4" />
          Setup Daily Reminders
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No daily reminders configured</p>
          <p className="text-sm">Setup daily reminders to receive notifications at 11:00 AM, 3:30 PM, and 5:45 PM</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">{reminder.email}</span>
                    <span className="text-sm text-muted">({reminder.teamName})</span>
                  </div>
                  <div className="text-sm text-muted">
                    <p>Reminder times: 11:00 AM, 3:30 PM, 5:45 PM</p>
                    <p>Status: {reminder.active ? 'Active' : 'Inactive'}</p>
                    <p>Last sent: {new Date(reminder.lastSent).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn ${reminder.active ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}
                    onClick={() => toggleReminder(reminder.id)}
                  >
                    {reminder.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    className="btn bg-red-500/20 text-red-600"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Setup Daily Reminders
              </h3>
              <button className="btn" onClick={() => setShowSetup(false)}>Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <input
                  type="email"
                  className="input mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Team Name</label>
                <input
                  type="text"
                  className="input mt-1"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Development Team"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-2">📅 Reminder Schedule</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 11:00 AM - Morning reminder</li>
                  <li>• 3:30 PM - Afternoon reminder</li>
                  <li>• 5:45 PM - Evening reminder</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  You&apos;ll receive emails with pending PRs at these times daily
                </p>
              </div>

              <div className="pt-4 border-t">
                <button
                  className="w-full btn btn-primary"
                  disabled={!email.trim()}
                  onClick={setupDailyReminders}
                >
                  <Calendar className="w-4 h-4" />
                  Setup Daily Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

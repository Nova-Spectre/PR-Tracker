"use client"

import { useEffect, useState } from 'react'
import { PRItem } from '@/lib/types'
import { schedulerService } from '@/lib/scheduler'
import { googleCalendarService } from '@/lib/calendar'
import { Calendar } from '@/components/icons'

interface Props {
  pr: PRItem
  onClose: () => void
}

export default function SchedulerSettings({ pr, onClose }: Props) {
  const [email, setEmail] = useState('therollingthunders1910@gmail.com')
  const [scheduledDate, setScheduledDate] = useState(pr.scheduledDate || '')
  const [scheduledTime, setScheduledTime] = useState(pr.scheduledTime || '')
  const [emailReminder, setEmailReminder] = useState(pr.emailReminder || false)
  const [calendarEvent, setCalendarEvent] = useState(pr.calendarEvent || false)

  // Load default email from DB if present; otherwise keep existing prefill
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/defaults')
        if (res.ok) {
          const j = await res.json()
          const d = j?.defaults
          if (d?.defaultEmail) {
            setEmail(String(d.defaultEmail))
          }
        }
      } catch (_) {
        // keep existing prefill
      }
    })()
  }, [])

  const handleSchedule = async () => {
    if (!email || !scheduledDate || !scheduledTime) {
      alert('Please fill in all required fields')
      return
    }

    try {
      if (emailReminder) {
        schedulerService.scheduleEmail(pr, email, scheduledDate, scheduledTime)
      }

      if (calendarEvent) {
        await googleCalendarService.addToCalendar(pr, email)
      }

      alert('Scheduled successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to schedule:', error)
      alert('Failed to schedule. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule PR Review
          </h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email Address *</label>
            <input
              type="email"
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@gmail.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                className="input mt-1"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Time *</label>
              <input
                type="time"
                className="input mt-1"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailReminder}
                onChange={(e) => setEmailReminder(e.target.checked)}
              />
              <span className="text-sm">Send Email Reminder</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={calendarEvent}
                onChange={(e) => setCalendarEvent(e.target.checked)}
              />
              <span className="text-sm">Add to Google Calendar</span>
            </label>
          </div>

          <div className="pt-4 border-t">
            <button
              className="w-full btn btn-primary"
              disabled={!email || !scheduledDate || !scheduledTime}
              onClick={handleSchedule}
            >
              Schedule Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

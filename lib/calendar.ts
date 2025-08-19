import { PRItem } from './types'

export interface CalendarEvent {
  id: string
  summary: string
  description: string
  startTime: string
  endTime: string
  attendees?: string[]
  reminders?: {
    useDefault: boolean
    overrides: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

export class GoogleCalendarService {
  private clientId: string
  private apiKey: string
  private calendarId: string

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || ''
    this.apiKey = process.env.GOOGLE_API_KEY || ''
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
  }

  async addToCalendar(pr: PRItem, email: string): Promise<boolean> {
    try {
      if (!pr.scheduledDate || !pr.scheduledTime) {
        throw new Error('PR must have scheduled date and time')
      }

      const startTime = new Date(`${pr.scheduledDate}T${pr.scheduledTime}`)
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour duration

      const event: CalendarEvent = {
        id: `pr_${pr.id}`,
        summary: `🔔 Reminder: ${pr.title} - Pending Release`,
        description: this.createCalendarDescription(pr),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendees: [email],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      }

      // In a real app, this would use the Google Calendar API
      // For now, we'll create a calendar link that users can click
      const calendarUrl = this.createCalendarLink(event)
      
      // Open the calendar link in a new tab
      window.open(calendarUrl, '_blank')
      
      return true
    } catch (error) {
      console.error('Failed to add to Google Calendar:', error)
      return false
    }
  }

  private createCalendarDescription(pr: PRItem): string {
    return `🚀 Pending PRs Release Reminder

Hi Team,

This is your scheduled reminder to review and release the following pull request:

🔧 Pending PR Details:

🔗 ${pr.title} – ${pr.status === 'approved' ? 'Ready for release' : 'Awaiting final approval'}

💡 Project/Service: ${pr.category === 'project' ? pr.project : pr.service}
💡 Author: ${pr.author}
💡 Priority: ${pr.priority}

💡 Tips:
• Check deployment notes 📝
• Coordinate with QA if needed 👩‍💻
• Avoid end-of-day releases 🌙

📌 Link to PR: ${pr.links?.[0]?.url || 'No link provided'}
📬 Optional: Send email or Slack ping if not released by EOD

---
PR Tracker Dashboard - Making releases smoother`
  }

  private createCalendarLink(event: CalendarEvent): string {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.summary,
      dates: `${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      details: event.description,
      add: event.attendees?.join(',') || ''
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Use Google Calendar API directly (requires OAuth)
  async addToCalendarAPI(pr: PRItem, accessToken: string): Promise<boolean> {
    try {
      const startTime = new Date(`${pr.scheduledDate}T${pr.scheduledTime}`)
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

      const event = {
        summary: `🔔 Reminder: ${pr.title} - Pending Release`,
        description: this.createCalendarDescription(pr),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: [{ email: pr.author }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      )

      if (response.ok) {
        console.log('Event added to Google Calendar successfully')
        return true
      } else {
        throw new Error(`Failed to add event: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to add to Google Calendar API:', error)
      return false
    }
  }

  // Create recurring daily reminders at specific times
  async createDailyReminders(email: string, pendingPRs: PRItem[]): Promise<boolean> {
    try {
      const reminderTimes = [
        { hour: 11, minute: 0, label: 'Morning' },
        { hour: 15, minute: 30, label: 'Afternoon' },
        { hour: 17, minute: 45, label: 'Evening' }
      ]

      for (const time of reminderTimes) {
        const today = new Date()
        const reminderTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), time.hour, time.minute)
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= new Date()) {
          reminderTime.setDate(reminderTime.getDate() + 1)
        }

        const event: CalendarEvent = {
          id: `daily_reminder_${time.label.toLowerCase()}`,
          summary: `🔔 ${time.label} Reminder: Pending PRs to Release`,
          description: this.createDailyReminderDescription(pendingPRs),
          startTime: reminderTime.toISOString(),
          endTime: new Date(reminderTime.getTime() + 15 * 60 * 1000).toISOString(), // 15 min duration
          attendees: [email],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 0 }, // Immediate
              { method: 'popup', minutes: 0 } // Immediate
            ]
          }
        }

        // Create calendar link for this reminder
        const calendarUrl = this.createCalendarLink(event)
        console.log(`Created ${time.label} reminder calendar link:`, calendarUrl)
      }

      return true
    } catch (error) {
      console.error('Failed to create daily reminders:', error)
      return false
    }
  }

  private createDailyReminderDescription(pendingPRs: PRItem[]): string {
    if (pendingPRs.length === 0) {
      return `🚀 Daily PR Release Check

No pending PRs found - great job keeping up with releases! 🎉

---
PR Tracker Dashboard - Making releases smoother`
    }

    const prsList = pendingPRs.map(pr => 
      `🔗 ${pr.title} – ${pr.status === 'approved' ? 'Ready for release' : 'Awaiting approval'}`
    ).join('\n')

    return `🚀 Daily PR Release Check

Hi Team,

This is your scheduled reminder to review and release the following pull requests:

🔧 Pending PRs List:

${prsList}

💡 Tips:
• Check deployment notes 📝
• Coordinate with QA if needed 👩‍💻
• Avoid end-of-day releases 🌙

📌 Link to PR Tracker: [Your dashboard URL]
📬 Optional: Send email or Slack ping if not released by EOD

---
PR Tracker Dashboard - Making releases smoother`
  }
}

export const googleCalendarService = new GoogleCalendarService()

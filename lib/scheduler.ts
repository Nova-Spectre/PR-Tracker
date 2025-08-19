import { PRItem } from './types'
import { STORAGE_KEY } from './data'
import { mailerSendService } from './mailer'
import { googleCalendarService } from './calendar'

export interface EmailSchedule {
  id: string
  prId: string
  email: string
  scheduledDate: string
  scheduledTime: string
  sent: boolean
}

export interface DailyReminderSchedule {
  id: string
  email: string
  teamName: string
  active: boolean
  lastSent: string
  reminderTimes: Array<{
    hour: number
    minute: number
    label: string
  }>
}

export class SchedulerService {
  private schedules: EmailSchedule[] = []
  private dailyReminders: DailyReminderSchedule[] = []

  constructor() {
    this.loadSchedules()
    this.loadDailyReminders()
    this.initializeDailyReminders()
  }

  private loadSchedules() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('email-schedules')
        if (saved) {
          this.schedules = JSON.parse(saved)
        }
      } catch (e) {
        console.error('Failed to load schedules:', e)
      }
    }
  }

  private saveSchedules() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('email-schedules', JSON.stringify(this.schedules))
      } catch (e) {
        console.error('Failed to save schedules:', e)
      }
    }
  }

  private loadDailyReminders() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('daily-reminders')
        if (saved) {
          this.dailyReminders = JSON.parse(saved)
        }
      } catch (e) {
        console.error('Failed to load daily reminders:', e)
      }
    }
  }

  private saveDailyReminders() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('daily-reminders', JSON.stringify(this.dailyReminders))
      } catch (e) {
        console.error('Failed to save daily reminders:', e)
      }
    }
  }

  scheduleEmail(pr: PRItem, email: string, date: string, time: string): string {
    const id = `schedule_${Date.now()}`
    const schedule: EmailSchedule = {
      id,
      prId: pr.id,
      email,
      scheduledDate: date,
      scheduledTime: time,
      sent: false
    }
    
    this.schedules.push(schedule)
    this.saveSchedules()
    
    // Schedule the actual email (in a real app, this would use a cron job or cloud function)
    this.scheduleEmailReminder(schedule, pr)
    
    return id
  }

  setupDailyReminders(email: string, teamName: string = 'Team'): string {
    const id = `daily_${Date.now()}`
    const reminder: DailyReminderSchedule = {
      id,
      email,
      teamName,
      active: true,
      lastSent: new Date().toISOString(),
      reminderTimes: [
        { hour: 11, minute: 0, label: 'Morning' },
        { hour: 15, minute: 30, label: 'Afternoon' },
        { hour: 17, minute: 45, label: 'Evening' }
      ]
    }
    
    this.dailyReminders.push(reminder)
    this.saveDailyReminders()
    
    // Create Google Calendar events for daily reminders
    this.createDailyCalendarReminders(reminder)
    
    return id
  }

  private async createDailyCalendarReminders(reminder: DailyReminderSchedule) {
    try {
      // Get pending PRs for the reminder
      const pendingPRs = await this.getPendingPRs()
      if (pendingPRs.length === 0) {
        console.log('[scheduler] No pending PRs; skipping calendar reminder creation')
        return
      }
      await googleCalendarService.createDailyReminders(reminder.email, pendingPRs)
    } catch (error) {
      console.error('Failed to create daily calendar reminders:', error)
    }
  }

  private async getPendingPRs(): Promise<PRItem[]> {
    const pendingStatuses: Array<PRItem['status']> = ['initial', 'in_review', 'approved']
    try {
      const res = await fetch('/api/prs')
      if (res.ok) {
        const json = await res.json()
        const prs: PRItem[] = Array.isArray(json?.prs) ? json.prs : []
        return prs.filter((p) => pendingStatuses.includes(p.status))
      }
    } catch (_) {}
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        const prs: PRItem[] = Array.isArray(data?.prs) ? data.prs : []
        return prs.filter((p) => pendingStatuses.includes(p.status))
      }
    } catch (_) {}
    return []
  }

  private scheduleEmailReminder(schedule: EmailSchedule, pr: PRItem) {
    const scheduledDateTime = new Date(`${schedule.scheduledDate}T${schedule.scheduledTime}`)
    const now = new Date()
    const delay = scheduledDateTime.getTime() - now.getTime()
    
    if (delay > 0) {
      setTimeout(() => {
        this.sendEmailReminder(schedule, pr)
      }, delay)
    }
  }

  private async sendEmailReminder(schedule: EmailSchedule, pr: PRItem) {
    try {
      // Send email via MailerSend
      const success = await mailerSendService.sendPendingPRsReminder(
        schedule.email, 
        [pr], 
        schedule.email.split('@')[0]
      )
      
      if (success) {
        // Mark as sent
        schedule.sent = true
        this.saveSchedules()
        console.log(`Email reminder sent for PR: ${pr.title}`)
      }
    } catch (error) {
      console.error('Failed to send email reminder:', error)
    }
  }

  // Check and send daily reminders
  async checkAndSendDailyReminders() {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    for (const reminder of this.dailyReminders) {
      if (!reminder.active) continue
      
      for (const time of reminder.reminderTimes) {
        // Check if it's time to send this reminder
        if (currentHour === time.hour && Math.abs(currentMinute - time.minute) <= 5) {
          // Check if we already sent this reminder today
          const lastSent = new Date(reminder.lastSent)
          const today = new Date()
          
          if (lastSent.toDateString() !== today.toDateString()) {
            await this.sendDailyReminder(reminder)
            reminder.lastSent = today.toISOString()
            this.saveDailyReminders()
          }
        }
      }
    }
  }

  private async sendDailyReminder(reminder: DailyReminderSchedule) {
    try {
      // Get pending PRs
      const pendingPRs = await this.getPendingPRs()
      if (pendingPRs.length === 0) {
        console.log('[scheduler] No pending PRs; skipping email reminder')
        return
      }
      
      // Send email reminder
      const success = await mailerSendService.sendPendingPRsReminder(
        reminder.email,
        pendingPRs,
        reminder.teamName
      )
      
      if (success) {
        console.log(`Daily reminder sent to ${reminder.email} for ${pendingPRs.length} pending PRs`)
      }
    } catch (error) {
      console.error('Failed to send daily reminder:', error)
    }
  }

  private initializeDailyReminders() {
    // Check for daily reminders every minute
    setInterval(() => {
      this.checkAndSendDailyReminders()
    }, 60 * 1000)
    
    // Also check immediately
    this.checkAndSendDailyReminders()
  }

  getSchedules(): EmailSchedule[] {
    return [...this.schedules]
  }

  getDailyReminders(): DailyReminderSchedule[] {
    return [...this.dailyReminders]
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex(s => s.id === id)
    if (index >= 0) {
      this.schedules.splice(index, 1)
      this.saveSchedules()
      return true
    }
    return false
  }

  deleteDailyReminder(id: string): boolean {
    const index = this.dailyReminders.findIndex(r => r.id === id)
    if (index >= 0) {
      this.dailyReminders.splice(index, 1)
      this.saveDailyReminders()
      return true
    }
    return false
  }

  toggleDailyReminder(id: string): boolean {
    const reminder = this.dailyReminders.find(r => r.id === id)
    if (reminder) {
      reminder.active = !reminder.active
      this.saveDailyReminders()
      return reminder.active
    }
    return false
  }
}

export const schedulerService = new SchedulerService()

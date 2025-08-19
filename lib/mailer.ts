import { PRItem } from './types'

export interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

export class MailerSendService {
  private apiKey: string
  private fromEmail: string
  private fromName: string

  constructor() {
    this.apiKey = process.env.MAILERSEND_API_KEY || ''
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'noreply@yourdomain.com'
    this.fromName = process.env.MAILERSEND_FROM_NAME || 'PR Tracker'
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.error('MailerSend API key not configured')
        return false
      }

      const response = await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          to: [
            {
              email: emailData.to,
              name: emailData.to.split('@')[0]
            }
          ],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        })
      })

      if (response.ok) {
        console.log('Email sent successfully via MailerSend')
        return true
      } else {
        const error = await response.text()
        console.error('Failed to send email:', error)
        return false
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  createPendingPRsEmail(to: string, pendingPRs: PRItem[], teamName: string = 'Team'): EmailData {
    const subject = '🚀 Pending PRs Awaiting Release – Action Needed'
    
    const prsList = pendingPRs.map(pr => 
      `🔗 ${pr.title} – ${pr.status === 'approved' ? 'Ready to deploy' : 'Waiting for release approval'}`
    ).join('\n')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .pr-list { background: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 Pending PRs Awaiting Release – Action Needed</h2>
          </div>
          
          <p>👋 Hey ${teamName},</p>
          
          <p>Just a friendly reminder that the following PR(s) are ready but still pending release:</p>
          
          <div class="pr-list">
            <h3>🔧 Pending PRs:</h3>
            ${pendingPRs.map(pr => 
              `<p>🔗 <strong>${pr.title}</strong> – ${pr.status === 'approved' ? 'Ready to deploy' : 'Waiting for release approval'}</p>`
            ).join('')}
          </div>
          
          <h3>📆 Suggested Action:</h3>
          <p>Please review and schedule the release for the above PRs when possible.<br>
          Let me know if there's anything needed from my side 🙋‍♂️🙋‍♀️</p>
          
          <p>Thanks a lot!</p>
          
          <div class="footer">
            <p>💻 PR Tracker Bot<br>
            🚧 PR Tracker – Making releases smoother</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
📬 Pending PRs Awaiting Release – Action Needed

👋 Hey ${teamName},

Just a friendly reminder that the following PR(s) are ready but still pending release:

🔧 Pending PRs:

${prsList}

📆 Suggested Action:
Please review and schedule the release for the above PRs when possible.
Let me know if there's anything needed from my side 🙋‍♂️🙋‍♀️

Thanks a lot!
💻 PR Tracker Bot
🚧 PR Tracker – Making releases smoother
    `

    return {
      to,
      subject,
      html,
      text
    }
  }

  async sendPendingPRsReminder(to: string, pendingPRs: PRItem[], teamName?: string): Promise<boolean> {
    if (pendingPRs.length === 0) return true
    
    const emailData = this.createPendingPRsEmail(to, pendingPRs, teamName)
    return this.sendEmail(emailData)
  }
}

export const mailerSendService = new MailerSendService()

# PR Tracker Dashboard

Kanban-style dashboard for tracking pull requests across multiple projects. Built with Next.js 14, TypeScript, TailwindCSS, and drag-and-drop.

This build works fully offline without GitHub/GitLab access. You can paste PR links manually. Data is stored in `localStorage`. Optional MongoDB integration can be wired later.

## ✨ **New Features (v1.1)**

### 🔔 **Daily Email Reminders**
- **3-times-daily schedule**: 11:00 AM, 3:30 PM, 5:45 PM
- **MailerSend integration** for professional email delivery
- **Beautiful HTML email templates** with pending PRs summary
- **Team customization** with personalized sender names

### 📅 **Google Calendar Integration**
- **Automatic calendar events** for PR reviews
- **Daily recurring reminders** with calendar links
- **Email and popup notifications** at scheduled times
- **Professional calendar descriptions** with PR details

### 🏷️ **Enhanced PR Management**
- **Priority tags**: Low, Medium, High, Critical
- **Project/Service categorization** for better organization
- **Advanced filtering** by category and workspace
- **Scheduling system** for review reminders

## 🚀 **Quick Start**

1. Install deps
```bash
npm install
```

2. Configure integrations (optional)
```bash
# Create .env.local with your API keys
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. Run dev server
```bash
npm run dev
```

Open http://localhost:3000

## 🔧 **Environment Variables**

Create a `.env.local` file in your project root:

```bash
# MailerSend Configuration
MAILERSEND_API_KEY=mlsn.984ee2b92e2c40741357fb28f07d8e5785e882cba5cb3e75bf1d18d49a1fd7d7
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=PR Tracker

# Google Calendar Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=primary

# MongoDB Configuration (optional)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=<db>
```

## 📧 **Email Setup**

1. **MailerSend Account**: Sign up at [mailersend.com](https://mailersend.com)
2. **API Key**: Generate API key in MailerSend dashboard
3. **Domain Verification**: Verify your sending domain
4. **Settings**: Configure in `/settings` page

## 📅 **Calendar Setup**

1. **Google Cloud Console**: Create project and enable Calendar API
2. **OAuth 2.0**: Create OAuth client ID and API key
3. **Calendar Permissions**: Grant access to your calendar
4. **Settings**: Configure in `/settings` page

## 🎯 **How to Use**

### **Daily Reminders**
1. Go to `/settings` → Daily Reminders tab
2. Click "Setup Daily Reminders"
3. Enter your email and team name
4. Receive emails at 11:00 AM, 3:30 PM, 5:45 PM daily

### **Individual PR Scheduling**
1. Click on any PR card
2. Click "Schedule Review" or "Schedule/Reschedule"
3. Set date, time, and notification preferences
4. Get email reminders and calendar events

### **PR Management**
1. **Add PRs**: Click "+ Add PR" with category, priority, and links
2. **Drag & Drop**: Move PRs between status columns
3. **Filter**: Use category buttons and workspace tabs
4. **View Details**: Click PR cards for full information

## 🚀 **Deploy to Vercel**

- Click "New Project" in Vercel and import this repo
- Framework: Next.js, build command: `next build`
- Add environment variables in Vercel Project Settings
- Deploy and enjoy!

## 🔄 **Git**

```bash
git add -A
git commit -m "feat: Add MailerSend + Google Calendar integration v1.1"
git push origin v1
```

## 🗺️ **Roadmap**

- ✅ **v1.0**: Basic PR tracking with Kanban board
- ✅ **v1.1**: Email reminders + Calendar integration
- 🔄 **v1.2**: MongoDB persistence API
- 🔄 **v1.3**: OAuth connections for GitHub/GitLab
- 🔄 **v1.4**: Team users and roles
- 🔄 **v1.5**: Advanced analytics and reporting



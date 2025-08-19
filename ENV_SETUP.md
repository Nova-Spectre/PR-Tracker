# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

## MailerSend Configuration
```bash
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=PR Tracker
```

## Google Calendar Configuration
```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=primary
```

## MongoDB Configuration (optional)
```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=<db>
```

## Setup Steps

### 1. MailerSend Setup
1. Sign up at [mailersend.com](https://mailersend.com)
2. Generate API key in dashboard
3. Verify your sending domain
4. Set environment variables

### 2. Google Calendar Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Generate API key
6. Set environment variables

### 3. Test the Integration
1. Start the app: `npm run dev`
2. Go to `/settings` page
3. Setup daily reminders
4. Test email and calendar functionality

## Security Notes
- Never commit `.env.local` to version control
- Use strong, unique API keys
- Regularly rotate your credentials
- Monitor API usage and costs

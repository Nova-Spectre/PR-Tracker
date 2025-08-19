# 🚀 Deploying PR Tracker Dashboard to Vercel

This guide provides step-by-step instructions for deploying your Next.js PR Tracker Dashboard to Vercel, including proper environment variable configuration.

## 📋 Prerequisites

Before deploying, ensure you have:
- A GitHub/GitLab repository with your PR Tracker code
- A Vercel account (free tier available)
- All necessary API keys and credentials ready
- Your project builds successfully locally (`npm run build`)

## 🔧 Environment Variables Required

Based on your project configuration, you'll need these environment variables:

### **MailerSend Configuration**
```bash
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=PR Tracker
```

### **Google Calendar Configuration**
```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=primary
```

### **MongoDB Configuration (Optional)**
```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=your_database_name
```

### **Additional Configuration**
```bash
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure your code is in a Git repository:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify your `package.json` has the correct scripts:**
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

3. **Check that `.env.local` is in your `.gitignore`:**
   ```bash
   # Verify .env.local is listed in .gitignore
   cat .gitignore | grep .env.local
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "New Project"**

3. **Import your Git repository:**
   - Connect your GitHub/GitLab account if not already connected
   - Select your PR Tracker repository
   - Click "Import"

4. **Configure project settings:**
   - **Project Name:** `pr-tracker-dashboard` (or your preferred name)
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (should be auto-filled)
   - **Output Directory:** `.next` (should be auto-filled)
   - **Install Command:** `npm install` (should be auto-filled)

5. **Click "Deploy"** (Don't worry about environment variables yet)

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   cd "/Users/shubhampatil/dashboard/PR Tracker"
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for first deployment)
   - Project name? `pr-tracker-dashboard`
   - In which directory? `./`

### Step 3: Configure Environment Variables

1. **Go to your project dashboard on Vercel:**
   - Navigate to your deployed project
   - Click on "Settings" tab
   - Click on "Environment Variables" in the sidebar

2. **Add each environment variable:**
   
   **For MailerSend:**
   - Name: `MAILERSEND_API_KEY`
   - Value: `your_actual_mailersend_api_key`
   - Environment: Production, Preview, Development (select all)
   
   - Name: `MAILERSEND_FROM_EMAIL`
   - Value: `noreply@yourdomain.com`
   - Environment: Production, Preview, Development
   
   - Name: `MAILERSEND_FROM_NAME`
   - Value: `PR Tracker`
   - Environment: Production, Preview, Development

   **For Google Calendar:**
   - Name: `GOOGLE_CLIENT_ID`
   - Value: `your_google_oauth_client_id`
   - Environment: Production, Preview, Development
   
   - Name: `GOOGLE_API_KEY`
   - Value: `your_google_api_key`
   - Environment: Production, Preview, Development
   
   - Name: `GOOGLE_CALENDAR_ID`
   - Value: `primary`
   - Environment: Production, Preview, Development

   **For MongoDB (if using):**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://username:password@cluster.mongodb.net/database`
   - Environment: Production, Preview, Development
   
   - Name: `MONGODB_DB`
   - Value: `your_database_name`
   - Environment: Production, Preview, Development

   **Additional Variables:**
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://your-app-name.vercel.app`
   - Environment: Production, Preview, Development
   
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Production only

3. **Click "Save" for each variable**

### Step 4: Redeploy with Environment Variables

1. **Trigger a new deployment:**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache" (optional)
   - Click "Redeploy"

2. **Or push a new commit:**
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
   git push origin main
   ```

## 🔍 Post-Deployment Verification

### Step 1: Test Basic Functionality
1. Visit your deployed URL: `https://your-app-name.vercel.app`
2. Verify the dashboard loads correctly
3. Test creating and managing PRs
4. Check drag-and-drop functionality

### Step 2: Test Integrations
1. **Email Integration:**
   - Go to Settings page
   - Configure email reminders
   - Test sending a reminder email

2. **Calendar Integration:**
   - Set up a calendar event
   - Verify it appears in Google Calendar

3. **Database Integration (if enabled):**
   - Create some PRs
   - Refresh the page to ensure data persists

### Step 3: Check Logs
1. In Vercel dashboard, go to "Functions" tab
2. Check for any runtime errors
3. Monitor the "Real-time Logs" during testing

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Build Failures
```bash
# Check build locally first
npm run build

# Common fixes:
# 1. Update dependencies
npm update

# 2. Clear Next.js cache
rm -rf .next
npm run build
```

#### Environment Variable Issues
- Ensure all required variables are set in Vercel dashboard
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Redeploy after adding new environment variables

#### API Route Errors
- Check Vercel function logs in dashboard
- Ensure API routes are in the correct `/app/api/` directory
- Verify MongoDB connection string format

#### Domain and CORS Issues
```bash
# Add your Vercel domain to allowed origins in:
# - Google Cloud Console (for Calendar API)
# - MailerSend dashboard (for email API)
```

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use strong, unique API keys
   - Regularly rotate credentials

2. **Domain Configuration:**
   - Set up custom domain if needed
   - Configure HTTPS redirects
   - Add your domain to API service allowlists

3. **Monitoring:**
   - Set up Vercel Analytics
   - Monitor function execution logs
   - Set up error tracking (optional: Sentry integration)

## 📈 Performance Optimization

1. **Enable Vercel Analytics:**
   ```bash
   npm install @vercel/analytics
   ```
   
2. **Add to your layout:**
   ```tsx
   import { Analytics } from '@vercel/analytics/react'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

3. **Configure Next.js optimization:**
   ```javascript
   // next.config.mjs
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     experimental: {
       optimizeCss: true,
     },
     compress: true,
   }
   
   export default nextConfig
   ```

## 🔄 Continuous Deployment

Your app will automatically redeploy when you push to your main branch. To customize this:

1. **Branch Protection:**
   - Go to Settings → Git
   - Configure production branch
   - Set up preview deployments for other branches

2. **Build & Development Settings:**
   - Customize build command if needed
   - Set up different environment variables for preview/production

## 📞 Support and Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment Guide:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## 🎉 Congratulations!

Your PR Tracker Dashboard is now deployed on Vercel! The application will automatically redeploy whenever you push changes to your repository.

**Your deployment URL:** `https://your-app-name.vercel.app`

Remember to update any webhook URLs or callback URLs in your integrated services (MailerSend, Google Calendar) to point to your new Vercel domain.

# 🔧 Render.com Deployment Troubleshooting Guide

## 🚨 **Current Issue Analysis**

Based on your deployment logs, your PR Tracker Dashboard deployed successfully to Render.com at:
**https://pr-tracker-2cvk.onrender.com**

However, there's a **MongoDB Atlas connection error** preventing proper server-UI interaction:

```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## 🎯 **Root Cause**

Render.com servers are trying to connect to your MongoDB Atlas cluster, but their IP addresses are not whitelisted in your Atlas network access settings.

## 🔧 **Solutions (Choose One)**

### **Solution 1: Allow All IPs (Quick Fix - Recommended for Development)**

1. **Go to MongoDB Atlas Dashboard**
   - Visit [cloud.mongodb.com](https://cloud.mongodb.com)
   - Sign in to your account

2. **Navigate to Network Access**
   - Click on "Network Access" in the left sidebar (under Security)

3. **Add IP Address**
   - Click "Add IP Address" button
   - Select "Allow Access from Anywhere" 
   - Or manually enter: `0.0.0.0/0` (CIDR notation)
   - Add a comment: "Render.com deployment access"
   - Click "Confirm"

4. **Wait for Changes to Apply**
   - Changes can take 1-2 minutes to propagate
   - You'll see a green status indicator when ready

### **Solution 2: Add Specific Render.com IP Ranges (More Secure)**

Render.com uses dynamic IP addresses, so you'll need to:

1. **Contact Render.com Support** for current IP ranges
2. **Add each IP range** to MongoDB Atlas Network Access
3. **Alternative**: Use a NAT Gateway or VPN (advanced setup)

### **Solution 3: Temporarily Disable MongoDB (Testing Only)**

If you want to test the UI without database functionality:

1. **Remove MongoDB Environment Variables** from Render.com:
   - Go to your Render.com service dashboard
   - Navigate to "Environment" tab
   - Remove or comment out:
     - `MONGODB_URI`
     - `MONGODB_DB`

2. **The app will fallback to localStorage only** (as designed)

## 🚀 **Step-by-Step Fix Implementation**

### **Immediate Fix (Recommended)**

1. **Whitelist All IPs in MongoDB Atlas:**
   ```
   IP Address: 0.0.0.0/0
   Comment: Render.com deployment - allow all IPs
   ```

2. **Verify Environment Variables in Render.com:**
   - Go to your service dashboard
   - Click "Environment" tab
   - Ensure these variables are set:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   MONGODB_DB=PR_tracker
   MAILERSEND_API_KEY=your_key_here
   MAILERSEND_FROM_EMAIL=your_email@domain.com
   MAILERSEND_FROM_NAME=PR Tracker
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CALENDAR_ID=primary
   ```

3. **Redeploy Your Service:**
   - Click "Manual Deploy" → "Deploy Latest Commit"
   - Or push a new commit to trigger auto-deploy

### **Verification Steps**

1. **Check MongoDB Atlas Network Access:**
   - Confirm `0.0.0.0/0` is listed and active (green status)

2. **Monitor Render.com Logs:**
   - Go to your service dashboard
   - Click "Logs" tab
   - Look for successful MongoDB connection message:
   ```
   [db] MongoDB connected
   ```

3. **Test Your Application:**
   - Visit: https://pr-tracker-2cvk.onrender.com
   - Try creating a PR
   - Check if data persists after page refresh

## 🐛 **Additional Troubleshooting**

### **If MongoDB Connection Still Fails:**

1. **Check MongoDB Atlas Cluster Status:**
   - Ensure your cluster is running (not paused)
   - Verify cluster region and configuration

2. **Verify Connection String:**
   - Ensure `MONGODB_URI` format is correct:
   ```
   mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   ```
   - Replace `<password>` with URL-encoded password (no special characters)

3. **Test Connection Locally:**
   ```bash
   # In your local project
   node -e "
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('✅ MongoDB connected'))
     .catch(err => console.error('❌ MongoDB error:', err));
   "
   ```

### **If UI Still Not Responding:**

1. **Check Render.com Service Status:**
   - Ensure service is "Live" (green status)
   - Check resource usage (CPU/Memory)

2. **Verify Port Configuration:**
   - Render.com should auto-detect port 3000
   - Your logs show: "Detected service running on port 10000" ✅

3. **Check Browser Console:**
   - Open browser dev tools
   - Look for JavaScript errors
   - Check network requests for API failures

## 🔒 **Security Recommendations**

### **For Production Deployment:**

1. **Restrict IP Access:**
   - Instead of `0.0.0.0/0`, use specific Render.com IP ranges
   - Contact Render.com support for current IP ranges

2. **Use Environment-Specific Databases:**
   ```
   Production: mongodb+srv://prod-user:pass@prod-cluster/prod-db
   Staging: mongodb+srv://staging-user:pass@staging-cluster/staging-db
   ```

3. **Rotate API Keys Regularly:**
   - MongoDB Atlas passwords
   - MailerSend API keys
   - Google API credentials

## 📊 **Monitoring and Maintenance**

### **Set Up Monitoring:**

1. **Render.com Metrics:**
   - Monitor response times
   - Track error rates
   - Set up alerts for downtime

2. **MongoDB Atlas Monitoring:**
   - Enable performance advisor
   - Set up connection alerts
   - Monitor database metrics

### **Regular Maintenance:**

1. **Update Dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor Logs:**
   - Check Render.com logs weekly
   - Look for performance issues
   - Monitor error patterns

## 🆘 **Emergency Fallback**

If MongoDB issues persist, your app is designed to work offline:

1. **Disable MongoDB temporarily:**
   - Remove `MONGODB_URI` environment variable
   - App will use localStorage only

2. **Re-enable when fixed:**
   - Add back MongoDB environment variables
   - Data will sync from localStorage to database

## 📞 **Support Resources**

- **Render.com Support:** [render.com/docs/support](https://render.com/docs/support)
- **MongoDB Atlas Support:** [support.mongodb.com](https://support.mongodb.com)
- **Next.js Deployment Issues:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## ✅ **Quick Checklist**

- [ ] MongoDB Atlas: Add `0.0.0.0/0` to Network Access
- [ ] Render.com: Verify all environment variables are set
- [ ] Redeploy service after changes
- [ ] Test application functionality
- [ ] Monitor logs for successful MongoDB connection
- [ ] Verify UI responds and data persists

**Expected Success Message in Logs:**
```
[db] Connecting to MongoDB... { db: 'PR_tracker' }
[db] MongoDB connected
```

Once you see this message, your application should work perfectly! 🎉

# Testing Guide for PR Tracker Dashboard

This guide explains how to test all the integrations in your PR Tracker Dashboard.

## 🧪 Available Test Scripts

### 1. **Quick Email Test** (Recommended to start with)
```bash
node test-quick-email.js
```
- **Purpose**: Tests MailerSend email integration
- **Target**: Sends email to `therollingthunders1910@gmail.com`
- **Requirements**: Only MailerSend environment variables
- **Use Case**: Quick verification that emails are working

### 2. **Simple Integration Test**
```bash
npm run test
# or
node test-simple.js
```
- **Purpose**: Tests Google Calendar and MailerSend
- **Target**: Creates calendar events and sends emails
- **Requirements**: Google Calendar + MailerSend environment variables
- **Use Case**: Verify both integrations work together

### 3. **Full Integration Test**
```bash
npm run test:full
# or
node test-integrations.js
```
- **Purpose**: Tests MongoDB CRUD + Google Calendar + MailerSend
- **Target**: Complete end-to-end testing
- **Requirements**: All environment variables + MongoDB connection
- **Use Case**: Production readiness verification

### 4. **Individual Component Tests**
```bash
# Test only email
npm run test:email

# Test only calendar
npm run test:calendar
```

## 🚀 Quick Start Testing

### Step 1: Set Environment Variables
Create `.env.local` with your API keys:
```bash
# MailerSend
MAILERSEND_API_KEY=your_api_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=PR Tracker

# Google Calendar
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_API_KEY=your_api_key
GOOGLE_CALENDAR_ID=primary

# MongoDB (optional)
MONGODB_URI=mongodb+srv://...
MONGODB_DB=your_db_name
```

### Step 2: Test Email Integration
```bash
node test-quick-email.js
```
This will send a test email to `therollingthunders1910@gmail.com`

### Step 3: Test Calendar Integration
```bash
npm run test:calendar
```
This will create a Google Calendar event

### Step 4: Test Both Together
```bash
npm run test
```
This will test both email and calendar functionality

## 📧 What Gets Tested

### **Email Tests**
- ✅ Individual PR reminder emails
- ✅ Daily summary emails with multiple PRs
- ✅ Professional HTML email templates
- ✅ Customizable sender identity
- ✅ Error handling and validation

### **Calendar Tests**
- ✅ Individual PR calendar events
- ✅ Daily recurring reminders
- ✅ Professional event descriptions
- ✅ Calendar link generation
- ✅ Multiple reminder times (11:00 AM, 3:30 PM, 5:45 PM)

### **MongoDB Tests** (Full test only)
- ✅ CREATE operations
- ✅ READ operations
- ✅ UPDATE operations
- ✅ DELETE operations
- ✅ Connection management

## 🔍 Expected Results

### **Successful Email Test**
```
✅ Environment variables check passed
📧 Sending test email to: therollingthunders1910@gmail.com
📤 From: noreply@yourdomain.com
🔄 Sending test email...
✅ Email sent successfully!
📧 Check your email: therollingthunders1910@gmail.com
🎉 Email integration is working correctly!
```

### **Successful Calendar Test**
```
📅 Testing Google Calendar Integration...
  🔄 Testing calendar event creation...
    ✅ Calendar event creation successful
    📱 Check your browser - a new tab should open with Google Calendar
  🔄 Testing daily reminder creation...
    ✅ Daily reminders creation successful
    📅 Check console for calendar links
```

## 🚨 Troubleshooting

### **Email Not Working?**
1. Check `MAILERSEND_API_KEY` is correct
2. Verify domain is verified in MailerSend
3. Check API key permissions
4. Look for errors in MailerSend dashboard

### **Calendar Not Working?**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY`
2. Check Google Cloud Console for API errors
3. Ensure Calendar API is enabled
4. Verify OAuth credentials are correct

### **MongoDB Connection Issues?**
1. Check `MONGODB_URI` format
2. Verify network connectivity
3. Check MongoDB Atlas IP whitelist
4. Verify database user permissions

## 📋 Test Data

All tests use this sample PR data:
```javascript
{
  title: 'Test PR - Integration Testing',
  project: 'Test Project',
  category: 'project',
  author: 'test.user',
  status: 'initial',
  priority: 'high',
  description: 'This is a test PR for integration testing',
  scheduledDate: '2024-12-25',
  scheduledTime: '10:00'
}
```

## 🎯 Next Steps After Testing

1. **All Tests Pass**: Your integration is ready for production!
2. **Some Tests Fail**: Check the error messages and fix configuration
3. **Environment Issues**: Set up missing API keys and credentials
4. **Integration Issues**: Review the service configurations

## 📞 Support

If you encounter issues:
1. Check the error messages in the test output
2. Verify your environment variables
3. Test individual components separately
4. Check the service dashboards for errors

Happy testing! 🚀

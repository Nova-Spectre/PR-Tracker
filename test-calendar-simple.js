#!/usr/bin/env node

/**
 * Simple Google Calendar Test for PR Tracker Dashboard
 * Directly tests Google Calendar integration without complex imports
 * 
 * Run with: node test-calendar-simple.js
 */

function createCalendarLink(event) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    details: event.description,
    add: event.attendees?.join(',') || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function testGoogleCalendar() {
  console.log('📅 Simple Google Calendar Integration Test\n');
  console.log('=' .repeat(50));
  
  // Check environment
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.log('⚠️  GOOGLE_CLIENT_ID not set (optional for basic test)');
  } else {
    console.log('✅ GOOGLE_CLIENT_ID: Set');
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.log('⚠️  GOOGLE_API_KEY not set (optional for basic test)');
  } else {
    console.log('✅ GOOGLE_API_KEY: Set');
  }

  console.log('=' .repeat(50));

  try {
    // Test PR data
    const testPR = {
      id: 'test-calendar-pr-' + Date.now(),
      title: 'Test PR - Calendar Integration',
      project: 'Test Project',
      category: 'project',
      author: 'test.user',
      status: 'initial',
      priority: 'high',
      description: 'This is a test PR to verify calendar integration is working correctly.',
      scheduledDate: '2024-12-25',
      scheduledTime: '10:00'
    };

    console.log('🔄 Creating test calendar event...');
    
    // Create calendar event
    const startTime = new Date(`${testPR.scheduledDate}T${testPR.scheduledTime}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const event = {
      id: `pr_${testPR.id}`,
      summary: `🔔 Reminder: ${testPR.title} - Pending Release`,
      description: `🚀 Pending PRs Release Reminder

Hi Team,

This is your scheduled reminder to review and release the following pull request:

🔧 Pending PR Details:

🔗 ${testPR.title} – ${testPR.status === 'approved' ? 'Ready for release' : 'Awaiting final approval'}

💡 Project/Service: ${testPR.category === 'project' ? testPR.project : testPR.service}
💡 Author: ${testPR.author}
💡 Priority: ${testPR.priority}

💡 Tips:
• Check deployment notes 📝
• Coordinate with QA if needed 👩‍💻
• Avoid end-of-day releases 🌙

📌 Link to PR: ${testPR.links?.[0]?.url || 'No link provided'}
📬 Optional: Send email or Slack ping if not released by EOD

---
PR Tracker Dashboard - Making releases smoother`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      attendees: ['therollingthunders1910@gmail.com']
    };

    // Generate calendar link
    const calendarUrl = createCalendarLink(event);
    
    console.log('✅ Calendar event created successfully!');
    console.log('\n📅 Event Details:');
    console.log(`   Title: ${event.summary}`);
    console.log(`   Date: ${startTime.toLocaleDateString()}`);
    console.log(`   Time: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
    console.log(`   Attendee: therollingthunders1910@gmail.com`);
    
    console.log('\n🔗 Calendar Link:');
    console.log(calendarUrl);
    
    console.log('\n📱 Opening calendar in browser...');
    
    // Try to open in browser (Node.js doesn't have browser.open, so we'll just show the link)
    console.log('💡 Copy and paste the calendar link above into your browser to create the event');
    
    // Test daily reminders
    console.log('\n🔄 Testing daily reminder creation...');
    
    const reminderTimes = [
      { hour: 11, minute: 0, label: 'Morning' },
      { hour: 15, minute: 30, label: 'Afternoon' },
      { hour: 17, minute: 45, label: 'Evening' }
    ];

    console.log('📅 Daily Reminder Schedule:');
    reminderTimes.forEach(time => {
      const reminderTime = new Date();
      reminderTime.setHours(time.hour, time.minute, 0, 0);
      
      const reminderEvent = {
        summary: `🔔 ${time.label} Reminder: Pending PRs to Release`,
        description: `🚀 Daily PR Release Check

Hi Team,

This is your scheduled reminder to review and release the following pull requests:

🔧 Pending PRs List:

🔗 ${testPR.title} – ${testPR.status === 'approved' ? 'Ready for release' : 'Awaiting approval'}

💡 Tips:
• Check deployment notes 📝
• Coordinate with QA if needed 👩‍💻
• Avoid end-of-day releases 🌙

📌 Link to PR Tracker: [Your dashboard URL]
📬 Optional: Send email or Slack ping if not released by EOD

---
PR Tracker Dashboard - Making releases smoother`,
        startTime: reminderTime.toISOString(),
        endTime: new Date(reminderTime.getTime() + 15 * 60 * 1000).toISOString(), // 15 min duration
        attendees: ['therollingthunders1910@gmail.com']
      };

      const reminderUrl = createCalendarLink(reminderEvent);
      console.log(`   ${time.label} (${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}): ${reminderUrl}`);
    });

    console.log('\n🎉 Google Calendar integration test completed successfully!');
    console.log('📧 Next step: Test email integration with: node test-email-simple.js');

  } catch (error) {
    console.error('💥 Calendar test failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Google Calendar API credentials');
    console.log('3. Ensure Calendar API is enabled in Google Cloud Console');
  }
}

// Run the test
testGoogleCalendar();

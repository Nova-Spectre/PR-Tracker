#!/usr/bin/env node

/**
 * Simple Integration Test for PR Tracker Dashboard
 * Tests Google Calendar and MailerSend without MongoDB requirement
 * 
 * Run with: node test-simple.js
 */

const { googleCalendarService } = require('./lib/calendar.js');
const { mailerSendService } = require('./lib/mailer.js');

// Test Configuration
const TEST_CONFIG = {
  testEmail: 'therollingthunders1910@gmail.com',
  testPR: {
    id: 'test-pr-' + Date.now(),
    title: 'Test PR - Simple Integration Testing',
    project: 'Test Project',
    service: 'Test Service',
    category: 'project',
    author: 'test.user',
    description: 'This is a test PR for simple integration testing',
    status: 'initial',
    priority: 'high',
    links: [{ url: 'https://github.com/test/repo/pull/999', label: 'Test PR' }],
    scheduledDate: '2024-12-25',
    scheduledTime: '10:00',
    emailReminder: true,
    calendarEvent: true
  }
};

class SimpleIntegrationTester {
  constructor() {
    this.testResults = [];
  }

  async testGoogleCalendar() {
    console.log('\n📅 Testing Google Calendar Integration...');
    
    try {
      // Test 1: Create calendar event
      console.log('  🔄 Testing calendar event creation...');
      const calendarResult = await googleCalendarService.addToCalendar(
        TEST_CONFIG.testPR,
        TEST_CONFIG.testEmail
      );

      if (calendarResult) {
        console.log('    ✅ Calendar event creation successful');
        console.log('    📱 Check your browser - a new tab should open with Google Calendar');
        this.testResults.push({ test: 'Google Calendar Create', status: 'PASS' });
      } else {
        console.log('    ❌ Calendar event creation failed');
        this.testResults.push({ test: 'Google Calendar Create', status: 'FAIL' });
      }

      // Test 2: Create daily reminders
      console.log('  🔄 Testing daily reminder creation...');
      const dailyReminderResult = await googleCalendarService.createDailyReminders(
        TEST_CONFIG.testEmail,
        [TEST_CONFIG.testPR]
      );

      if (dailyReminderResult) {
        console.log('    ✅ Daily reminders creation successful');
        console.log('    📅 Check console for calendar links');
        this.testResults.push({ test: 'Google Calendar Daily Reminders', status: 'PASS' });
      } else {
        console.log('    ❌ Daily reminders creation failed');
        this.testResults.push({ test: 'Google Calendar Daily Reminders', status: 'FAIL' });
      }

    } catch (error) {
      console.error('  ❌ Google Calendar test failed:', error.message);
      this.testResults.push({ test: 'Google Calendar', status: 'FAIL', error: error.message });
    }
  }

  async testMailerSend() {
    console.log('\n📧 Testing MailerSend Email Integration...');
    
    try {
      // Test 1: Send individual PR reminder
      console.log('  🔄 Testing individual PR email...');
      const individualEmailResult = await mailerSendService.sendPendingPRsReminder(
        TEST_CONFIG.testEmail,
        [TEST_CONFIG.testPR],
        'Test Team'
      );

      if (individualEmailResult) {
        console.log('    ✅ Individual PR email sent successfully');
        console.log(`    📧 Check your email: ${TEST_CONFIG.testEmail}`);
        this.testResults.push({ test: 'MailerSend Individual Email', status: 'PASS' });
      } else {
        console.log('    ❌ Individual PR email failed');
        this.testResults.push({ test: 'MailerSend Individual Email', status: 'FAIL' });
      }

      // Test 2: Send daily summary email
      console.log('  🔄 Testing daily summary email...');
      const dailyEmailResult = await mailerSendService.sendPendingPRsReminder(
        TEST_CONFIG.testEmail,
        [TEST_CONFIG.testPR, { ...TEST_CONFIG.testPR, id: '2', title: 'Second Test PR' }],
        'Test Team'
      );

      if (dailyEmailResult) {
        console.log('    ✅ Daily summary email sent successfully');
        console.log(`    📧 Check your email: ${TEST_CONFIG.testEmail}`);
        this.testResults.push({ test: 'MailerSend Daily Summary', status: 'PASS' });
      } else {
        console.log('    ❌ Daily summary email failed');
        this.testResults.push({ test: 'MailerSend Daily Summary', status: 'FAIL' });
      }

    } catch (error) {
      console.error('  ❌ MailerSend test failed:', error.message);
      this.testResults.push({ test: 'MailerSend', status: 'FAIL', error: error.message });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Simple Integration Tests for PR Tracker Dashboard\n');
    console.log('=' .repeat(60));
    console.log(`📧 Test email: ${TEST_CONFIG.testEmail}`);
    console.log('=' .repeat(60));
    
    const startTime = Date.now();

    // Test Google Calendar
    await this.testGoogleCalendar();

    // Test MailerSend
    await this.testMailerSend();

    // Print results
    this.printResults();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n⏱️  Total test duration: ${duration.toFixed(2)} seconds`);
    console.log('=' .repeat(60));
  }

  printResults() {
    console.log('\n📋 Test Results Summary:');
    console.log('=' .repeat(40));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n' + '=' .repeat(40));
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Integration is working correctly.');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Check the logs above for details.`);
    }
  }
}

// Environment check for email and calendar
function checkEnvironment() {
  console.log('🔍 Environment Check:');
  console.log('=' .repeat(30));
  
  const requiredVars = [
    'MAILERSEND_API_KEY',
    'MAILERSEND_FROM_EMAIL',
    'MAILERSEND_FROM_NAME',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_API_KEY'
  ];

  let missingVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(`\n⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Please set these variables before running tests.');
    console.log('See ENV_SETUP.md for setup instructions.');
    return false;
  }

  console.log('\n✅ All required environment variables are set!');
  return true;
}

// Main execution
async function main() {
  try {
    // Check environment
    if (!checkEnvironment()) {
      process.exit(1);
    }

    // Run tests
    const tester = new SimpleIntegrationTester();
    await tester.runAllTests();

  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SimpleIntegrationTester, checkEnvironment };

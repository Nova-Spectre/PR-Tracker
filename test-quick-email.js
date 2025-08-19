#!/usr/bin/env node

/**
 * Quick Email Test for PR Tracker Dashboard
 * Sends a test email to therollingthunders1910@gmail.com
 * 
 * Run with: node test-quick-email.js
 */

const { mailerSendService } = require('./lib/mailer.js');

async function testEmail() {
  console.log('📧 Quick Email Test for PR Tracker Dashboard\n');
  console.log('=' .repeat(50));
  
  // Check environment
  if (!process.env.MAILERSEND_API_KEY) {
    console.error('❌ MAILERSEND_API_KEY not set in environment');
    console.log('Please set your MailerSend API key and run again.');
    process.exit(1);
  }

  if (!process.env.MAILERSEND_FROM_EMAIL) {
    console.error('❌ MAILERSEND_FROM_EMAIL not set in environment');
    console.log('Please set your sender email and run again.');
    process.exit(1);
  }

  console.log('✅ Environment variables check passed');
  console.log(`📧 Sending test email to: therollingthunders1910@gmail.com`);
  console.log(`📤 From: ${process.env.MAILERSEND_FROM_EMAIL}`);
  console.log('=' .repeat(50));

  try {
    // Test PR data
    const testPRs = [
      {
        title: 'Test PR - Email Integration',
        project: 'Test Project',
        category: 'project',
        author: 'test.user',
        status: 'initial',
        priority: 'high',
        description: 'This is a test PR to verify email integration is working correctly.'
      },
      {
        title: 'Another Test PR',
        project: 'Test Project',
        category: 'project',
        author: 'test.user',
        status: 'approved',
        priority: 'medium',
        description: 'This is another test PR to verify multiple PRs in email.'
      }
    ];

    console.log('🔄 Sending test email...');
    
    const result = await mailerSendService.sendPendingPRsReminder(
      'therollingthunders1910@gmail.com',
      testPRs,
      'Test Team'
    );

    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your email: therollingthunders1910@gmail.com');
      console.log('📱 Check spam folder if not in inbox');
      console.log('\n🎉 Email integration is working correctly!');
    } else {
      console.log('❌ Email sending failed');
      console.log('🔍 Check your MailerSend API key and configuration');
    }

  } catch (error) {
    console.error('💥 Email test failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Verify your MailerSend API key is correct');
    console.log('2. Check if your domain is verified in MailerSend');
    console.log('3. Ensure your API key has proper permissions');
    console.log('4. Check MailerSend dashboard for any errors');
  }
}

// Run the test
testEmail();

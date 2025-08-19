#!/usr/bin/env node

/**
 * Simple Email Test for PR Tracker Dashboard
 * Directly tests MailerSend API without complex imports
 * 
 * Run with: node test-email-simple.js
 */

async function testMailerSendAPI() {
  console.log('📧 Simple MailerSend API Test\n');
  console.log('=' .repeat(50));
  
  // Check environment
  if (!process.env.MAILERSEND_API_KEY) {
    console.error('❌ MAILERSEND_API_KEY not set in environment');
    console.log('Please set your MailerSend API key and run again.');
    console.log('Example: export MAILERSEND_API_KEY=your_key_here');
    process.exit(1);
  }

  if (!process.env.MAILERSEND_FROM_EMAIL) {
    console.error('❌ MAILERSEND_FROM_EMAIL not set in environment');
    console.log('Please set your sender email and run again.');
    console.log('Example: export MAILERSEND_FROM_EMAIL=noreply@yourdomain.com');
    process.exit(1);
  }

  console.log('✅ Environment variables check passed');
  console.log(`📧 Sending test email to: therollingthunders1910@gmail.com`);
  console.log(`📤 From: ${process.env.MAILERSEND_FROM_EMAIL}`);
  console.log('=' .repeat(50));

  try {
    // Test email data
    const emailData = {
      from: {
        email: process.env.MAILERSEND_FROM_EMAIL,
        name: process.env.MAILERSEND_FROM_NAME || 'PR Tracker'
      },
      to: [
        {
          email: 'therollingthunders1910@gmail.com',
          name: 'Test User'
        }
      ],
      subject: '🚀 Test Email from PR Tracker Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 Test Email Successfully Sent!</h2>
            </div>
            
            <div class="content">
              <h3>📧 MailerSend Integration Test</h3>
              <p>This is a test email to verify that your PR Tracker Dashboard email integration is working correctly.</p>
              
              <h4>🔧 Test Details:</h4>
              <ul>
                <li><strong>Service:</strong> MailerSend</li>
                <li><strong>From:</strong> ${process.env.MAILERSEND_FROM_EMAIL}</li>
                <li><strong>To:</strong> therollingthunders1910@gmail.com</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              
              <p>If you received this email, your MailerSend integration is working perfectly! 🚀</p>
            </div>
            
            <div class="footer">
              <p>💻 PR Tracker Dashboard - Making releases smoother</p>
              <p><small>This is a test email sent automatically by the integration test suite.</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Test Email Successfully Sent!

MailerSend Integration Test

This is a test email to verify that your PR Tracker Dashboard email integration is working correctly.

Test Details:
- Service: MailerSend
- From: ${process.env.MAILERSEND_FROM_EMAIL}
- To: therollingthunders1910@gmail.com
- Time: ${new Date().toLocaleString()}

If you received this email, your MailerSend integration is working perfectly!

---
PR Tracker Dashboard - Making releases smoother
This is a test email sent automatically by the integration test suite.
      `
    };

    console.log('🔄 Sending test email via MailerSend API...');
    
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILERSEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your email: therollingthunders1910@gmail.com');
      console.log('📱 Check spam folder if not in inbox');
      console.log('\n🎉 MailerSend integration is working correctly!');
      
      const result = await response.json();
      console.log('\n📊 API Response:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Email sending failed');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Error:', error);
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1. Verify your MailerSend API key is correct');
      console.log('2. Check if your domain is verified in MailerSend');
      console.log('3. Ensure your API key has proper permissions');
      console.log('4. Check MailerSend dashboard for any errors');
    }

  } catch (error) {
    console.error('💥 Email test failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your MailerSend API key');
    console.log('3. Check if MailerSend service is accessible');
  }
}

// Run the test
testMailerSendAPI();

#!/usr/bin/env node

/**
 * Integration Test Suite for PR Tracker Dashboard
 * Tests MongoDB CRUD operations, Google Calendar, and MailerSend
 * 
 * Run with: node test-integrations.js
 */

const { MongoClient } = require('mongodb');
const { googleCalendarService } = require('./lib/calendar.js');
const { mailerSendService } = require('./lib/mailer.js');

// Test Configuration
const TEST_CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'pr-tracker-test',
    collection: 'test-prs'
  },
  testEmail: 'therollingthunders1910@gmail.com',
  testPR: {
    title: 'Test PR - Integration Testing',
    project: 'Test Project',
    service: 'Test Service',
    category: 'project',
    author: 'test.user',
    description: 'This is a test PR for integration testing',
    status: 'initial',
    priority: 'high',
    links: [{ url: 'https://github.com/test/repo/pull/999', label: 'Test PR' }],
    scheduledDate: '2024-12-25',
    scheduledTime: '10:00',
    emailReminder: true,
    calendarEvent: true
  }
};

class IntegrationTester {
  constructor() {
    this.mongoClient = null;
    this.db = null;
    this.collection = null;
    this.testResults = [];
  }

  async connectMongo() {
    try {
      console.log('🔌 Connecting to MongoDB...');
      this.mongoClient = new MongoClient(TEST_CONFIG.mongodb.uri);
      await this.mongoClient.connect();
      this.db = this.mongoClient.db(TEST_CONFIG.mongodb.dbName);
      this.collection = this.db.collection(TEST_CONFIG.mongodb.collection);
      console.log('✅ MongoDB connected successfully');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  async disconnectMongo() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      console.log('🔌 MongoDB disconnected');
    }
  }

  async testMongoCRUD() {
    console.log('\n📊 Testing MongoDB CRUD Operations...');
    
    try {
      // Test 1: Create (Insert)
      console.log('  🔄 Testing CREATE operation...');
      const insertResult = await this.collection.insertOne(TEST_CONFIG.testPR);
      const insertedId = insertResult.insertedId;
      console.log(`    ✅ Created PR with ID: ${insertedId}`);
      this.testResults.push({ test: 'MongoDB CREATE', status: 'PASS', id: insertedId });

      // Test 2: Read (Find)
      console.log('  📖 Testing READ operation...');
      const foundPR = await this.collection.findOne({ _id: insertedId });
      if (foundPR && foundPR.title === TEST_CONFIG.testPR.title) {
        console.log('    ✅ READ operation successful');
        this.testResults.push({ test: 'MongoDB READ', status: 'PASS' });
      } else {
        console.log('    ❌ READ operation failed');
        this.testResults.push({ test: 'MongoDB READ', status: 'FAIL' });
      }

      // Test 3: Update
      console.log('  ✏️  Testing UPDATE operation...');
      const updateResult = await this.collection.updateOne(
        { _id: insertedId },
        { $set: { status: 'in_review', priority: 'critical' } }
      );
      if (updateResult.modifiedCount === 1) {
        console.log('    ✅ UPDATE operation successful');
        this.testResults.push({ test: 'MongoDB UPDATE', status: 'PASS' });
      } else {
        console.log('    ❌ UPDATE operation failed');
        this.testResults.push({ test: 'MongoDB UPDATE', status: 'FAIL' });
      }

      // Test 4: Delete
      console.log('  🗑️  Testing DELETE operation...');
      const deleteResult = await this.collection.deleteOne({ _id: insertedId });
      if (deleteResult.deletedCount === 1) {
        console.log('    ✅ DELETE operation successful');
        this.testResults.push({ test: 'MongoDB DELETE', status: 'PASS' });
      } else {
        console.log('    ❌ DELETE operation failed');
        this.testResults.push({ test: 'MongoDB DELETE', status: 'FAIL' });
      }

      // Test 5: Verify deletion
      const verifyDelete = await this.collection.findOne({ _id: insertedId });
      if (!verifyDelete) {
        console.log('    ✅ Deletion verification successful');
        this.testResults.push({ test: 'MongoDB DELETE Verification', status: 'PASS' });
      } else {
        console.log('    ❌ Deletion verification failed');
        this.testResults.push({ test: 'MongoDB DELETE Verification', status: 'FAIL' });
      }

    } catch (error) {
      console.error('  ❌ MongoDB CRUD test failed:', error.message);
      this.testResults.push({ test: 'MongoDB CRUD', status: 'FAIL', error: error.message });
    }
  }

  async testGoogleCalendar() {
    console.log('\n📅 Testing Google Calendar Integration...');
    
    try {
      // Test 1: Create calendar event
      console.log('  🔄 Testing calendar event creation...');
      const testPR = {
        ...TEST_CONFIG.testPR,
        id: 'test-calendar-pr-' + Date.now()
      };

      const calendarResult = await googleCalendarService.addToCalendar(
        testPR,
        TEST_CONFIG.testEmail
      );

      if (calendarResult) {
        console.log('    ✅ Calendar event creation successful');
        this.testResults.push({ test: 'Google Calendar Create', status: 'PASS' });
      } else {
        console.log('    ❌ Calendar event creation failed');
        this.testResults.push({ test: 'Google Calendar Create', status: 'FAIL' });
      }

      // Test 2: Create daily reminders
      console.log('  🔄 Testing daily reminder creation...');
      const dailyReminderResult = await googleCalendarService.createDailyReminders(
        TEST_CONFIG.testEmail,
        [testPR]
      );

      if (dailyReminderResult) {
        console.log('    ✅ Daily reminders creation successful');
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
    console.log('🚀 Starting Integration Tests for PR Tracker Dashboard\n');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();

    // Test MongoDB CRUD
    const mongoConnected = await this.connectMongo();
    if (mongoConnected) {
      await this.testMongoCRUD();
      await this.disconnectMongo();
    } else {
      console.log('⚠️  Skipping MongoDB tests due to connection failure');
    }

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

// Environment check
function checkEnvironment() {
  console.log('🔍 Environment Check:');
  console.log('=' .repeat(30));
  
  const requiredVars = [
    'MONGODB_URI',
    'MONGODB_DB',
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
    const tester = new IntegrationTester();
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

module.exports = { IntegrationTester, checkEnvironment };

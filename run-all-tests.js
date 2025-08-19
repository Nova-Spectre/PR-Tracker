#!/usr/bin/env node

/**
 * Comprehensive Test Runner for PR Tracker Dashboard
 * Runs all integration tests and provides a summary
 * 
 * Run with: node run-all-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

class TestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runTest(testName, command, description) {
    console.log(`\n🧪 Running ${testName}...`);
    console.log(`📝 ${description}`);
    console.log('=' .repeat(60));
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: __dirname 
      });
      
      console.log(output);
      this.testResults.push({ name: testName, status: 'PASS', output });
      console.log(`✅ ${testName} completed successfully!`);
      
    } catch (error) {
      console.log('❌ Test failed with output:');
      console.log(error.stdout || 'No output');
      console.log(error.stderr || 'No error output');
      
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message, output: error.stdout });
      console.log(`❌ ${testName} failed!`);
    }
  }

  async runAllTests() {
    console.log('🚀 PR Tracker Dashboard - Comprehensive Test Suite\n');
    console.log('=' .repeat(60));
    console.log('This will test all integrations: Email, Calendar, and MongoDB');
    console.log('=' .repeat(60));
    
    // Test 1: Email Integration
    await this.runTest(
      'Email Integration Test',
      'node test-email-simple.js',
      'Tests MailerSend email integration by sending a test email to therollingthunders1910@gmail.com'
    );

    // Test 2: Calendar Integration
    await this.runTest(
      'Calendar Integration Test',
      'node test-calendar-simple.js',
      'Tests Google Calendar integration by creating test events and daily reminders'
    );

    // Test 3: MongoDB Integration
    await this.runTest(
      'MongoDB Integration Test',
      'node test-mongodb-simple.js',
      'Tests MongoDB CRUD operations (Create, Read, Update, Delete)'
    );

    // Print summary
    this.printSummary();
  }

  printSummary() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    console.log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your PR Tracker Dashboard is fully integrated!');
      console.log('🚀 Ready for production use.');
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Check the logs above for details.`);
      console.log('🔧 Fix the issues and run the tests again.');
    }

    console.log('\n📚 Next Steps:');
    if (passed >= 2) {
      console.log('✅ Your core integrations are working!');
      console.log('🌐 Deploy to Vercel or your preferred hosting platform.');
      console.log('👥 Start using the dashboard with your team.');
    } else if (passed >= 1) {
      console.log('⚠️  Some integrations are working, others need attention.');
      console.log('🔧 Check the failed tests and fix configuration issues.');
      console.log('📧 Email integration is usually the easiest to get working first.');
    } else {
      console.log('❌ No integrations are working yet.');
      console.log('🔧 Start with email integration (MailerSend) as it\'s the simplest.');
      console.log('📚 Check ENV_SETUP.md for configuration instructions.');
    }
  }
}

// Environment check
function checkEnvironment() {
  console.log('🔍 Environment Check:');
  console.log('=' .repeat(30));
  
  const requiredVars = [
    'MAILERSEND_API_KEY',
    'MAILERSEND_FROM_EMAIL',
    'MONGODB_URI',
    'MONGODB_DB'
  ];

  const optionalVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_API_KEY'
  ];

  let missingRequired = [];
  let missingOptional = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing (Required)`);
      missingRequired.push(varName);
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`⚠️  ${varName}: Missing (Optional)`);
      missingOptional.push(varName);
    }
  });

  if (missingRequired.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingRequired.join(', ')}`);
    console.log('Please set these variables before running tests.');
    console.log('See ENV_SETUP.md for setup instructions.');
    return false;
  }

  if (missingOptional.length > 0) {
    console.log(`\n⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`);
    console.log('Some tests may be limited but core functionality will work.');
  }

  console.log('\n✅ Environment check passed!');
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
    const runner = new TestRunner();
    await runner.runAllTests();

  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TestRunner, checkEnvironment };

#!/usr/bin/env node

/**
 * Simple MongoDB Test for PR Tracker Dashboard
 * Directly tests MongoDB CRUD operations without complex imports
 * 
 * Run with: node test-mongodb-simple.js
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testMongoDB() {
  console.log('🗄️  Simple MongoDB CRUD Test\n');
  console.log('=' .repeat(50));
  
  // Check environment
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not set in environment');
    console.log('Please set your MongoDB connection string and run again.');
    console.log('Example: export MONGODB_URI=mongodb+srv://...');
    console.log('\n⚠️  Skipping MongoDB tests due to missing connection string');
    return;
  }

  if (!process.env.MONGODB_DB) {
    console.log('❌ MONGODB_DB not set in environment');
    console.log('Please set your MongoDB database name and run again.');
    console.log('Example: export MONGODB_DB=your_db_name');
    console.log('\n⚠️  Skipping MongoDB tests due to missing database name');
    return;
  }

  console.log('✅ Environment variables check passed');
  console.log(`🔌 Connecting to MongoDB...`);
  console.log(`📊 Database: ${process.env.MONGODB_DB}`);
  console.log('=' .repeat(50));

  let client;
  let collection;

  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB connected successfully');

    const db = client.db(process.env.MONGODB_DB);
    collection = db.collection('test-prs');

    // Test data
    const testPR = {
      title: 'Test PR - MongoDB Integration',
      project: 'Test Project',
      service: 'Test Service',
      category: 'project',
      author: 'test.user',
      description: 'This is a test PR to verify MongoDB integration is working correctly.',
      status: 'initial',
      priority: 'high',
      links: [{ url: 'https://github.com/test/repo/pull/999', label: 'Test PR' }],
      scheduledDate: '2024-12-25',
      scheduledTime: '10:00',
      emailReminder: true,
      calendarEvent: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('\n📊 Testing MongoDB CRUD Operations...');
    
    // Test 1: CREATE (Insert)
    console.log('  🔄 Testing CREATE operation...');
    const insertResult = await collection.insertOne(testPR);
    const insertedId = insertResult.insertedId;
    console.log(`    ✅ Created PR with ID: ${insertedId}`);
    console.log(`    📝 Title: ${testPR.title}`);

    // Test 2: READ (Find)
    console.log('  📖 Testing READ operation...');
    const foundPR = await collection.findOne({ _id: insertedId });
    if (foundPR && foundPR.title === testPR.title) {
      console.log('    ✅ READ operation successful');
      console.log(`    📝 Retrieved: ${foundPR.title}`);
    } else {
      console.log('    ❌ READ operation failed');
      throw new Error('Could not retrieve inserted document');
    }

    // Test 3: UPDATE
    console.log('  ✏️  Testing UPDATE operation...');
    const updateResult = await collection.updateOne(
      { _id: insertedId },
      { 
        $set: { 
          status: 'in_review', 
          priority: 'critical',
          updatedAt: new Date()
        } 
      }
    );
    if (updateResult.modifiedCount === 1) {
      console.log('    ✅ UPDATE operation successful');
      console.log('    📝 Updated status to: in_review, priority to: critical');
    } else {
      console.log('    ❌ UPDATE operation failed');
      throw new Error('Update operation did not modify any documents');
    }

    // Test 4: READ after UPDATE
    console.log('  📖 Testing READ after UPDATE...');
    const updatedPR = await collection.findOne({ _id: insertedId });
    if (updatedPR && updatedPR.status === 'in_review' && updatedPR.priority === 'critical') {
      console.log('    ✅ READ after UPDATE successful');
      console.log(`    📝 Status: ${updatedPR.status}, Priority: ${updatedPR.priority}`);
    } else {
      console.log('    ❌ READ after UPDATE failed');
      throw new Error('Updated values not reflected in document');
    }

    // Test 5: DELETE
    console.log('  🗑️  Testing DELETE operation...');
    const deleteResult = await collection.deleteOne({ _id: insertedId });
    if (deleteResult.deletedCount === 1) {
      console.log('    ✅ DELETE operation successful');
    } else {
      console.log('    ❌ DELETE operation failed');
      throw new Error('Delete operation did not remove any documents');
    }

    // Test 6: Verify deletion
    console.log('  🔍 Testing DELETE verification...');
    const verifyDelete = await collection.findOne({ _id: insertedId });
    if (!verifyDelete) {
      console.log('    ✅ Deletion verification successful');
      console.log('    📝 Document no longer exists in database');
    } else {
      console.log('    ❌ Deletion verification failed');
      throw new Error('Document still exists after deletion');
    }

    console.log('\n🎉 All MongoDB CRUD tests passed successfully!');
    console.log('✅ CREATE, READ, UPDATE, DELETE operations working correctly');
    console.log('📊 Database connection and operations verified');

  } catch (error) {
    console.error('\n💥 MongoDB test failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check your MONGODB_URI connection string');
    console.log('2. Verify your database name is correct');
    console.log('3. Check network connectivity to MongoDB');
    console.log('4. Verify user permissions and IP whitelist');
    console.log('5. Check MongoDB service status');

  } finally {
    // Cleanup
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the test
testMongoDB();

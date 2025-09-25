#!/usr/bin/env node

/**
 * Test script for Klaviyo integration
 * Usage: node test-klaviyo.js
 * 
 * Make sure to set KLAVIYO_PUBLIC_KEY in your .env file before running
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('.env file not found. Make sure to set KLAVIYO_PUBLIC_KEY environment variable.');
}

const BASE_URL = 'http://localhost:3000';

async function testFeedbackSubmission(type, rating) {
  const endpoint = type === 'high' ? '/api/feedback/high-rating' : '/api/feedback/low-rating';
  
  const testData = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    rating: rating,
    feedback: `This is a test ${type}-rating feedback submitted at ${new Date().toISOString()}`
  };

  console.log(`\n📧 Testing ${type}-rating feedback submission...`);
  console.log('Request data:', testData);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Feedback submitted successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (!process.env.KLAVIYO_PUBLIC_KEY) {
        console.log('⚠️  Note: KLAVIYO_PUBLIC_KEY not set, Klaviyo event was skipped');
      } else {
        console.log('📤 Klaviyo event should have been sent (check server logs for confirmation)');
      }
    } else {
      console.error('❌ Error submitting feedback:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to submit feedback:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Klaviyo Integration Tests');
  console.log('=====================================');
  
  // Check if server is running
  try {
    await fetch(BASE_URL);
  } catch (error) {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // Check environment variable
  if (!process.env.KLAVIYO_PUBLIC_KEY) {
    console.warn('⚠️  Warning: KLAVIYO_PUBLIC_KEY is not set in environment variables');
    console.warn('   Klaviyo events will be skipped, but feedback will still be saved');
    console.warn('   To enable Klaviyo, add KLAVIYO_PUBLIC_KEY to your .env file');
  } else {
    console.log('✅ KLAVIYO_PUBLIC_KEY is configured');
  }
  
  // Test high-rating feedback
  await testFeedbackSubmission('high', 5);
  
  // Small delay between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test low-rating feedback
  await testFeedbackSubmission('low', 2);
  
  console.log('\n=====================================');
  console.log('✨ Tests completed!');
  console.log('\nTo verify Klaviyo events:');
  console.log('1. Check server console logs for Klaviyo event status');
  console.log('2. Log into your Klaviyo dashboard');
  console.log('3. Go to Analytics > Metrics');
  console.log('4. Look for "Send feedback" events');
  console.log('5. Check the event properties to see the feedback details');
}

// Run tests
runTests().catch(console.error);

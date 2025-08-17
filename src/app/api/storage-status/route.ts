import { NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/feedbackService';

export async function GET() {
  try {
    const environment = process.env.NODE_ENV;
    const hasMongoUri = !!process.env.MONGODB_URI;
    const forceFileStorage = process.env.FORCE_FILE_STORAGE === 'true';
    
    // Determine current storage mode
    let storageMode = 'unknown';
    let storageDetails = '';
    
    if (environment === 'development' || forceFileStorage) {
      storageMode = 'file';
      storageDetails = 'Using file storage (data/feedback.json)';
    } else if (environment === 'production' && hasMongoUri) {
      storageMode = 'mongodb';
      storageDetails = 'Using MongoDB Atlas (trustpilot database)';
    } else {
      storageMode = 'file';
      storageDetails = 'Using file storage (MongoDB not configured)';
    }
    
    // Test current storage by getting feedback count
    let feedbackCount = 0;
    let storageTest = 'unknown';
    
    try {
      const result = await FeedbackService.getAllFeedback(1, 1); // Get just 1 item to test storage
      feedbackCount = result.total; // Use the total count from pagination
      storageTest = 'success';
    } catch (error) {
      storageTest = 'failed';
      console.error('Storage test failed:', error);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        environment,
        storageMode,
        storageDetails,
        hasMongoUri,
        forceFileStorage,
        feedbackCount,
        storageTest,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

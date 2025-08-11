import { NextResponse } from 'next/server';
import { getFeedbacksCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Test the connection by trying to get the collection
    const collection = await getFeedbacksCollection();
    
    // Test a simple operation
    const count = await collection.countDocuments();
    
    console.log('✅ MongoDB connection successful!');
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      data: {
        database: 'trustpilot',
        collection: 'feedbacks',
        documentCount: count,
        environment: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/feedbackService';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sample data can only be added in development mode' },
        { status: 403 }
      );
    }

    await FeedbackService.addSampleData();

    return NextResponse.json({
      success: true,
      message: 'Sample feedback data added successfully'
    });

  } catch (error) {
    console.error('Error adding sample data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sample data can only be cleared in development mode' },
        { status: 403 }
      );
    }

    await FeedbackService.clearAllFeedback();

    return NextResponse.json({
      success: true,
      message: 'All feedback data cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing feedback data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

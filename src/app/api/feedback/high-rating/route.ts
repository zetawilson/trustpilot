import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/feedbackService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, rating, feedback, name } = body;

    // Validate required fields
    if (!email || !rating || !feedback) {
      return NextResponse.json(
        { error: 'Email, rating, and feedback are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 4 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be 4 or 5 for high-rating feedback' },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save feedback to MongoDB
    const savedFeedback = await FeedbackService.createFeedback({
      email,
      rating,
      feedback,
      name,
      type: 'high-rating',
      ipAddress,
      userAgent
    });

    console.log('High-rating feedback saved to MongoDB:', {
      id: savedFeedback._id,
      email,
      rating,
      type: 'high-rating',
      timestamp: savedFeedback.timestamp
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: savedFeedback._id,
        email,
        rating,
        feedback,
        name: name || 'Anonymous',
        timestamp: savedFeedback.timestamp
      }
    });

  } catch (error) {
    console.error('High-rating feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

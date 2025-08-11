import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/feedbackService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'high-rating' | 'low-rating' | null;
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let feedback;

    if (email) {
      feedback = await FeedbackService.getFeedbackByEmail(email);
    } else if (type) {
      feedback = await FeedbackService.getFeedbackByType(type);
    } else {
      feedback = await FeedbackService.getAllFeedback();
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeedback = feedback.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        feedback: paginatedFeedback,
        pagination: {
          page,
          limit,
          total: feedback.length,
          totalPages: Math.ceil(feedback.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

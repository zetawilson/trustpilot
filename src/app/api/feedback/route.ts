import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/feedbackService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'high-rating' | 'low-rating' | null;
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (email) {
      // Email-based search doesn't have pagination yet, return all
      const feedback = await FeedbackService.getFeedbackByEmail(email);
      return NextResponse.json({
        success: true,
        data: {
          feedback,
          total: feedback.length,
          page: 1,
          pageSize: feedback.length,
          totalPages: 1
        }
      });
    } else {
      // Use paginated method
      const result = await FeedbackService.getAllFeedback(page, pageSize, type || undefined);
      return NextResponse.json({
        success: true,
        data: result
      });
    }

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: ids array required' },
        { status: 400 }
      );
    }

    let deletedCount;
    if (ids.length === 1) {
      const success = await FeedbackService.deleteFeedback(ids[0]);
      deletedCount = success ? 1 : 0;
    } else {
      deletedCount = await FeedbackService.deleteMultipleFeedback(ids);
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        message: `Successfully deleted ${deletedCount} feedback item(s)`
      }
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
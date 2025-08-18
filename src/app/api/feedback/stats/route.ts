import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/feedbackService';

export async function GET(request: NextRequest) {
  try {
    const [feedbackStats, invitationStats] = await Promise.all([
      FeedbackService.getFeedbackStats(),
      FeedbackService.getInvitationStats()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...feedbackStats,
        invitationStats
      }
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

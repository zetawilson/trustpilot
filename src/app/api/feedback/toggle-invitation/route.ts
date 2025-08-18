import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FeedbackService } from '@/lib/feedbackService';
import { AuthService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const { feedbackId } = await request.json();
    console.log('Toggle invitation request for feedbackId:', feedbackId);

    // Validate input
    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // Get auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify current user
    const user = await AuthService.getUserFromToken(authToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    console.log('User ID for toggle:', user._id);

    // Toggle invitation
    const success = await FeedbackService.toggleInvitation(feedbackId, user._id!);
    console.log('Toggle result:', success);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to toggle invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation toggled successfully'
    });

  } catch (error) {
    console.error('Error toggling invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

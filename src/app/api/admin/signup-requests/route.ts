import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

// Get all signup requests
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is super user
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await AuthService.getUserById(authToken);
    if (!user || !user.isSuperUser) {
      return NextResponse.json(
        { message: 'Access denied. Super user privileges required.' },
        { status: 403 }
      );
    }

    const signupRequests = await AuthService.getAllSignupRequests();

    return NextResponse.json({
      success: true,
      data: signupRequests
    });

  } catch (error) {
    console.error('Get signup requests error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve signup request
export async function POST(request: NextRequest) {
  try {
    const { requestId, action } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { message: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Check if user is authenticated and is super user
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await AuthService.getUserById(authToken);
    if (!user || !user.isSuperUser) {
      return NextResponse.json(
        { message: 'Access denied. Super user privileges required.' },
        { status: 403 }
      );
    }

    if (action === 'approve') {
      await AuthService.approveSignupRequest(requestId, user._id!);
      return NextResponse.json({
        success: true,
        message: 'Signup request approved successfully'
      });
    } else {
      await AuthService.rejectSignupRequest(requestId, user._id!);
      return NextResponse.json({
        success: true,
        message: 'Signup request rejected successfully'
      });
    }

  } catch (error) {
    console.error('Signup request action error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

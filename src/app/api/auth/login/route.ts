import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Login user
    const user = await AuthService.loginUser(email, password);

    // Create session (in production, use proper session management)
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isSuperUser: user.isSuperUser,
        isApproved: user.isApproved,
        isActive: user.isActive,
      }
    });

    // Set session cookie (simple implementation)
    response.cookies.set('auth-token', user._id!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

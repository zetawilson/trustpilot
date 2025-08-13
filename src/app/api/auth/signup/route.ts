import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    console.log('signup route');
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Register user
    const signupRequest = await AuthService.registerUser(email, password, name);

    return NextResponse.json({
      success: true,
      message: 'Signup request submitted successfully. Please wait for admin approval.',
      data: {
        email: signupRequest.email,
        name: signupRequest.name,
        status: signupRequest.status,
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
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

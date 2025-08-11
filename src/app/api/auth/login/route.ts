import { NextRequest, NextResponse } from 'next/server';
import { emailValidationService } from '@/lib/emailValidation';

// Mock user database - in real app, this would be a database
const mockUsers = [
  {
    id: 1,
    email: 'phillipawilson83@gmail.com',
    password: '123', // In real app, this would be hashed
    name: 'Phillip Wilson'
  },
  {
    id: 2,
    email: 'admin@trust.com',
    password: 'admin123',
    name: 'Admin User'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 401 }
      );
    }

    // Check password (in real app, compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Success - return user data (without password) and set auth cookie
    const { password: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    });

    // Set authentication cookie
    response.cookies.set('auth-token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

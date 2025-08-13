import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function GET() {
  try {
    // Initialize super user
    await AuthService.initializeSuperUser();

    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
      data: {
        superUserEmail: process.env.SUPER_USER_EMAIL || 'Not configured',
        superUserPassword: process.env.SUPER_USER_PASSWORD ? '***' : 'Not configured',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Initialization error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

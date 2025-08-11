import { NextRequest, NextResponse } from 'next/server';
import { emailValidationService } from '@/lib/emailValidation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic format validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          isValid: false,
          reason: 'Invalid email format',
          provider: 'Regex Validation'
        },
        { status: 200 }
      );
    }

    // Advanced validation using third-party API
    try {
      const validationResult = await emailValidationService.validateEmail(email);
      
      return NextResponse.json({
        isValid: validationResult.isValid,
        reason: validationResult.reason,
        provider: validationResult.provider,
        details: validationResult.details,
        timestamp: new Date().toISOString()
      });

    } catch (validationError) {
      console.error('Email validation service error:', validationError);
      
      // Return basic validation result if service fails
      return NextResponse.json({
        isValid: true,
        reason: 'Advanced validation unavailable, using basic format check',
        provider: 'Regex Fallback (APIs unavailable)',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Email validation endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET requests for simple validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          isValid: false,
          reason: 'Invalid email format',
          provider: 'Regex Validation'
        },
        { status: 200 }
      );
    }

    // Advanced validation
    try {
      const validationResult = await emailValidationService.validateEmail(email);
      
      return NextResponse.json({
        isValid: validationResult.isValid,
        reason: validationResult.reason,
        provider: validationResult.provider,
        details: validationResult.details,
        timestamp: new Date().toISOString()
      });

    } catch (validationError) {
      console.error('Email validation service error:', validationError);
      
      return NextResponse.json({
        isValid: true,
        reason: 'Advanced validation unavailable, using basic format check',
        provider: 'Regex Fallback (APIs unavailable)',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Email validation endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

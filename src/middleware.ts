import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated (has auth-token cookie)
  const isAuthenticated = request.cookies.has('auth-token');
  
  console.log(`Middleware: ${pathname} - Auth: ${isAuthenticated}`);
  
  // Public feedback pages - no authentication required
  if (pathname.startsWith('/high-rating') || pathname.startsWith('/low-rating')) {
    return NextResponse.next();
  }
  
  // Protected routes - redirect to login if not authenticated
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    console.log(`Redirecting ${pathname} to login - not authenticated`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is authenticated and tries to access login page, redirect to dashboard
  if (pathname === '/' && isAuthenticated) {
    console.log(`Redirecting ${pathname} to dashboard - already authenticated`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

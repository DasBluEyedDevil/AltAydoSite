import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './utils/supabase/middleware';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/userprofile',
  '/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the pathname is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const { supabase, supabaseResponse } = createClient(request);
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, redirect to login
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // User is authenticated, allow the request
    return supabaseResponse;
  }
  
  // Not a protected route, continue as normal
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes (/api/*)
    // - Static files (_next/static/*)
    // - Static files in the public directory (favicon.ico, etc)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
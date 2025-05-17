import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient, isAuthenticated } from './utils/amplify/middleware';

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
    // Create Amplify client with the request context
    const { amplifyResponse } = createClient(request);

    try {
      // Check if the user is authenticated
      const isUserAuthenticated = await isAuthenticated(request);

      // If not authenticated, redirect to login
      if (!isUserAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
        return NextResponse.redirect(url);
      }

      // User is authenticated, allow the request
      console.log("User authenticated, allowing access to protected route");
      return amplifyResponse;
    } catch (error) {
      console.error("Error in authentication middleware:", error);
      // On error, redirect to login as a fallback
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      url.searchParams.set('error', 'AuthError');
      return NextResponse.redirect(url);
    }
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

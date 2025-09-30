import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
    try {
      // Get the session token using NextAuth
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If not authenticated, redirect to login
      if (!token) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("User not authenticated, redirecting to login");
        }
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
        return NextResponse.redirect(url);
      }

      // User is authenticated, allow the request
      if (process.env.NODE_ENV !== 'production') {
        console.log("User authenticated, allowing access to protected route");
      }
      return NextResponse.next();
    } catch (error) {
      console.error("Error in authentication middleware:", error);
      // On error, redirect to login as a fallback
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      url.search_params.set('error', 'AuthError');
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
    // - Image optimization (_next/image/*)
    // - Static files in the public directory (favicon.ico, images, assets, etc)
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|fonts|.*\.png|.*\.jpg|.*\.jpeg|.*\.gif|.*\.svg|.*\.webp|.*\.ico|.*\.woff|.*\.woff2|.*\.ttf|.*\.otf).*)',
  ],
};

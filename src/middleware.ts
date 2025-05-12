import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the token using the same secret from the NextAuth configuration
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "c9c3fa66d0c46cfa96ef9b3dfbcb2f30b62cee09f33c9f16a1cc39993a7a1984"
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  
  const isProtectedPage = 
    request.nextUrl.pathname.startsWith('/dashboard') || 
    request.nextUrl.pathname.startsWith('/userprofile') || 
    request.nextUrl.pathname.startsWith('/admin');

  // Debug logging (only works in server console)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
    console.log(`[Middleware] isAuth: ${isAuth}, isAuthPage: ${isAuthPage}, isProtectedPage: ${isProtectedPage}`);
    console.log(`[Middleware] Token:`, token ? 'Present' : 'Not present');
  }

  // If trying to access auth pages while already logged in
  if (isAuthPage) {
    if (isAuth) {
      console.log('[Middleware] Already authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If trying to access protected pages while not logged in
  if (isProtectedPage && !isAuth) {
    console.log('[Middleware] Not authenticated, redirecting to login');
    const from = request.nextUrl.pathname;
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/userprofile/:path*', 
    '/admin/:path*', 
    '/login', 
    '/signup'
  ],
}; 
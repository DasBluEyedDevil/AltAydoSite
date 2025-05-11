import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

export async function middleware(req: NextRequest) {
  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Check if the path starts with /dashboard
  if (path.startsWith('/dashboard')) {
    const session = await auth0.getSession();
    
    // If no session exists, redirect to the login page
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/api/auth/login';
      url.searchParams.set('returnTo', path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}; 
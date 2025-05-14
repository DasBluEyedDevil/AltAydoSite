import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define which paths require authentication
const protectedPaths = ['/dashboard', '/userprofile', '/admin'];

// Make sure the secret is set properly for all environments
const getSecretKey = () => {
  const secret = process.env.NEXTAUTH_SECRET || "c9c3fa66d0c46cfa96ef9b3dfbcb2f30b62cee09f33c9f16a1cc39993a7a1984";
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn('Missing NEXTAUTH_SECRET environment variable in middleware. Using fallback secret (not recommended for production)');
  }
  return secret;
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is protected
  const isPathProtected = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  // Extract cookies for debugging
  const cookies = request.cookies.toString();
  console.log(`Middleware inspecting path: ${path}, has auth cookies: ${cookies.includes('next-auth')}, cookie length: ${cookies.length}`);

  if (isPathProtected) {
    const secret = getSecretKey();

    try {
      // Get token with explicit secret
      const token = await getToken({
        req: request,
        secret: secret,
        secureCookie: process.env.NODE_ENV === "production",
      });

      // If no token, redirect to login
      if (!token) {
        // Create URL for redirection with correct base
        const baseUrl = request.nextUrl.origin;
        const url = new URL('/login', baseUrl);
        // Store the original path for potential redirect back after login
        url.searchParams.set('from', path);
        // Use a clean redirect to avoid potential redirect loops
        return NextResponse.redirect(url);
      }

      // Check if token is expired
      const tokenExpiration = token.exp as number | undefined;
      if (tokenExpiration && tokenExpiration < Math.floor(Date.now() / 1000)) {
        const baseUrl = request.nextUrl.origin;
        const url = new URL('/login', baseUrl);
        url.searchParams.set('error', 'token_expired');
        return NextResponse.redirect(url);
      }

      // Token exists and is valid, allow access
      console.log(`Auth token verified for user: ${token.name || 'unknown'}`);
    } catch (error) {
      console.error('Error checking authentication token:', error);
      // If there's an error, redirect to login to be safe
      const baseUrl = request.nextUrl.origin;
      const url = new URL('/login', baseUrl);
      url.searchParams.set('error', 'session_error');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/userprofile/:path*',
    '/admin/:path*',
  ],
}; 

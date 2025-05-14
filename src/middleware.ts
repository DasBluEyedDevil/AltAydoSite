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
  console.log(`Middleware inspecting path: ${path}, has auth cookies: ${cookies.includes('next-auth')}`);
  
  if (isPathProtected) {
    const secret = getSecretKey();
    
    try {
      // Get token with explicit secret
      const token = await getToken({
        req: request,
        secret: secret,
        secureCookie: process.env.NODE_ENV === "production",
      });
      
      // Detailed debug logging
      console.log(`Middleware checking auth for path: ${path}, token exists: ${!!token}`);
      if (token) {
        console.log(`Token found for user: ${token.email || 'unknown'}`);
      }
      
      // If no token, redirect to login
      if (!token) {
        console.log(`No auth token found, redirecting to login from: ${path}`);
        const url = new URL('/login', request.url);
        url.searchParams.set('from', path);
        return NextResponse.redirect(url);
      }
      
      // Token exists, allow access
      console.log(`Auth token verified, allowing access to: ${path}`);
    } catch (error) {
      console.error('Error checking authentication token:', error);
      // If there's an error, redirect to login to be safe
      const url = new URL('/login', request.url);
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
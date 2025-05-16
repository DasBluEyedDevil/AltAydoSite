import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

// Define which paths require authentication
const protectedPaths = ['/dashboard', '/userprofile', '/admin'];

// This function handles authentication and route protection
export async function middleware(request: NextRequest) {
  // Create a Supabase client for the middleware
  const res = createClient(request);

  // Check if the path is protected
  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(prefix => path.startsWith(prefix));

  // If the path is not protected, just return the response
  if (!isProtectedPath) {
    return res;
  }

  // For protected paths, we need to check if the user is authenticated
  // This will be handled by Supabase Auth in the page components
  // If authentication fails, the page component will redirect to login

  return res;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes, and next.js specific paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 

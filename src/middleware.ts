import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

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
  return createClient(request);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes, and next.js specific paths
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}; 

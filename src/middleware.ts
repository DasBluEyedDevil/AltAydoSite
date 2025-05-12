import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: "c9c3fa66d0c46cfa96ef9b3dfbcb2f30b62cee09f33c9f16a1cc39993a7a1984"
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuth && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}; 
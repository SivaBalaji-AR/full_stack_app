import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // We use 'jose' because 'jsonwebtoken' doesn't work in Edge Middleware

// Define paths that require authentication
const protectedPaths = ['/dashboard', '/admin', '/worker', '/profile', '/shop-admin'];

// Define paths that are public (redirect logged-in users away from these)
const publicPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // 1. Check if the current path is protected
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  let isValidToken = false;
  let userRole = null;

  if (token) {
    try {
      // Verify token securely on the server side
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      isValidToken = true;
      userRole = payload.role as string;
    } catch (error) {
      // Token is invalid or expired
      isValidToken = false;
    }
  }

  // 2. Redirect Logic

  // Scenario A: Unauthenticated user tries to access protected route
  if (isProtected && !isValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Scenario B: Authenticated user tries to access public route (Login/Signup)
  if (isPublic && isValidToken) {
    // Redirect to their specific dashboard based on role
    if (userRole === 'admin') return NextResponse.redirect(new URL('/profile', request.url));
    if (userRole === 'worker') return NextResponse.redirect(new URL('/profile', request.url));
    if (userRole === 'shop_admin') return NextResponse.redirect(new URL('/profile', request.url));
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Scenario C: Role-based protection (Optional but recommended)
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/profile', request.url)); // Unauthorized
  }

  if (pathname.startsWith('/shop-admin') && userRole !== 'shop_admin') {
    return NextResponse.redirect(new URL('/profile', request.url)); // Unauthorized
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
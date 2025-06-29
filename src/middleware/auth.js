import { NextResponse } from 'next/server';

/**
 * Authentication middleware
 * Handles route protection and authentication checks
 */
export function authMiddleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ];
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/notes',
    '/profile',
    '/settings'
  ];
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For protected routes, we'll add a header to indicate auth is required
  // The actual auth check will be done client-side with AuthGuard
  if (isProtectedRoute) {
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'true');
    return response;
  }
  
  // For public routes, add header to indicate no auth required
  if (isPublicRoute) {
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'false');
    return response;
  }
  
  return NextResponse.next();
}

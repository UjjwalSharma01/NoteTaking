import { NextResponse } from 'next/server';
import { 
  apiMiddleware, 
  authPageMiddleware, 
  publicPageMiddleware,
  rateLimitMiddleware 
} from './src/middleware/index.js';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = rateLimitMiddleware(request);
    if (rateLimitResult && rateLimitResult.status === 429) {
      return rateLimitResult;
    }
    return apiMiddleware(request);
  }
  
  // Apply auth middleware to protected pages
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/notes') || 
      pathname.startsWith('/profile') || 
      pathname.startsWith('/settings')) {
    return authPageMiddleware(request);
  }
  
  // Apply public middleware to other pages
  return publicPageMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

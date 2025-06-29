import { NextResponse } from 'next/server';

/**
 * CORS middleware
 * Handles Cross-Origin Resource Sharing
 */
export function corsMiddleware(request) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }
  
  const response = NextResponse.next();
  
  // Add CORS headers to response
  response.headers.set('Access-Control-Allow-Origin', 
    process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : '*'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

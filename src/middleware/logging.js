import { NextResponse } from 'next/server';

/**
 * Logging middleware
 * Logs requests for monitoring and debugging
 */
export function loggingMiddleware(request) {
  const { method, url } = request;
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  // Log the request (in production, send to logging service)
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  
  const response = NextResponse.next();
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  return response;
}

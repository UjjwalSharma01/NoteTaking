import { NextResponse } from 'next/server';
import { middlewareConfig } from './config.js';

/**
 * Rate limiting middleware
 * Simple in-memory rate limiting (for production, use Redis or similar)
 */

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map();

export function rateLimitMiddleware(request, customLimits = {}) {
  const { pathname } = request.nextUrl;
  const config = middlewareConfig.rateLimit;
  
  // Determine rate limits based on route type
  let maxRequests = config.maxRequests;
  if (pathname.startsWith('/api/auth/')) {
    maxRequests = config.authMaxRequests;
  } else if (pathname.startsWith('/api/')) {
    maxRequests = config.apiMaxRequests;
  }
  
  // Apply custom limits if provided
  if (customLimits.maxRequests) {
    maxRequests = customLimits.maxRequests;
  }
  
  const windowSize = customLimits.windowSize || config.windowSize;
  // Get client IP
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  const now = Date.now();
  const windowStart = now - windowSize;
  
  // Clean old entries
  for (const [key, data] of requestCounts.entries()) {
    if (data.firstRequest < windowStart) {
      requestCounts.delete(key);
    }
  }
  
  // Get or create request data for this IP
  let requestData = requestCounts.get(ip);
  if (!requestData) {
    requestData = {
      count: 0,
      firstRequest: now
    };
    requestCounts.set(ip, requestData);
  }
  
  // Reset if window has passed
  if (requestData.firstRequest < windowStart) {
    requestData.count = 0;
    requestData.firstRequest = now;
  }
  
  // Increment request count
  requestData.count++;
  
  // Check if rate limit exceeded
  if (requestData.count > maxRequests) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Maximum ${maxRequests} requests per ${Math.floor(windowSize / 60000)} minutes.`
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(windowSize / 1000).toString()
        }
      }
    );
  }
  
  // Add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (maxRequests - requestData.count).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil((requestData.firstRequest + windowSize) / 1000).toString());
  
  return response;
}

import { NextResponse } from 'next/server';
import { middlewareConfig } from './config.js';

/**
 * Security middleware
 * Handles security headers, CSP, and other security measures
 */
export function securityMiddleware(request) {
  const response = NextResponse.next();
  
  // Build Content Security Policy from config
  const cspDirectives = [];
  const { csp } = middlewareConfig.security;
  
  for (const [directive, sources] of Object.entries(csp)) {
    const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
    cspDirectives.push(`${directiveName} ${sources.join(' ')}`);
  }
  
  const cspHeader = cspDirectives.join('; ');
  
  // Security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

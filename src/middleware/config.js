/**
 * Middleware configuration
 * Centralized configuration for all middleware settings
 */

export const middlewareConfig = {
  // Rate limiting configuration
  rateLimit: {
    windowSize: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Max requests per window
    apiMaxRequests: 50, // Stricter limit for API routes
    authMaxRequests: 10, // Even stricter for auth routes
  },
  
  // Security configuration
  security: {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-eval'", 
        "'unsafe-inline'", 
        "https://www.googletagmanager.com"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:"
      ],
      connectSrc: [
        "'self'", 
        "https://*.firebaseapp.com", 
        "https://*.googleapis.com", 
        "wss://*.firebaseapp.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  
  // Authentication configuration
  auth: {
    publicRoutes: [
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ],
    protectedRoutes: [
      '/dashboard',
      '/notes',
      '/profile',
      '/settings'
    ],
    redirectAfterLogin: '/dashboard',
    redirectAfterLogout: '/'
  },
  
  // CORS configuration
  cors: {
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  },
  
  // Logging configuration
  logging: {
    enabled: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    logRequests: true,
    logResponses: false,
    sensitiveHeaders: ['authorization', 'cookie', 'x-api-key']
  }
};

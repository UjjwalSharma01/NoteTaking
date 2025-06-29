import { authMiddleware } from './auth.js';
import { securityMiddleware } from './security.js';
import { rateLimitMiddleware } from './rateLimit.js';
import { loggingMiddleware } from './logging.js';
import { corsMiddleware } from './cors.js';

/**
 * Middleware chain composer
 * Allows combining multiple middleware functions
 */
export function chain(...middlewares) {
  return (request) => {
    let response;
    
    for (const middleware of middlewares) {
      response = middleware(request);
      
      // If middleware returns a response (like rate limiting), stop the chain
      if (response && response.status !== undefined) {
        return response;
      }
    }
    
    return response;
  };
}

/**
 * Apply middleware conditionally based on path patterns
 */
export function conditionalMiddleware(condition, middleware) {
  return (request) => {
    if (condition(request)) {
      return middleware(request);
    }
    return null; // Continue to next middleware
  };
}

/**
 * Common middleware combinations
 */
export const apiMiddleware = chain(
  loggingMiddleware,
  corsMiddleware,
  securityMiddleware,
  rateLimitMiddleware
);

export const authPageMiddleware = chain(
  loggingMiddleware,
  securityMiddleware,
  authMiddleware
);

export const publicPageMiddleware = chain(
  loggingMiddleware,
  securityMiddleware
);

// Export individual middleware for custom combinations
export {
  authMiddleware,
  securityMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  corsMiddleware
};

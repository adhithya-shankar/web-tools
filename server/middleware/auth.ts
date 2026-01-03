import type { Request, Response, NextFunction } from 'express';

/**
 * Example authentication middleware
 * In a real app, this would validate JWT tokens, sessions, etc.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  const token = authHeader.substring(7);

  // TODO: Validate token (JWT verification, session lookup, etc.)
  // For now, just check if a token exists
  if (!token) {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }

  // Attach user info to request (would come from token validation)
  // req.user = decodedToken.user;

  next();
}

/**
 * Optional auth - doesn't fail if no token, but attaches user if present
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // TODO: Validate and attach user if valid
    console.log('Token present:', token.substring(0, 10) + '...');
  }

  next();
}


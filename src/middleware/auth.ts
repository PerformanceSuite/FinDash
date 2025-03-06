import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';
import { User } from '../models/User';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Get user from token
    const user = await authService.getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    // Attach user to request object
    req.user = user;
    
    // Continue to next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Role-based authorization middleware
 * Requires authenticate middleware to be used first
 */
export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists on request (set by authenticate middleware)
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Convert roles to array if string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      // User has required role, continue
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

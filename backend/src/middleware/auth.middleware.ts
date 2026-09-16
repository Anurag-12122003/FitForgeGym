import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Role } from '../generated/prisma/client.js';

export interface AuthenticatedUserPayload extends JwtPayload {
  id: string;
  email: string;
  role: Role;

}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  console.log("token", token)

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as AuthenticatedUserPayload;
    req.user = decoded;
    console.log(typeof decoded)
    console.log("decoded", decoded)
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
};

export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      return;
    }
    next();
  };
};
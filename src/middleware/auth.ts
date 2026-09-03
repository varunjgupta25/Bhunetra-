import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

import { prisma } from '../db/prisma';

export type Role = 'CUSTOMER' | 'ENTREPRENEUR' | 'LOGISTICS' | 'ADMIN';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: Role;
      name: string;
    };

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'Your session token has expired or is invalid. Please switch role or log in again.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

export const verifyOwnershipOrAdmin = (resourceOwnerId: string, reqUser: AuthRequest['user']) => {
  if (!reqUser) return false;
  if (reqUser.role === 'ADMIN') return true;
  return reqUser.id === resourceOwnerId;
};

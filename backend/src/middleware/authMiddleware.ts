import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: number;
    email: string;
    admin: boolean;
}

// Augment the Express Request interface
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.admin) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

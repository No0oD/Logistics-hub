import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../modules/users/entities/user.entity';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ status: 403, message: 'Forbidden' });
      return;
    }

    next();
  };
}
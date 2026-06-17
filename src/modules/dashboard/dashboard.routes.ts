import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { requireRole } from '../../shared/middleware/require-role.middleware';
import { UserRole } from '../users/entities/user.entity';

export function dashboardRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new DashboardController(em);

  const isDispatcherOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER);
  const isAdmin = requireRole(UserRole.ADMIN);

  router.use(authMiddleware);

  router.get('/stats', isDispatcherOrAbove, controller.stats);
  router.get('/shipments-by-status', isDispatcherOrAbove, controller.shipmentsByStatus);
  router.get('/warehouse-load', isAdmin, controller.warehouseLoad);

  return router;
}
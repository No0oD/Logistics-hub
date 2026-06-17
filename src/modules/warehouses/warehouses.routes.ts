import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { WarehousesController } from './warehouses.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { requireRole } from '../../shared/middleware/require-role.middleware';
import { UserRole } from '../users/entities/user.entity';

export function warehousesRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new WarehousesController(em);

  const isAdmin = requireRole(UserRole.ADMIN);
  const isDispatcherOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER);

  router.use(authMiddleware);

  router.get('/', isDispatcherOrAbove, controller.findAll);
  router.post('/', isAdmin, controller.create);
  router.get('/:id', isDispatcherOrAbove, controller.findOne);
  router.patch('/:id', isAdmin, controller.update);
  router.delete('/:id', isAdmin, controller.remove);
  router.get('/:id/shipments', isDispatcherOrAbove, controller.getShipments);

  return router;
}
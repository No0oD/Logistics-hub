import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { ShipmentsController } from './shipments.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { requireRole } from '../../shared/middleware/require-role.middleware';
import { UserRole } from '../users/entities/user.entity';

export function shipmentsRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new ShipmentsController(em);

  const isDispatcher = requireRole(UserRole.ADMIN, UserRole.DISPATCHER);
  const isAuthenticated = requireRole(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER, UserRole.VIEWER);
  const isDriverOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER);

  // Публічний ендпоінт — без authMiddleware
  router.get('/track/:trackingCode', controller.track);

  // Всі інші — захищені
  router.use(authMiddleware);

  router.get('/', isDispatcher, controller.findAll);
  router.post('/', isDispatcher, controller.create);
  router.get('/:id', isAuthenticated, controller.findOne);
  router.patch('/:id', isDispatcher, controller.update);
  router.patch('/:id/status', isDriverOrAbove, controller.changeStatus);
  router.get('/:id/events', isAuthenticated, controller.getEvents);

  return router;
}
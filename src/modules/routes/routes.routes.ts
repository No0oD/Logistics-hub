import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { RoutesController } from './routes.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { requireRole } from '../../shared/middleware/require-role.middleware';
import { UserRole } from '../users/entities/user.entity';

export function routesRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new RoutesController(em);

  const isDispatcher = requireRole(UserRole.ADMIN, UserRole.DISPATCHER);
  const isDispatcherOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER);
  const isDriverOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER);

  router.use(authMiddleware);

  router.get('/', isDispatcherOrAbove, controller.findAll);
  router.post('/', isDispatcher, controller.create);
  router.get('/:id', isDriverOrAbove, controller.findOne);
  router.patch('/:id', isDispatcher, controller.update);
  router.patch('/:id/status', isDriverOrAbove, controller.changeStatus);

  return router;
}
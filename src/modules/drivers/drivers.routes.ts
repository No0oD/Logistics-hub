import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { DriversController } from './drivers.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { requireRole } from '../../shared/middleware/require-role.middleware';
import { UserRole } from '../users/entities/user.entity';
import { RoutesController } from '../routes/routes.controller';


export function driversRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new DriversController(em);

  const isAdmin = requireRole(UserRole.ADMIN);
  const isDispatcherOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER);
  const isDriverOrAbove = requireRole(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER);

  const routesController = new RoutesController(em);


  router.use(authMiddleware);

  router.get('/available', isDispatcherOrAbove, controller.findAvailable);

  router.get('/', isDispatcherOrAbove, controller.findAll);
  router.post('/', isAdmin, controller.create);
  router.get('/:id', isDispatcherOrAbove, controller.findOne);
  router.patch('/:id', isAdmin, controller.update);
  router.patch('/:id/status', isDriverOrAbove, controller.changeStatus);
  router.delete('/:id', isAdmin, controller.remove);
  router.get('/:driverId/routes', isDispatcherOrAbove, routesController.findByDriver);


  return router;
}
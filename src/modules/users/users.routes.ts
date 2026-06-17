import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { requireRole } from '../../shared/middleware/require-role.middleware';
import { UserRole } from './entities/user.entity';

export function usersRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new UsersController(em);

  router.use(authMiddleware);
  router.use(requireRole(UserRole.ADMIN));

  router.get('/', controller.findAll);
  router.get('/:id', controller.findOne);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  router.patch('/:id/role', controller.changeRole);

  return router;
}
import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export function authRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new AuthController(em);

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);
  router.get('/me', authMiddleware, controller.me);

  return router;
}
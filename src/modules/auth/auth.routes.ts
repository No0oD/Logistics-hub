import { Router } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export function authRouter(em: EntityManager): Router {
  const router = Router();
  const controller = new AuthController(em);

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Реєстрація нового користувача
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: Успішна реєстрація
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Помилка валідації
   *       409:
   *         description: Email вже використовується
   */
  router.post('/register', controller.register);

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Вхід в систему
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Успішний вхід
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Невірний email або пароль
   */
  router.post('/login', controller.login);

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Оновлення access токена
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Нова пара токенів
   *       401:
   *         description: Невалідний refresh токен
   */
  router.post('/refresh', controller.refresh);

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Вихід з системи
   *     responses:
   *       200:
   *         description: Успішний вихід
   */
  router.post('/logout', controller.logout);

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Поточний користувач
   *     responses:
   *       200:
   *         description: Дані поточного користувача
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Не авторизований
   */
  router.get('/me', authMiddleware, controller.me);

  return router;
}
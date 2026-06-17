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

  /**
   * @swagger
   * /api/shipments/track/{trackingCode}:
   *   get:
   *     tags: [Shipments]
   *     summary: Публічне відстеження вантажу (без авторизації)
   *     security: []
   *     parameters:
   *       - in: path
   *         name: trackingCode
   *         required: true
   *         schema:
   *           type: string
   *         example: LH-A1B2C3-01
   *     responses:
   *       200:
   *         description: Дані відстеження
   *       404:
   *         description: Вантаж не знайдено
   */
  router.get('/track/:trackingCode', controller.track);

  router.use(authMiddleware);

  /**
   * @swagger
   * /api/shipments:
   *   get:
   *     tags: [Shipments]
   *     summary: Список вантажів
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [created, at_warehouse, in_transit, delivered, returned, lost]
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, normal, high, express]
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: Список вантажів з пагінацією
   */
  router.get('/', isDispatcher, controller.findAll);

  /**
   * @swagger
   * /api/shipments:
   *   post:
   *     tags: [Shipments]
   *     summary: Створити вантаж
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateShipmentRequest'
   *     responses:
   *       201:
   *         description: Вантаж створено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Shipment'
   */
  router.post('/', isDispatcher, controller.create);

  /**
   * @swagger
   * /api/shipments/{id}:
   *   get:
   *     tags: [Shipments]
   *     summary: Деталі вантажу
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Деталі вантажу
   *       404:
   *         description: Не знайдено
   */
  router.get('/:id', isAuthenticated, controller.findOne);

  /**
   * @swagger
   * /api/shipments/{id}:
   *   patch:
   *     tags: [Shipments]
   *     summary: Оновити вантаж
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               description:
   *                 type: string
   *               weight:
   *                 type: number
   *               priority:
   *                 type: string
   *     responses:
   *       200:
   *         description: Оновлено
   */
  router.patch('/:id', isDispatcher, controller.update);

  /**
   * @swagger
   * /api/shipments/{id}/status:
   *   patch:
   *     tags: [Shipments]
   *     summary: Змінити статус вантажу (стейт-машина)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ChangeStatusRequest'
   *     responses:
   *       200:
   *         description: Статус змінено
   *       400:
   *         description: Недозволений перехід
   *       403:
   *         description: Немає прав для цього переходу
   */
  router.patch('/:id/status', isDriverOrAbove, controller.changeStatus);

  /**
   * @swagger
   * /api/shipments/{id}/events:
   *   get:
   *     tags: [Shipments]
   *     summary: Історія подій вантажу
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Список подій
   */
  router.get('/:id/events', isAuthenticated, controller.getEvents);

  return router;
}
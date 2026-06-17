import 'reflect-metadata';
import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { warehousesRouter } from './modules/warehouses/warehouses.routes';
import { driversRouter } from './modules/drivers/drivers.routes';
import { routesRouter } from './modules/routes/routes.routes';
import { shipmentsRouter } from './modules/shipments/shipments.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';



export let orm: MikroORM;

const app = express();

app.use(express.json());

export async function initApp() {
  orm = await MikroORM.init(config);

  app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter(orm.em));
  app.use('/api/users', usersRouter(orm.em)); 
  app.use('/api/warehouses', warehousesRouter(orm.em));
  app.use('/api/drivers', driversRouter(orm.em));
  app.use('/api/routes', routesRouter(orm.em));
  app.use('/api/shipments', shipmentsRouter(orm.em));
  app.use('/api/dashboard', dashboardRouter(orm.em));

  return app;
}
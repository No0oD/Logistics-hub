import 'reflect-metadata';
import express from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import { requestContextMiddleware } from './shared/middleware/request-context.middleware';

export let orm: MikroORM;

const app = express();

app.use(express.json());

export async function initApp() {
  orm = await MikroORM.init(config);
  app.use(requestContextMiddleware);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
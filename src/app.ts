import 'reflect-metadata';
import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import { authRouter } from './modules/auth/auth.routes';

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

  return app;
}
import { defineConfig } from '@mikro-orm/mysql';
import { User } from './modules/users/entities/user.entity';

export default defineConfig({
  entities: [User],
  dbName: process.env.DB_NAME!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  debug: true,
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
  },
});
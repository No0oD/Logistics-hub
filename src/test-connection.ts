import 'reflect-metadata';
import 'dotenv/config';
import { MikroORM } from '@mikro-orm/mysql';
import config from './mikro-orm.config';

async function main() {
  const orm = await MikroORM.init(config);
  console.log('✅ Connected to MySQL!');
  await orm.close();
}

main().catch((err) => {
  console.error('❌ Connection failed:', err);
});
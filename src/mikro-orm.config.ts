import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { User } from './modules/users/entities/user.entity';
import { Warehouse } from './modules/warehouses/entities/warehouse.entity';
import { Driver } from './modules/drivers/entities/driver.entity';
import { Shipment } from './modules/shipments/entities/shipment.entity';
import { ShipmentEvent } from './modules/shipments/entities/shipment-event.entity';
import { Route } from './modules/routes/entities/route.entity';

export default defineConfig({
  entities: [User, Warehouse, Driver, Shipment, ShipmentEvent, Route],
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
  seeder: {
    path: './src/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
});
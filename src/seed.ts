import 'reflect-metadata';
import 'dotenv/config';
import { MikroORM } from '@mikro-orm/mysql';
import bcrypt from 'bcryptjs';
import config from './mikro-orm.config';
import { User, UserRole } from './modules/users/entities/user.entity';
import { Warehouse, WarehouseType, WarehouseStatus } from './modules/warehouses/entities/warehouse.entity';
import { Driver, DriverStatus } from './modules/drivers/entities/driver.entity';
import { Shipment, ShipmentStatus, ShipmentPriority } from './modules/shipments/entities/shipment.entity';
import { ShipmentEvent } from './modules/shipments/entities/shipment-event.entity';
import { Route, RouteStatus } from './modules/routes/entities/route.entity';

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = em.create(User, {
    email: 'admin@logistics.com',
    password: passwordHash,
    firstName: 'Адмін',
    lastName: 'Системний',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dispatcher1 = em.create(User, {
    email: 'dispatcher1@logistics.com',
    password: passwordHash,
    firstName: 'Олена',
    lastName: 'Коваль',
    role: UserRole.DISPATCHER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dispatcher2 = em.create(User, {
    email: 'dispatcher2@logistics.com',
    password: passwordHash,
    firstName: 'Микола',
    lastName: 'Бондар',
    role: UserRole.DISPATCHER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const driverUser1 = em.create(User, {
    email: 'driver1@logistics.com',
    password: passwordHash,
    firstName: 'Василь',
    lastName: 'Петренко',
    role: UserRole.DRIVER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const driverUser2 = em.create(User, {
    email: 'driver2@logistics.com',
    password: passwordHash,
    firstName: 'Іван',
    lastName: 'Шевченко',
    role: UserRole.DRIVER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const driverUser3 = em.create(User, {
    email: 'driver3@logistics.com',
    password: passwordHash,
    firstName: 'Олег',
    lastName: 'Мельник',
    role: UserRole.DRIVER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const viewer = em.create(User, {
    email: 'client@logistics.com',
    password: passwordHash,
    firstName: 'Клієнт',
    lastName: 'Тестовий',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await em.flush();
  console.log('✅ Users created');

  // ── Warehouses ─────────────────────────────────────────────────
  const warehouse1 = em.create(Warehouse, {
    name: 'Київ Центральний',
    address: 'вул. Промислова, 1',
    city: 'Київ',
    capacity: 1000,
    area: 5000,
    type: WarehouseType.DISTRIBUTION_CENTER,
    status: WarehouseStatus.ACTIVE,
    latitude: 50.4501,
    longitude: 30.5234,
    createdAt: new Date(),
  });

  const warehouse2 = em.create(Warehouse, {
    name: 'Львів Захід',
    address: 'вул. Городоцька, 222',
    city: 'Львів',
    capacity: 500,
    area: 2500,
    type: WarehouseType.SORTING_HUB,
    status: WarehouseStatus.ACTIVE,
    latitude: 49.8397,
    longitude: 24.0297,
    createdAt: new Date(),
  });

  const warehouse3 = em.create(Warehouse, {
    name: 'Одеса Порт',
    address: 'вул. Портова, 15',
    city: 'Одеса',
    capacity: 800,
    area: 4000,
    type: WarehouseType.DISTRIBUTION_CENTER,
    status: WarehouseStatus.ACTIVE,
    latitude: 46.4825,
    longitude: 30.7233,
    createdAt: new Date(),
  });

  const warehouse4 = em.create(Warehouse, {
    name: 'Харків Схід',
    address: 'пр. Московський, 100',
    city: 'Харків',
    capacity: 300,
    area: 1500,
    type: WarehouseType.LAST_MILE,
    status: WarehouseStatus.ACTIVE,
    latitude: 49.9935,
    longitude: 36.2304,
    createdAt: new Date(),
  });

  const warehouse5 = em.create(Warehouse, {
    name: 'Дніпро Логістик',
    address: 'вул. Індустріальна, 50',
    city: 'Дніпро',
    capacity: 600,
    area: 3000,
    type: WarehouseType.SORTING_HUB,
    status: WarehouseStatus.MAINTENANCE,
    latitude: 48.4647,
    longitude: 35.0462,
    createdAt: new Date(),
  });

  await em.flush();
  console.log('✅ Warehouses created');

  // ── Drivers ────────────────────────────────────────────────────
  const driver1 = em.create(Driver, {
    user: driverUser1,
    licenseNumber: 'AA123456',
    vehicleType: 'Вантажівка',
    vehiclePlate: 'KA1234AA',
    status: DriverStatus.AVAILABLE,
    createdAt: new Date(),
  });

  const driver2 = em.create(Driver, {
    user: driverUser2,
    licenseNumber: 'BB654321',
    vehicleType: 'Мікроавтобус',
    vehiclePlate: 'LV5678BB',
    status: DriverStatus.AVAILABLE,
    createdAt: new Date(),
  });

  const driver3 = em.create(Driver, {
    user: driverUser3,
    licenseNumber: 'CC789012',
    vehicleType: 'Вантажівка',
    vehiclePlate: 'OD9012CC',
    status: DriverStatus.OFFLINE,
    createdAt: new Date(),

  });

  await em.flush();
  console.log('✅ Drivers created');

  // ── Shipments ──────────────────────────────────────────────────
  const shipment1 = em.create(Shipment, {
    trackingCode: 'LH-A1B2C3-01',
    description: 'Електроніка — ноутбуки (5 шт)',
    weight: 15.5,
    dimensions: '60x40x30 см',
    status: ShipmentStatus.DELIVERED,
    priority: ShipmentPriority.HIGH,
    warehouse: warehouse1,
    sender: dispatcher1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const shipment2 = em.create(Shipment, {
    trackingCode: 'LH-D4E5F6-02',
    description: 'Одяг — зимова колекція',
    weight: 30.0,
    dimensions: '80x60x50 см',
    status: ShipmentStatus.IN_TRANSIT,
    priority: ShipmentPriority.NORMAL,
    warehouse: warehouse2,
    sender: dispatcher1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const shipment3 = em.create(Shipment, {
    trackingCode: 'LH-G7H8I9-03',
    description: 'Запчастини — автомобільні',
    weight: 50.0,
    dimensions: '100x80x60 см',
    status: ShipmentStatus.AT_WAREHOUSE,
    priority: ShipmentPriority.EXPRESS,
    warehouse: warehouse3,
    sender: dispatcher2,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const shipment4 = em.create(Shipment, {
    trackingCode: 'LH-J1K2L3-04',
    description: 'Продукти харчування',
    weight: 100.0,
    dimensions: '120x100x80 см',
    status: ShipmentStatus.CREATED,
    priority: ShipmentPriority.NORMAL,
    warehouse: warehouse1,
    sender: dispatcher2,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const shipment5 = em.create(Shipment, {
    trackingCode: 'LH-M4N5O6-05',
    description: 'Меблі — офісні крісла (10 шт)',
    weight: 200.0,
    dimensions: '150x120x100 см',
    status: ShipmentStatus.RETURNED,
    priority: ShipmentPriority.LOW,
    warehouse: warehouse4,
    sender: dispatcher1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await em.flush();
  console.log('✅ Shipments created');

  // ── Shipment Events ────────────────────────────────────────────
  em.create(ShipmentEvent, {
    shipment: shipment1,
    status: ShipmentStatus.CREATED,
    location: 'Київ',
    comment: 'Вантаж прийнятий до відправки',
    createdBy: dispatcher1,
    createdAt: new Date(),
  });

  em.create(ShipmentEvent, {
    shipment: shipment1,
    status: ShipmentStatus.AT_WAREHOUSE,
    location: 'Склад Київ Центральний',
    comment: 'Вантаж на складі',
    createdBy: dispatcher1,
    createdAt: new Date(),

  });

  em.create(ShipmentEvent, {
    shipment: shipment1,
    status: ShipmentStatus.IN_TRANSIT,
    location: 'Київ → Львів',
    comment: 'Водій Петренко В.',
    createdBy: driverUser1,
    createdAt: new Date(),

  });

  em.create(ShipmentEvent, {
    shipment: shipment1,
    status: ShipmentStatus.DELIVERED,
    location: 'Львів',
    comment: 'Доставлено отримувачу',
    createdBy: driverUser1,
    createdAt: new Date(),

  });

  em.create(ShipmentEvent, {
    shipment: shipment2,
    status: ShipmentStatus.CREATED,
    location: 'Львів',
    comment: 'Вантаж прийнятий',
    createdBy: dispatcher1,
    createdAt: new Date(),

  });

  em.create(ShipmentEvent, {
    shipment: shipment2,
    status: ShipmentStatus.IN_TRANSIT,
    location: 'Львів → Одеса',
    comment: 'В дорозі',
    createdBy: driverUser2,
    createdAt: new Date(),
  });

  await em.flush();
  console.log('✅ Shipment events created');

  // ── Routes ─────────────────────────────────────────────────────
  em.create(Route, {
    driver: driver1,
    shipment: shipment2,
    origin: warehouse2,
    destination: warehouse3,
    status: RouteStatus.IN_PROGRESS,
    estimatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    startedAt: new Date(),
    distance: 850.5,
  });

  em.create(Route, {
    driver: driver2,
    shipment: shipment3,
    origin: warehouse3,
    destination: warehouse4,
    status: RouteStatus.PLANNED,
    estimatedAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    distance: 1100.0,
  });

  await em.flush();
  console.log('✅ Routes created');

  await orm.close();
  console.log('\n🎉 Seed completed successfully!');
  console.log('\nТестові акаунти (пароль: password123):');
  console.log('  admin@logistics.com        — Admin');
  console.log('  dispatcher1@logistics.com  — Dispatcher');
  console.log('  dispatcher2@logistics.com  — Dispatcher');
  console.log('  driver1@logistics.com      — Driver');
  console.log('  driver2@logistics.com      — Driver');
  console.log('  driver3@logistics.com      — Driver');
  console.log('  client@logistics.com       — Viewer');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
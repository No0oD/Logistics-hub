import { EntityManager } from '@mikro-orm/mysql';
import { Shipment, ShipmentStatus, ShipmentPriority } from './entities/shipment.entity';
import { ShipmentEvent } from './entities/shipment-event.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateShipmentDto, UpdateShipmentDto, ChangeShipmentStatusDto } from './dto/shipment.dto';

// Стейт-машина: які переходи дозволені і хто може їх робити
const ALLOWED_TRANSITIONS: Record<ShipmentStatus, { next: ShipmentStatus[]; roles: UserRole[] }> = {
  [ShipmentStatus.CREATED]: {
    next: [ShipmentStatus.AT_WAREHOUSE],
    roles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  [ShipmentStatus.AT_WAREHOUSE]: {
    next: [ShipmentStatus.IN_TRANSIT],
    roles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  [ShipmentStatus.IN_TRANSIT]: {
    next: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED, ShipmentStatus.LOST],
    roles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER],
  },
  [ShipmentStatus.RETURNED]: {
    next: [ShipmentStatus.AT_WAREHOUSE],
    roles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  [ShipmentStatus.DELIVERED]: { next: [], roles: [] },
  [ShipmentStatus.LOST]: { next: [], roles: [] },
};

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `LH-${part1}-${part2}`;
}

export class ShipmentsService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page = 1, limit = 20, filters: { status?: ShipmentStatus; priority?: ShipmentPriority } = {}) {
    const offset = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const [data, total] = await this.em.findAndCount(
      Shipment,
      where,
      {
        limit,
        offset,
        populate: ['warehouse', 'sender'] as const,
        orderBy: { createdAt: 'DESC' },
      }
    );
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const shipment = await this.em.findOne(
      Shipment,
      { id },
      { populate: ['warehouse', 'sender'] as const }
    );
    if (!shipment) throw new Error('NOT_FOUND');
    return shipment;
  }

  async findByTrackingCode(trackingCode: string) {
    const shipment = await this.em.findOne(
      Shipment,
      { trackingCode },
      { populate: ['warehouse'] as const }
    );
    if (!shipment) throw new Error('NOT_FOUND');

    // Для публічного tracking — мінімум інформації
    return {
      trackingCode: shipment.trackingCode,
      status: shipment.status,
      description: shipment.description,
      priority: shipment.priority,
      warehouse: shipment.warehouse
        ? { name: (shipment.warehouse as Warehouse).name, city: (shipment.warehouse as Warehouse).city }
        : null,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  async getEvents(id: number) {
    const shipment = await this.em.findOne(Shipment, { id });
    if (!shipment) throw new Error('NOT_FOUND');

    const events = await this.em.find(
      ShipmentEvent,
      { shipment: { id } },
      {
        populate: ['createdBy'] as const,
        orderBy: { createdAt: 'ASC' },
      }
    );
    return events;
  }

  async create(dto: CreateShipmentDto, senderId: number) {
    const sender = await this.em.findOne(User, { id: senderId });
    if (!sender) throw new Error('USER_NOT_FOUND');

    let warehouse: Warehouse | null = null;
    if (dto.warehouseId) {
      warehouse = await this.em.findOne(Warehouse, { id: dto.warehouseId });
      if (!warehouse) throw new Error('WAREHOUSE_NOT_FOUND');
    }

    const now = new Date();
    const shipment = this.em.create(Shipment, {
      trackingCode: generateTrackingCode(),
      description: dto.description,
      weight: dto.weight,
      dimensions: dto.dimensions,
      priority: dto.priority ?? ShipmentPriority.NORMAL,
      status: ShipmentStatus.CREATED,
      sender,
      warehouse: warehouse ?? undefined,
      createdAt: now,
      updatedAt: now,
    });

    await this.em.flush();

    // Створюємо перший ShipmentEvent
    this.em.create(ShipmentEvent, {
      shipment,
      status: ShipmentStatus.CREATED,
      comment: 'Вантаж створено',
      createdBy: sender,
      createdAt: now,
    });

    await this.em.flush();
    return shipment;
  }

  async update(id: number, dto: UpdateShipmentDto) {
    const shipment = await this.em.findOne(Shipment, { id });
    if (!shipment) throw new Error('NOT_FOUND');

    if (shipment.status === ShipmentStatus.DELIVERED || shipment.status === ShipmentStatus.LOST) {
      throw new Error('FINAL_STATUS');
    }

    if (dto.description !== undefined) shipment.description = dto.description;
    if (dto.weight !== undefined) shipment.weight = dto.weight;
    if (dto.dimensions !== undefined) shipment.dimensions = dto.dimensions;
    if (dto.priority !== undefined) shipment.priority = dto.priority;
    shipment.updatedAt = new Date();

    await this.em.flush();
    return shipment;
  }

  async changeStatus(id: number, dto: ChangeShipmentStatusDto, userId: number, userRole: UserRole) {
    const shipment = await this.em.findOne(Shipment, { id });
    if (!shipment) throw new Error('NOT_FOUND');

    const transition = ALLOWED_TRANSITIONS[shipment.status];

    // Перевірка чи перехід дозволений
    if (!transition.next.includes(dto.status)) {
      throw new Error('INVALID_TRANSITION');
    }

    // Перевірка чи роль дозволена для цього переходу
    if (!transition.roles.includes(userRole)) {
      throw new Error('FORBIDDEN');
    }

    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    shipment.status = dto.status;
    shipment.updatedAt = new Date();

    // Логуємо подію
    this.em.create(ShipmentEvent, {
      shipment,
      status: dto.status,
      comment: dto.comment,
      location: dto.location,
      createdBy: user,
      createdAt: new Date(),
    });

    await this.em.flush();
    return shipment;
  }
}
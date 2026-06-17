import { EntityManager } from '@mikro-orm/mysql';
import { Route, RouteStatus } from './entities/route.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateRouteDto, UpdateRouteDto, ChangeRouteStatusDto } from './dto/route.dto';

export class RoutesService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await this.em.findAndCount(
      Route,
      {},
      {
        limit,
        offset,
        populate: ['driver', 'driver.user', 'shipment', 'origin', 'destination'] as const,
        orderBy: { id: 'DESC' },
      }
    );
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const route = await this.em.findOne(
      Route,
      { id },
      { populate: ['driver', 'driver.user', 'shipment', 'origin', 'destination'] as const }
    );
    if (!route) throw new Error('NOT_FOUND');
    return route;
  }

  async findByDriver(driverId: number) {
    const data = await this.em.find(
      Route,
      { driver: { id: driverId } },
      {
        populate: ['shipment', 'origin', 'destination'] as const,
        orderBy: { id: 'DESC' },
      }
    );
    return data;
  }

  async create(dto: CreateRouteDto) {
    const driver = await this.em.findOne(Driver, { id: dto.driverId });
    if (!driver) throw new Error('DRIVER_NOT_FOUND');

    const shipment = await this.em.findOne(Shipment, { id: dto.shipmentId });
    if (!shipment) throw new Error('SHIPMENT_NOT_FOUND');

    const origin = await this.em.findOne(Warehouse, { id: dto.originId });
    if (!origin) throw new Error('ORIGIN_NOT_FOUND');

    const destination = await this.em.findOne(Warehouse, { id: dto.destinationId });
    if (!destination) throw new Error('DESTINATION_NOT_FOUND');

    const route = this.em.create(Route, {
      driver,
      shipment,
      origin,
      destination,
      status: RouteStatus.PLANNED,
      estimatedAt: dto.estimatedAt ? new Date(dto.estimatedAt) : undefined,
      distance: dto.distance,
      notes: dto.notes,
    });

    await this.em.flush();
    return route;
  }

  async update(id: number, dto: UpdateRouteDto) {
    const route = await this.em.findOne(Route, { id });
    if (!route) throw new Error('NOT_FOUND');

    if (dto.estimatedAt !== undefined) route.estimatedAt = new Date(dto.estimatedAt);
    if (dto.distance !== undefined) route.distance = dto.distance;
    if (dto.notes !== undefined) route.notes = dto.notes;

    await this.em.flush();
    return route;
  }

  async changeStatus(id: number, dto: ChangeRouteStatusDto, requesterId: number, requesterRole: string) {
    const route = await this.em.findOne(
      Route,
      { id },
      { populate: ['driver', 'driver.user'] as const }
    );
    if (!route) throw new Error('NOT_FOUND');

    // Driver може змінювати статус тільки свого маршруту
    if (requesterRole === 'driver' && route.driver.user.id !== requesterId) {
      throw new Error('FORBIDDEN');
    }

    // Логіка переходів
    if (dto.status === RouteStatus.IN_PROGRESS) {
      route.startedAt = new Date();
    }
    if (dto.status === RouteStatus.COMPLETED) {
      route.completedAt = new Date();
    }

    route.status = dto.status;
    await this.em.flush();
    return route;
  }
}
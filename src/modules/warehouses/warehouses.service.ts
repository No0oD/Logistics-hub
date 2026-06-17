import { EntityManager } from '@mikro-orm/mysql';
import { Warehouse, WarehouseStatus, WarehouseType } from './entities/warehouse.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';

export class WarehousesService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await this.em.findAndCount(
      Warehouse,
      {},
      { limit, offset, orderBy: { name: 'ASC' } }
    );
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const warehouse = await this.em.findOne(Warehouse, { id });
    if (!warehouse) throw new Error('NOT_FOUND');
    return warehouse;
  }

  async create(dto: CreateWarehouseDto) {
  const warehouse = this.em.create(Warehouse, {
    name: dto.name,
    address: dto.address,
    city: dto.city,
    capacity: dto.capacity,
    area: dto.area,
    latitude: dto.latitude,
    longitude: dto.longitude,
    type: dto.type ?? WarehouseType.DISTRIBUTION_CENTER,
    status: WarehouseStatus.ACTIVE,
    createdAt: new Date(),
  });
  await this.em.flush();
  return warehouse;
}

  async update(id: number, dto: UpdateWarehouseDto) {
    const warehouse = await this.em.findOne(Warehouse, { id });
    if (!warehouse) throw new Error('NOT_FOUND');

    if (dto.name !== undefined) warehouse.name = dto.name;
    if (dto.address !== undefined) warehouse.address = dto.address;
    if (dto.city !== undefined) warehouse.city = dto.city;
    if (dto.capacity !== undefined) warehouse.capacity = dto.capacity;
    if (dto.status !== undefined) warehouse.status = dto.status;

    await this.em.flush();
    return warehouse;
  }

  async remove(id: number) {
    const warehouse = await this.em.findOne(Warehouse, { id });
    if (!warehouse) throw new Error('NOT_FOUND');
    warehouse.status = WarehouseStatus.CLOSED;
    await this.em.flush();
  }

  async getShipments(id: number, page = 1, limit = 20) {
    const warehouse = await this.em.findOne(Warehouse, { id });
    if (!warehouse) throw new Error('NOT_FOUND');

    const offset = (page - 1) * limit;
    const [data, total] = await this.em.findAndCount(
      Shipment,
      { warehouse: { id } },
      { limit, offset, orderBy: { createdAt: 'DESC' } }
    );
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }
}
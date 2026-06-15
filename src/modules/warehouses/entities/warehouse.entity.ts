import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum WarehouseType {
  DISTRIBUTION_CENTER = 'distribution_center',
  SORTING_HUB = 'sorting_hub',
  LAST_MILE = 'last_mile',
  COLD_STORAGE = 'cold_storage',
}

export enum WarehouseStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

@Entity({ tableName: 'warehouses' })
export class Warehouse {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  address!: string;

  @Property()
  city!: string;

  @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Property()
  capacity!: number;

  @Property({ fieldName: 'area_sqm', type: 'decimal', precision: 10, scale: 2, nullable: true })
  area?: number;

  @Enum(() => WarehouseType)
  type: WarehouseType = WarehouseType.DISTRIBUTION_CENTER;

  @Enum(() => WarehouseStatus)
  status: WarehouseStatus = WarehouseStatus.ACTIVE;

  @Property({ type: 'json', nullable: true })
  zones?: object;

  @Property({ fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();
}
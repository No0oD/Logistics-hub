import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToOne } from '@mikro-orm/core';
import { Driver } from '../../drivers/entities/driver.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum RouteStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'routes' })
export class Route {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Driver, { fieldName: 'driver_id' })
  driver!: Driver;

  @OneToOne(() => Shipment, { fieldName: 'shipment_id' })
  shipment!: Shipment;

  @ManyToOne(() => Warehouse, { fieldName: 'origin_id' })
  origin!: Warehouse;

  @ManyToOne(() => Warehouse, { fieldName: 'destination_id' })
  destination!: Warehouse;

  @Enum(() => RouteStatus)
  status: RouteStatus = RouteStatus.PLANNED;

  @Property({ fieldName: 'estimated_at', nullable: true })
  estimatedAt?: Date;

  @Property({ fieldName: 'started_at', nullable: true })
  startedAt?: Date;

  @Property({ fieldName: 'completed_at', nullable: true })
  completedAt?: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance?: number;

  @Property({ nullable: true })
  notes?: string;
}
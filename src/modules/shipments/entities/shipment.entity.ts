import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';

export enum ShipmentStatus {
  CREATED = 'created',
  AT_WAREHOUSE = 'at_warehouse',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  LOST = 'lost',
}

export enum ShipmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  EXPRESS = 'express',
}

@Entity({ tableName: 'shipments' })
export class Shipment {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'tracking_code', unique: true })
  trackingCode!: string;

  @Property()
  description!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Property({ nullable: true })
  dimensions?: string;

  @Enum(() => ShipmentStatus)
  status: ShipmentStatus = ShipmentStatus.CREATED;

  @Enum(() => ShipmentPriority)
  priority: ShipmentPriority = ShipmentPriority.NORMAL;

  @ManyToOne(() => Warehouse, { fieldName: 'warehouse_id', nullable: true })
  warehouse?: Warehouse;

  @ManyToOne(() => User, { fieldName: 'sender_id' })
  sender!: User;

  @Property({ fieldName: 'receiver_id', nullable: true })
  receiverId?: number;

  @Property({ fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
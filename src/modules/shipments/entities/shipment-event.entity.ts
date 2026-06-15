import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Shipment, ShipmentStatus } from './shipment.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ tableName: 'shipment_events' })
export class ShipmentEvent {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Shipment, { fieldName: 'shipment_id' })
  shipment!: Shipment;

  @Enum(() => ShipmentStatus)
  status!: ShipmentStatus;

  @Property({ nullable: true })
  location?: string;

  @Property({ nullable: true })
  comment?: string;

  @ManyToOne(() => User, { fieldName: 'created_by' })
  createdBy!: User;

  @Property({ fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();
}
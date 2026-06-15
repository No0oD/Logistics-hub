import { Entity, PrimaryKey, Property, Enum, OneToOne } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_ROUTE = 'on_route',
  ON_BREAK = 'on_break',
  OFFLINE = 'offline',
}

@Entity({ tableName: 'drivers' })
export class Driver {
  @PrimaryKey()
  id!: number;

  @OneToOne(() => User, { fieldName: 'user_id' })
  user!: User;

  @Property({ fieldName: 'license_number' })
  licenseNumber!: string;

  @Property({ fieldName: 'vehicle_type' })
  vehicleType!: string;

  @Property({ fieldName: 'vehicle_plate' })
  vehiclePlate!: string;

  @Enum(() => DriverStatus)
  status: DriverStatus = DriverStatus.OFFLINE;

  @Property({ fieldName: 'current_lat', type: 'decimal', precision: 10, scale: 6, nullable: true })
  currentLat?: number;

  @Property({ fieldName: 'current_lng', type: 'decimal', precision: 10, scale: 6, nullable: true })
  currentLng?: number;

  @Property({ fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();
}
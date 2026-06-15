import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum UserRole {
  ADMIN = 'admin',
  DISPATCHER = 'dispatcher',
  DRIVER = 'driver',
  VIEWER = 'viewer',
}

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property({ fieldName: 'first_name' })
  firstName!: string;

  @Property({ fieldName: 'last_name' })
  lastName!: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.VIEWER;

  @Property({ fieldName: 'is_active', default: true })
  isActive: boolean = true;

  @Property({ fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
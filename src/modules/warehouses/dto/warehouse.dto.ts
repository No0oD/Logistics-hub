import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { WarehouseType, WarehouseStatus } from '../entities/warehouse.entity';

export class CreateWarehouseDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsNumber()
  @Min(1)
  capacity!: number;

  @IsNumber()
  @IsOptional()
  area?: number;

  @IsEnum(WarehouseType)
  @IsOptional()
  type?: WarehouseType;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;
}
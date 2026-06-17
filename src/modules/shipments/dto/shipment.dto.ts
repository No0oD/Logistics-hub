import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ShipmentStatus, ShipmentPriority } from '../entities/shipment.entity';

export class CreateShipmentDto {
  @IsString()
  description!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsEnum(ShipmentPriority)
  @IsOptional()
  priority?: ShipmentPriority;

  @IsNumber()
  @IsOptional()
  warehouseId?: number;
}

export class UpdateShipmentDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsEnum(ShipmentPriority)
  @IsOptional()
  priority?: ShipmentPriority;
}

export class ChangeShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
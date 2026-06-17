import { IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { RouteStatus } from '../entities/route.entity';

export class CreateRouteDto {
  @IsNumber()
  driverId!: number;

  @IsNumber()
  shipmentId!: number;

  @IsNumber()
  originId!: number;

  @IsNumber()
  destinationId!: number;

  @IsDateString()
  @IsOptional()
  estimatedAt?: string;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsOptional()
  notes?: string;
}

export class UpdateRouteDto {
  @IsDateString()
  @IsOptional()
  estimatedAt?: string;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsOptional()
  notes?: string;
}

export class ChangeRouteStatusDto {
  @IsEnum(RouteStatus)
  status!: RouteStatus;
}
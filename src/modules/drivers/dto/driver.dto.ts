import { IsString, IsEnum, IsOptional } from 'class-validator';
import { DriverStatus } from '../entities/driver.entity';

export class CreateDriverDto {
  @IsString()
  licenseNumber!: string;

  @IsString()
  vehicleType!: string;

  @IsString()
  vehiclePlate!: string;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  vehiclePlate?: string;
}

export class ChangeDriverStatusDto {
  @IsEnum(DriverStatus)
  status!: DriverStatus;
}
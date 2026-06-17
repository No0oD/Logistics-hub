import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ChangeRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
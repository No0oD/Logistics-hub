import { EntityManager } from '@mikro-orm/mysql';
import { Driver, DriverStatus } from './entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { CreateDriverDto, UpdateDriverDto, ChangeDriverStatusDto } from './dto/driver.dto';

export class DriversService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await this.em.findAndCount(
      Driver,
      {},
      { limit, offset, populate: ['user'] as const }
    );
    return { data: data.map(this.toResponse), total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAvailable() {
    const data = await this.em.find(
      Driver,
      { status: DriverStatus.AVAILABLE },
      { populate: ['user'] as const }
    );
    return data.map(this.toResponse);
  }

  async findOne(id: number) {
    const driver = await this.em.findOne(Driver, { id }, { populate: ['user'] as const });
    if (!driver) throw new Error('NOT_FOUND');
    return this.toResponse(driver);
  }

  async create(userId: number, dto: CreateDriverDto) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    const existing = await this.em.findOne(Driver, { user: { id: userId } });
    if (existing) throw new Error('DRIVER_EXISTS');

    const driver = this.em.create(Driver, {
      user,
      licenseNumber: dto.licenseNumber,
      vehicleType: dto.vehicleType,
      vehiclePlate: dto.vehiclePlate,
      status: DriverStatus.OFFLINE,
      createdAt: new Date(),
    });

    await this.em.flush();
    return this.toResponse(driver);
  }

  async update(id: number, dto: UpdateDriverDto) {
    const driver = await this.em.findOne(Driver, { id });
    if (!driver) throw new Error('NOT_FOUND');

    if (dto.licenseNumber !== undefined) driver.licenseNumber = dto.licenseNumber;
    if (dto.vehicleType !== undefined) driver.vehicleType = dto.vehicleType;
    if (dto.vehiclePlate !== undefined) driver.vehiclePlate = dto.vehiclePlate;

    await this.em.flush();
    return this.toResponse(driver);
  }

  async changeStatus(id: number, dto: ChangeDriverStatusDto, requesterId: number, requesterRole: string) {
    const driver = await this.em.findOne(Driver, { id }, { populate: ['user'] as const });
    if (!driver) throw new Error('NOT_FOUND');

    // Driver може змінювати тільки свій статус
    if (requesterRole === 'driver' && driver.user.id !== requesterId) {
      throw new Error('FORBIDDEN');
    }

    driver.status = dto.status;
    await this.em.flush();
    return this.toResponse(driver);
  }

  async remove(id: number) {
    const driver = await this.em.findOne(Driver, { id });
    if (!driver) throw new Error('NOT_FOUND');
    driver.status = DriverStatus.OFFLINE;
    await this.em.flush();
  }

  private toResponse(driver: Driver) {
    return {
      id: driver.id,
      licenseNumber: driver.licenseNumber,
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate,
      status: driver.status,
      currentLat: driver.currentLat,
      currentLng: driver.currentLng,
      createdAt: driver.createdAt,
      user: driver.user
        ? {
            id: driver.user.id,
            email: driver.user.email,
            firstName: driver.user.firstName,
            lastName: driver.user.lastName,
          }
        : undefined,
    };
  }
}
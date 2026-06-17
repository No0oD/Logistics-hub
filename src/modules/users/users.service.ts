import { EntityManager } from '@mikro-orm/mysql';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto, ChangeRoleDto } from './dto/update-user.dto';

export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await this.em.findAndCount(
      User,
      {},
      { limit, offset, orderBy: { createdAt: 'DESC' } }
    );

    return { data: data.map(this.toResponse), total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const user = await this.em.findOne(User, { id });
    if (!user) throw new Error('USER_NOT_FOUND');
    return this.toResponse(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.em.findOne(User, { id });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    user.updatedAt = new Date();

    await this.em.flush();
    return this.toResponse(user);
  }

  async remove(id: number) {
    const user = await this.em.findOne(User, { id });
    if (!user) throw new Error('USER_NOT_FOUND');

    user.isActive = false;
    user.updatedAt = new Date();
    await this.em.flush();
  }

  async changeRole(id: number, dto: ChangeRoleDto) {
    const user = await this.em.findOne(User, { id });
    if (!user) throw new Error('USER_NOT_FOUND');

    user.role = dto.role;
    user.updatedAt = new Date();
    await this.em.flush();
    return this.toResponse(user);
  }

  private toResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
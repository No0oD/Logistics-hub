import { EntityManager } from '@mikro-orm/mysql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: number;
  role: UserRole;
}

// Тимчасове сховище refresh-токенів (в пам'яті)

const refreshTokenStore = new Set<string>();

export class AuthService {
  constructor(private readonly em: EntityManager) {}

  async register(dto: RegisterDto): Promise<{ user: User; tokens: TokenPair }> {
    const existing = await this.em.findOne(User, { email: dto.email });
    if (existing) {
      throw new Error('USER_EXISTS');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const now = new Date();

    const user = this.em.create(User, {
      email: dto.email,
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role ?? UserRole.VIEWER,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await this.em.flush();

    const tokens = this.generateTokens(user);
    refreshTokenStore.add(tokens.refreshToken);

    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: TokenPair }> {
    const user = await this.em.findOne(User, { email: dto.email });

    if (!user || !user.isActive) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user);
    refreshTokenStore.add(tokens.refreshToken);

    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshTokenStore.has(refreshToken)) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as JwtPayload;
    } catch {
      refreshTokenStore.delete(refreshToken);
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const user = await this.em.findOne(User, { id: payload.userId });
    if (!user || !user.isActive) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    refreshTokenStore.delete(refreshToken);
    const tokens = this.generateTokens(user);
    refreshTokenStore.add(tokens.refreshToken);

    return tokens;
  }

  logout(refreshToken: string): void {
    refreshTokenStore.delete(refreshToken);
  }

private generateTokens(user: User): TokenPair {
  const payload: JwtPayload = { userId: user.id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
    }
}
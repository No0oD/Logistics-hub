import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { validateDto } from '../../shared/utils/validate';

export class AuthController {
  constructor(private readonly em: EntityManager) {}

  private get service() {
    return new AuthService(this.em);
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(RegisterDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const { user, tokens } = await this.service.register(dto);
      res.status(201).json({
        user: { id: user.id, email: user.email, role: user.role },
        ...tokens,
      });
    } catch (err: any) {
      if (err.message === 'USER_EXISTS') {
        res.status(409).json({ status: 409, message: 'Email already in use' });
        return;
      }
      res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(LoginDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const { user, tokens } = await this.service.login(dto);
      res.status(200).json({
        user: { id: user.id, email: user.email, role: user.role },
        ...tokens,
      });
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ status: 401, message: 'Invalid email or password' });
        return;
      }
      res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ status: 400, message: 'Refresh token required' });
      return;
    }

    try {
      const tokens = await this.service.refresh(refreshToken);
      res.status(200).json(tokens);
    } catch {
      res.status(401).json({ status: 401, message: 'Invalid or expired refresh token' });
    }
  };

  logout = (req: Request, res: Response): void => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      this.service.logout(refreshToken);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const em = this.em;
    const user = await em.findOne(
      (await import('../users/entities/user.entity')).User,
      { id: (req as any).user.userId }
    );

    if (!user) {
      res.status(404).json({ status: 404, message: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  };
}
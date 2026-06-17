import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangeRoleDto } from './dto/update-user.dto';
import { validateDto } from '../../shared/utils/validate';

export class UsersController {
  constructor(private readonly em: EntityManager) {}

  private get service() {
    return new UsersService(this.em);
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.service.findAll(page, limit);
    res.json(result);
  };

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.findOne(Number(req.params.id));
      res.json(user);
    } catch {
      res.status(404).json({ status: 404, message: 'User not found' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(UpdateUserDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const user = await this.service.update(Number(req.params.id), dto);
      res.json(user);
    } catch {
      res.status(404).json({ status: 404, message: 'User not found' });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(Number(req.params.id));
      res.status(200).json({ message: 'User deactivated' });
    } catch {
      res.status(404).json({ status: 404, message: 'User not found' });
    }
  };

  changeRole = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(ChangeRoleDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const user = await this.service.changeRole(Number(req.params.id), dto);
      res.json(user);
    } catch {
      res.status(404).json({ status: 404, message: 'User not found' });
    }
  };
}
import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, ChangeDriverStatusDto } from './dto/driver.dto';
import { validateDto } from '../../shared/utils/validate';

export class DriversController {
  constructor(private readonly em: EntityManager) {}

  private get service() {
    return new DriversService(this.em);
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.service.findAll(page, limit);
    res.json(result);
  };

  findAvailable = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.findAvailable();
    res.json(result);
  };

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const driver = await this.service.findOne(Number(req.params.id));
      res.json(driver);
    } catch {
      res.status(404).json({ status: 404, message: 'Driver not found' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(CreateDriverDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    const userId = Number(req.body.userId);
    if (!userId) {
      res.status(400).json({ status: 400, message: 'userId is required' });
      return;
    }

    try {
      const driver = await this.service.create(userId, dto);
      res.status(201).json(driver);
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        res.status(404).json({ status: 404, message: 'User not found' });
        return;
      }
      if (err.message === 'DRIVER_EXISTS') {
        res.status(409).json({ status: 409, message: 'Driver profile already exists for this user' });
        return;
      }
      res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(UpdateDriverDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }
    try {
      const driver = await this.service.update(Number(req.params.id), dto);
      res.json(driver);
    } catch {
      res.status(404).json({ status: 404, message: 'Driver not found' });
    }
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(ChangeDriverStatusDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }
    try {
      const driver = await this.service.changeStatus(
        Number(req.params.id),
        dto,
        req.user.userId,
        req.user.role
      );
      res.json(driver);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        res.status(403).json({ status: 403, message: 'Forbidden' });
        return;
      }
      res.status(404).json({ status: 404, message: 'Driver not found' });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(Number(req.params.id));
      res.json({ message: 'Driver deactivated' });
    } catch {
      res.status(404).json({ status: 404, message: 'Driver not found' });
    }
  };
}
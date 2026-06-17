import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { RoutesService } from './routes.service';
import { CreateRouteDto, UpdateRouteDto, ChangeRouteStatusDto } from './dto/route.dto';
import { validateDto } from '../../shared/utils/validate';

export class RoutesController {
  constructor(private readonly em: EntityManager) {}

  private get service() {
    return new RoutesService(this.em);
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.service.findAll(page, limit);
    res.json(result);
  };

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const route = await this.service.findOne(Number(req.params.id));
      res.json(route);
    } catch {
      res.status(404).json({ status: 404, message: 'Route not found' });
    }
  };

  findByDriver = async (req: Request, res: Response): Promise<void> => {
    try {
      const routes = await this.service.findByDriver(Number(req.params.driverId));
      res.json(routes);
    } catch {
      res.status(404).json({ status: 404, message: 'Driver not found' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(CreateRouteDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const route = await this.service.create(dto);
      res.status(201).json(route);
    } catch (err: any) {
      const notFound: Record<string, string> = {
        DRIVER_NOT_FOUND: 'Driver not found',
        SHIPMENT_NOT_FOUND: 'Shipment not found',
        ORIGIN_NOT_FOUND: 'Origin warehouse not found',
        DESTINATION_NOT_FOUND: 'Destination warehouse not found',
      };
      if (notFound[err.message]) {
        res.status(404).json({ status: 404, message: notFound[err.message] });
        return;
      }
      res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(UpdateRouteDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }
    try {
      const route = await this.service.update(Number(req.params.id), dto);
      res.json(route);
    } catch {
      res.status(404).json({ status: 404, message: 'Route not found' });
    }
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(ChangeRouteStatusDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }
    try {
      const route = await this.service.changeStatus(
        Number(req.params.id),
        dto,
        req.user.userId,
        req.user.role
      );
      res.json(route);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        res.status(403).json({ status: 403, message: 'Forbidden' });
        return;
      }
      res.status(404).json({ status: 404, message: 'Route not found' });
    }
  };
}
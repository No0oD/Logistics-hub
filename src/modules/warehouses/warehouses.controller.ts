import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { validateDto } from '../../shared/utils/validate';

export class WarehousesController {
  constructor(private readonly em: EntityManager) {}

  private get service() {
    return new WarehousesService(this.em);
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.service.findAll(page, limit);
    res.json(result);
  };

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const warehouse = await this.service.findOne(Number(req.params.id));
      res.json(warehouse);
    } catch {
      res.status(404).json({ status: 404, message: 'Warehouse not found' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(CreateWarehouseDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }
    const warehouse = await this.service.create(dto);
    res.status(201).json(warehouse);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(UpdateWarehouseDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }
    try {
      const warehouse = await this.service.update(Number(req.params.id), dto);
      res.json(warehouse);
    } catch {
      res.status(404).json({ status: 404, message: 'Warehouse not found' });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(Number(req.params.id));
      res.json({ message: 'Warehouse closed' });
    } catch {
      res.status(404).json({ status: 404, message: 'Warehouse not found' });
    }
  };

  getShipments = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    try {
      const result = await this.service.getShipments(Number(req.params.id), page, limit);
      res.json(result);
    } catch {
      res.status(404).json({ status: 404, message: 'Warehouse not found' });
    }
  };
}
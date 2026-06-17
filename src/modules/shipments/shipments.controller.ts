
import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto, UpdateShipmentDto, ChangeShipmentStatusDto } from './dto/shipment.dto';
import { validateDto } from '../../shared/utils/validate';
import { ShipmentStatus, ShipmentPriority } from './entities/shipment.entity';

export class ShipmentsController {
  constructor(private readonly em: EntityManager) {}

  private get service() {
    return new ShipmentsService(this.em);
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const filters = {
      status: req.query.status as ShipmentStatus | undefined,
      priority: req.query.priority as ShipmentPriority | undefined,
    };
    const result = await this.service.findAll(page, limit, filters);
    res.json(result);
  };

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const shipment = await this.service.findOne(Number(req.params.id));
      res.json(shipment);
    } catch {
      res.status(404).json({ status: 404, message: 'Shipment not found' });
    }
  };

  track = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await this.service.findByTrackingCode(req.params.trackingCode as string);      res.json(result);
    } catch {
      res.status(404).json({ status: 404, message: 'Shipment not found' });
    }
  };

  getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await this.service.getEvents(Number(req.params.id));
      res.json(events);
    } catch {
      res.status(404).json({ status: 404, message: 'Shipment not found' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(CreateShipmentDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const shipment = await this.service.create(dto, req.user.userId);
      res.status(201).json(shipment);
    } catch (err: any) {
      if (err.message === 'WAREHOUSE_NOT_FOUND') {
        res.status(404).json({ status: 404, message: 'Warehouse not found' });
        return;
      }
      res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(UpdateShipmentDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const shipment = await this.service.update(Number(req.params.id), dto);
      res.json(shipment);
    } catch (err: any) {
      if (err.message === 'FINAL_STATUS') {
        res.status(400).json({ status: 400, message: 'Cannot update shipment in final status' });
        return;
      }
      res.status(404).json({ status: 404, message: 'Shipment not found' });
    }
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { errors, dto } = await validateDto(ChangeShipmentStatusDto, req.body);
    if (errors) {
      res.status(400).json({ status: 400, message: 'Validation failed', errors });
      return;
    }

    try {
      const shipment = await this.service.changeStatus(
        Number(req.params.id),
        dto,
        req.user.userId,
        req.user.role
      );
      res.json(shipment);
    } catch (err: any) {
      if (err.message === 'INVALID_TRANSITION') {
        res.status(400).json({ status: 400, message: 'Invalid status transition' });
        return;
      }
      if (err.message === 'FORBIDDEN') {
        res.status(403).json({ status: 403, message: 'Forbidden' });
        return;
      }
      res.status(404).json({ status: 404, message: 'Shipment not found' });
    }
  };
}
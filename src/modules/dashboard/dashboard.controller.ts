import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { Shipment, ShipmentStatus } from '../shipments/entities/shipment.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Route } from '../routes/entities/route.entity';

export class DashboardController {
  constructor(private readonly em: EntityManager) {}

  stats = async (req: Request, res: Response): Promise<void> => {
    const [totalShipments, totalWarehouses, totalDrivers, totalRoutes] = await Promise.all([
      this.em.count(Shipment, {}),
      this.em.count(Warehouse, {}),
      this.em.count(Driver, {}),
      this.em.count(Route, {}),
    ]);

    res.json({ totalShipments, totalWarehouses, totalDrivers, totalRoutes });
  };

  shipmentsByStatus = async (req: Request, res: Response): Promise<void> => {
    const statuses = Object.values(ShipmentStatus);

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.em.count(Shipment, { status }),
      }))
    );

    res.json(counts);
  };

  warehouseLoad = async (req: Request, res: Response): Promise<void> => {
    const warehouses = await this.em.findAll(Warehouse, {});

    const result = await Promise.all(
      warehouses.map(async (w) => {
        const shipmentsCount = await this.em.count(Shipment, { warehouse: { id: w.id } });
        const loadPercent = Math.round((shipmentsCount / w.capacity) * 100);
        return {
          id: w.id,
          name: w.name,
          city: w.city,
          capacity: w.capacity,
          currentShipments: shipmentsCount,
          loadPercent,
          status: w.status,
        };
      })
    );

    res.json(result);
  };
}
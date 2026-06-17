import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Logistics Hub API',
      version: '1.0.0',
      description: 'REST API для системи управління логістикою',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@logistics.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            firstName: { type: 'string', example: 'Іван' },
            lastName: { type: 'string', example: 'Петренко' },
            role: { type: 'string', enum: ['admin', 'dispatcher', 'driver', 'viewer'], default: 'viewer' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@logistics.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        // ── User ─────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'admin@logistics.com' },
            firstName: { type: 'string', example: 'Адмін' },
            lastName: { type: 'string', example: 'Системний' },
            role: { type: 'string', enum: ['admin', 'dispatcher', 'driver', 'viewer'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Warehouse ─────────────────────────────────────────────
        Warehouse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'Київ Центральний' },
            address: { type: 'string' },
            city: { type: 'string' },
            capacity: { type: 'integer' },
            type: { type: 'string', enum: ['distribution_center', 'sorting_hub', 'last_mile', 'cold_storage'] },
            status: { type: 'string', enum: ['active', 'maintenance', 'closed'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateWarehouseRequest: {
          type: 'object',
          required: ['name', 'address', 'city', 'capacity'],
          properties: {
            name: { type: 'string', example: 'Київ Центральний' },
            address: { type: 'string', example: 'вул. Промислова, 1' },
            city: { type: 'string', example: 'Київ' },
            capacity: { type: 'integer', example: 1000 },
            area: { type: 'number', example: 5000 },
            type: { type: 'string', enum: ['distribution_center', 'sorting_hub', 'last_mile', 'cold_storage'] },
            latitude: { type: 'number', example: 50.4501 },
            longitude: { type: 'number', example: 30.5234 },
          },
        },
        // ── Driver ────────────────────────────────────────────────
        Driver: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            licenseNumber: { type: 'string' },
            vehicleType: { type: 'string' },
            vehiclePlate: { type: 'string' },
            status: { type: 'string', enum: ['available', 'on_route', 'on_break', 'offline'] },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        // ── Shipment ──────────────────────────────────────────────
        Shipment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            trackingCode: { type: 'string', example: 'LH-A1B2C3-01' },
            description: { type: 'string' },
            weight: { type: 'number' },
            status: { type: 'string', enum: ['created', 'at_warehouse', 'in_transit', 'delivered', 'returned', 'lost'] },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'express'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateShipmentRequest: {
          type: 'object',
          required: ['description'],
          properties: {
            description: { type: 'string', example: 'Електроніка' },
            weight: { type: 'number', example: 15.5 },
            dimensions: { type: 'string', example: '60x40x30 см' },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'express'], default: 'normal' },
            warehouseId: { type: 'integer', example: 1 },
          },
        },
        ChangeStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string' },
            comment: { type: 'string', example: 'Прийнято на склад' },
            location: { type: 'string', example: 'Київ' },
          },
        },
        // ── Route ─────────────────────────────────────────────────
        Route: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            status: { type: 'string', enum: ['planned', 'in_progress', 'completed', 'cancelled'] },
            distance: { type: 'number' },
            estimatedAt: { type: 'string', format: 'date-time' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Common ────────────────────────────────────────────────
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'integer' },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
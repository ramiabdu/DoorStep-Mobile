import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import {env} from './config/env.js';
import {openApiDocument} from './config/openapi.js';
import {createPool} from './db/pool.js';
import {errorHandler} from './middleware/errorHandler.js';
import {requestLogger} from './middleware/requestLogger.js';
import {createAdminRouter} from './modules/admin/admin.routes.js';
import {createAuthRouter} from './modules/auth/auth.routes.js';
import {createCartRouter} from './modules/cart/cart.routes.js';
import {createDriverRouter} from './modules/driver/driver.routes.js';
import {createOrdersRouter} from './modules/orders/orders.routes.js';
import {createRestaurantsRouter} from './modules/restaurants/restaurants.routes.js';
import {MemoryRepository} from './repositories/memoryRepository.js';
import {PostgresRepository} from './repositories/postgresRepository.js';
import type {DoorstepRepository} from './repositories/repository.js';

export const createRepository = (): DoorstepRepository => {
  if (env.NODE_ENV === 'test' || env.DATA_DRIVER === 'memory') {
    return new MemoryRepository();
  }

  return new PostgresRepository(createPool());
};

export const createApp = (repository: DoorstepRepository = createRepository()) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      credentials: true
    })
  );
  app.use(express.json({limit: '1mb'}));
  app.use(requestLogger);

  app.get('/health', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'doorstep-mobile-api',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/api/openapi.json', (_request, response) => response.json(openApiDocument));
  app.use('/api/auth', createAuthRouter(repository));
  app.use('/api/restaurants', createRestaurantsRouter(repository));
  app.use('/api/cart', createCartRouter(repository));
  app.use('/api/orders', createOrdersRouter(repository));
  app.use('/api/driver', createDriverRouter(repository));
  app.use('/api/admin', createAdminRouter(repository));
  app.use(errorHandler);

  return app;
};


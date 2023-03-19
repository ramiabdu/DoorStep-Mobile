import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import {env} from './config/env.js';
import {openApiDocument} from './config/openapi.js';
import {createPool} from './db/pool.js';
import {errorHandler} from './middleware/errorHandler.js';
import {requestLogger} from './middleware/requestLogger.js';
import {createAddressesRouter} from './modules/addresses/addresses.routes.js';
import {createAdminRouter} from './modules/admin/admin.routes.js';
import {createAnalyticsRouter} from './modules/analytics/analytics.routes.js';
import {createAuthRouter} from './modules/auth/auth.routes.js';
import {createCartRouter} from './modules/cart/cart.routes.js';
import {createCategoriesRouter} from './modules/categories/categories.routes.js';
import {createCouponsRouter} from './modules/coupons/coupons.routes.js';
import {createDriverRouter} from './modules/driver/driver.routes.js';
import {createNotificationsRouter} from './modules/notifications/notifications.routes.js';
import {createOrdersRouter} from './modules/orders/orders.routes.js';
import {createPaymentsRouter} from './modules/payments/payments.routes.js';
import {createProductsRouter} from './modules/products/products.routes.js';
import {createRestaurantsRouter} from './modules/restaurants/restaurants.routes.js';
import {createReviewsRouter} from './modules/reviews/reviews.routes.js';
import {createStoresRouter} from './modules/stores/stores.routes.js';
import {createUsersRouter} from './modules/users/users.routes.js';
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
  app.use('/api/categories', createCategoriesRouter(repository));
  app.use('/api/stores', createStoresRouter(repository));
  app.use('/api/restaurants', createRestaurantsRouter(repository));
  app.use('/api/products', createProductsRouter(repository));
  app.use('/api/cart', createCartRouter(repository));
  app.use('/api/orders', createOrdersRouter(repository));
  app.use('/api/addresses', createAddressesRouter(repository));
  app.use('/api/payments', createPaymentsRouter(repository));
  app.use('/api/notifications', createNotificationsRouter(repository));
  app.use('/api/coupons', createCouponsRouter(repository));
  app.use('/api/reviews', createReviewsRouter(repository));
  app.use('/api/users', createUsersRouter(repository));
  app.use('/api/analytics', createAnalyticsRouter(repository));
  app.use('/api/driver', createDriverRouter(repository));
  app.use('/api/admin', createAdminRouter(repository));
  app.use(errorHandler);

  return app;
};

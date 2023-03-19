import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {getStringValue} from '../../utils/requestValues.js';

const assignSchema = z.object({
  params: z.object({
    orderId: z.string().min(1)
  }),
  body: z.object({
    driverId: z.string().min(1)
  })
});

export const createAdminRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('admin'));

  router.get(
    '/overview',
    asyncHandler(async (_request, response) => {
      const overview = await repository.adminOverview();
      response.json({overview});
    })
  );

  router.get(
    '/orders',
    asyncHandler(async (_request, response) => {
      const orders = await repository.listAssignableOrders();
      response.json({orders});
    })
  );

  router.get(
    '/orders/all',
    asyncHandler(async (_request, response) => {
      const orders = await repository.listAllOrders();
      response.json({orders});
    })
  );

  router.get(
    '/stores',
    asyncHandler(async (_request, response) => {
      const stores = await repository.listStores();
      response.json({stores});
    })
  );

  router.get(
    '/products',
    asyncHandler(async (_request, response) => {
      const products = await repository.listProducts();
      response.json({products});
    })
  );

  router.get(
    '/users',
    asyncHandler(async (_request, response) => {
      const users = await repository.listUsers();
      response.json({users});
    })
  );

  router.get(
    '/analytics',
    asyncHandler(async (_request, response) => {
      const analytics = await repository.analyticsOverview();
      response.json({analytics});
    })
  );

  router.patch(
    '/orders/:orderId/assign',
    validate(assignSchema),
    asyncHandler(async (request, response) => {
      const orderId = getStringValue(request.params.orderId, 'orderId');
      const driverId = getStringValue(request.body.driverId, 'driverId');
      const order = await repository.assignOrder(orderId, driverId);
      response.json({order});
    })
  );

  return router;
};

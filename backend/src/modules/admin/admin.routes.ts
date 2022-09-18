import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

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

  router.patch(
    '/orders/:orderId/assign',
    validate(assignSchema),
    asyncHandler(async (request, response) => {
      const order = await repository.assignOrder(request.params.orderId, request.body.driverId);
      response.json({order});
    })
  );

  return router;
};


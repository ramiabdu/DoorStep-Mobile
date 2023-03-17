import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import type {OrderStatus} from '../../types/domain.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {getStringValue} from '../../utils/requestValues.js';

const statusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1)
  }),
  body: z.object({
    status: z.enum(['confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'])
  })
});

export const createDriverRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('driver'));

  router.get(
    '/orders',
    asyncHandler(async (request, response) => {
      const orders = await repository.listOrdersForDriver(request.user?.id ?? '');
      response.json({orders});
    })
  );

  router.patch(
    '/orders/:orderId/status',
    validate(statusSchema),
    asyncHandler(async (request, response) => {
      const orderId = getStringValue(request.params.orderId, 'orderId');
      const status = getStringValue(request.body.status, 'status') as OrderStatus;
      const order = await repository.updateOrderStatus(orderId, status);
      response.json({order});
    })
  );

  return router;
};

import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {forbidden, notFound} from '../../utils/errors.js';

const checkoutSchema = z.object({
  body: z.object({
    deliveryAddress: z.string().min(8).max(180)
  })
});

const orderParamsSchema = z.object({
  params: z.object({
    orderId: z.string().min(1)
  })
});

export const createOrdersRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/',
    authorize('customer'),
    asyncHandler(async (request, response) => {
      const orders = await repository.listOrdersForUser(request.user?.id ?? '');
      response.json({orders});
    })
  );

  router.post(
    '/',
    authorize('customer'),
    validate(checkoutSchema),
    asyncHandler(async (request, response) => {
      const order = await repository.createOrderFromCart(
        request.user?.id ?? '',
        request.body.deliveryAddress
      );
      response.status(201).json({order});
    })
  );

  router.get(
    '/:orderId',
    validate(orderParamsSchema),
    asyncHandler(async (request, response) => {
      const order = await repository.getOrder(request.params.orderId);
      if (!order) {
        throw notFound('Order not found');
      }

      const isOwner = order.customerId === request.user?.id;
      const isDriver = order.driverId === request.user?.id;
      const isAdmin = request.user?.role === 'admin';
      if (!isOwner && !isDriver && !isAdmin) {
        throw forbidden();
      }

      response.json({order});
    })
  );

  return router;
};


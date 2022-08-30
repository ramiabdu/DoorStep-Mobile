import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

const addItemSchema = z.object({
  body: z.object({
    menuItemId: z.string().min(1),
    quantity: z.number().int().positive().max(20).default(1)
  })
});

const updateItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1)
  }),
  body: z.object({
    quantity: z.number().int().min(0).max(20)
  })
});

export const createCartRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('customer'));

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const cart = await repository.getCart(request.user?.id ?? '');
      response.json({cart});
    })
  );

  router.post(
    '/items',
    validate(addItemSchema),
    asyncHandler(async (request, response) => {
      const cart = await repository.addCartItem(
        request.user?.id ?? '',
        request.body.menuItemId,
        request.body.quantity
      );
      response.status(201).json({cart});
    })
  );

  router.patch(
    '/items/:itemId',
    validate(updateItemSchema),
    asyncHandler(async (request, response) => {
      const cart = await repository.updateCartItem(
        request.user?.id ?? '',
        request.params.itemId,
        request.body.quantity
      );
      response.json({cart});
    })
  );

  router.delete(
    '/',
    asyncHandler(async (request, response) => {
      await repository.clearCart(request.user?.id ?? '');
      response.status(204).send();
    })
  );

  return router;
};


import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {getStringValue} from '../../utils/requestValues.js';

const addressSchema = z.object({
  body: z.object({
    label: z.string().min(2).max(40),
    line1: z.string().min(4).max(120),
    line2: z.string().max(120).optional(),
    city: z.string().min(2).max(80),
    postalCode: z.string().min(3).max(16),
    instructions: z.string().max(160).optional(),
    isDefault: z.boolean().optional()
  })
});

const paramsSchema = z.object({
  params: z.object({
    addressId: z.string().min(1)
  })
});

export const createAddressesRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('customer'));

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const userId = getStringValue(request.user?.id, 'userId');
      const addresses = await repository.listAddresses(userId);
      response.json({addresses});
    })
  );

  router.post(
    '/',
    validate(addressSchema),
    asyncHandler(async (request, response) => {
      const userId = getStringValue(request.user?.id, 'userId');
      const address = await repository.createAddress(userId, request.body);
      response.status(201).json({address});
    })
  );

  router.delete(
    '/:addressId',
    validate(paramsSchema),
    asyncHandler(async (request, response) => {
      const userId = getStringValue(request.user?.id, 'userId');
      const addressId = getStringValue(request.params.addressId, 'addressId');
      await repository.deleteAddress(userId, addressId);
      response.status(204).send();
    })
  );

  return router;
};

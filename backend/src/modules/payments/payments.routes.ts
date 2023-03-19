import {Router} from 'express';

import {authenticate, authorize} from '../../middleware/auth.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {getStringValue} from '../../utils/requestValues.js';

export const createPaymentsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('customer'));

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const userId = getStringValue(request.user?.id, 'userId');
      const payments = await repository.listPaymentMethods(userId);
      response.json({payments});
    })
  );

  return router;
};

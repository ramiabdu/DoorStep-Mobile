import {Router} from 'express';

import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

export const createCouponsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const coupons = await repository.listCoupons();
      response.json({coupons});
    })
  );

  return router;
};

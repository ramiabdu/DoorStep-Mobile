import {Router} from 'express';

import {authenticate, authorize} from '../../middleware/auth.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

export const createAnalyticsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('admin'));

  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const analytics = await repository.analyticsOverview();
      response.json({analytics});
    })
  );

  return router;
};

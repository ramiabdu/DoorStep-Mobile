import {Router} from 'express';
import {z} from 'zod';

import {authenticate, authorize} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {getStringValue} from '../../utils/requestValues.js';

const paramsSchema = z.object({
  params: z.object({
    storeId: z.string().min(1)
  })
});

const reviewSchema = paramsSchema.extend({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    body: z.string().min(8).max(400)
  })
});

export const createReviewsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.get(
    '/stores/:storeId',
    validate(paramsSchema),
    asyncHandler(async (request, response) => {
      const storeId = getStringValue(request.params.storeId, 'storeId');
      const reviews = await repository.listReviews(storeId);
      response.json({reviews});
    })
  );

  router.post(
    '/stores/:storeId',
    authenticate,
    authorize('customer'),
    validate(reviewSchema),
    asyncHandler(async (request, response) => {
      const storeId = getStringValue(request.params.storeId, 'storeId');
      const userId = getStringValue(request.user?.id, 'userId');
      const review = await repository.createReview({
        storeId,
        userId,
        rating: Number(request.body.rating),
        body: getStringValue(request.body.body, 'body')
      });
      response.status(201).json({review});
    })
  );

  return router;
};

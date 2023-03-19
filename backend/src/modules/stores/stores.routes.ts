import {Router} from 'express';
import {z} from 'zod';

import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import type {StoreFilters, StoreType} from '../../types/domain.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {notFound} from '../../utils/errors.js';
import {getStringValue} from '../../utils/requestValues.js';

const storeParamsSchema = z.object({
  params: z.object({
    storeId: z.string().min(1)
  })
});

const isStoreType = (value: unknown): value is StoreType =>
  value === 'restaurant' || value === 'supermarket' || value === 'convenience';

const queryValue = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

export const createStoresRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const filters: StoreFilters = {
        type: isStoreType(request.query.type) ? request.query.type : undefined,
        query: queryValue(request.query.q),
        category: queryValue(request.query.category),
        featured: request.query.featured === 'true' ? true : undefined
      };
      const stores = await repository.listStores(filters);
      response.json({stores});
    })
  );

  router.get(
    '/:storeId',
    validate(storeParamsSchema),
    asyncHandler(async (request, response) => {
      const storeId = getStringValue(request.params.storeId, 'storeId');
      const store = await repository.getStore(storeId);
      if (!store) {
        throw notFound('Store not found');
      }

      const products = await repository.listProducts({storeId: store.id});
      const reviews = await repository.listReviews(store.id);
      response.json({store, products, reviews});
    })
  );

  return router;
};

import {Router} from 'express';
import {z} from 'zod';

import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import type {ProductFilters} from '../../types/domain.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {notFound} from '../../utils/errors.js';
import {getStringValue} from '../../utils/requestValues.js';

const productParamsSchema = z.object({
  params: z.object({
    productId: z.string().min(1)
  })
});

const queryValue = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

export const createProductsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const filters: ProductFilters = {
        storeId: queryValue(request.query.storeId),
        categoryId: queryValue(request.query.categoryId),
        query: queryValue(request.query.q),
        deal: request.query.deal === 'true' ? true : undefined,
        popular: request.query.popular === 'true' ? true : undefined
      };
      const products = await repository.listProducts(filters);
      response.json({products});
    })
  );

  router.get(
    '/:productId',
    validate(productParamsSchema),
    asyncHandler(async (request, response) => {
      const productId = getStringValue(request.params.productId, 'productId');
      const product = await repository.getProduct(productId);
      if (!product) {
        throw notFound('Product not found');
      }

      response.json({product});
    })
  );

  return router;
};

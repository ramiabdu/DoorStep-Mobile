import {Router} from 'express';
import {z} from 'zod';

import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {notFound} from '../../utils/errors.js';
import {getStringValue} from '../../utils/requestValues.js';

const paramsSchema = z.object({
  params: z.object({
    restaurantId: z.string().min(1)
  })
});

export const createRestaurantsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const restaurants = await repository.listRestaurants();
      response.json({restaurants});
    })
  );

  router.get(
    '/:restaurantId',
    validate(paramsSchema),
    asyncHandler(async (request, response) => {
      const restaurantId = getStringValue(request.params.restaurantId, 'restaurantId');
      const restaurant = await repository.getRestaurant(restaurantId);
      if (!restaurant) {
        throw notFound('Restaurant not found');
      }

      const menuItems = await repository.listMenuItems(restaurant.id);
      response.json({restaurant, menuItems});
    })
  );

  router.get(
    '/:restaurantId/menu',
    validate(paramsSchema),
    asyncHandler(async (request, response) => {
      const restaurantId = getStringValue(request.params.restaurantId, 'restaurantId');
      const restaurant = await repository.getRestaurant(restaurantId);
      if (!restaurant) {
        throw notFound('Restaurant not found');
      }

      const menuItems = await repository.listMenuItems(restaurant.id);
      response.json({menuItems});
    })
  );

  return router;
};

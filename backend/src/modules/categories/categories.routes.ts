import {Router} from 'express';

import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

export const createCategoriesRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const categories = await repository.listCategories();
      response.json({categories});
    })
  );

  return router;
};

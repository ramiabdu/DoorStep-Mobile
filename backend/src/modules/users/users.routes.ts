import {Router} from 'express';

import {authenticate, authorize} from '../../middleware/auth.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

export const createUsersRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate, authorize('admin'));

  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const users = await repository.listUsers();
      response.json({users});
    })
  );

  return router;
};

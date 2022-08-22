import {Router} from 'express';
import {z} from 'zod';

import {authenticate} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {notFound} from '../../utils/errors.js';
import {createAuthService} from './auth.service.js';

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['customer', 'driver', 'admin']).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const createAuthRouter = (repository: DoorstepRepository) => {
  const router = Router();
  const authService = createAuthService(repository);

  router.post(
    '/signup',
    validate(signupSchema),
    asyncHandler(async (request, response) => {
      const result = await authService.signup(request.body);
      response.status(201).json(result);
    })
  );

  router.post(
    '/login',
    validate(loginSchema),
    asyncHandler(async (request, response) => {
      const result = await authService.login(request.body);
      response.json(result);
    })
  );

  router.get(
    '/me',
    authenticate,
    asyncHandler(async (request, response) => {
      const userId = request.user?.id;
      const user = userId ? await repository.findUserById(userId) : null;
      if (!user) {
        throw notFound('User not found');
      }

      response.json({user});
    })
  );

  return router;
};


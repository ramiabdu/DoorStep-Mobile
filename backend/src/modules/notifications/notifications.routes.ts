import {Router} from 'express';
import {z} from 'zod';

import {authenticate} from '../../middleware/auth.js';
import {validate} from '../../middleware/validate.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {getStringValue} from '../../utils/requestValues.js';

const paramsSchema = z.object({
  params: z.object({
    notificationId: z.string().min(1)
  })
});

export const createNotificationsRouter = (repository: DoorstepRepository) => {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const userId = getStringValue(request.user?.id, 'userId');
      const notifications = await repository.listNotifications(userId);
      response.json({notifications});
    })
  );

  router.patch(
    '/:notificationId/read',
    validate(paramsSchema),
    asyncHandler(async (request, response) => {
      const userId = getStringValue(request.user?.id, 'userId');
      const notificationId = getStringValue(request.params.notificationId, 'notificationId');
      const notification = await repository.markNotificationRead(userId, notificationId);
      response.json({notification});
    })
  );

  return router;
};

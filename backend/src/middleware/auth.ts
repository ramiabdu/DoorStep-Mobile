import type {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import {env} from '../config/env.js';
import type {UserRole} from '../types/domain.js';
import {forbidden, unauthorized} from '../utils/errors.js';

interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export const authenticate = (request: Request, _response: Response, next: NextFunction) => {
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (!token) {
    next(unauthorized());
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    request.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email
    };
    next();
  } catch {
    next(unauthorized('Invalid or expired authentication token'));
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(unauthorized());
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(forbidden());
      return;
    }

    next();
  };


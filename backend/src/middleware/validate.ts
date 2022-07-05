import type {NextFunction, Request, Response} from 'express';
import type {AnyZodObject} from 'zod';

export const validate =
  (schema: AnyZodObject) => (request: Request, _response: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: request.body,
      params: request.params,
      query: request.query
    });

    request.body = parsed.body ?? request.body;
    request.params = parsed.params ?? request.params;
    request.query = parsed.query ?? request.query;
    next();
  };


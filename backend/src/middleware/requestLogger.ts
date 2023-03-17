import type {RequestHandler} from 'express';
import type {IncomingMessage, ServerResponse} from 'node:http';
import pinoHttpModule from 'pino-http';

import {logger} from '../utils/logger.js';

type RequestLogLevel = 'error' | 'warn' | 'info';

type PinoHttpFactory = (options: {
  logger: typeof logger;
  customLogLevel: (
    request: IncomingMessage,
    response: ServerResponse,
    error?: Error
  ) => RequestLogLevel;
}) => RequestHandler;

const pinoHttp = pinoHttpModule as unknown as PinoHttpFactory;

export const requestLogger = pinoHttp({
  logger,
  customLogLevel(_request: IncomingMessage, response: ServerResponse, error?: Error) {
    void _request;

    if (response.statusCode >= 500 || error) {
      return 'error';
    }

    if (response.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  }
});

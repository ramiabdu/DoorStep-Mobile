import pinoHttp from 'pino-http';

import {logger} from '../utils/logger.js';

export const requestLogger = pinoHttp({
  logger,
  customLogLevel(_request, response, error) {
    if (response.statusCode >= 500 || error) {
      return 'error';
    }

    if (response.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  }
});

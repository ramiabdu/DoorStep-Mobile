import pg from 'pg';

import {env} from '../config/env.js';

const {Pool} = pg;

export const createPool = () => {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when DATA_DRIVER=postgres');
  }

  return new Pool({
    connectionString: env.DATABASE_URL,
    ssl:
      env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false
          }
        : undefined
  });
};


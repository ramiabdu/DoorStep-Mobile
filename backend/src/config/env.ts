import 'dotenv/config';

import {z} from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16).default('local-development-secret'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATA_DRIVER: z.enum(['postgres', 'memory']).default('postgres'),
  LOG_LEVEL: z.string().default('info')
});

export const env = envSchema.parse(process.env);

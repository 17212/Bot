import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  FACEBOOK_PAGE_ID: z.string().min(1),
  FACEBOOK_ACCESS_TOKEN: z.string().min(1),
  FACEBOOK_VERIFY_TOKEN: z.string().min(1),
  FACEBOOK_APP_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);

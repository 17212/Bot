import { z } from "zod";

export const envSchema = z.object({
  FACEBOOK_PAGE_ID: z.string().min(1),
  FACEBOOK_ACCESS_TOKEN: z.string().min(1),
  FACEBOOK_VERIFY_TOKEN: z.string().min(1),
  FACEBOOK_APP_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000")
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(raw = process.env): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

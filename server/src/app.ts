import cors from 'cors';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import bodyParser from 'body-parser';
import { appRouter } from './routers';
import { db } from './db';
import { healthHandler } from './routes/health';
import { facebookWebhook, facebookWebhookVerify } from './webhooks/facebook';
import { processScheduledPosts } from './routes/scheduledPosts';
import type { Context } from './trpc';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(
    bodyParser.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  app.get('/api/health', healthHandler);
  app.get('/api/webhook/facebook', facebookWebhookVerify);
  app.post('/api/webhook/facebook', facebookWebhook);
  app.post('/api/scheduled-posts/process', processScheduledPosts);

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: (): Context => ({ db, userId: 1 }),
    }),
  );

  return app;
}

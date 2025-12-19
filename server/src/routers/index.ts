import { router } from '../trpc';
import { commentsRouter } from './comments';
import { messagesRouter } from './messages';
import { postsRouter } from './posts';
import { settingsRouter } from './settings';
import { statsRouter } from './stats';

export const appRouter = router({
  posts: postsRouter,
  settings: settingsRouter,
  stats: statsRouter,
  comments: commentsRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;

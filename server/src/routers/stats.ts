import { count, eq } from 'drizzle-orm';
import { fbComments, fbMessages, fbPosts } from '../../drizzle/schema';
import { publicProcedure, router } from '../trpc';

export const statsRouter = router({
  summary: publicProcedure.query(async ({ ctx }) => {
    const [[postsCount], [commentsCount], [messagesCount], [pendingComments], [pendingMessages]] =
      await Promise.all([
        ctx.db.select({ value: count() }).from(fbPosts),
        ctx.db.select({ value: count() }).from(fbComments),
        ctx.db.select({ value: count() }).from(fbMessages),
        ctx.db.select({ value: count() }).from(fbComments).where(eq(fbComments.status, 'new')),
        ctx.db.select({ value: count() }).from(fbMessages).where(eq(fbMessages.status, 'new')),
      ]);

    return {
      totalPosts: postsCount.value ?? 0,
      totalComments: commentsCount.value ?? 0,
      totalMessages: messagesCount.value ?? 0,
      pendingComments: pendingComments.value ?? 0,
      pendingMessages: pendingMessages.value ?? 0,
    };
  }),
});

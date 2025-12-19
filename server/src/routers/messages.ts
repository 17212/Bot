import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { conversations, fbMessages } from '../../drizzle/schema';
import { publicProcedure, router } from '../trpc';

export const messagesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(conversations).orderBy(asc(conversations.lastMessageAt)).limit(100);
  }),
  thread: publicProcedure.input(z.object({ conversationId: z.number() })).query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(fbMessages)
      .where(eq(fbMessages.conversationId, input.conversationId))
      .orderBy(asc(fbMessages.createdAt));
  }),
  mark: publicProcedure
    .input(z.object({ id: z.number(), status: z.enum(['answered', 'ignored', 'new']) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(fbMessages)
        .set({ status: input.status, repliedAt: input.status === 'answered' ? new Date() : null })
        .where(eq(fbMessages.id, input.id))
        .returning();
      return updated;
    }),
});

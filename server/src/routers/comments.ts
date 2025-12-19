import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fbComments } from '../../drizzle/schema';
import { publicProcedure, router } from '../trpc';

export const commentsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(fbComments).orderBy(asc(fbComments.createdAt)).limit(100);
  }),
  mark: publicProcedure
    .input(z.object({ id: z.number(), status: z.enum(['answered', 'ignored', 'new']) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(fbComments)
        .set({ status: input.status, repliedAt: input.status === 'answered' ? new Date() : null })
        .where(eq(fbComments.id, input.id))
        .returning();
      return updated;
    }),
});

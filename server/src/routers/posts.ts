import { TRPCError } from '@trpc/server';
import { and, asc, eq, lte } from 'drizzle-orm';
import { z } from 'zod';
import { fbPosts, scheduledPosts } from '../../drizzle/schema';
import { publicProcedure, router } from '../trpc';

const createPostInput = z.object({
  message: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']).default('draft'),
  scheduledFor: z.string().datetime().optional(),
  scheduleType: z.enum(['once', 'daily', 'weekly', 'monthly']).default('once'),
});

export const postsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(fbPosts)
      .orderBy(asc(fbPosts.createdAt))
      .limit(100);
    return data;
  }),
  create: publicProcedure
    .input(createPostInput)
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(fbPosts)
        .values({
          userId: ctx.userId ?? 1,
          message: input.message,
          mediaUrl: input.mediaUrl,
          status: input.status,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        })
        .returning();

      if (input.status === 'scheduled' && input.scheduledFor) {
        await ctx.db.insert(scheduledPosts).values({
          userId: ctx.userId ?? 1,
          fbPostId: post.id,
          scheduleType: input.scheduleType,
          nextRunAt: new Date(input.scheduledFor),
        });
      }
      return post;
    }),
  due: publicProcedure
    .input(z.object({ now: z.string().datetime() }))
    .query(async ({ ctx, input }) => {
      const nowDate = new Date(input.now);
      const data = await ctx.db
        .select({
          scheduleId: scheduledPosts.id,
          postId: fbPosts.id,
          message: fbPosts.message,
          mediaUrl: fbPosts.mediaUrl,
          nextRunAt: scheduledPosts.nextRunAt,
          scheduleType: scheduledPosts.scheduleType,
          retryCount: scheduledPosts.retryCount,
        })
        .from(scheduledPosts)
        .where(
          and(
            lte(scheduledPosts.nextRunAt, nowDate),
            lte(scheduledPosts.retryCount, 3),
          ),
        )
        .innerJoin(fbPosts, eq(fbPosts.id, scheduledPosts.fbPostId));
      return data;
    }),
  markPosted: publicProcedure
    .input(
      z.object({
        scheduleId: z.number(),
        postId: z.number(),
        pagePostId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(fbPosts)
        .set({ status: 'posted', pagePostId: input.pagePostId, postedAt: new Date() })
        .where(eq(fbPosts.id, input.postId));
      await ctx.db
        .update(scheduledPosts)
        .set({ retryCount: 0, lastRunAt: new Date(), nextRunAt: null })
        .where(eq(scheduledPosts.id, input.scheduleId));
      return { ok: true };
    }),
  fail: publicProcedure
    .input(
      z.object({
        scheduleId: z.number(),
        postId: z.number(),
        error: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(fbPosts)
        .set({ status: 'failed', lastError: input.error })
        .where(eq(fbPosts.id, input.postId));

      const updated = await ctx.db
        .update(scheduledPosts)
        .set({
          retryCount: scheduledPosts.retryCount + 1,
          lastRunAt: new Date(),
        })
        .where(eq(scheduledPosts.id, input.scheduleId));

      if (!updated.rowsAffected) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
      }
      return { ok: true };
    }),
});

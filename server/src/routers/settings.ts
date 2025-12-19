import { z } from 'zod';
import { botSettings } from '../../drizzle/schema';
import { publicProcedure, router } from '../trpc';

const settingsInput = z.object({
  pageId: z.string().min(1),
  accessToken: z.string().min(10),
  verifyToken: z.string().min(6),
  appSecret: z.string().min(10),
  persona: z.enum(['entertaining', 'formal', 'sarcastic', 'friendly', 'professional']),
  autoReplyComments: z.boolean(),
  autoReplyMessages: z.boolean(),
  language: z.enum(['ar', 'en']),
});

export const settingsRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    const [settings] = await ctx.db.select().from(botSettings).limit(1);
    return settings ?? null;
  }),
  save: publicProcedure.input(settingsInput).mutation(async ({ ctx, input }) => {
    const [existing] = await ctx.db.select().from(botSettings).limit(1);
    if (existing) {
      const [updated] = await ctx.db
        .update(botSettings)
        .set({ ...input, updatedAt: new Date() })
        .where(botSettings.id.eq(existing.id))
        .returning();
      return updated;
    }
    const [created] = await ctx.db
      .insert(botSettings)
      .values({
        userId: ctx.userId ?? 1,
        ...input,
      })
      .returning();
    return created;
  }),
});

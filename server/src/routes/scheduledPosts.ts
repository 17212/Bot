import type { Request, Response } from 'express';
import { db } from '../db';
import { FacebookService } from '../services/facebook';
import { computeNextRun, getDueSchedules } from '../utils/scheduler';

const facebook = new FacebookService();

export async function processScheduledPosts(_req: Request, res: Response) {
  const now = new Date();
  const due = await getDueSchedules(db, now);
  const results: Array<{ scheduleId: number; success: boolean; error?: string }> = [];

  for (const job of due) {
    try {
      const published = await facebook.publishPost({ message: job.message, mediaUrl: job.mediaUrl ?? undefined });
      const next = computeNextRun(job.nextRunAt, job.scheduleType as any);
      await db.update((await import('../../drizzle/schema')).fbPosts).set({
        status: 'posted',
        pagePostId: published.id,
        postedAt: new Date(),
      });
      await db.update((await import('../../drizzle/schema')).scheduledPosts).set({
        retryCount: 0,
        lastRunAt: new Date(),
        nextRunAt: next,
      });
      results.push({ scheduleId: job.scheduleId, success: true });
    } catch (error: any) {
      await db.update((await import('../../drizzle/schema')).scheduledPosts).set({
        retryCount: job.retryCount + 1,
        lastRunAt: new Date(),
      });
      results.push({ scheduleId: job.scheduleId, success: false, error: error?.message });
    }
  }

  return res.json({ processed: results.length, results });
}

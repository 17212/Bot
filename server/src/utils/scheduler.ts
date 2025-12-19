import { and, eq, lte } from 'drizzle-orm';
import { fbPosts, scheduledPosts } from '../../drizzle/schema';
import type { DrizzleDb } from '../db';

export async function getDueSchedules(db: DrizzleDb, now: Date) {
  return db
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
    .where(and(lte(scheduledPosts.nextRunAt, now), lte(scheduledPosts.retryCount, 3)))
    .innerJoin(fbPosts, eq(fbPosts.id, scheduledPosts.fbPostId));
}

export function computeNextRun(current: Date, scheduleType: 'once' | 'daily' | 'weekly' | 'monthly') {
  const next = new Date(current);
  if (scheduleType === 'daily') next.setDate(next.getDate() + 1);
  if (scheduleType === 'weekly') next.setDate(next.getDate() + 7);
  if (scheduleType === 'monthly') next.setMonth(next.getMonth() + 1);
  return scheduleType === 'once' ? null : next;
}

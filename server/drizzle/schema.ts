import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
  'users',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    locale: varchar('locale', { length: 10 }).default('en'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
  }),
);

export const botSettings = mysqlTable(
  'bot_settings',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    pageId: varchar('page_id', { length: 128 }).notNull(),
    accessToken: text('access_token').notNull(),
    verifyToken: varchar('verify_token', { length: 255 }).notNull(),
    appSecret: varchar('app_secret', { length: 255 }).notNull(),
    persona: mysqlEnum('persona', ['entertaining', 'formal', 'sarcastic', 'friendly', 'professional']).default('friendly'),
    autoReplyComments: boolean('auto_reply_comments').default(true),
    autoReplyMessages: boolean('auto_reply_messages').default(true),
    language: mysqlEnum('language', ['ar', 'en']).default('ar'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (table) => ({
    userIdx: index('idx_bot_settings_user').on(table.userId),
  }),
);

export const fbPosts = mysqlTable(
  'fb_posts',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    pagePostId: varchar('page_post_id', { length: 255 }),
    message: text('message').notNull(),
    mediaUrl: text('media_url'),
    status: mysqlEnum('status', ['draft', 'scheduled', 'posted', 'failed']).notNull().default('draft'),
    scheduledFor: datetime('scheduled_for'),
    postedAt: datetime('posted_at'),
    likes: int('likes').default(0),
    comments: int('comments').default(0),
    shares: int('shares').default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (table) => ({
    statusIdx: index('idx_fb_posts_status').on(table.status),
    scheduledIdx: index('idx_fb_posts_scheduled').on(table.scheduledFor),
  }),
);

export const scheduledPosts = mysqlTable(
  'scheduled_posts',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    fbPostId: bigint('fb_post_id', { mode: 'number' })
      .notNull()
      .references(() => fbPosts.id),
    scheduleType: mysqlEnum('schedule_type', ['once', 'daily', 'weekly', 'monthly']).notNull().default('once'),
    nextRunAt: datetime('next_run_at').notNull(),
    retryCount: int('retry_count').default(0),
    lastRunAt: datetime('last_run_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (table) => ({
    nextRunIdx: index('idx_scheduled_posts_next_run').on(table.nextRunAt),
  }),
);

export const fbComments = mysqlTable(
  'fb_comments',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    fbCommentId: varchar('fb_comment_id', { length: 255 }).notNull(),
    fbPostId: bigint('fb_post_id', { mode: 'number' }).references(() => fbPosts.id),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
    message: text('message').notNull(),
    fromName: varchar('from_name', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['new', 'answered', 'ignored']).default('new'),
    repliedAt: datetime('replied_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    commentIdx: index('idx_fb_comments_comment').on(table.fbCommentId),
    statusIdx: index('idx_fb_comments_status').on(table.status),
  }),
);

export const conversations = mysqlTable(
  'conversations',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    participantId: varchar('participant_id', { length: 255 }).notNull(),
    lastMessageAt: datetime('last_message_at').notNull(),
    personaApplied: mysqlEnum('persona_applied', ['entertaining', 'formal', 'sarcastic', 'friendly', 'professional']).default('friendly'),
    language: mysqlEnum('language', ['ar', 'en']).default('ar'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userParticipantIdx: index('idx_conversations_user_participant').on(table.userId, table.participantId),
  }),
);

export const fbMessages = mysqlTable(
  'fb_messages',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    fbMessageId: varchar('fb_message_id', { length: 255 }).notNull(),
    conversationId: bigint('conversation_id', { mode: 'number' })
      .notNull()
      .references(() => conversations.id),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
    senderId: varchar('sender_id', { length: 255 }).notNull(),
    text: text('text').notNull(),
    status: mysqlEnum('status', ['new', 'answered', 'ignored']).default('new'),
    repliedAt: datetime('replied_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    messageIdx: index('idx_fb_messages_message').on(table.fbMessageId),
    statusIdx: index('idx_fb_messages_status').on(table.status),
  }),
);

export const botActivity = mysqlTable(
  'bot_activity',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    type: mysqlEnum('type', ['post_publish', 'comment_reply', 'message_reply', 'error']).notNull(),
    payload: json('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    typeIdx: index('idx_bot_activity_type').on(table.type),
  }),
);

export const botSettingsRelations = relations(botSettings, ({ one }) => ({
  user: one(users, { fields: [botSettings.userId], references: [users.id] }),
}));

export const fbPostsRelations = relations(fbPosts, ({ one }) => ({
  user: one(users, { fields: [fbPosts.userId], references: [users.id] }),
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one }) => ({
  post: one(fbPosts, { fields: [scheduledPosts.fbPostId], references: [fbPosts.id] }),
  user: one(users, { fields: [scheduledPosts.userId], references: [users.id] }),
}));

export const fbCommentsRelations = relations(fbComments, ({ one }) => ({
  post: one(fbPosts, { fields: [fbComments.fbPostId], references: [fbPosts.id] }),
}));

export const fbMessagesRelations = relations(fbMessages, ({ one }) => ({
  conversation: one(conversations, { fields: [fbMessages.conversationId], references: [conversations.id] }),
}));

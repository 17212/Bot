import {
  mysqlTable,
  serial,
  varchar,
  text,
  json,
  datetime,
  int,
  boolean,
  mysqlEnum
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  name: varchar("name", { length: 191 }),
  locale: varchar("locale", { length: 8 }).default("en"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const botSettings = mysqlTable("bot_settings", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  pageId: varchar("page_id", { length: 191 }).notNull(),
  accessToken: text("access_token").notNull(),
  verifyToken: varchar("verify_token", { length: 191 }).notNull(),
  appSecret: varchar("app_secret", { length: 191 }).notNull(),
  persona: mysqlEnum("persona", [
    "entertaining",
    "formal",
    "sarcastic",
    "friendly",
    "professional"
  ]).default("friendly"),
  toneOverrides: json("tone_overrides"),
  autoReplyComments: boolean("auto_reply_comments").default(true),
  autoReplyMessages: boolean("auto_reply_messages").default(true),
  language: mysqlEnum("language", ["ar", "en"]).default("ar"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const fbPosts = mysqlTable("fb_posts", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  pageId: varchar("page_id", { length: 191 }).notNull(),
  fbPostId: varchar("fb_post_id", { length: 191 }),
  content: text("content").notNull(),
  mediaUrls: json("media_urls"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft"),
  scheduledAt: datetime("scheduled_at", { mode: "string" }),
  publishedAt: datetime("published_at", { mode: "string" }),
  stats: json("stats"),
  retryCount: int("retry_count").default(0),
  error: text("error"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  postId: int("post_id").notNull(),
  recurrence: mysqlEnum("recurrence", ["none", "daily", "weekly", "monthly"]).default("none"),
  nextRunAt: datetime("next_run_at", { mode: "string" }),
  lastRunAt: datetime("last_run_at", { mode: "string" }),
  timezone: varchar("timezone", { length: 64 }).default("UTC")
});

export const fbComments = mysqlTable("fb_comments", {
  id: serial("id").primaryKey(),
  fbCommentId: varchar("fb_comment_id", { length: 191 }).notNull(),
  postId: int("post_id"),
  userId: int("user_id"),
  message: text("message").notNull(),
  fromName: varchar("from_name", { length: 191 }),
  fromId: varchar("from_id", { length: 191 }),
  status: mysqlEnum("status", ["new", "replied", "ignored"]).default("new"),
  repliedAt: datetime("replied_at", { mode: "string" }),
  replyId: varchar("reply_id", { length: 191 }),
  language: mysqlEnum("language", ["ar", "en"]).default("ar"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  pageId: varchar("page_id", { length: 191 }).notNull(),
  participantId: varchar("participant_id", { length: 191 }).notNull(),
  lastMessageAt: datetime("last_message_at", { mode: "string" }),
  personaSnapshot: json("persona_snapshot"),
  state: json("state")
});

export const fbMessages = mysqlTable("fb_messages", {
  id: serial("id").primaryKey(),
  fbMessageId: varchar("fb_message_id", { length: 191 }).notNull(),
  conversationId: int("conversation_id").notNull(),
  senderId: varchar("sender_id", { length: 191 }).notNull(),
  senderName: varchar("sender_name", { length: 191 }),
  message: text("message"),
  attachments: json("attachments"),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).default("inbound"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const aiResponses = mysqlTable("ai_responses", {
  id: serial("id").primaryKey(),
  source: mysqlEnum("source", ["comment", "message"]).notNull(),
  sourceId: int("source_id").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  model: varchar("model", { length: 64 }),
  latencyMs: int("latency_ms"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const botActivity = mysqlTable("bot_activity", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  refId: varchar("ref_id", { length: 191 }),
  status: varchar("status", { length: 64 }).notNull(),
  meta: json("meta"),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

export const webhooksLog = mysqlTable("webhooks_log", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 191 }).notNull(),
  type: varchar("type", { length: 128 }).notNull(),
  payload: json("payload"),
  signatureValid: boolean("signature_valid").default(false),
  receivedAt: datetime("received_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`)
});

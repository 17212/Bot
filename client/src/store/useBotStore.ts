import { create } from "zustand";
import type { Post } from "@/components/PostCard";
import type { Comment } from "@/components/CommentCard";
import type { Message } from "@/components/MessageCard";

export type Recurrence = "none" | "daily" | "weekly" | "monthly";

type BotStats = {
  postsPublished: number;
  commentsReplied: number;
  threads: number;
  avgReplyTimeSec: number;
  successRate: number;
  pendingComments: number;
  activeThreads: number;
};

type BotSettings = {
  pageId: string;
  accessToken: string;
  verifyToken: string;
  systemPrompt: string;
  autoComments: boolean;
  autoMessages: boolean;
  language: "ar" | "en";
};

type State = {
  posts: Post[];
  comments: Comment[];
  messages: Message[];
  stats: BotStats;
  settings: BotSettings;
  addPost: (input: {
    content: string;
    mode: "publish" | "schedule";
    scheduledAt?: string;
    recurrence?: Recurrence;
  }) => void;
  setSystemPrompt: (prompt: string) => void;
  updateSettings: (partial: Partial<BotSettings>) => void;
  setCommentStatus: (id: string, status: Comment["status"], replyText?: string) => void;
};

const seedPosts: Post[] = [
  {
    id: "p-1",
    content: "Launching our AI-driven Facebook assistant today!",
    status: "published",
    stats: { likes: 210, comments: 58, shares: 12 }
  },
  {
    id: "p-2",
    content: "Daily recap is scheduled for 6pm with fresh insights.",
    status: "scheduled",
    scheduledAt: "Today 18:00",
    recurrence: "daily",
    stats: { likes: 0, comments: 0, shares: 0 }
  }
];

const seedComments: Comment[] = [
  { id: "c1", author: "User A", message: "Is this automated?", status: "new" },
  { id: "c2", author: "User B", message: "Great update!", status: "replied", repliedAt: "Today 10:05", replyText: "Appreciate it." },
  { id: "c3", author: "User C", message: "When is next post?", status: "new" }
];

const seedMessages: Message[] = [
  { id: "m1", sender: "User X", text: "Hello?", direction: "inbound", time: "09:30" },
  { id: "m2", sender: "Bot", text: "Hi, what's up?", direction: "outbound", time: "09:31" }
];

export const useBotStore = create<State>((set) => ({
  posts: seedPosts,
  comments: seedComments,
  messages: seedMessages,
  stats: {
    postsPublished: 342,
    commentsReplied: 9842,
    threads: 1324,
    avgReplyTimeSec: 2.4,
    successRate: 99.3,
    pendingComments: 98,
    activeThreads: 24
  },
  settings: {
    pageId: "",
    accessToken: "",
    verifyToken: "",
    systemPrompt: "You are 'Not Human', a sarcastic Egyptian Franco AI. Be brief, cold, and witty.",
    autoComments: true,
    autoMessages: true,
    language: "ar"
  },
  addPost: ({ content, mode, scheduledAt, recurrence = "none" }) =>
    set((state) => {
      const id = `p-${Date.now()}`;
      const newPost: Post = {
        id,
        content,
        status: mode === "publish" ? "published" : "scheduled",
        scheduledAt: mode === "schedule" ? scheduledAt || "Soon" : undefined,
        recurrence: mode === "schedule" ? recurrence : undefined,
        stats: { likes: 0, comments: 0, shares: 0 }
      };
      const stats = { ...state.stats };
      if (mode === "publish") {
        stats.postsPublished += 1;
      }
      return { posts: [newPost, ...state.posts], stats };
    }),
  setSystemPrompt: (prompt) =>
    set((state) => ({ settings: { ...state.settings, systemPrompt: prompt } })),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  setCommentStatus: (id, status, replyText) =>
    set((state) => {
      const comments = state.comments.map((c) =>
        c.id === id ? { ...c, status, replyText, repliedAt: replyText ? "now" : c.repliedAt } : c
      );
      const stats = { ...state.stats };
      if (status === "replied") {
        stats.commentsReplied += 1;
        stats.pendingComments = Math.max(0, stats.pendingComments - 1);
      } else if (status === "ignored") {
        stats.pendingComments = Math.max(0, stats.pendingComments - 1);
      }
      return { comments, stats };
    })
}));

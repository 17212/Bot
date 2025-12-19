import type { FC } from "react";
import { CalendarClock, Send, Repeat, AlertCircle } from "lucide-react";
import clsx from "clsx";

export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export type Post = {
  id: string;
  content: string;
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt?: string;
  recurrence?: Recurrence;
  stats?: { likes: number; comments: number; shares: number };
};

export type PostCardProps = {
  post: Post;
};

const PostCard: FC<PostCardProps> = ({ post }) => {
  const statusColor = {
    draft: "bg-white/10 text-body",
    scheduled: "bg-primary/15 text-primary",
    published: "bg-primary/25 text-primary",
    failed: "bg-red-500/20 text-red-200"
  }[post.status];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-body/80">
          <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", statusColor)}>{post.status}</span>
          {post.scheduledAt ? (
            <span className="flex items-center gap-2 text-xs text-body/60">
              <CalendarClock size={14} /> {post.scheduledAt}
            </span>
          ) : null}
        </div>
        {post.status === "scheduled" ? (
          <Repeat size={16} className="text-primary" />
        ) : post.status === "published" ? (
          <Send size={16} className="text-primary" />
        ) : post.status === "failed" ? (
          <AlertCircle size={16} className="text-red-300" />
        ) : null}
      </div>
      <p className="text-heading font-semibold leading-relaxed">{post.content}</p>
      <div className="flex items-center gap-4 text-xs text-body/70">
        <span>👍 {post.stats?.likes ?? 0}</span>
        <span>💬 {post.stats?.comments ?? 0}</span>
        <span>↗️ {post.stats?.shares ?? 0}</span>
      </div>
    </div>
  );
};

export default PostCard;

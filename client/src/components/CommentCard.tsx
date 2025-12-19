import type { FC } from "react";
import { CheckCircle2, MessageCircle, SmilePlus, XCircle } from "lucide-react";
import clsx from "clsx";

export type Comment = {
  id: string;
  author: string;
  message: string;
  status: "new" | "replied" | "ignored";
  repliedAt?: string;
  replyText?: string;
};

export type CommentCardProps = {
  comment: Comment;
  onApprove?: (id: string) => void;
  onIgnore?: (id: string) => void;
};

const CommentCard: FC<CommentCardProps> = ({ comment, onApprove, onIgnore }) => {
  const statusColor = {
    new: "bg-primary/15 text-primary",
    replied: "bg-emerald-500/20 text-emerald-200",
    ignored: "bg-white/10 text-body"
  }[comment.status];

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/8 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle size={16} className="text-primary" />
          <span className="text-heading font-semibold">{comment.author}</span>
        </div>
        <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", statusColor)}>
          {comment.status}
        </span>
      </div>
      <p className="text-body leading-relaxed">{comment.message}</p>
      {comment.replyText ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-body/90">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <CheckCircle2 size={14} />
            Replied{comment.repliedAt ? ` • ${comment.repliedAt}` : ""}
          </div>
          {comment.replyText}
        </div>
      ) : null}
      {comment.status === "new" ? (
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary font-semibold hover:bg-primary/30 transition"
            onClick={() => onApprove?.(comment.id)}
            type="button"
          >
            <SmilePlus size={16} className="inline mr-2" />
            Approve AI reply
          </button>
          <button
            className="px-3 py-2 rounded-xl border border-white/10 text-body hover:bg-white/5 transition"
            onClick={() => onIgnore?.(comment.id)}
            type="button"
          >
            <XCircle size={16} className="inline mr-2" />
            Ignore
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default CommentCard;

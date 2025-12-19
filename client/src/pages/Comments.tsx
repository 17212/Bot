import CommentCard from "@/components/CommentCard";

const comments = [
  {
    id: "c1",
    author: "User A",
    message: "Is this automated?",
    status: "new" as const
  },
  {
    id: "c2",
    author: "User B",
    message: "Great update!",
    status: "replied" as const,
    repliedAt: "Today 10:05",
    replyText: "Appreciate it."
  }
];

function Comments() {
  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">Comments</div>
      <p className="text-body text-sm">Review and approve AI replies.</p>
      <div className="grid gap-3">
        {comments.map((c) => (
          <CommentCard key={c.id} comment={c} />
        ))}
      </div>
    </div>
  );
}

export default Comments;

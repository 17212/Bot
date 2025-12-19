import PostCard from "@/components/PostCard";

const scheduled = [
  {
    id: "sch-1",
    content: "Weekly recap goes out every Sunday 6pm.",
    status: "scheduled" as const,
    scheduledAt: "Sun 18:00",
    stats: { likes: 0, comments: 0, shares: 0 }
  },
  {
    id: "sch-2",
    content: "Daily quote at 9am.",
    status: "scheduled" as const,
    scheduledAt: "Daily 09:00",
    stats: { likes: 0, comments: 0, shares: 0 }
  }
];

function PostScheduler() {
  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">Post Scheduler</div>
      <p className="text-body text-sm">Manage upcoming and recurring posts.</p>
      <div className="grid gap-4">
        {scheduled.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

export default PostScheduler;

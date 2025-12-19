import PostCard from "@/components/PostCard";

const samplePosts = [
  {
    id: "1",
    content: "Launching our AI-driven Facebook assistant today!",
    status: "published",
    stats: { likes: 210, comments: 58, shares: 12 }
  },
  {
    id: "2",
    content: "Daily recap is scheduled for 6pm with fresh insights.",
    status: "scheduled",
    stats: { likes: 0, comments: 0, shares: 0 }
  }
];

function Posts() {
  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">Posts Manager</div>
      <div className="grid gap-4">
        {samplePosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

export default Posts;

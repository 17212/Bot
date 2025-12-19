import { useMemo, useState } from "react";
import { toast } from "sonner";
import PostCard, { Post } from "@/components/PostCard";
import { Repeat, CalendarClock } from "lucide-react";

type Recurrence = "none" | "daily" | "weekly" | "monthly";

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
    stats: { likes: 0, comments: 0, shares: 0 }
  }
];

function Posts() {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [mode, setMode] = useState<"publish" | "schedule">("publish");

  const canSubmit = useMemo(() => content.trim().length > 5, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const id = `p-${Date.now()}`;
    const isSchedule = mode === "schedule";
    const newPost: Post = {
      id,
      content,
      status: isSchedule ? "scheduled" : "published",
      scheduledAt: isSchedule ? scheduledAt || "Later today" : undefined,
      stats: { likes: 0, comments: 0, shares: 0 }
    };
    setPosts((prev) => [newPost, ...prev]);
    toast.success(isSchedule ? "Post scheduled" : "Post published");
    setContent("");
    setScheduledAt("");
    setRecurrence("none");
    setMode("publish");
  };

  return (
    <div className="space-y-6">
      <div className="text-heading font-heading text-2xl flex items-center gap-2">
        Posts Manager
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-5 border border-white/8 space-y-4"
      >
        <div className="grid gap-3">
          <label className="text-sm text-body/80 space-y-2">
            <span className="flex items-center gap-2">
              Content <span className="text-xs text-primary">required</span>
            </span>
            <textarea
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-body focus:border-primary/60 focus:outline-none"
              rows={3}
              placeholder="Write a post or instruction for Gemini to expand..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>

          <div className="grid md:grid-cols-3 gap-3">
            <label className="text-sm text-body/80 space-y-2">
              <span className="flex items-center gap-2">
                <CalendarClock size={14} /> Schedule time (optional)
              </span>
              <input
                type="datetime-local"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-body focus:border-primary/60 focus:outline-none"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </label>

            <label className="text-sm text-body/80 space-y-2">
              <span className="flex items-center gap-2">
                <Repeat size={14} /> Recurrence
              </span>
              <select
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-body focus:border-primary/60 focus:outline-none"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>

            <div className="text-sm text-body/80 space-y-2">
              <span>Mode</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("publish")}
                  className={`flex-1 px-3 py-2 rounded-xl border ${
                    mode === "publish"
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/10 text-body"
                  }`}
                >
                  Publish now
                </button>
                <button
                  type="button"
                  onClick={() => setMode("schedule")}
                  className={`flex-1 px-3 py-2 rounded-xl border ${
                    mode === "schedule"
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/10 text-body"
                  }`}
                >
                  Schedule
                </button>
              </div>
              <div className="text-xs text-body/60">
                If scheduled without time, uses the nearest 15-minute slot.
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/60 text-primary font-semibold disabled:opacity-50"
            >
              {mode === "publish" ? "Publish now" : "Save schedule"}
            </button>
          </div>
        </div>
      </form>

      <div className="grid gap-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

export default Posts;

type Props = {
  title: string;
  status: string;
  stats?: { likes?: number; comments?: number; shares?: number };
  scheduledFor?: string;
};

export function PostCard({ title, status, stats, scheduledFor }: Props) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">{title}</h3>
        <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">{status}</span>
      </div>
      {scheduledFor && <p className="text-textSecondary text-sm">Scheduled: {scheduledFor}</p>}
      <div className="flex gap-3 text-sm text-textSecondary">
        <span>👍 {stats?.likes ?? 0}</span>
        <span>💬 {stats?.comments ?? 0}</span>
        <span>↪️ {stats?.shares ?? 0}</span>
      </div>
    </div>
  );
}

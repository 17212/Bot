import { Activity, MessageCircle, FileText, Bell, Clock3, Gauge, Sparkles } from "lucide-react";
import StatWidget from "@/components/StatWidget";

const stats = [
  { label: "Published Posts", value: 342, icon: <FileText className="text-primary" size={18} />, accent: "primary" as const, hint: "+8 today" },
  { label: "Comments Replied", value: "9,842", icon: <MessageCircle className="text-primary" size={18} />, hint: "98 waiting" },
  { label: "Messenger Threads", value: "1,324", icon: <Activity className="text-primary" size={18} />, hint: "24 active" },
  { label: "Avg Reply Time", value: "2.4s", icon: <Clock3 className="text-primary" size={18} />, hint: "p95: 4.1s" }
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col gap-2">
        <div className="text-heading font-heading text-2xl">Live Dashboard</div>
        <p className="text-body text-sm">Real-time status for posts, comments, and messenger queues.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {stats.map((s) => (
            <StatWidget key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} hint={s.hint} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-heading font-heading">Activity</div>
            <span className="text-xs text-body/70">Today</span>
          </div>
          <ul className="space-y-3 text-sm text-body">
            <li>• Published 12 posts (8 scheduled, 4 instant) — 0 failures.</li>
            <li>• Auto-replied to 320 comments (Gemini: friendly persona).</li>
            <li>• Messenger queue healthy; last response latency 1.6s, p95 4.1s.</li>
            <li>• Webhook signature checks: 100% passed (0 invalid).</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-heading font-heading">Health</div>
            <span className="text-xs text-body/70">Realtime</span>
          </div>
          <div className="space-y-2 text-sm text-body">
            <div className="flex items-center justify-between">
              <span>Facebook Graph API</span>
              <span className="px-2 py-1 rounded-lg bg-primary/15 text-primary font-semibold text-xs">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gemini</span>
              <span className="px-2 py-1 rounded-lg bg-primary/15 text-primary font-semibold text-xs">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Scheduler</span>
              <span className="px-2 py-1 rounded-lg bg-primary/15 text-primary font-semibold text-xs">1 min tick</span>
            </div>
            <div className="flex items-center justify-between">
              <span>DB & Queue</span>
              <span className="px-2 py-1 rounded-lg bg-primary/15 text-primary font-semibold text-xs">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Success rate</span>
              <span className="px-2 py-1 rounded-lg bg-primary/15 text-primary font-semibold text-xs flex items-center gap-1">
                <Gauge size={12} /> 99.3%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>AI safety</span>
              <span className="px-2 py-1 rounded-lg bg-primary/15 text-primary font-semibold text-xs flex items-center gap-1">
                <Sparkles size={12} /> Clean
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

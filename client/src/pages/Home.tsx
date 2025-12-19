import { Sparkles, Zap, Shield, Clock3, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Real-time AI Replies",
    desc: "Gemini 2.5 Pro generates natural replies for comments and Messenger in seconds.",
    icon: Sparkles
  },
  {
    title: "Scheduler & Recurrence",
    desc: "Publish now, schedule later, or repeat daily/weekly/monthly with retries.",
    icon: Clock3
  },
  {
    title: "Analytics & Health",
    desc: "Instant stats for posts, comments, and messages with live status.",
    icon: BarChart3
  },
  {
    title: "Privacy & Security",
    desc: "Tokens stay in env, webhooks verified, rate limits and audit trails.",
    icon: Shield
  },
  {
    title: "High Performance",
    desc: "Offline-first mindset with queues, fast UI on React 19 + Tailwind 4.",
    icon: Zap
  }
];

function Home() {
  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-3xl p-8 border border-white/5">
        <div className="flex flex-col gap-4">
          <div className="text-heading font-heading text-3xl">Facebook AI Bot</div>
          <p className="text-body max-w-3xl">
            IDRISIUM Corp. presents a real-time, offline-first assistant for Facebook Pages powered by Gemini 2.5
            Pro. Auto-reply to comments and Messenger, schedule posts with recurrence, and track live performance.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold">Gemini 2.5 Pro</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-heading">Offline-first</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-heading">Webhooks</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-heading">tRPC + React 19</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass-panel rounded-2xl p-5 border border-white/5 flex gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Icon className="text-primary" size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-heading font-semibold">{f.title}</div>
                <p className="text-body text-sm">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default Home;

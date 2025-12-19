import StatWidget from "@/components/StatWidget";
import { Activity, BarChart3, MessageCircle, FileText } from "lucide-react";

const stats = [
  { label: "Posts", value: 128, icon: <FileText className="text-primary" size={16} /> },
  { label: "Comments", value: 4321, icon: <MessageCircle className="text-primary" size={16} /> },
  { label: "Messages", value: 987, icon: <Activity className="text-primary" size={16} /> },
  { label: "Engagement", value: "18.4%", icon: <BarChart3 className="text-primary" size={16} /> }
];

function Statistics() {
  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">Statistics</div>
      <p className="text-body text-sm">Quick KPIs for your page.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatWidget key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>
    </div>
  );
}

export default Statistics;

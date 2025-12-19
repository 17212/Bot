import { ReactNode } from "react";
import clsx from "clsx";

type StatWidgetProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "primary" | "neutral";
  hint?: string;
};

function StatWidget({ label, value, icon, accent = "neutral", hint }: StatWidgetProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl p-4 border glass-panel",
        accent === "primary" ? "border-primary/40" : "border-white/8"
      )}
    >
      <div className="flex items-center justify-between text-body/80 text-sm">
        <span>{label}</span>
        {icon}
      </div>
      <div className="text-heading font-heading text-2xl mt-2">{value}</div>
      {hint ? <div className="text-xs text-body/60 mt-1">{hint}</div> : null}
    </div>
  );
}

export default StatWidget;

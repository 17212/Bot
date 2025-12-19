import { PropsWithChildren, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppStrings } from "@/constants/strings";
import { Menu, LayoutDashboard, MessageSquare, Settings, BarChart2, Home as HomeIcon, Clock3, FileText, MessageCircleHeart, Info } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Home", to: "/", icon: HomeIcon },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", to: "/posts", icon: FileText },
  { label: "Scheduler", to: "/scheduler", icon: Clock3 },
  { label: "Comments", to: "/comments", icon: MessageCircleHeart },
  { label: "Messages", to: "/messages", icon: MessageSquare },
  { label: "Statistics", to: "/statistics", icon: BarChart2 },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "About", to: "/about", icon: Info }
];

function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const active = useMemo(() => location.pathname, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-body flex">
      <aside className="w-64 hidden md:flex flex-col gap-4 p-4 border-r border-white/5 bg-black/70 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
            AI
          </div>
          <div>
            <div className="text-heading font-heading text-lg">{AppStrings.company}</div>
            <div className="text-xs text-body/70">{AppStrings.motto}</div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition",
                  "hover:bg-primary/10",
                  isActive ? "bg-primary/15 text-heading" : "text-body"
                )}
              >
                <Icon size={18} className="text-primary" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="text-xs text-body/70">
          © {new Date().getFullYear()} {AppStrings.company}. Crafted by {AppStrings.founder} — {AppStrings.founderTitle}.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 backdrop-blur-md bg-black/60 border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg border border-white/10 text-body hover:bg-primary/10">
                <Menu size={18} />
              </button>
              <div>
                <div className="text-heading font-heading text-lg">Facebook AI Bot</div>
                <div className="text-xs text-body/70">Real-time assistant powered by Gemini 2.5 Pro</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-body/80">
              <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold">Online</span>
              <span className="hidden sm:inline">{AppStrings.motto}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-black via-black to-[#050505] min-h-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

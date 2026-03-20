"use client";
import { LayoutDashboard, Compass, Target, MessageSquare, Zap, User, LogOut, TrendingUp, Map } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview",        id: "overview" },
  { icon: Compass,         label: "Explore Careers", id: "explore"  },
  { icon: Map,             label: "Career Roadmap",  id: "roadmap"  },
  { icon: Target,          label: "Skill Gap",       id: "gap"      },
  { icon: Zap,             label: "Resume Optimizer",id: "resume"   },
  { icon: TrendingUp,      label: "Market Insights", id: "market"   },
  { icon: MessageSquare,   label: "Soul Chat",       id: "chat"     },
];

export default function Sidebar({ activeTab, setActiveTab, userEmail }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    window.location.href = "/";
  };

  const displayName = userEmail ? userEmail.split("@")[0] : "Explorer";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/5 p-6 flex flex-col z-50" style={{background:'#0b0c10', fontFamily:"'DM Sans',sans-serif"}}>
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{transform:'rotate(8deg)'}}/>
        <span className="font-bold text-xl tracking-tight text-white">NexChakra</span>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
              activeTab === item.id
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/25"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            <item.icon size={17}/>
            {item.label}
          </button>
        ))}
      </nav>

      {/* USER */}
      <div className="pt-5 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
            {displayName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate capitalize">{displayName}</p>
            <p className="text-zinc-600 text-xs truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/8 transition-colors group text-sm font-medium"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform"/>
          Sign out
        </button>
      </div>
    </aside>
  );
}
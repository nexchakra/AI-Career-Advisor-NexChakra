"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp, Building, Zap, Globe, Loader2, Wifi, WifiOff,
} from "lucide-react";
import axios from "axios";

const REGIONS = [
  "India (₹)",
  "Global ($)",
  "United States ($)",
  "United Kingdom (£)",
  "Europe (€)",
  "Southeast Asia",
  "Middle East",
];

const DEMAND_BADGE: Record<string, string> = {
  High:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low:    "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── PROP TYPE — exported so dashboard/page.tsx can check it ────────────────
export interface MarketInsightsProps {
  /** Pre-select a region from the REGIONS list. Defaults to "India (₹)". */
  defaultRegion?: string;
}

export default function MarketInsights({ defaultRegion }: MarketInsightsProps) {
  const [role,    setRole]    = useState("");
  const [region,  setRegion]  = useState(defaultRegion ?? "India (₹)");
  const [data,    setData]    = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync region when the parent currency toggle changes
  useEffect(() => {
    if (defaultRegion) setRegion(defaultRegion);
  }, [defaultRegion]);

  const fetchInsights = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await axios.post("http://localhost:8000/market-insights", {
        role,
        region,
      });
      setData(res.data as Record<string, unknown>);
    } catch {
      // Fallback preview data — currency-aware
      setData({
        salary_range:     region.includes("₹") ? "₹8–24 LPA"  : "$50k–$120k",
        demand_level:     "High",
        trending_skills:  ["AI/ML", "Cloud", "DevOps"],
        top_companies:    region.includes("₹")
          ? ["TCS", "Infosys", "Wipro"]
          : ["Google", "Microsoft", "Amazon"],
        growth_outlook:   "Strong demand projected through 2027.",
        remote_friendly:  true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Typed helpers so we don't cast everywhere below
  const salaryRange    = data?.salary_range    as string | undefined;
  const demandLevel    = data?.demand_level    as string | undefined;
  const trendingSkills = data?.trending_skills as string[] | undefined;
  const topCompanies   = data?.top_companies   as string[] | undefined;
  const growthOutlook  = data?.growth_outlook  as string | undefined;
  const remoteFriendly = data?.remote_friendly as boolean | undefined;

  return (
    <div className="space-y-6">

      {/* CONTROLS */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ROLE INPUT */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
              Job Role / Field
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInsights()}
              placeholder="e.g. UX Designer, Cardiologist, Data Scientist…"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 transition-all"
            />
          </div>

          {/* REGION SELECT */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Select region"
              title="Select region"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchInsights}
          disabled={!role.trim() || loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Fetching insights…</>
          ) : (
            <><TrendingUp size={16} /> Get Market Insights</>
          )}
        </button>
      </div>

      {/* RESULTS */}
      {data && !loading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* KEY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">
                Salary Range
              </p>
              <p className="text-2xl font-bold text-white">{salaryRange}</p>
              <p className="text-zinc-500 text-xs mt-1">Annual · {region}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">
                Demand Level
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold border mt-1 ${
                  DEMAND_BADGE[demandLevel ?? ""] ?? DEMAND_BADGE.Medium
                }`}
              >
                {demandLevel}
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">
                Remote Friendly
              </p>
              <div className="flex items-center gap-2 mt-1">
                {remoteFriendly ? (
                  <Wifi size={20} className="text-emerald-400" />
                ) : (
                  <WifiOff size={20} className="text-zinc-500" />
                )}
                <span
                  className={`font-bold ${
                    remoteFriendly ? "text-emerald-400" : "text-zinc-500"
                  }`}
                >
                  {remoteFriendly ? "Yes" : "Limited"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TRENDING SKILLS */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-yellow-400" />
                <h4 className="font-semibold text-sm">Trending Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSkills?.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-yellow-500/8 border border-yellow-500/15 text-yellow-400 rounded-lg text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* TOP COMPANIES */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building size={16} className="text-indigo-400" />
                <h4 className="font-semibold text-sm">Top Hiring</h4>
              </div>
              <div className="space-y-2">
                {topCompanies?.map((c, i) => (
                  <div key={c} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 font-mono w-4">{i + 1}</span>
                    <span className="text-sm text-zinc-300 font-medium">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GROWTH OUTLOOK */}
          {growthOutlook && (
            <div className="bg-indigo-600/8 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-3">
              <Globe size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-1">
                  Growth Outlook
                </p>
                <p className="text-zinc-300 text-sm">{growthOutlook}</p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
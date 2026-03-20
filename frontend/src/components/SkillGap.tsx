"use client";
import { useEffect, useState, useCallback } from "react";
import { Target, Zap, BookOpen, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";

const ROLES = [
  "Senior Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "UX Designer",
  "Product Manager",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Business Analyst",
  "Content Strategist",
  "Financial Analyst",
  "Graphic Designer",
  "Medical Researcher",
];

interface GapData {
  missing_skills: string[];
  certifications: string[];
  suggested_project: string;
}

export default function SkillGap({ userId }: { userId: string }) {
  const [data,       setData]       = useState<GapData | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [targetRole, setTargetRole] = useState("Senior Backend Engineer");

  // Stable fetch wrapped in useCallback so it can be a useEffect dependency
  const fetchData = useCallback(async (role: string) => {
    if (!userId) return;
    setLoading(true);
    setData(null);
    try {
      const res = await axios.post("http://localhost:8000/analyze-gap", {
        user_id: userId,
        target_role: role,
      });
      setData(res.data as GapData);
    } catch {
      setData({
        missing_skills: ["Upload your resume to get personalised results"],
        certifications: [],
        suggested_project: "",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch on mount and whenever userId changes — fetchData is now stable
  useEffect(() => {
    if (userId) fetchData(targetRole);
  }, [userId, fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">

      {/* ROLE SELECTOR */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="target-role-select"
            className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block"
          >
            Target Role
          </label>
          <select
            id="target-role-select"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            aria-label="Select your target role"
            title="Select your target role"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-zinc-900">
                {r}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => fetchData(targetRole)}
          disabled={loading}
          className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Analyse
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-52 text-zinc-500">
          <Loader2 className="animate-spin mb-3 text-indigo-500" size={28} />
          <p className="text-sm animate-pulse">Analysing your profile…</p>
        </div>
      )}

      {/* RESULTS */}
      {data && !loading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* CRITICAL GAPS */}
            <div className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target className="text-red-400" size={18} />
                <h3 className="font-semibold text-white">Critical Skill Gaps</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-red-500/8 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold uppercase tracking-wide"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* CERTIFICATIONS */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="text-indigo-400" size={18} />
                <h3 className="font-semibold text-white">Priority Certifications</h3>
              </div>
              <ul className="space-y-3">
                {data.certifications.length > 0 ? (
                  data.certifications.map((c) => (
                    <li key={c} className="flex items-start gap-3 text-sm text-zinc-400">
                      <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                      {c}
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-600 text-sm">
                    Upload your resume to get certification recommendations.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* GAP-CLOSER PROJECT */}
          {data.suggested_project && (
            <div className="relative overflow-hidden bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-6">
              <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
                <Zap size={100} className="text-indigo-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-yellow-400 fill-yellow-400" size={18} />
                  <h3 className="font-semibold text-white">The Gap-Closer Project</h3>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                  &ldquo;{data.suggested_project}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
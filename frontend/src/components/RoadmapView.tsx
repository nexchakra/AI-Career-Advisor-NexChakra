"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Zap, Lightbulb, Layers, Database, Cpu,
  ArrowRight, Rocket, Loader2, AlertCircle, ChevronDown, Search,
} from "lucide-react";
import axios from "axios";

// ── Suggested roles shown in the dropdown ────────────────────────────────
const SUGGESTED_ROLES = [
  "Senior Backend Engineer",
  "Frontend Developer",
  "Full Stack Engineer",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "Product Designer",
  "Business Analyst",
  "Cloud Architect",
  "UX Researcher",
  "Cybersecurity Analyst",
  "Graphic Designer",
  "Medical Doctor",
  "Financial Analyst",
  "Content Strategist",
  "Chartered Accountant",
  "Civil Engineer",
  "HR Manager",
  "Lawyer",
  "Teacher / Educator",
];

interface RoadmapStep {
  title:  string;
  status: "completed" | "current" | "upcoming";
  desc:   string;
  skills: string[];
  icon:   string;
}
interface RoadmapData {
  career_path:  string;
  match_score:  number;
  steps:        RoadmapStep[];
}

function PhaseIcon({ type }: { type: string }) {
  const cls = "shrink-0";
  switch (type) {
    case "db":     return <Database size={17} className={`${cls} text-emerald-400`} />;
    case "layers": return <Layers   size={17} className={`${cls} text-indigo-400`}  />;
    case "cpu":    return <Cpu      size={17} className={`${cls} text-violet-400`}  />;
    default:       return <Rocket   size={17} className={`${cls} text-blue-400`}    />;
  }
}

export default function RoadmapView({ userId }: { userId: string }) {
  const [roadmap,     setRoadmap]     = useState<RoadmapData | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(false);
  const [inputValue,  setInputValue]  = useState("Senior Backend Engineer");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on what's typed
  const filtered = inputValue.trim().length === 0
    ? SUGGESTED_ROLES
    : SUGGESTED_ROLES.filter((r) =>
        r.toLowerCase().includes(inputValue.toLowerCase())
      );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchRoadmap = async (role: string) => {
    if (!role.trim()) return;
    setLoading(true);
    setError(false);
    setRoadmap(null);
    setShowDropdown(false);
    try {
      const res = await axios.post("http://localhost:8000/generate-roadmap", {
        user_id:     userId || "guest",
        target_role: role.trim(),
      });
      setRoadmap(res.data as RoadmapData);
    } catch {
      setError(true);
      setRoadmap({
        career_path: role,
        match_score: 72,
        steps: [
          { title: "Foundations",   status: "completed", desc: "Core concepts and fundamentals.",        skills: ["Basics", "Problem Solving", "Git"],       icon: "db"     },
          { title: "Intermediate",  status: "current",   desc: "Build real-world projects and APIs.",    skills: ["Framework", "Databases", "Testing"],      icon: "layers" },
          { title: "Senior Skills", status: "upcoming",  desc: "Architecture, scaling, and leadership.", skills: ["System Design", "Cloud", "Mentorship"],   icon: "cpu"    },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (role: string) => {
    setInputValue(role);
    setShowDropdown(false);
    fetchRoadmap(role);
  };

  return (
    <div className="space-y-8 pb-20">

      {/* ── COMBO INPUT ─────────────────────────────────────────────────── */}
      <div ref={containerRef} className="relative">
        <div className="flex gap-3">
          {/* TEXT INPUT — free type anything */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              aria-label="Enter your target career role"
              title="Type any career role or pick from suggestions"
              placeholder="Type any career — Doctor, Designer, Engineer…"
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchRoadmap(inputValue);
                if (e.key === "Escape") setShowDropdown(false);
              }}
              className="w-full pl-10 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 transition-all"
            />
            {/* Chevron toggle */}
            <button
              type="button"
              aria-label="Show role suggestions"
              title="Show suggestions"
              onClick={() => setShowDropdown((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={() => fetchRoadmap(inputValue)}
            disabled={loading || !inputValue.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <><Rocket size={15} /> Generate Roadmap</>
            )}
          </button>
        </div>

        {/* DROPDOWN SUGGESTIONS */}
        <AnimatePresence>
          {showDropdown && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#111218] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-64 overflow-y-auto"
            >
              {filtered.length < SUGGESTED_ROLES.length && inputValue.trim() && (
                /* Show "use custom" option when filtering */
                <button
                  type="button"
                  onClick={() => handleSelect(inputValue)}
                  className="w-full text-left px-4 py-3 text-sm text-indigo-400 hover:bg-indigo-600/15 border-b border-white/5 flex items-center gap-2 transition-colors"
                >
                  <Search size={13} />
                  Use &ldquo;{inputValue}&rdquo; as custom role
                </button>
              )}
              {filtered.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelect(role)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group ${
                    role === inputValue
                      ? "bg-indigo-600/15 text-indigo-300"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {role}
                  {role === inputValue && (
                    <CheckCircle2 size={13} className="text-indigo-400" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── LOADING ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-72 text-zinc-500">
          <Loader2 className="animate-spin mb-4 text-indigo-500" size={36} />
          <p className="text-sm animate-pulse">Calculating your optimal trajectory…</p>
        </div>
      )}

      {/* ── ROADMAP ──────────────────────────────────────────────────────── */}
      {roadmap && !loading && (
        <>
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-indigo-600/8 border border-indigo-500/20 rounded-2xl p-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="text-yellow-400" size={18} />
                  <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">AI Strategy</p>
                </div>
                <h2 className="text-2xl font-bold text-white">{roadmap.career_path}</h2>
                <p className="text-zinc-400 text-sm mt-1 max-w-md">
                  Optimised path based on your current skill profile.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Match</p>
                <span className="text-4xl font-black text-indigo-400">{roadmap.match_score}%</span>
              </div>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-500/70">
                <AlertCircle size={13} /> Showing preview — connect backend for live data.
              </div>
            )}
          </motion.div>

          {/* TIMELINE */}
          <div className="relative ml-6 border-l-2 border-zinc-800/60 pl-10 space-y-12">
            <AnimatePresence>
              {roadmap.steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* STATUS DOT */}
                  <div className={`absolute -left-[58px] top-1.5 p-1.5 rounded-full border-[5px] border-[#08090c] z-20 ${
                    step.status === "completed" ? "bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.3)]" :
                    step.status === "current"   ? "bg-indigo-600 shadow-[0_0_24px_rgba(79,70,229,0.5)]"  :
                    "bg-zinc-700"
                  }`}>
                    {step.status === "completed" ? (
                      <CheckCircle2 size={14} className="text-white" />
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-full ${step.status === "current" ? "animate-pulse bg-white" : "bg-transparent"}`} />
                    )}
                  </div>

                  {/* CARD */}
                  <div className={`rounded-2xl p-7 border transition-all ${
                    step.status === "current"
                      ? "bg-indigo-500/5 border-indigo-500/30 ring-1 ring-indigo-500/15"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <PhaseIcon type={step.icon} />
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">
                            Phase 0{i + 1}
                          </span>
                        </div>
                        <h3 className={`text-xl font-bold ${step.status === "current" ? "text-indigo-200" : "text-zinc-100"}`}>
                          {step.title}
                        </h3>
                      </div>
                      {step.status === "current" && (
                        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-5">{step.desc}</p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {step.skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-all rounded-lg text-xs font-mono">
                          {s}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`flex items-center gap-2 text-xs font-bold transition-all ${
                        step.status === "completed" ? "text-emerald-500" : "text-indigo-400 hover:gap-3"
                      }`}
                    >
                      {step.status === "completed"
                        ? "✓ Milestone Reached"
                        : <><span>Access Training Modules</span> <ArrowRight size={14} /></>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* END NODE */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-5 ml-6 pl-10"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-400/20">
              <Rocket size={22} className="text-white fill-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white italic">Placement Ready</h4>
              <p className="text-zinc-600 text-xs">Automated resume push to top hiring companies.</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
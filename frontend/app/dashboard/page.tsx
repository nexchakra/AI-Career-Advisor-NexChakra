"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, Target, Wand2, TrendingUp, BookOpen,
  Compass, Upload, Loader2, IndianRupee, DollarSign,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

import Assessment      from "@/src/components/Assessment";
import RoadmapView     from "@/src/components/RoadmapView";
import Sidebar         from "@/src/components/Sidebar";
import SoulChat        from "@/src/components/SoulChat";
import ProtectedRoute  from "@/src/components/ProtectedRoute";
import SkillGap        from "@/src/components/SkillGap";
import ResumeOptimizer from "@/src/components/ResumeOptimizer";
import MarketInsights  from "@/src/components/Marketinsights";
import CareerExplorer  from "@/src/components/Careerexplorer";

import "./dashboard.css";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TAB_MOTION = {
  initial:    { opacity: 0, y: 18  },
  animate:    { opacity: 1, y: 0   },
  exit:       { opacity: 0, y: -18 },
  transition: { duration: 0.22     },
};

function calcStrength(count: number): { label: string; color: string } {
  if (count >= 10) return { label: "Expert",   color: "indigo" };
  if (count >= 6)  return { label: "Advanced", color: "violet" };
  if (count >= 3)  return { label: "Growing",  color: "amber"  };
  return                  { label: "Beginner", color: "zinc"   };
}

// ─────────────────────────────────────────────────────────────────────────────
// EDGE-SAFE FILE UPLOAD HOOK
//
// WHY: Edge fires onChange synchronously as the file dialog closes, which
// blocks the main thread if React state updates run on the same tick.
// FIX:  defer the state update via setTimeout(fn, 0) — one tick later, Edge
//       has finished its dialog-close sequence and the thread is free.
//
// Additionally, all inputs use className="hidden" (display:none) rather than
// opacity-0/absolute/inset-0. Edge's layout scanner skips display:none
// elements, preventing the secondary "not responding" freeze.
// ─────────────────────────────────────────────────────────────────────────────
function useEdgeSafeUpload(onFile: (f: File) => void) {
  const ref = useRef<HTMLInputElement>(null);

  const openDialog = () => {
    if (ref.current) ref.current.value = ""; // allow re-selecting same file
    ref.current?.click();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // ✅ Defer one tick — prevents Edge main-thread freeze on dialog confirm
    setTimeout(() => onFile(file), 0);
  };

  return { ref, openDialog, onChange };
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW STAT CARDS — driven by real skill count from API
// ─────────────────────────────────────────────────────────────────────────────
function OverviewStats({ skills, loading }: { skills: string[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const count     = skills.length;
  const readiness = count > 0 ? Math.min(count * 5, 100) : null;
  const { label: strength, color: sc } = calcStrength(count);

  const hintText =
    count === 0 ? "Upload resume to calculate" :
    count < 6   ? `Add ${6 - count} more skills to reach Advanced` :
                  "Great foundation — keep growing";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* READINESS SCORE */}
      <div className="stat-card stat-card--indigo">
        <div className="stat-card__header">
          <TrendingUp size={15} className="text-indigo-400" />
          <p className="stat-card__label">Readiness Score</p>
        </div>
        {readiness !== null ? (
          <>
            <h3 className="stat-card__value">{readiness}%</h3>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${readiness}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="stat-card__hint">{count} skills on file</p>
          </>
        ) : (
          <p className="stat-card__hint">{hintText}</p>
        )}
      </div>

      {/* PROFILE STRENGTH */}
      <div className={`stat-card stat-card--${sc}`}>
        <div className="stat-card__header">
          <Brain size={15} className={`text-${sc}-400`} />
          <p className="stat-card__label">Profile Strength</p>
        </div>
        <h3 className="stat-card__value">{strength}</h3>
        <p className="stat-card__hint">{hintText}</p>
      </div>

      {/* MARKET DEMAND */}
      <div className="stat-card stat-card--emerald">
        <div className="stat-card__header">
          <Zap size={15} className="text-emerald-400" />
          <p className="stat-card__label">Market Demand</p>
        </div>
        <h3 className="stat-card__value">High</h3>
        <p className="stat-card__hint">India tech hiring up 23% — 2025</p>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS PANEL — shows upload CTA when no resume; Edge-safe input
// ─────────────────────────────────────────────────────────────────────────────
function SkillsPanel({
  skills, loading, onUpload, uploading,
}: {
  skills: string[];
  loading: boolean;
  onUpload: (f: File) => void;
  uploading: boolean;
}) {
  const { ref, openDialog, onChange } = useEdgeSafeUpload(onUpload);

  if (loading) {
    return (
      <div className="md:col-span-8 h-44 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
    );
  }

  if (skills.length === 0) {
    return (
      <div className="md:col-span-8 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
        {/*
          ✅ EDGE-SAFE: className="hidden" → display:none
          Edge's layout scanner skips display:none elements entirely.
          DO NOT use opacity-0 + absolute + inset-0 (causes Edge freeze).
        */}
        <input
          ref={ref}
          type="file"
          accept=".pdf"
          aria-label="Upload resume PDF"
          title="Upload resume PDF"
          onChange={onChange}
          className="hidden"
        />
        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
          <Upload size={20} className="text-zinc-500" />
        </div>
        <div>
          <p className="text-white font-semibold mb-1">No resume uploaded yet</p>
          <p className="text-zinc-500 text-sm max-w-sm">
            Upload your PDF resume to detect skills and unlock personalised insights.
          </p>
        </div>
        {/* ✅ Button triggers hidden input programmatically — no <label> wrapper needed */}
        <button
          type="button"
          onClick={openDialog}
          disabled={uploading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
        >
          {uploading
            ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
            : <><Upload size={14} /> Upload Resume (PDF)</>}
        </button>
      </div>
    );
  }

  return (
    <div className="md:col-span-8 bg-white/[0.02] border border-white/5 rounded-2xl p-8">
      <div className="flex items-center gap-2 mb-5">
        <Brain className="text-indigo-400" size={18} />
        <h2 className="font-semibold text-lg">Your Skills</h2>
        <span className="ml-auto text-xs text-zinc-600 font-mono">{skills.length} detected</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL GAP TAB WRAPPER — amber upload banner when no profile; Edge-safe
// ─────────────────────────────────────────────────────────────────────────────
function SkillGapWithUpload({ userId }: { userId: string }) {
  const [status,    setStatus]    = useState<"checking" | "noprofile" | "ready">("checking");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await axios.post("http://localhost:8000/upload-resume", fd);
      setStatus("ready");
    } catch {
      // swallow — let user retry
    } finally {
      setUploading(false);
    }
  };

  const { ref, openDialog, onChange } = useEdgeSafeUpload(handleFile);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:8000/profile/${userId}`)
      .then((r) => setStatus(r.data?.skills?.length ? "ready" : "noprofile"))
      .catch(() => setStatus("noprofile"));
  }, [userId]);

  if (status === "checking") {
    return (
      <div className="flex items-center gap-3 text-zinc-500 h-32">
        <Loader2 size={18} className="animate-spin text-indigo-500" />
        Checking your profile…
      </div>
    );
  }

  if (status === "noprofile") {
    return (
      <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-center">
        {/* ✅ Edge-safe hidden input — display:none, triggered by button below */}
        <input
          ref={ref}
          type="file"
          accept=".pdf"
          aria-label="Upload resume PDF for skill gap analysis"
          title="Upload resume PDF"
          onChange={onChange}
          className="hidden"
        />
        <div className="flex-1 space-y-1">
          <p className="text-amber-300 font-semibold flex items-center gap-2 text-sm">
            <Upload size={15} /> Resume required for Skill Gap Analysis
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We read your skills from your resume to compare against your target role.
            Upload a PDF (max 5 MB) to continue.
          </p>
        </div>
        <button
          type="button"
          onClick={openDialog}
          disabled={uploading}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-700 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          {uploading
            ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
            : <><Upload size={14} /> Upload Resume</>}
        </button>
      </div>
    );
  }

  return <SkillGap userId={userId} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY TOGGLE  ₹ / $
// ─────────────────────────────────────────────────────────────────────────────
function CurrencyToggle({
  currency, setCurrency,
}: {
  currency: "INR" | "USD";
  setCurrency: (c: "INR" | "USD") => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
      {(["INR", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            currency === c
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          {c === "INR" ? <IndianRupee size={13} /> : <DollarSign size={13} />}
          {c === "INR" ? "INR ₹" : "USD $"}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab,      setActiveTab]      = useState("overview");
  const [userId,         setUserId]         = useState("");
  const [userEmail,      setUserEmail]      = useState("");
  const [skills,         setSkills]         = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [currency,       setCurrency]       = useState<"INR" | "USD">("INR");

  useEffect(() => {
    setUserId(localStorage.getItem("user_id")    ?? "");
    setUserEmail(localStorage.getItem("user_email") ?? "");
  }, []);

  const fetchProfile = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const r = await axios.get(`http://localhost:8000/profile/${id}`);
      setSkills(r.data?.skills ?? []);
    } catch {
      setSkills([]);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(userId); }, [userId, fetchProfile]);

  // Upload handler used by the overview SkillsPanel
  const handleOverviewUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await axios.post("http://localhost:8000/upload-resume", fd);
      await fetchProfile(userId); // refresh skill count immediately
    } catch {
      // swallow
    } finally {
      setUploading(false);
    }
  };

  const userName     = userEmail.split("@")[0] || "Explorer";
  const marketRegion = currency === "INR" ? "India (₹)" : "Global ($)";

  return (
    <ProtectedRoute>
      <div className="dashboard-root">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userEmail={userEmail} />

        <main className="flex-1 ml-64 p-10 relative min-h-screen">
          {/* ambient background glows */}
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-[-5%] left-[25%] w-[35%] h-[35%] bg-indigo-600/8 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-violet-600/8 blur-[100px] rounded-full" />
          </div>

          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ─────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <motion.div key="overview" {...TAB_MOTION} className="space-y-8 max-w-6xl">
                <header>
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-2">
                    Career Intelligence
                  </p>
                  <h1 className="text-4xl font-bold text-white font-display">
                    Welcome back,{" "}
                    <em className="text-indigo-400 not-italic capitalize">{userName}</em>
                  </h1>
                  <p className="text-zinc-500 mt-2">Your AI-powered career command centre.</p>
                </header>

                <OverviewStats skills={skills} loading={profileLoading} />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <SkillsPanel
                    skills={skills}
                    loading={profileLoading}
                    onUpload={handleOverviewUpload}
                    uploading={uploading}
                  />
                  <div className="md:col-span-4 bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-2xl p-8 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-indigo-400" size={18} />
                      <h2 className="font-semibold text-lg">Quick Actions</h2>
                    </div>
                    <button type="button" onClick={() => setActiveTab("gap")}
                      className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 text-sm">
                      <Target size={16} /> Skill Gap Analysis
                    </button>
                    <button type="button" onClick={() => setActiveTab("explore")}
                      className="w-full py-3 border border-white/10 text-white font-semibold hover:bg-white/5 transition-all rounded-xl flex items-center justify-center gap-2 text-sm">
                      <Compass size={16} /> Explore Careers
                    </button>
                    <button type="button" onClick={() => setActiveTab("resume")}
                      className="w-full py-3 border border-white/10 text-white font-semibold hover:bg-white/5 transition-all rounded-xl flex items-center justify-center gap-2 text-sm">
                      <Wand2 size={16} /> Improve Resume
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <BookOpen className="text-indigo-400" size={22} />
                    Career Suitability Assessment
                  </h2>
                  <Assessment />
                </div>
              </motion.div>
            )}

            {/* ── EXPLORE CAREERS ──────────────────────────────────────── */}
            {activeTab === "explore" && (
              <motion.div key="explore" {...TAB_MOTION} className="max-w-5xl">
                <h1 className="text-4xl font-bold mb-2 font-display">
                  Explore <em className="text-indigo-400 not-italic">Careers</em>
                </h1>
                <p className="text-zinc-500 mb-10">
                  Discover roles across every field — tech, medicine, arts, law, business and beyond.
                </p>
                <CareerExplorer />
              </motion.div>
            )}

            {/* ── SKILL GAP ────────────────────────────────────────────── */}
            {activeTab === "gap" && (
              <motion.div key="gap" {...TAB_MOTION} className="max-w-5xl">
                <h1 className="text-4xl font-bold mb-2 font-display">
                  Skill <em className="text-indigo-400 not-italic">Gap</em> Analysis
                </h1>
                <p className="text-zinc-500 mb-6">Compare your current profile against your target role.</p>
                <SkillGapWithUpload userId={userId} />
              </motion.div>
            )}

            {/* ── RESUME OPTIMIZER ─────────────────────────────────────── */}
            {activeTab === "resume" && (
              <motion.div key="resume" {...TAB_MOTION} className="max-w-4xl">
                <h1 className="text-4xl font-bold mb-2 font-display">
                  Resume <em className="text-indigo-400 not-italic">Optimizer</em>
                </h1>
                <p className="text-zinc-500 mb-10">AI-powered bullet rewrites for maximum ATS impact.</p>
                <ResumeOptimizer userId={userId} />
              </motion.div>
            )}

            {/* ── CAREER ROADMAP ───────────────────────────────────────── */}
            {activeTab === "roadmap" && (
              <motion.div key="roadmap" {...TAB_MOTION} className="max-w-4xl">
                <h1 className="text-4xl font-bold mb-10 font-display">
                  Your Personalized <em className="text-indigo-400 not-italic">Path</em>
                </h1>
                <RoadmapView userId={userId} />
              </motion.div>
            )}

            {/* ── MARKET INSIGHTS ──────────────────────────────────────── */}
            {activeTab === "market" && (
              <motion.div key="market" {...TAB_MOTION} className="max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <h1 className="text-4xl font-bold font-display">
                      Market <em className="text-indigo-400 not-italic">Insights</em>
                    </h1>
                    <p className="text-zinc-500 mt-2">
                      Salary data, demand signals, and top hiring companies.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-zinc-600 text-xs uppercase font-bold tracking-wider">Currency</p>
                    <CurrencyToggle currency={currency} setCurrency={setCurrency} />
                  </div>
                </div>
                <MarketInsights defaultRegion={marketRegion} />
              </motion.div>
            )}

            {/* ── SOUL CHAT ────────────────────────────────────────────── */}
            {activeTab === "chat" && (
              <motion.div key="chat" {...TAB_MOTION} className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-1 font-display">
                  Career <em className="text-indigo-400 not-italic">Soul</em> Chat
                </h1>
                <p className="text-zinc-500 mb-6">Your always-on AI mentor — for any career, any stage.</p>
                <SoulChat userId={userId} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
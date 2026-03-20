"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Sparkles, Brain, Target, Map, MessageSquare,
  TrendingUp, Compass, ChevronDown, Star,
} from "lucide-react";

// ── CONSTANTS ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Compass,       title: "Career Explorer",    desc: "Discover paths in medicine, law, design, finance, tech and beyond — not just engineering." },
  { icon: Map,           title: "AI Roadmap",         desc: "Phase-by-phase plan built around your exact skill set and target role." },
  { icon: Target,        title: "Skill Gap Analysis", desc: "See exactly what's missing between you and your dream job — with projects to close it." },
  { icon: Brain,         title: "Resume Optimizer",   desc: "AI rewrites your bullets with action verbs and measurable impact." },
  { icon: TrendingUp,    title: "Market Insights",    desc: "Live salary ranges, demand signals, and top hiring companies by region." },
  { icon: MessageSquare, title: "Soul Chat",          desc: "Always-on career mentor that validates, motivates, and gives honest next steps." },
];

const FIELDS = [
  "Software Engineering", "Medicine & Healthcare", "Graphic Design", "Finance & Banking",
  "Architecture", "Law & Legal", "Data Science", "Psychology", "Journalism",
  "Environmental Science", "Marketing", "Nursing", "Film & Media",
  "Entrepreneurship", "Teaching", "Biotechnology",
];

const TESTIMONIALS = [
  { name: "Priya S.",  role: "Medical Student → Research",  text: "I had no idea which branch of medicine suited me. Soul Chat helped me realise clinical research was my calling.", stars: 5 },
  { name: "Arjun K.",  role: "CS Graduate → ML Engineer",   text: "The roadmap showed me exactly which 3 skills to learn. Got placed in 4 months.", stars: 5 },
  { name: "Meera T.",  role: "Arts Student → UX Designer",  text: "Finally a platform that didn't push me into coding. It guided me straight to UX and I love it.", stars: 5 },
];

// ── ANIMATED TICKER ───────────────────────────────────────────────────────
function FieldTicker() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-white/5">
      <div className="flex animate-ticker whitespace-nowrap gap-8">
        {[...FIELDS, ...FIELDS].map((f, i) => (
          <span key={i} className="text-zinc-600 text-sm font-medium tracking-wide uppercase shrink-0">
            {f} <span className="text-indigo-800 mx-4">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── ANIMATED STAT COUNTER ─────────────────────────────────────────────────
function StatCounter({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let val = 0;
        const step = to / 60;
        const timer = setInterval(() => {
          val += step;
          if (val >= to) { setCount(to); clearInterval(timer); }
          else setCount(Math.floor(val));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black text-white">{count}{suffix}</p>
      <p className="text-zinc-500 text-sm mt-1">{label}</p>
    </div>
  );
}

// ── MAIN LANDING PAGE ─────────────────────────────────────────────────────
export default function LandingPage() {
  const router  = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1],   ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="bg-[#08090c] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&display=swap');

        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .animate-ticker { animation: ticker 28s linear infinite; }

        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(0.97)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,40px) scale(1.08)} 66%{transform:translate(20px,-20px) scale(0.95)} }
        .orb1 { animation: orb1 18s ease-in-out infinite; }
        .orb2 { animation: orb2 22s ease-in-out infinite; }

        .card-glow:hover { box-shadow: 0 0 40px rgba(99,102,241,0.08), 0 1px 0 rgba(255,255,255,0.06) inset; }
        .text-display   { font-family: 'Cormorant Garamond', serif; }

        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: #08090c; }
        ::-webkit-scrollbar-thumb { background: #1e1f2e; border-radius: 2px; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] backdrop-blur-xl bg-[#08090c]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg shadow-[0_0_14px_rgba(99,102,241,0.6)]" style={{ transform: "rotate(8deg)" }} />
            <span className="font-bold text-lg tracking-tight">NexChakra</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            {/* ✅ Anchor tags — no JS needed, native smooth scroll */}
            <a href="#features"     className="hover:text-white transition-colors">Features</a>
            <a href="#how"          className="hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ type="button" on all nav buttons */}
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)]"
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs + grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb1 absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="orb2 absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-violet-700/8 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* BADGE */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <Sparkles size={13} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">AI-powered · All fields · Free to start</span>
          </motion.div>

          {/* HEADLINE */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-display text-6xl md:text-8xl text-white leading-[1.05] mb-6">
            Your career,<br />
            <em className="text-indigo-400">finally clear.</em>
          </motion.h1>

          {/* SUBHEAD */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            NexChakra uses AI to map your strengths to the right career — whether
            that&apos;s medicine, design, law, tech, or something you haven&apos;t considered yet.
          </motion.p>

          {/* CTA ROW */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">

            {/* PRIMARY CTA */}
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-base transition-all shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_50px_rgba(99,102,241,0.55)] flex items-center gap-2.5"
            >
              Start for free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/*
              ✅ "See how it works" is now a real <a> anchor tag.
              It scrolls to the #how section which is rendered further down the page.
              No JS needed — native browser smooth scroll.
            */}
            <a
              href="#how"
              className="px-8 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-2xl font-medium text-base text-zinc-300 transition-all flex items-center gap-2"
            >
              <ChevronDown size={15} className="text-indigo-400" />
              How it works
            </a>
          </motion.div>

          {/* SCROLL CUE */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <ChevronDown size={20} className="text-zinc-600 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <FieldTicker />

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCounter to={50}  suffix="K+" label="Students Guided"  />
          <StatCounter to={200} suffix="+"  label="Career Paths"     />
          <StatCounter to={95}  suffix="%"  label="Satisfaction Rate" />
          <StatCounter to={12}  suffix="+"  label="Fields Covered"   />
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Everything you need</p>
          <h2 className="text-display text-5xl md:text-6xl text-white">
            Built for every<br /><em className="text-zinc-400">kind of student.</em>
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl mx-auto">
            From school leavers to career switchers — NexChakra works for any field, any stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }} viewport={{ once: true }}
              className="card-glow group p-7 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.035] transition-all cursor-default">
              <div className="w-10 h-10 bg-indigo-600/15 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600/25 transition-all">
                <f.icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      {/* ✅ id="how" — this is what both nav link and hero button scroll to */}
      <section id="how" className="py-28 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Simple process</p>
            <h2 className="text-display text-5xl text-white">
              Three steps to<br /><em className="text-zinc-400">career clarity.</em>
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: "01", title: "Take the assessment",     desc: "Answer 4 quick questions about your interests, strengths, and goals." },
                { n: "02", title: "Get your career map",     desc: "AI analyses your profile and recommends paths — with a phase-by-phase roadmap." },
                { n: "03", title: "Execute with confidence", desc: "Use Skill Gap, Soul Chat, and Market Insights to land your role." },
              ].map((step, i) => (
                <motion.div key={step.n}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.4 }} viewport={{ once: true }}
                  className="text-center relative">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center mx-auto mb-5">
                    <span className="text-indigo-400 font-black text-sm">{step.n}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FIELDS SHOWCASE ─────────────────────────────────────────────── */}
      <section className="py-28 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Not just tech</p>
            <h2 className="text-display text-5xl text-white leading-tight mb-6">
              Every field.<br /><em className="text-zinc-400">Every ambition.</em>
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-8 max-w-md">
              Most career platforms only know software jobs. NexChakra covers medicine,
              law, design, arts, finance, education — any path a student might aspire to.
            </p>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-zinc-100 transition-all flex items-center gap-2"
            >
              Explore your field <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.slice(0, 10).map((f, i) => (
              <motion.div key={f}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }} viewport={{ once: true }}
                className="px-4 py-3 bg-white/[0.025] border border-white/5 rounded-xl text-zinc-400 text-sm hover:text-white hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-default">
                {f}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Student stories</p>
            <h2 className="text-display text-5xl text-white">
              Real clarity.<br /><em className="text-zinc-400">Real outcomes.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="p-7 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                <div className="flex gap-0.5">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-600/12 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mb-6">Start today — it&apos;s free</p>
          <h2 className="text-display text-6xl md:text-7xl text-white mb-6 leading-tight">
            Ready to find<br /><em className="text-indigo-400">your path?</em>
          </h2>
          <p className="text-zinc-500 text-lg mb-10">
            Join thousands of students who found their direction with NexChakra.
          </p>
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="group px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-lg transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] flex items-center gap-3 mx-auto"
          >
            Get started for free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg" style={{ transform: "rotate(8deg)" }} />
            <span className="font-bold text-sm text-white">NexChakra</span>
          </div>
          <p className="text-zinc-700 text-xs">© 2025 NexChakra. All rights reserved.</p>
          <div className="flex gap-5 text-zinc-600 text-xs">
            <a href="/auth" className="hover:text-white transition-colors">Sign In</a>
            <a href="/auth" className="hover:text-white transition-colors">Sign Up</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
"use client";
import { useState } from "react";
import { Search, Loader2, TrendingUp, Briefcase, BookOpen, ArrowRight } from "lucide-react";
import axios from "axios";

const POPULAR = [
  "Software Engineering","Medicine","Graphic Design","Finance & Banking","Law",
  "Architecture","Psychology","Data Science","Journalism","Teaching",
  "Environmental Science","Marketing","Nursing","Film & Media","Entrepreneurship",
];

const demandColor: Record<string,string> = {
  High: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Low: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function CareerExplorer() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");

  const explore = async (field: string) => {
    if (!field.trim()) return;
    setLoading(true); setData(null); setSearched(field);
    try {
      const res = await axios.post("http://localhost:8000/explore-field", { field });
      setData(res.data);
    } catch {
      setData({
        overview: "A rapidly growing field with diverse opportunities worldwide.",
        top_roles: ["Entry Analyst","Senior Specialist","Manager","Director"],
        entry_paths: ["University degree","Bootcamp / self-study"],
        key_skills: ["Communication","Critical Thinking","Domain Knowledge","Adaptability"],
        avg_salary: "$45k–$90k",
        job_outlook: "High",
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      {/* SEARCH */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
          <input
            value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&explore(query)}
            placeholder="Search any career field — medicine, design, finance..."
            className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 transition-all"
          />
        </div>
        <button onClick={()=>explore(query)} disabled={!query.trim()||loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin"/> : <><ArrowRight size={16}/> Explore</>}
        </button>
      </div>

      {/* POPULAR PILLS */}
      <div>
        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">Popular Fields</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map(f => (
            <button key={f} onClick={()=>{ setQuery(f); explore(f); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${searched===f?'bg-indigo-600/15 text-indigo-300 border-indigo-500/30':'bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:border-white/15'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* RESULT */}
      {loading && (
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 size={20} className="animate-spin text-indigo-500"/>
          <span className="text-sm animate-pulse">Exploring {searched}...</span>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* HEADER */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-2xl font-bold text-white capitalize">{searched}</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${demandColor[data.job_outlook]||demandColor.Medium}`}>
                {data.job_outlook} Demand
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-sm">{data.overview}</p>
            <p className="text-indigo-400 font-semibold mt-3 flex items-center gap-1.5 text-sm">
              <TrendingUp size={14}/> {data.avg_salary} avg. salary
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TOP ROLES */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} className="text-indigo-400"/>
                <h4 className="font-semibold text-sm text-white">Top Roles</h4>
              </div>
              <ul className="space-y-2">
                {data.top_roles?.map((r: string) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"/>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* ENTRY PATHS */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-violet-400"/>
                <h4 className="font-semibold text-sm text-white">Entry Paths</h4>
              </div>
              <ul className="space-y-2">
                {data.entry_paths?.map((p: string) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full shrink-0"/>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* KEY SKILLS */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-emerald-400"/>
                <h4 className="font-semibold text-sm text-white">Key Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.key_skills?.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
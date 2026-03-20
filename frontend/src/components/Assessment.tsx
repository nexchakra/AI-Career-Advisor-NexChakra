"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw, TrendingUp, Loader2 } from "lucide-react";
import axios from "axios";

const questions = [
  {
    q: "What type of work energises you most?",
    opts: ["Solving logical problems", "Creating visual experiences", "Helping & caring for people", "Leading and managing"],
  },
  {
    q: "Which subject do you enjoy most?",
    opts: ["Maths & Science", "Arts & Humanities", "Commerce & Economics", "Biology & Health"],
  },
  {
    q: "What's your preferred work environment?",
    opts: ["Remote / independent", "Collaborative team", "Outdoors / fieldwork", "Client-facing / social"],
  },
  {
    q: "What matters most in your career?",
    opts: ["High salary & growth", "Creative freedom", "Helping society", "Stability & work-life balance"],
  },
];

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [interest, setInterest] = useState("");
  const [edu, setEdu] = useState("college");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const choose = (opt: string) => {
    const newAns = [...answers, opt];
    setAnswers(newAns);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // move to interests step
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/career-assessment", {
        answers,
        interests: interest || "general",
        education_level: edu,
      });
      setResult(res.data);
    } catch {
      setResult({ careers: [{ title:"Data Analyst", field:"Technology", match_score:82, why:"You have a logical mindset and enjoy structured problem-solving.", first_step:"Learn Python basics on freeCodeCamp.", salary_range:"$55k–$95k" }] });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); setInterest(""); };

  const progress = Math.round((answers.length / questions.length) * 100);

  if (result) return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-indigo-400" size={20}/> AI Career Recommendations</h3>
        <button onClick={reset} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
          <RotateCcw size={14}/> Retake
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.careers?.map((c: any, i: number) => (
          <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
            className={`rounded-2xl p-6 border transition-all ${i===0?'bg-indigo-600/10 border-indigo-500/30':'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{c.field}</span>
              <span className={`text-sm font-bold ${i===0?'text-indigo-400':'text-zinc-400'}`}>{c.match_score}%</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{c.title}</h4>
            <p className="text-zinc-400 text-sm mb-4">{c.why}</p>
            <div className="bg-white/5 rounded-lg p-3 mb-2">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">First Step</p>
              <p className="text-zinc-300 text-xs">{c.first_step}</p>
            </div>
            <p className="text-indigo-400 text-xs font-semibold flex items-center gap-1"><TrendingUp size={12}/>{c.salary_range}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl">
      {/* PROGRESS BAR */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-600 mb-2">
          <span>Question {Math.min(step+1, questions.length)} of {questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Q{step+1}</p>
            <h2 className="text-xl font-bold text-white mb-6">{questions[step].q}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {questions[step].opts.map(opt => (
                <button key={opt} onClick={() => choose(opt)}
                  className="py-3 px-4 bg-white/5 hover:bg-indigo-600/15 border border-white/8 hover:border-indigo-500/40 rounded-xl text-sm text-zinc-300 hover:text-white transition-all text-left flex items-center justify-between group">
                  {opt}
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-indigo-400 transition-colors"/>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="final" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 space-y-5">
            <h2 className="text-xl font-bold text-white">Almost there — tell us a bit more</h2>
            <div>
              <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2 block">Interests / Hobbies (optional)</label>
              <input value={interest} onChange={e=>setInterest(e.target.value)} placeholder="e.g. writing, music, travelling, sports..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"/>
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2 block">Education Level</label>
              <div className="flex gap-2 flex-wrap">
                {["school","college","graduate","working"].map(e=>(
                  <button key={e} onClick={()=>setEdu(e)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${edu===e?'bg-indigo-600/15 text-indigo-300 border-indigo-500/30':'bg-white/5 text-zinc-500 border-white/5 hover:text-white'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={submit} disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all">
              {loading ? <><Loader2 className="animate-spin" size={18}/> Analysing your profile...</> : <><Sparkles size={18}/> Get My Career Matches</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"use client";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = isLogin ? "/login" : "/signup";
    try {
      const res = await axios.post(`http://localhost:8000${endpoint}`, { email, password });
      
      if (isLogin) {
        // Successful Login
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("user_email", res.data.email);
        window.location.href = "/dashboard";
      } else {
        // Successful Signup
        setIsLogin(true);
        setPassword(""); // Clear password for security
        setError("✓ Account created! Please sign in.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = ["Design", "Medicine", "Engineering", "Law", "Finance", "Arts", "Business", "Education"];

  return (
    <main className="min-h-screen bg-[#08090c] flex overflow-hidden font-sans">
      {/* GLOBAL STYLES FIX */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        
        body {
          font-family: 'DM Sans', sans-serif;
        }

        .field-pill { 
          animation: float 6s ease-in-out infinite; 
        }

        @keyframes float { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-8px); } 
        }

        .glow-input:focus { 
          box-shadow: 0 0 0 2px rgba(99,102,241,0.4); 
        }
      `}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-[#0f1022] to-[#08090c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 50%)'}} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] rotate-[8deg]" />
            <span className="text-white font-bold text-xl tracking-tight">NexChakra</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-3">AI Career Intelligence</p>
            <h1 className="text-5xl text-white leading-tight font-serif italic">
              Your path.<br />
              <span className="text-indigo-400 not-italic font-bold">Illuminated.</span>
            </h1>
            <p className="text-zinc-400 mt-4 text-lg leading-relaxed max-w-sm">
              For students and professionals across every field — not just tech.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 max-w-sm">
            {fields.map((f, i) => (
              <span key={f} className="field-pill px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-xs font-medium" style={{animationDelay:`${i*0.4}s`}}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[["50K+","Students"],["95%","Success"],["200+","Paths"]].map(([n,l])=>(
            <div key={l} className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <p className="text-2xl font-bold text-white">{n}</p>
              <p className="text-zinc-500 text-xs mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl rotate-[8deg]" />
            <span className="text-white font-bold text-lg">NexChakra</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white font-serif">
                  {isLogin ? "Welcome back" : "Join the network"}
                </h2>
                <p className="text-zinc-500 mt-2">
                  {isLogin ? "Sign in to continue your journey" : "Start your career intelligence journey"}
                </p>
              </div>

              <div className="flex bg-white/5 rounded-xl p-1 mb-8 border border-white/5">
                {["Sign In","Sign Up"].map((label, i) => (
                  <button key={label} type="button" onClick={()=>setIsLogin(i===0)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${(isLogin&&i===0)||(!isLogin&&i===1)?'bg-indigo-600 text-white shadow-lg':'text-zinc-500 hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-2 block">Email</label>
                  <input
                    type="email" required value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="glow-input w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPass?"text":"password"} required value={password}
                      onChange={e=>setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glow-input w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 outline-none transition-all text-sm pr-12"
                    />
                    <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className={`text-sm px-3 py-2 rounded-lg ${error.startsWith('✓')?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {error}
                  </p>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight size={18}/>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                {isLogin?"Don't have an account?":"Already registered?"}{" "}
                <button type="button" onClick={()=>setIsLogin(!isLogin)} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  {isLogin?"Sign up free":"Sign in"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
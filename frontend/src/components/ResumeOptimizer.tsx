"use client";
import { useState, useRef } from "react";
import { Upload, Sparkles, Wand2, Check, Loader2, FileText, X } from "lucide-react";
import axios from "axios";

export default function ResumeOptimizer({ userId }: { userId: string }) {
  const [file,        setFile]        = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState("");
  const [status,      setStatus]      = useState<"idle" | "uploading" | "optimizing" | "done">("idle");

  const inputRef = useRef<HTMLInputElement>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // EDGE-SAFE file change handler
  // DON'T call setFile() directly inside onChange — Edge fires onChange
  // synchronously as the dialog closes, and the immediate state update
  // blocks the renderer → "not responding".
  // setTimeout(fn, 0) defers one tick; by then Edge's dialog cleanup is done.
  // ──────────────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setTimeout(() => setFile(picked), 0); // ✅ defer — prevents Edge freeze
  };

  const openDialog = () => {
    if (inputRef.current) inputRef.current.value = ""; // allow re-picking same file
    inputRef.current?.click();
  };

  const handleOptimize = async () => {
    if (!file) return;
    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:8000/upload-resume", formData);
      setStatus("optimizing");
      const res = await axios.post(
        `http://localhost:8000/improve-resume?user_id=${userId}`
      );
      setSuggestions(res.data.suggestions);
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  const reset = () => {
    setFile(null);
    setSuggestions("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── UPLOAD ZONE ──────────────────────────────────────────────────── */}
      <div className={`rounded-2xl border-2 border-dashed p-10 transition-all ${
        file
          ? "border-indigo-500/50 bg-indigo-500/5"
          : "border-white/10 hover:border-white/20 bg-white/[0.01]"
      }`}>

        {/* ICON + FILE INFO */}
        <div className="flex flex-col items-center gap-4 text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            file ? "bg-indigo-600/20" : "bg-zinc-900"
          }`}>
            {file
              ? <FileText className="text-indigo-400" size={22} />
              : <Upload   className="text-zinc-600"   size={22} />}
          </div>

          {file ? (
            <div>
              <p className="text-white font-semibold text-sm">{file.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                {(file.size / 1024).toFixed(1)} KB · Ready to optimise
              </p>
            </div>
          ) : (
            <div>
              <p className="text-zinc-300 font-medium text-sm">Select your resume PDF</p>
              <p className="text-zinc-600 text-xs mt-1">PDF only · Max 5 MB</p>
            </div>
          )}
        </div>

        {/* BROWSE + CLEAR BUTTONS */}
        <div className="flex items-center justify-center gap-3">
          {/*
            ✅ EDGE-SAFE INPUT PATTERN:
            - className="hidden" → display:none (Edge layout scanner skips it)
            - NOT opacity-0 / position:absolute / inset-0 (those cause freeze)
            - Triggered programmatically via ref.click() from button below
          */}
          <input
            ref={inputRef}
            id="resume-optimizer-input"
            type="file"
            accept=".pdf"
            aria-label="Upload your resume PDF"
            title="Upload your resume PDF"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={openDialog}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
          >
            <Upload size={14} />
            {file ? "Change file" : "Browse PDF"}
          </button>

          {file && (
            <button
              type="button"
              onClick={reset}
              aria-label="Remove selected file"
              title="Remove selected file"
              className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── OPTIMISE BUTTON ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleOptimize}
        disabled={!file || (status !== "idle" && status !== "done")}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.35)]"
      >
        {status === "idle"       && <><Wand2    size={18} />                           Optimise Resume</>}
        {status === "uploading"  && <><Loader2  size={18} className="animate-spin"  /> Syncing Profile…</>}
        {status === "optimizing" && <><Sparkles size={18} className="animate-pulse" /> AI Rewriting Bullets…</>}
        {status === "done"       && <><Check    size={18} />                           Analysis Complete</>}
      </button>

      {/* ── RESULT ───────────────────────────────────────────────────────── */}
      {suggestions && (
        <div className="bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Impact Enhancements</h3>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg uppercase font-black border border-indigo-500/20">
              AI Powered
            </span>
          </div>
          <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm border-l-2 border-indigo-500/30 pl-5 font-mono">
            {suggestions}
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-6 text-xs text-zinc-600 hover:text-white transition-colors"
          >
            ↑ Upload another resume
          </button>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import axios from "axios";

interface Msg { role: "assistant" | "user"; text: string; }

export default function SoulChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hey! I'm Soul, your AI career mentor. I'm here for any field — tech, medicine, arts, law, business — you name it. What's on your mind today?",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      }));
      const res = await axios.post("http://localhost:8000/career-soul-chat", {
        user_id: userId || "guest",
        message: text,
        history,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I'm having a moment. Give me a second and try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-[#0d0e14]"
      style={{ height: "72vh" }}
    >
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.4)]">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-white">Career Soul AI</h3>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Online · All fields
          </span>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={13} className="text-indigo-400" />
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white/5 border border-white/5 text-zinc-300 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <User size={13} className="text-zinc-400" />
              </div>
            )}
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot size={13} className="text-indigo-400" />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT ROW */}
      <div className="px-4 py-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
        {/* ✅ aria-label + title fixes axe/forms "no label" error */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about salaries, career switches, skills, stress…"
          aria-label="Chat message input"
          title="Type your message and press Enter"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 transition-all"
        />
        {/* ✅ type="button" + aria-label fixes button-type + axe/name-role-value errors */}
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          title="Send message"
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
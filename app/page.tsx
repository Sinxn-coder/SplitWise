"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Wallet, ArrowRight, Sparkles } from "lucide-react"

// Import the main container dynamically with SSR disabled to make loading instantaneous
const ExpenseSplitter = dynamic(
  () => import("@/components/expense-splitter").then((mod) => mod.ExpenseSplitter),
  { ssr: false }
)

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleLaunch = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsStarted(true)
    }, 600) // matches transition duration
  }

  if (isStarted) {
    return (
      <div className="min-h-screen bg-slate-950 text-foreground animate-in fade-in zoom-in-95 duration-500">
        {/* Small Top bar to return to landing page */}
        <div className="w-full bg-slate-900/40 border-b border-border/40 py-2.5 px-4 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-wider">SPLITWISE PRO</span>
          </div>
          <button 
            onClick={() => {
              setIsExiting(false)
              setIsStarted(false)
            }}
            className="text-[10px] text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded bg-slate-800/60 border border-slate-700/50 transition-all hover:scale-105 cursor-pointer"
          >
            ← Back
          </button>
        </div>
        <div className="max-w-5xl mx-auto p-4 md:py-8">
          <ExpenseSplitter />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden transition-all duration-700 ${
        isExiting ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Dynamic Keyframe Injection */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes laser-flow {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-laser {
          stroke-dasharray: 6;
          animation: laser-flow 4s linear infinite;
        }
        .animate-orb-1 {
          animation: orb-float-1 15s ease-in-out infinite;
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
        }
      `}</style>

      {/* Subtle Glowing Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />

      {/* Centered Minimal Header */}
      <header className="relative w-full max-w-4xl mx-auto px-6 py-8 flex justify-center items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-400/20">
            <Wallet className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-sm font-black text-slate-50 tracking-wider text-glow uppercase">SplitWise</span>
        </div>
      </header>

      {/* Focused Centered Hero Section */}
      <main className="relative flex-1 max-w-3xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-8 z-10 py-8">
        
        {/* Simple Pill Tag */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase animate-pulse">
          <Sparkles className="h-3 w-3 fill-emerald-400 text-emerald-400" />
          Optimal Settlements Engine
        </div>

        {/* Clean Header */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-50 leading-tight tracking-tight">
            Perfect bill splits.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent text-glow">
              Zero hassle.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Split complex bills dynamically among roommates or friends, compute minimal settlements, and backup splits securely to the cloud.
          </p>
        </div>

        {/* Sleek Centered Launch Button */}
        <div className="w-full sm:w-auto">
          <button
            onClick={handleLaunch}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs tracking-wide rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:scale-105 hover:shadow-emerald-400/20 cursor-pointer uppercase"
          >
            Launch SplitWise
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Centered Animated Simulator (Removed features, footer & extra links) */}
        <div className="w-full max-w-sm pt-4 animate-float">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            
            {/* LIVE TRANSFER SIMULATOR SVG */}
            <div className="relative h-44 w-full bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
              
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Curve Alice -> Bob */}
                <path d="M 60 55 Q 160 35 260 55" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="2" />
                <path d="M 60 55 Q 160 35 260 55" fill="none" stroke="url(#emerald-glow)" strokeWidth="1.5" className="animate-laser" />

                {/* Curve Charlie -> Bob */}
                <path d="M 160 135 Q 210 95 260 55" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="2" />
                <path d="M 160 135 Q 210 95 260 55" fill="none" stroke="url(#emerald-glow)" strokeWidth="1.5" className="animate-laser" style={{ animationDelay: "-2s" }} />

                <defs>
                  <linearGradient id="emerald-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar 1: Alice */}
              <div className="absolute top-6 left-6 flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/60 flex items-center justify-center">
                  <span className="text-xs font-bold text-rose-400">A</span>
                </div>
                <span className="text-[8px] font-bold text-rose-400 bg-rose-500/5 px-1 py-0.2 rounded">-120</span>
              </div>

              {/* Avatar 2: Charlie */}
              <div className="absolute bottom-4 left-24 flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/60 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">C</span>
                </div>
                <span className="text-[8px] font-bold text-amber-400 bg-amber-500/5 px-1 py-0.2 rounded">-80</span>
              </div>

              {/* Avatar 3: Bob */}
              <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-400">B</span>
                </div>
                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/5 px-1 py-0.2 rounded">+200</span>
              </div>
            </div>

            {/* Micro settlement text */}
            <p className="text-[9px] text-slate-400 text-center mt-2.5 font-bold tracking-wide flex items-center justify-center gap-1">
              ⚡ Settle in 2 direct transfers
            </p>
          </div>
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="relative w-full py-6 flex justify-center items-center z-10 text-[9px] text-slate-600 font-bold tracking-widest uppercase">
        <span>SplitWise PRO</span>
      </footer>
    </div>
  )
}

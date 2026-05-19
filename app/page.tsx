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
      <div className="min-h-screen bg-slate-50 text-slate-900 animate-in fade-in zoom-in-95 duration-500">
        {/* Small Top bar to return to landing page */}
        <div className="w-full bg-white border-b border-slate-200 py-2.5 px-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-200">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-wider">SPLITWISE PRO</span>
          </div>
          <button 
            onClick={() => {
              setIsExiting(false)
              setIsStarted(false)
            }}
            className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded bg-slate-100 border border-slate-200 transition-all hover:scale-105 cursor-pointer"
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
      className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden transition-all duration-700 ${
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
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
        }
      `}</style>

      {/* Fresh Light Theme Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />

      {/* Clean Light Theme Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      {/* Minimal Header */}
      <header className="relative w-full max-w-4xl mx-auto px-6 py-8 flex justify-center items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-400/20">
            <Wallet className="h-4.5 w-4.5 text-white stroke-[2.5]" />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-wider uppercase">SplitWise</span>
        </div>
      </header>

      {/* Focused Centered Hero Section */}
      <main className="relative flex-1 max-w-3xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-8 z-10 py-8">
        
        {/* Fresh Light Pill Tag */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase animate-pulse">
          <Sparkles className="h-3 w-3 fill-emerald-600 text-emerald-600" />
          Optimal Settlements Engine
        </div>

        {/* Clean Header */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Perfect bill splits.<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent text-glow">
              Zero hassle.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto font-medium">
            Split complex bills dynamically among roommates or friends, compute minimal settlements, and backup splits securely to the cloud.
          </p>
        </div>

        {/* Sleek High-Contrast Launch Button */}
        <div className="w-full sm:w-auto">
          <button
            onClick={handleLaunch}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wide rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-300 hover:scale-105 cursor-pointer uppercase"
          >
            Launch SplitWise
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Centered Animated Simulator (Light Theme Glassmorphic Card) */}
        <div className="w-full max-w-sm pt-4 animate-float">
          <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 shadow-xl shadow-slate-200/50 backdrop-blur-md">
            
            {/* LIVE TRANSFER SIMULATOR SVG */}
            <div className="relative h-44 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
              
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Curve Alice -> Bob */}
                <path d="M 60 55 Q 160 35 260 55" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2" />
                <path d="M 60 55 Q 160 35 260 55" fill="none" stroke="url(#emerald-glow)" strokeWidth="1.5" className="animate-laser" />

                {/* Curve Charlie -> Bob */}
                <path d="M 160 135 Q 210 95 260 55" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2" />
                <path d="M 160 135 Q 210 95 260 55" fill="none" stroke="url(#emerald-glow)" strokeWidth="1.5" className="animate-laser" style={{ animationDelay: "-2s" }} />

                <defs>
                  <linearGradient id="emerald-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar 1: Alice (Rose Red) */}
              <div className="absolute top-6 left-6 flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-rose-600">A</span>
                </div>
                <span className="text-[8px] font-bold text-rose-600 bg-rose-50 border border-rose-100/50 px-1 py-0.2 rounded">-Rs. 120</span>
              </div>

              {/* Avatar 2: Charlie (Amber Orange) */}
              <div className="absolute bottom-4 left-24 flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-amber-600">C</span>
                </div>
                <span className="text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-100/50 px-1 py-0.2 rounded">-Rs. 80</span>
              </div>

              {/* Avatar 3: Bob (Emerald Green) */}
              <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-emerald-600">B</span>
                </div>
                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1 py-0.2 rounded">+Rs. 200</span>
              </div>
            </div>

            {/* Micro settlement text */}
            <p className="text-[9px] text-slate-500 text-center mt-2.5 font-bold tracking-wide flex items-center justify-center gap-1">
              ⚡ Settle in 2 direct transfers
            </p>
          </div>
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="relative w-full py-6 flex justify-center items-center z-10 text-[9px] text-slate-400 font-bold tracking-widest uppercase">
        <span>SplitWise PRO</span>
      </footer>
    </div>
  )
}

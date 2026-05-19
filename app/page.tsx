"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Wallet, ArrowRight, Sparkles, DollarSign, Send, Landmark, Coins } from "lucide-react"

// Import the main container dynamically with SSR disabled to make loading instantaneous
const ExpenseSplitter = dynamic(
  () => import("@/components/expense-splitter").then((mod) => mod.ExpenseSplitter),
  { ssr: false }
)

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Hydration guard to ensure client and server render match perfectly
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLaunch = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsStarted(true)
    }, 600) // matches transition duration
  }

  // Pre-hydration rendering shell in light theme background
  if (!mounted) {
    return <div className="min-h-screen bg-slate-50/50" />
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
            ← Back to Intro
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
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-emerald-50/20 text-slate-800 flex flex-col relative overflow-hidden transition-all duration-700 ${
        isExiting ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* React 19 Standard Stylesheet Injection for Advanced Animations */}
      <style>{`
        @keyframes float-soft {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        @keyframes laser-flow {
          0% { stroke-dashoffset: 80; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -50px) scale(1.15); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes cash-pulse {
          0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.8; }
          50% { transform: scale(1.2) translate(-50%, -50%); opacity: 1; }
        }
        @keyframes cash-flow-1 {
          0% { left: 20%; top: 30%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 80%; top: 30%; opacity: 0; }
        }
        @keyframes cash-flow-2 {
          0% { left: 45%; top: 75%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 80%; top: 30%; opacity: 0; }
        }
        .animate-float-soft {
          animation: float-soft 6s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 5s ease-in-out infinite;
        }
        .animate-laser {
          stroke-dasharray: 8;
          animation: laser-flow 3.5s linear infinite;
        }
        .animate-orb-1 {
          animation: orb-float-1 16s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: orb-float-2 12s ease-in-out infinite;
        }
        .animate-cash-1 {
          animation: cash-flow-1 4s infinite linear;
        }
        .animate-cash-2 {
          animation: cash-flow-2 4s infinite linear;
          animation-delay: 2s;
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .pulse-emerald {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse-emerald-seq 2s infinite;
        }
        @keyframes pulse-emerald-seq {
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Fresh Light Theme Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-emerald-300/10 blur-[130px] pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-teal-300/10 blur-[130px] pointer-events-none animate-orb-2" />

      {/* Modern Light Theme Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_45%,#000_70%,transparent_100%)] opacity-20" />

      {/* Minimal Header */}
      <header className="relative w-full max-w-4xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/15 border border-emerald-400/20">
            <Wallet className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 tracking-wider uppercase">SplitWise</span>
            <span className="text-[8px] block text-emerald-600 font-extrabold tracking-widest mt-[-2px] uppercase">PRO EDITION</span>
          </div>
        </div>

        <button 
          onClick={handleLaunch}
          className="text-xs font-bold text-slate-800 hover:text-emerald-700 transition-all border border-slate-200 hover:border-emerald-300/60 px-3.5 py-1.5 rounded-xl bg-white/70 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1"
        >
          Launch App
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </header>

      {/* Fully Redesigned Center Hero Section */}
      <main className="relative flex-1 max-w-3xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-9 z-10 py-10">
        
        {/* Animated Badge Tag */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-[10px] font-extrabold text-emerald-700 tracking-widest uppercase shadow-sm">
          <Sparkles className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
          Zero math friction • Optimal settlement engine
        </div>

        {/* Clean, Impactful Header Copy */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight">
            Perfect bill splits.<br />
            <span className="relative inline-block mt-1">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent text-glow">
                Zero hassle.
              </span>
              <span className="absolute bottom-1 left-0 w-full h-[6px] bg-emerald-400/20 rounded-full blur-[1px]" />
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto font-medium">
            Take the headache out of group outings, shared grocery bills, and roommate expenses. Split complex bills dynamically among multiple payers under strict budget constraints, backed up securely to the cloud.
          </p>
        </div>

        {/* Sleek Pulse Glow Launch Button */}
        <div className="w-full sm:w-auto relative">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-md animate-pulse" />
          <button
            onClick={handleLaunch}
            className="relative group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer uppercase border border-slate-800"
          >
            Launch SplitWise
            <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform text-emerald-400" />
          </button>
        </div>

        {/* Fully Redesigned Premium Simulator Panel (Absolute Positioning Bug Fixed) */}
        <div className="w-full max-w-md pt-4 animate-float-soft">
          <div className="glass-panel rounded-3xl p-5 shadow-2xl shadow-slate-200/60 border border-slate-200/80 relative overflow-hidden">
            
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-teal-500/5 blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-500" />
                Live Settlement Simulator
              </span>
              <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Optimal flow
              </span>
            </div>

            {/* LIVE TRANSFER SIMULATOR CONTAINER */}
            <div className="relative h-56 w-full bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden block">
              
              {/* Glowing SVG Bezier Connection Curves */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Curve Alice (A) -> Bob (B) */}
                <path d="M 60 70 Q 170 30 280 70" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="3" />
                <path d="M 60 70 Q 170 30 280 70" fill="none" stroke="url(#emerald-glow)" strokeWidth="2" className="animate-laser" />

                {/* Curve Charlie (C) -> Bob (B) */}
                <path d="M 170 170 Q 225 120 280 70" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="3" />
                <path d="M 170 170 Q 225 120 280 70" fill="none" stroke="url(#emerald-glow)" strokeWidth="2" className="animate-laser" style={{ animationDelay: "-2.5s" }} />

                <defs>
                  <linearGradient id="emerald-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Animated Floating Cash Particles (Moving along paths) */}
              <div className="absolute w-5 h-5 bg-white border border-emerald-200 rounded-full flex items-center justify-center shadow-md animate-cash-1 pointer-events-none">
                <span className="text-[9px]">💸</span>
              </div>
              <div className="absolute w-5 h-5 bg-white border border-emerald-200 rounded-full flex items-center justify-center shadow-md animate-cash-2 pointer-events-none">
                <span className="text-[9px]">💸</span>
              </div>

              {/* Avatar 1: Alice (Debtor A - Soft Rose Red Theme) */}
              <div className="absolute top-8 left-6 flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center shadow-md shadow-rose-100/60 transition-transform hover:scale-105">
                  <span className="text-sm font-black text-rose-600">A</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-700 block">Alice</span>
                  <span className="text-[8px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded mt-0.5 block">-Rs. 120</span>
                </div>
              </div>

              {/* Avatar 2: Charlie (Debtor C - Warm Amber Orange Theme) */}
              <div className="absolute bottom-6 left-28 flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center shadow-md shadow-amber-100/60 transition-transform hover:scale-105">
                  <span className="text-sm font-black text-amber-600">C</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-700 block">Charlie</span>
                  <span className="text-[8px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded mt-0.5 block">-Rs. 80</span>
                </div>
              </div>

              {/* Avatar 3: Bob (Creditor B - Emerald Green Theme with Pulse) */}
              <div className="absolute top-8 right-6 flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center shadow-md shadow-emerald-100/60 transition-transform hover:scale-105 pulse-emerald">
                  <span className="text-sm font-black text-emerald-600">B</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-700 block">Bob</span>
                  <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded mt-0.5 block">+Rs. 200</span>
                </div>
              </div>

              {/* Centered Floating Dinner Bill representation */}
              <div className="absolute top-24 left-6 bg-white/95 border border-slate-200/80 px-2 py-1 rounded-lg shadow-md flex items-center gap-1.5 animate-float-reverse pointer-events-none">
                <Coins className="h-3 w-3 text-emerald-500" />
                <span className="text-[8px] font-extrabold text-slate-700">Dinner split: Rs. 600</span>
              </div>
            </div>

            {/* Optimal Resolution Footer Badge */}
            <div className="mt-4 p-3 bg-slate-50/80 border border-slate-100 rounded-xl flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-bold tracking-wide">Resulting Transfers:</span>
              <span className="font-extrabold text-emerald-700 flex items-center gap-1 uppercase tracking-wider">
                ⚡ Settle in 2 direct transfers
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="relative w-full py-6 flex justify-center items-center z-10 text-[9px] text-slate-400 font-bold tracking-widest uppercase">
        <span>SplitWise PRO • Zero Math Friction</span>
      </footer>
    </div>
  )
}

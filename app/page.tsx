"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Database, 
  FileText, 
  Github, 
  ShieldCheck 
} from "lucide-react"

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
            ← Back to Landing Page
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
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.08); }
        }
        @keyframes laser-flow {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.15); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-60px, 60px) scale(1.2); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-laser {
          stroke-dasharray: 6;
          animation: laser-flow 4s linear infinite;
        }
        .animate-orb-1 {
          animation: orb-float-1 12s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: orb-float-2 15s ease-in-out infinite;
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }
      `}</style>

      {/* Floating Glowing Neon Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none animate-orb-2" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Abstract Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Header */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
            <Wallet className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-black text-slate-50 tracking-wider text-glow uppercase">SplitWise</span>
            <span className="text-[9px] block text-emerald-400 font-bold tracking-widest mt-[-2px] uppercase">PRO</span>
          </div>
        </div>

        <button 
          onClick={handleLaunch}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/20 hover:border-emerald-500/40 px-4 py-2 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 hover:scale-105 cursor-pointer flex items-center gap-1.5"
        >
          Launch App
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8 z-10 py-10">
        {/* Left Intro Text Column */}
        <div className="flex-1 flex flex-col items-start text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-emerald-400 tracking-wide uppercase animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
            Supercharged Multi-Payer splits
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-50 leading-[1.1] tracking-tight">
            Perfect settlements,<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent text-glow">
              zero math friction.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
            Take the headache out of group outings, shared grocery bills, and roommates expenses. Split complex bills dynamically among multiple payers under strict budget constraints, backed up securely to the cloud.
          </p>

          {/* Quick Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-2">
            {[
              "Multi-Payer Custom Allocations",
              "Greedy Debt-Settlement Resolution",
              "Direct PDF & WhatsApp Sharing",
              "Supabase Cloud Sync Backup",
            ].map((prop, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">{prop}</span>
              </div>
            ))}
          </div>

          {/* Big Glowing Launch Button */}
          <div className="pt-6 w-full sm:w-auto">
            <button
              onClick={handleLaunch}
              className="relative group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide rounded-xl shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 hover:shadow-emerald-400/30 cursor-pointer overflow-hidden uppercase"
            >
              {/* Button light flare overlay */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[none] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
              
              Start Splitting Now
              <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Animated Interactive Simulator Column */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center items-center">
          <div className="relative w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md animate-float">
            
            {/* Glass glow spot */}
            <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-emerald-500/25 blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 tracking-wider">Settlement Engine Simulator</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Optimal Flow</span>
            </div>

            {/* LIVE TRANSFER SIMULATOR SVG */}
            <div className="relative h-64 w-full bg-slate-950/70 border border-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
              
              {/* Glowing Transfer Lines */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Curve Alice -> Bob */}
                <path 
                  d="M 80 80 Q 200 60 320 80" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.15)" 
                  strokeWidth="3" 
                />
                <path 
                  d="M 80 80 Q 200 60 320 80" 
                  fill="none" 
                  stroke="url(#emerald-glow)" 
                  strokeWidth="2" 
                  className="animate-laser"
                />

                {/* Curve Charlie -> Bob */}
                <path 
                  d="M 200 200 Q 260 140 320 80" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.15)" 
                  strokeWidth="3" 
                />
                <path 
                  d="M 200 200 Q 260 140 320 80" 
                  fill="none" 
                  stroke="url(#emerald-glow)" 
                  strokeWidth="2" 
                  className="animate-laser"
                  style={{ animationDelay: "-2s" }}
                />

                {/* SVG Definitions */}
                <defs>
                  <linearGradient id="emerald-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar 1: Alice (Debtor) */}
              <div className="absolute top-10 left-10 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border-2 border-rose-500/80 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <span className="text-sm font-black text-rose-400">A</span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-300">Alice</p>
                  <p className="text-[9px] font-extrabold text-rose-400 bg-rose-500/5 px-1 py-0.5 rounded mt-0.5">-Rs. 120.00</p>
                </div>
              </div>

              {/* Avatar 2: Charlie (Debtor) */}
              <div className="absolute bottom-6 left-32 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/80 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <span className="text-sm font-black text-amber-400">C</span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-300">Charlie</p>
                  <p className="text-[9px] font-extrabold text-amber-400 bg-amber-500/5 px-1 py-0.5 rounded mt-0.5">-Rs. 80.00</p>
                </div>
              </div>

              {/* Avatar 3: Bob (Creditor - Paid for all) */}
              <div className="absolute top-10 right-10 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500/80 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <span className="text-sm font-black text-emerald-400 animate-pulse">B</span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-300">Bob</p>
                  <p className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/5 px-1 py-0.5 rounded mt-0.5">+Rs. 200.00</p>
                </div>
              </div>

              {/* Floating settlement tags */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest shadow-md">
                Pays Rs. 120 ➜
              </div>
              
              <div className="absolute bottom-16 right-16 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest shadow-md">
                Pays Rs. 80 ➜
              </div>
            </div>

            {/* Bottom mini-summary */}
            <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Optimal Resolution:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wide">
                ⚡ Settle in 2 direct transfers
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Feature List Grid */}
      <section className="relative w-full max-w-6xl mx-auto px-6 py-12 lg:py-16 z-10 border-t border-slate-900/60 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Multi-Payer Splits */}
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-3 shadow-lg hover:border-slate-800/80 transition-all hover:-translate-y-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15">
              <Users className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-sm">Custom Multi-Payer Contributions</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Did two people pay different amounts for grocery shopping? Track precise allocations. Set custom caps so entries never exceed the total bill, with a live visual balanced progress bar.
            </p>
          </div>

          {/* Card 2: Optimal Settlements */}
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-3 shadow-lg hover:border-slate-800/80 transition-all hover:-translate-y-1">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/15">
              <Sparkles className="h-4.5 w-4.5 text-teal-400" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-sm">Greedy Settlement Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              No more complex debtor networks! Our matching algorithm dynamically computes net balances and pairs creditors with debtors using the absolute minimum cash transfers possible.
            </p>
          </div>

          {/* Card 3: Database Synchronization */}
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-3 shadow-lg hover:border-slate-800/80 transition-all hover:-translate-y-1">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/15">
              <Database className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-sm">Secure Supabase Backups</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Sync your friends, groups, and bill summaries instantly to the cloud. Complete with secure environment-key management and seamless offline-first Local Storage cache mirroring.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900/40 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase">
          <span>SplitWise PRO</span>
          <span className="text-slate-700">•</span>
          <span>Zero Math Friction</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/Sinxn-coder/SplitWise" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
            <Github className="w-3.5 h-3.5" />
            View Repository
          </a>
        </div>
      </footer>
    </div>
  )
}

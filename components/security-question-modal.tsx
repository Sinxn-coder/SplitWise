"use client"

import { useState } from "react"
import { ShieldCheck, Lock, ChevronDown, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was your childhood nickname?",
  "What was the name of your primary school?",
  "What is your favourite childhood movie?",
]

interface SecurityQuestionModalProps {
  userId: string
  fullName: string
  onComplete: () => void
}

export function SecurityQuestionModal({ userId, fullName, onComplete }: SecurityQuestionModalProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0])
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [success, setSuccess] = useState(false)

  // Secure browser-native SHA-256 hashing (same as password hashing)
  const hashAnswer = async (text: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text.trim().toLowerCase())
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const cleanAnswer = answer.trim()
    if (cleanAnswer.length < 2) {
      setErrorMsg("Please enter a proper answer — at least 2 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const answerHash = await hashAnswer(cleanAnswer)

      const { error } = await supabase
        .from("users")
        .update({
          security_question: selectedQuestion,
          security_answer_hash: answerHash,
        })
        .eq("id", userId)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => onComplete(), 1000)
    } catch (err: any) {
      console.error("Failed to save security question:", err)
      setErrorMsg(err.message || "Could not save. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // Full screen backdrop — cannot be dismissed
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Gradient top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-7 w-7 text-white stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Set a Security Question
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">
                Hey <span className="font-bold text-slate-700">{fullName.split(" ")[0]}</span>! 
                For your account's safety, please set a security question. 
                This helps you recover your account if you ever forget your password.
              </p>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
              Your answer is encrypted before being saved — we never store it in plain text. 
              Remember exactly what you type, including spelling.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Security Question
              </label>
              <div className="relative">
                <select
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(e.target.value)}
                  disabled={isSubmitting || success}
                  className="w-full appearance-none pl-4 pr-9 py-3.5 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all"
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Your Answer
              </label>
              <Input
                type="text"
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isSubmitting || success}
                required
                autoComplete="off"
                className="py-5 rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-xs font-semibold"
              />
              <p className="text-[9px] text-slate-400">
                Remember exactly how you type this — capitalisation doesn't matter, but spelling does.
              </p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold animate-in fade-in duration-200">
                {errorMsg}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold animate-in fade-in duration-200">
                <Check className="h-4 w-4 text-emerald-600" />
                Security question saved! Setting up your account...
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving securely...
                </>
              ) : success ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved!
                </>
              ) : (
                "Save Security Question"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

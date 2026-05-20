"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, History, Receipt, ShieldCheck, Smartphone, Users, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppTutorialProps {
  userName: string
  onComplete: () => void
}

export function AppTutorial({ userName, onComplete }: AppTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(() => [
    {
      icon: Wallet,
      title: `Welcome, ${userName}`,
      eyebrow: "Quick start",
      body: "HomiePay helps you manage group bills, split purchases, choose who paid, and save every result without doing the math yourself.",
      preview: "Start from Groups, then move into Split Bill whenever you are ready to calculate.",
    },
    {
      icon: Users,
      title: "Create or join groups",
      eyebrow: "Groups",
      body: "Make a group for roommates, trips, family, or friends. Add members manually or join an existing group with a share code.",
      preview: "Groups keep the right people together so every new bill starts faster.",
    },
    {
      icon: Receipt,
      title: "Split a bill step by step",
      eyebrow: "Split Bill",
      body: "Add friends, enter products, assign who used each item, select who paid, then review the final balances.",
      preview: "Use Next and Back in the splitter to adjust details before saving.",
    },
    {
      icon: History,
      title: "Save and reopen bills",
      eyebrow: "History",
      body: "After a calculation, save the bill. You can reopen previous bills later, delete old ones, and keep your records organized.",
      preview: "Saved bills are useful for repeat expenses and monthly settlements.",
    },
    {
      icon: ShieldCheck,
      title: "Works with cloud sync",
      eyebrow: "Sync",
      body: "When you are online, groups and bills sync in the background. If you go offline, changes stay on this device and sync when the connection returns.",
      preview: "You can keep working even when the network is unstable.",
    },
    {
      icon: Smartphone,
      title: "Install after this tour",
      eyebrow: "PWA",
      body: "Once you finish this tutorial, HomiePay will show the install option if your browser supports it.",
      preview: "Installing gives you a cleaner app-like experience from your home screen.",
    },
  ], [userName])

  const step = steps[stepIndex]
  const Icon = step.icon
  const isLastStep = stepIndex === steps.length - 1

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setStepIndex((current) => Math.min(current + 1, steps.length - 1))
      }
      if (event.key === "ArrowLeft") {
        setStepIndex((current) => Math.max(current - 1, 0))
      }
      if (event.key === "Escape") {
        onComplete()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onComplete, steps.length])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
      return
    }

    setStepIndex((current) => current + 1)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-4 py-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">HomiePay Tour</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Step {stepIndex + 1} of {steps.length}
              </p>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
            aria-label="Close tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7">
          <div className="mb-6 flex items-center gap-2">
            {steps.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setStepIndex(index)}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= stepIndex ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
                aria-label={`Go to tutorial step ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
              <Icon className="h-8 w-8" />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">{step.eyebrow}</p>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">{step.title}</h2>
              <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{step.body}</p>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs font-semibold leading-5 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200">
                {step.preview}
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={onComplete}
              className="text-xs font-bold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                disabled={stepIndex === 0}
                className="h-10 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Receipt, Plus, Users, History, Download, DollarSign, Smartphone, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { StepIndicator } from "@/components/step-indicator"
import { AddFriendsStep } from "@/components/steps/add-friends-step"
import { AddProductsStep } from "@/components/steps/add-products-step"
import { AssignProductsStep } from "@/components/steps/assign-products-step"
import { SelectPayerStep } from "@/components/steps/select-payer-step"
import { FinalCalculationStep } from "@/components/steps/final-calculation-step"
import { SavedBills } from "@/components/saved-bills"
import { GroupsView } from "@/components/groups-view"
import { useExpenseData, SavedBill } from "@/hooks/use-expense-data"
import { Button } from "@/components/ui/button"

const STEP_LABELS = ["Friends", "Products", "Assign", "Payer", "Summary"]

export function ExpenseSplitter() {
  const [activeTab, setActiveTab] = useState<"groups" | "splitter" | "history">("groups")
  const [currentStep, setCurrentStep] = useState(1)
  const [savedBills, setSavedBills] = useState<SavedBill[]>([])
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showPwaPopup, setShowPwaPopup] = useState(false)
  
  const {
    people,
    products,
    paidBy,
    groups,
    isLoaded,
    addPerson,
    updatePerson,
    removePerson,
    addProduct,
    updateProduct,
    removeProduct,
    togglePersonForProduct,
    assignAllPeopleToProduct,
    toggleSplitByPercentage,
    updateProductPercentage,
    calculateSplits,
    calculateOwes,
    setPaidBy,
    resetAll,
    saveBill,
    getSavedBills,
    loadBill,
    deleteSavedBill,
    addGroup,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    updateMemberInGroup,
    loadGroupIntoActiveSplit,
    grandTotal,
  } = useExpenseData()

  // Register PWA service worker on mount & capture install prompt
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Register service worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").then(
          (reg) => console.log("Service Worker registered with scope: ", reg.scope),
          (err) => console.error("Service Worker registration failed: ", err)
        )
      }

      // Capture PWA install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setInstallPrompt(e)
      }
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }
    }
  }, [])

  // Trigger PWA Install Steps Popup when opened in browser (non-standalone)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone
      if (!isStandalone) {
        // Show popup after 1.5 seconds delay
        const showTimer = setTimeout(() => {
          setShowPwaPopup(true)
        }, 1500)

        return () => {
          clearTimeout(showTimer)
        }
      }
    }
  }, [])

  // Load saved bills on mount
  useEffect(() => {
    if (isLoaded) {
      setSavedBills(getSavedBills())
    }
  }, [isLoaded, getSavedBills])

  const handleReset = () => {
    resetAll()
    setCurrentStep(1)
  }

  const handleSaveBill = () => {
    saveBill()
    setSavedBills(getSavedBills())
    setActiveTab("history") // switch to history tab so user can see it!
  }

  const handleLoadBill = (billId: string) => {
    loadBill(billId)
    setCurrentStep(5)
    setActiveTab("splitter")
  }

  const handleDeleteBill = (billId: string) => {
    deleteSavedBill(billId)
    setSavedBills(getSavedBills())
  }

  const handleNewBill = () => {
    resetAll()
    setCurrentStep(1)
  }

  const handleInstallApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") {
      setInstallPrompt(null)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading SplitWise...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Dollar Icon in Green on White BG */}
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
              <DollarSign className="h-5 w-5 text-emerald-600 font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">SplitWise</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Install PWA Button */}
            {installPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstallApp}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-xs px-2.5 py-1.5 h-8 flex items-center gap-1 font-medium"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Install App
              </Button>
            )}

            {savedBills.length > 0 && activeTab === "splitter" && currentStep === 5 && (
              <Button variant="outline" size="sm" onClick={handleNewBill} className="h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Bill
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-2xl md:max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Navigation - Hidden on Mobile */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 space-y-4">
          <div className="p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm space-y-2 sticky top-20">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-2 mb-2">Dashboard</p>
            
            <button
              onClick={() => setActiveTab("groups")}
              className={`w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                activeTab === "groups"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/10 scale-102"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>Groups</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "groups" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground border border-border"
              }`}>
                {groups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("splitter")}
              className={`w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                activeTab === "splitter"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/10 scale-102"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>Split Bill</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/10 scale-102"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="h-4 w-4" />
                <span>History</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "history" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground border border-border"
              }`}>
                {savedBills.length}
              </span>
            </button>
            
            {/* Divider */}
            <div className="h-px bg-border/50 my-2" />
            
            {/* Quick Stats Panel */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Stats</span>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Total Saved Bills:</span>
                <span className="font-semibold text-foreground">{savedBills.length}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total Groups:</span>
                <span className="font-semibold text-foreground">{groups.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Tab Content Display */}
          <div className="transition-all duration-300">
            {/* GROUPS TAB */}
            {activeTab === "groups" && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <GroupsView
                  groups={groups}
                  onAddGroup={addGroup}
                  onUpdateGroup={updateGroup}
                  onDeleteGroup={deleteGroup}
                  onAddMember={addMemberToGroup}
                  onRemoveMember={removeMemberFromGroup}
                  onUpdateMember={updateMemberInGroup}
                  onSelectGroup={(groupId) => {
                    loadGroupIntoActiveSplit(groupId)
                    setCurrentStep(2) // Skip Step 1 (Friends) since group loaded them!
                    setActiveTab("splitter")
                  }}
                  onNewBill={() => {
                    handleNewBill()
                    setActiveTab("splitter")
                  }}
                />
              </div>
            )}

            {/* SPLIT BILL TAB */}
            {activeTab === "splitter" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} totalSteps={5} stepLabels={STEP_LABELS} />

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {currentStep === 1 && (
                    <AddFriendsStep
                      people={people}
                      addPerson={addPerson}
                      updatePerson={updatePerson}
                      removePerson={removePerson}
                      onContinue={() => setCurrentStep(2)}
                    />
                  )}

                  {currentStep === 2 && (
                    <AddProductsStep
                      products={products}
                      addProduct={addProduct}
                      updateProduct={updateProduct}
                      removeProduct={removeProduct}
                      onBack={() => setCurrentStep(1)}
                      onContinue={() => setCurrentStep(3)}
                    />
                  )}

                  {currentStep === 3 && (
                    <AssignProductsStep
                      people={people}
                      products={products}
                      togglePersonForProduct={togglePersonForProduct}
                      assignAllPeopleToProduct={assignAllPeopleToProduct}
                      toggleSplitByPercentage={toggleSplitByPercentage}
                      updateProductPercentage={updateProductPercentage}
                      onBack={() => setCurrentStep(2)}
                      onContinue={() => setCurrentStep(4)}
                    />
                  )}

                  {currentStep === 4 && (
                    <SelectPayerStep
                      people={people}
                      paidBy={paidBy}
                      setPaidBy={setPaidBy}
                      onBack={() => setCurrentStep(3)}
                      onContinue={() => setCurrentStep(5)}
                    />
                  )}

                  {currentStep === 5 && (
                    <FinalCalculationStep
                      people={people}
                      paidBy={paidBy}
                      calculateSplits={calculateSplits}
                      calculateOwes={calculateOwes}
                      grandTotal={grandTotal}
                      onBack={() => setCurrentStep(4)}
                      onReset={handleReset}
                      onSaveBill={handleSaveBill}
                    />
                  )}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <SavedBills
                  bills={savedBills}
                  onLoadBill={handleLoadBill}
                  onDeleteBill={handleDeleteBill}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Floating Bottom Tab Navigation (Fixed bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/80 flex items-center justify-around py-2.5 shadow-lg px-2">
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
            activeTab === "groups" ? "text-emerald-600 scale-105" : "text-muted-foreground"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeTab === "groups" ? "bg-emerald-50 text-emerald-600" : ""}`}>
            <Users className="h-5 w-5" />
          </div>
          <span>Groups</span>
        </button>

        <button
          onClick={() => setActiveTab("splitter")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
            activeTab === "splitter" ? "text-emerald-600 scale-105" : "text-muted-foreground"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeTab === "splitter" ? "bg-emerald-50 text-emerald-600" : ""}`}>
            <Receipt className="h-5 w-5" />
          </div>
          <span>Split Bill</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
            activeTab === "history" ? "text-emerald-600 scale-105" : "text-muted-foreground"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeTab === "history" ? "bg-emerald-50 text-emerald-600" : ""}`}>
            <History className="h-5 w-5" />
          </div>
          <span>History</span>
        </button>
      </div>

      {/* Footer Branding (Nexlyte) */}
      <footer className="w-full py-8 border-t border-border/10 flex items-center justify-center mt-8 pb-24 md:pb-8">
        <a 
          href="https://sinxn-coder.github.io/Nexlyte/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-row items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold opacity-75 group-hover:text-foreground transition-colors">Powered by</span>
          <img 
            src="nexlytelight.png" 
            alt="Nexlyte Light" 
            className="h-4.5 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform duration-200" 
          />
          <img 
            src="nexlytedark.png" 
            alt="Nexlyte Dark" 
            className="h-4.5 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform duration-200" 
          />
          <span className="text-xs font-bold tracking-tight text-foreground/80 group-hover:text-emerald-600 transition-colors duration-200">Nexlyte</span>
        </a>
      </footer>

      {/* PWA Floating Installation Popup & Steps */}
      {showPwaPopup && (
        <div className="fixed bottom-20 md:bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 p-4 rounded-2xl bg-card border border-border/80 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm shrink-0">
                <Smartphone className="h-5 w-5 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Install SplitWise PWA</h3>
                <p className="text-xs text-muted-foreground">Use fully offline like a native app!</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPwaPopup(false)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-3.5 pt-3.5 border-t border-border/40 space-y-2">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">How to Install:</p>
            <div className="text-xs space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-[10px] text-emerald-700 flex items-center justify-center shrink-0 font-bold">1</span>
                <p className="leading-snug">
                  <span className="font-semibold text-foreground">Mobile:</span> Tap the browser's <span className="underline font-medium">Share</span> or <span className="underline font-medium">Menu</span> button.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-[10px] text-emerald-700 flex items-center justify-center shrink-0 font-bold">2</span>
                <p className="leading-snug">
                  Tap <span className="font-semibold text-foreground">"Add to Home Screen"</span> or <span className="font-semibold text-foreground">"Install App"</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

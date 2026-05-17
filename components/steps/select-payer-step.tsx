"use client"

import { Wallet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Person } from "@/hooks/use-expense-data"

interface SelectPayerStepProps {
  people: Person[]
  paidBy: string | null
  setPaidBy: (id: string | null) => void
  onBack: () => void
  onContinue: () => void
}

export function SelectPayerStep({
  people,
  paidBy,
  setPaidBy,
  onBack,
  onContinue,
}: SelectPayerStepProps) {
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wallet className="h-5 w-5 text-primary" />
          Who Paid the Bill?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the person who paid at the shop
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {people.map((person, index) => {
            const isSelected = paidBy === person.id
            return (
              <button
                key={person.id}
                onClick={() => setPaidBy(isSelected ? null : person.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-2 ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium truncate">{person.name}</span>
                </div>
              </button>
            )
          })}
        </div>

        {!paidBy && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Select who paid the bill to see who owes them money
          </p>
        )}

        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onContinue} disabled={!paidBy} className="min-w-32">
            Calculate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Users2, IndianRupee, CheckCircle2, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Person, Product } from "@/hooks/use-expense-data"

interface AssignProductsStepProps {
  people: Person[]
  products: Product[]
  togglePersonForProduct: (productId: string, personId: string) => void
  assignAllPeopleToProduct: (productId: string) => void
  toggleSplitByPercentage: (productId: string) => void
  updateProductPercentage: (productId: string, personId: string, percentage: number) => void
  onBack: () => void
  onContinue: () => void
}

export function AssignProductsStep({
  people,
  products,
  togglePersonForProduct,
  assignAllPeopleToProduct,
  toggleSplitByPercentage,
  updateProductPercentage,
  onBack,
  onContinue,
}: AssignProductsStepProps) {
  
  const getTotalShares = (product: Product) => {
    return product.percentages
      .filter((p) => product.assignedTo.includes(p.personId))
      .reduce((sum, p) => sum + p.percentage, 0)
  }

  const getShareAmount = (product: Product, personId?: string) => {
    if (product.assignedTo.length === 0) return 0
    const totalCost = product.price * product.quantity

    if (product.splitByPercentage && personId) {
      const assignment = product.percentages.find((p) => p.personId === personId)
      const totalShares = getTotalShares(product)
      if (totalShares === 0) return 0
      return assignment ? (totalCost * assignment.percentage) / totalShares : 0
    }

    return totalCost / product.assignedTo.length
  }

  const getTotalCost = (product: Product) => {
    return product.price * product.quantity
  }

  const hasAnyAssignments = products.some((p) => p.assignedTo.length > 0)

  // Generate options in increments of 0.5 based on product quantity
  const generateDropdownOptions = (quantity: number) => {
    const options: number[] = [0]
    const maxVal = Math.max(quantity, 1)
    for (let i = 0.5; i <= maxVal; i += 0.5) {
      options.push(i)
    }
    // If the quantity is not a multiple of 0.5, add it as well
    if (!options.includes(quantity)) {
      options.push(quantity)
    }
    return options.sort((a, b) => a - b)
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users2 className="h-5 w-5 text-primary" />
          Assign Products
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select who consumed each item and split the cost equally or by custom count
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {product.name}
                  {product.quantity > 1 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      x{product.quantity}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-primary flex items-center">
                  <IndianRupee className="h-3 w-3" />
                  {getTotalCost(product).toFixed(2)}
                  {product.quantity > 1 && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({product.quantity} x {product.price.toFixed(2)})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={product.splitByPercentage ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleSplitByPercentage(product.id)}
                  className="text-xs"
                  disabled={product.assignedTo.length === 0}
                >
                  <Sliders className="h-3.5 w-3.5 mr-1" />
                  Custom Count
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => assignAllPeopleToProduct(product.id)}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Split Equally
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {people.map((person) => {
                const isSelected = product.assignedTo.includes(person.id)
                return (
                  <label
                    key={person.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border border-primary/30 text-foreground"
                        : "bg-background border border-border hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePersonForProduct(product.id, person.id)}
                    />
                    <span className="text-sm font-medium">{person.name}</span>
                  </label>
                )
              })}
            </div>

            {/* Custom Count Split UI */}
            {product.splitByPercentage && product.assignedTo.length > 0 && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Custom count split (select how many items consumed)</span>
                  <span className="text-primary font-medium">
                    Total Selected Count: {getTotalShares(product).toFixed(1)} / {product.quantity}
                  </span>
                </div>
                {product.assignedTo.map((personId) => {
                  const person = people.find((p) => p.id === personId)
                  const assignment = product.percentages.find((p) => p.personId === personId)
                  const currentCount = assignment?.percentage ?? 1
                  const dropdownOptions = generateDropdownOptions(product.quantity)

                  return (
                    <div key={personId} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24 truncate">{person?.name}</span>
                      <div className="flex-1 max-w-[120px]">
                        <select
                          value={currentCount}
                          onChange={(e) =>
                            updateProductPercentage(
                              product.id,
                              personId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-primary"
                        >
                          {dropdownOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt} {opt === 1 ? "item" : "items"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center ml-auto">
                        <IndianRupee className="h-3 w-3 mr-0.5" />
                        {getShareAmount(product, personId).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Equal Split Summary */}
            {!product.splitByPercentage && product.assignedTo.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Split {product.assignedTo.length}{" "}
                  {product.assignedTo.length === 1 ? "way" : "ways"}:{" "}
                  <span className="text-primary font-medium inline-flex items-center">
                    <IndianRupee className="h-2.5 w-2.5" />
                    {getShareAmount(product).toFixed(2)} each
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onContinue} disabled={!hasAnyAssignments} className="min-w-32">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

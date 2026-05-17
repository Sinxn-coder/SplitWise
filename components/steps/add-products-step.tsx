"use client"

import { useState } from "react"
import { Plus, Trash2, Edit3, Check, X, ShoppingBag, IndianRupee, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileBottomSheet } from "@/components/mobile-bottom-sheet"
import type { Product } from "@/hooks/use-expense-data"

interface AddProductsStepProps {
  products: Product[]
  addProduct: (name: string, price: number, quantity: number) => void
  updateProduct: (id: string, updates: Partial<Omit<Product, "id">>) => void
  removeProduct: (id: string) => void
  onBack: () => void
  onContinue: () => void
}

export function AddProductsStep({
  products,
  addProduct,
  updateProduct,
  removeProduct,
  onBack,
  onContinue,
}: AddProductsStepProps) {
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newQuantity, setNewQuantity] = useState("1")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingPrice, setEditingPrice] = useState("")
  const [editingQuantity, setEditingQuantity] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleAddProduct = () => {
    if (newName.trim() && newPrice) {
      const price = parseFloat(newPrice)
      const quantity = parseInt(newQuantity) || 1
      if (!isNaN(price) && price > 0 && quantity > 0) {
        addProduct(newName, price, quantity)
        setNewName("")
        setNewPrice("")
        setNewQuantity("1")
        setIsSheetOpen(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddProduct()
    }
  }

  const startEditing = (product: Product) => {
    setEditingId(product.id)
    setEditingName(product.name)
    setEditingPrice(product.price.toString())
    setEditingQuantity(product.quantity.toString())
  }

  const saveEdit = () => {
    if (editingId && editingName.trim() && editingPrice && editingQuantity) {
      const price = parseFloat(editingPrice)
      const quantity = parseInt(editingQuantity)
      if (!isNaN(price) && price > 0 && !isNaN(quantity) && quantity > 0) {
        updateProduct(editingId, { name: editingName.trim(), price, quantity })
        setEditingId(null)
        setEditingName("")
        setEditingPrice("")
        setEditingQuantity("")
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
    setEditingPrice("")
    setEditingQuantity("")
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

  return (
    <>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Add Products
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add items with unit price and quantity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desktop: Inline form */}
          <div className="hidden md:flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Product name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <div className="flex gap-2">
              <div className="relative w-24">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="relative w-20">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                  min="1"
                />
              </div>
              <Button onClick={handleAddProduct} disabled={!newName.trim() || !newPrice}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Mobile: Button to open sheet */}
          <div className="md:hidden">
            <Button onClick={() => setIsSheetOpen(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {products.length > 0 && (
            <div className="space-y-2 mt-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 animate-in fade-in slide-in-from-left-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {editingId === product.id ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="flex-1 h-8"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <div className="relative w-20">
                          <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="h-8 pl-7"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <span className="text-muted-foreground">x</span>
                        <Input
                          type="number"
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="h-8 w-16"
                          min="1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary hover:text-primary"
                          onClick={saveEdit}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        {product.quantity > 1 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            x{product.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end text-sm">
                          <span className="text-muted-foreground text-xs">
                            {product.quantity > 1 && (
                              <span className="inline-flex items-center">
                                <IndianRupee className="h-2.5 w-2.5" />
                                {product.price.toFixed(2)} x {product.quantity}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center font-semibold text-primary">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {(product.price * product.quantity).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => startEditing(product)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center pt-3 mt-3 border-t border-border">
                <span className="font-medium text-muted-foreground">Total</span>
                <span className="flex items-center text-lg font-bold text-primary">
                  <IndianRupee className="h-4 w-4" />
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No products added yet</p>
              <p className="text-sm">Add items to split between friends</p>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onContinue} disabled={products.length === 0} className="min-w-32">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Add Product">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Product Name</label>
            <Input
              placeholder="Enter product name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="h-12 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Unit Price</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="pl-9 h-12 text-base"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <Input
                type="number"
                placeholder="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="h-12 text-base"
                min="1"
              />
            </div>
          </div>

          {newPrice && newQuantity && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="flex items-center font-bold text-primary">
                  <IndianRupee className="h-4 w-4" />
                  {(parseFloat(newPrice || "0") * parseInt(newQuantity || "1")).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleAddProduct}
            disabled={!newName.trim() || !newPrice}
            className="w-full h-12 text-base"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </MobileBottomSheet>
    </>
  )
}

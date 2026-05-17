"use client"

import { useState } from "react"
import { Plus, Trash2, Edit3, Check, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileBottomSheet } from "@/components/mobile-bottom-sheet"
import type { Person } from "@/hooks/use-expense-data"

interface AddFriendsStepProps {
  people: Person[]
  addPerson: (name: string) => void
  updatePerson: (id: string, name: string) => void
  removePerson: (id: string) => void
  onContinue: () => void
}

export function AddFriendsStep({
  people,
  addPerson,
  updatePerson,
  removePerson,
  onContinue,
}: AddFriendsStepProps) {
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleAddPerson = () => {
    if (newName.trim()) {
      addPerson(newName)
      setNewName("")
      setIsSheetOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPerson()
    }
  }

  const startEditing = (person: Person) => {
    setEditingId(person.id)
    setEditingName(person.name)
  }

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      updatePerson(editingId, editingName)
      setEditingId(null)
      setEditingName("")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  return (
    <>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            Add Friends
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add the names of people who will split the bill
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desktop: Inline form */}
          <div className="hidden md:flex gap-2">
            <Input
              placeholder="Enter friend&apos;s name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleAddPerson} disabled={!newName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Mobile: FAB to open sheet */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsSheetOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </div>

          {people.length > 0 && (
            <div className="space-y-2 mt-4">
              {people.map((person, index) => (
                <div
                  key={person.id}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 animate-in fade-in slide-in-from-left-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {editingId === person.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="flex-1 h-8"
                        autoFocus
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
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{person.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => startEditing(person)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removePerson(person.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {people.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No friends added yet</p>
              <p className="text-sm">Add at least 2 people to continue</p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button
              onClick={onContinue}
              disabled={people.length < 2}
              className="min-w-32"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Add Friend"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Friend&apos;s Name
            </label>
            <Input
              placeholder="Enter name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-12 text-base"
            />
          </div>
          <Button
            onClick={handleAddPerson}
            disabled={!newName.trim()}
            className="w-full h-12 text-base"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </MobileBottomSheet>
    </>
  )
}

"use client"

import { useState } from "react"
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MobileBottomSheet } from "@/components/mobile-bottom-sheet"
import type { Group, Person } from "@/hooks/use-expense-data"

interface GroupsViewProps {
  groups: Group[]
  onAddGroup: (name: string) => string
  onUpdateGroup: (id: string, updates: Partial<Omit<Group, "id">>) => void
  onDeleteGroup: (id: string) => void
  onAddMember: (groupId: string, name: string) => string
  onRemoveMember: (groupId: string, personId: string) => void
  onUpdateMember: (groupId: string, personId: string, name: string) => void
  onSelectGroup: (groupId: string) => void
  onNewBill: () => void
}

export function GroupsView({
  groups,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  onSelectGroup,
  onNewBill,
}: GroupsViewProps) {
  const [newGroupName, setNewGroupName] = useState("")
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [addingMemberGroupId, setAddingMemberGroupId] = useState<string | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingMemberName, setEditingMemberName] = useState("")

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const groupId = onAddGroup(newGroupName.trim())
      setNewGroupName("")
      setShowAddGroup(false)
      setExpandedGroupId(groupId)
    }
  }

  const handleSaveGroupName = (groupId: string) => {
    if (editingGroupName.trim()) {
      onUpdateGroup(groupId, { name: editingGroupName.trim() })
      setEditingGroupId(null)
      setEditingGroupName("")
    }
  }

  const handleAddMember = (groupId: string) => {
    if (newMemberName.trim()) {
      onAddMember(groupId, newMemberName.trim())
      setNewMemberName("")
      setAddingMemberGroupId(null)
    }
  }

  const handleSaveMemberName = (groupId: string, personId: string) => {
    if (editingMemberName.trim()) {
      onUpdateMember(groupId, personId, editingMemberName.trim())
      setEditingMemberId(null)
      setEditingMemberName("")
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Start */}
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Quick Split</h3>
              <p className="text-sm text-muted-foreground">
                Start a new bill without a group
              </p>
            </div>
            <Button onClick={onNewBill} className="gap-2">
              <Receipt className="h-4 w-4" />
              New Bill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Groups */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Groups
            </CardTitle>
            {/* Desktop Add Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddGroup(true)}
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Group
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create groups for recurring expense sharing
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No groups yet</p>
              <p className="text-sm">Create a group to save your friends</p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="rounded-xl border border-border/50 overflow-hidden bg-card"
              >
                {/* Group Header */}
                <div
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    setExpandedGroupId(expandedGroupId === group.id ? null : group.id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            className="h-8 w-32"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveGroupName(group.id)
                              if (e.key === "Escape") setEditingGroupId(null)
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveGroupName(group.id)}
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingGroupId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold">{group.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingGroupId(group.id)
                        setEditingGroupName(group.name)
                      }}
                    >
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteGroup(group.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <ChevronRight
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedGroupId === group.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Group Content */}
                {expandedGroupId === group.id && (
                  <div className="px-3 pb-3 pt-0 border-t border-border/50">
                    {/* Members */}
                    <div className="mt-3 space-y-2">
                      {group.members.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No members yet
                        </p>
                      ) : (
                        group.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50"
                          >
                            {editingMemberId === member.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editingMemberName}
                                  onChange={(e) => setEditingMemberName(e.target.value)}
                                  className="h-8 flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleSaveMemberName(group.id, member.id)
                                    if (e.key === "Escape") setEditingMemberId(null)
                                  }}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleSaveMemberName(group.id, member.id)}
                                >
                                  <Check className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => setEditingMemberId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-medium">{member.name}</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setEditingMemberId(member.id)
                                      setEditingMemberName(member.name)
                                    }}
                                  >
                                    <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => onRemoveMember(group.id, member.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}

                      {/* Add Member - Desktop */}
                      <div className="hidden sm:flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Add member name"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="h-9"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddMember(group.id)
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddMember(group.id)}
                          disabled={!newMemberName.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Add Member - Mobile */}
                      <div className="sm:hidden mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setAddingMemberGroupId(group.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Member
                        </Button>
                        {addingMemberGroupId === group.id && (
                          <MobileBottomSheet
                            isOpen={addingMemberGroupId === group.id}
                            onClose={() => {
                              setAddingMemberGroupId(null)
                              setNewMemberName("")
                            }}
                            title="Add Member"
                          >
                            <div className="space-y-4">
                              <Input
                                placeholder="Enter member name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                autoFocus
                              />
                              <Button
                                className="w-full"
                                onClick={() => handleAddMember(group.id)}
                                disabled={!newMemberName.trim()}
                              >
                                Add Member
                              </Button>
                            </div>
                          </MobileBottomSheet>
                        )}
                      </div>
                    </div>

                    {/* Use Group Button */}
                    <Button
                      className="w-full mt-4"
                      onClick={() => onSelectGroup(group.id)}
                      disabled={group.members.length === 0}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Start Bill with Group
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Mobile Add Group Button */}
          <div className="sm:hidden pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddGroup(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Group
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Add Group Sheet */}
      <MobileBottomSheet
        isOpen={showAddGroup}
        onClose={() => {
          setShowAddGroup(false)
          setNewGroupName("")
        }}
        title="Create New Group"
      >
        <div className="space-y-4">
          <Input
            placeholder="Enter group name (e.g., College Friends)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            autoFocus
          />
          <Button
            className="w-full"
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
          >
            Create Group
          </Button>
        </div>
      </MobileBottomSheet>
    </div>
  )
}

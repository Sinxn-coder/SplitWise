"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  Receipt,
  Copy,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MobileBottomSheet } from "@/components/mobile-bottom-sheet"
import { PremiumModal } from "@/components/premium-modal"
import type { Group, Person } from "@/hooks/use-expense-data"

interface GroupsViewProps {
  groups: Group[]
  onAddGroup: (name: string, addSelf: boolean) => string
  onUpdateGroup: (id: string, updates: Partial<Omit<Group, "id">>) => void
  onDeleteGroup: (id: string) => void
  onAddMember: (groupId: string, name: string) => string
  onRemoveMember: (groupId: string, personId: string) => void
  onUpdateMember: (groupId: string, personId: string, name: string) => void
  onJoinGroup: (code: string) => Promise<{ success: boolean; message: string; groupName?: string }>
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
  onJoinGroup,
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
  const [activeDetailGroupId, setActiveDetailGroupId] = useState<string | null>(null)

  // Three-dot dropdown menu state
  const [openMenuGroupId, setOpenMenuGroupId] = useState<string | null>(null)
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null)
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuGroupId(null)
        setOpenMemberMenuId(null)
        setConfirmDeleteGroupId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sharing states
  const [activeAddTab, setActiveAddTab] = useState<"create" | "join">("create")
  const [shareCodeInput, setShareCodeInput] = useState("")
  const [joinError, setJoinError] = useState("")
  const [joinSuccess, setJoinSuccess] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null)
  const [addSelfToGroup, setAddSelfToGroup] = useState(true)

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const groupId = onAddGroup(newGroupName.trim(), addSelfToGroup)
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

  const handleJoinGroup = async () => {
    setJoinError("")
    setJoinSuccess("")
    setIsJoining(true)

    const code = shareCodeInput.trim().toUpperCase()
    if (!code) {
      setJoinError("Please enter a group share code.")
      setIsJoining(false)
      return
    }

    try {
      const res = await onJoinGroup(code)
      if (res.success) {
        setJoinSuccess(`Successfully joined "${res.groupName}"!`)
        setShareCodeInput("")
        setTimeout(() => {
          setShowAddGroup(false)
          setJoinSuccess("")
          // Switch tab back to default for next open
          setActiveAddTab("create")
        }, 1500)
      } else {
        setJoinError(res.message)
      }
    } catch (err) {
      setJoinError("Could not join group. Try again!")
    } finally {
      setIsJoining(false)
    }
  }

  const handleCopyCode = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation()
    if (!group.shareCode) return
    
    navigator.clipboard.writeText(group.shareCode)
    setCopiedGroupId(group.id)
    setTimeout(() => setCopiedGroupId(null), 2000)
  }

  const activeGroup = groups.find(g => g.id === activeDetailGroupId)

  if (activeGroup) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setActiveDetailGroupId(null)}
            className="gap-2 px-3 py-1.5 h-9 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold text-xs tracking-wider uppercase cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Groups
          </Button>

          {/* Optional Group Settings Menu (Rename / Delete) */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenMenuGroupId(openMenuGroupId === activeGroup.id ? null : activeGroup.id)}
              className="h-9 w-9 rounded-xl cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {openMenuGroupId === activeGroup.id && (
              <div className="absolute right-0 top-10 z-50 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Rename Group */}
                <button
                  onClick={() => {
                    setEditingGroupId(activeGroup.id)
                    setEditingGroupName(activeGroup.name)
                    setOpenMenuGroupId(null)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  Rename Group
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />
                
                {/* Delete Group */}
                {confirmDeleteGroupId === activeGroup.id ? (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">Are you sure?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDeleteGroup(activeGroup.id)
                          setActiveDetailGroupId(null)
                          setOpenMenuGroupId(null)
                          setConfirmDeleteGroupId(null)
                        }}
                        className="flex-1 py-1.5 text-[10px] font-extrabold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteGroupId(null)}
                        className="flex-1 py-1.5 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => confirmDeleteGroupId === activeGroup.id || setConfirmDeleteGroupId(activeGroup.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Group Main Card Info */}
        <Card className="border-border/50 shadow-lg overflow-hidden relative">
          {/* Custom Banner Background Gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <CardContent className="p-6 pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md"
                style={{ backgroundColor: activeGroup.color }}
              >
                {activeGroup.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1.5 flex-1 w-full">
                {editingGroupId === activeGroup.id ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Input
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      className="h-10 text-lg font-bold max-w-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveGroupName(activeGroup.id)
                        if (e.key === "Escape") setEditingGroupId(null)
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() => handleSaveGroupName(activeGroup.id)}
                    >
                      <Check className="h-5 w-5 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() => setEditingGroupId(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-black text-foreground tracking-tight">{activeGroup.name}</h2>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <Users className="h-3 w-3" />
                    {activeGroup.members.length} Members
                  </span>

                  {activeGroup.shareCode && (
                    <button
                      onClick={(e) => handleCopyCode(e, activeGroup)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      {copiedGroupId === activeGroup.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Code: {activeGroup.shareCode}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Members Section */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Group Members
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage group participants and split profiles
              </p>
            </div>

            {/* Quick add trigger for desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Input
                placeholder="New member name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="h-9 w-40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMember(activeGroup.id)
                }}
              />
              <Button
                size="sm"
                className="h-9"
                onClick={() => handleAddMember(activeGroup.id)}
                disabled={!newMemberName.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeGroup.members.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No members in this group yet. Add friends below to start.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    {editingMemberId === member.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingMemberName}
                          onChange={(e) => setEditingMemberName(e.target.value)}
                          className="h-8 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveMemberName(activeGroup.id, member.id)
                            if (e.key === "Escape") setEditingMemberId(null)
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleSaveMemberName(activeGroup.id, member.id)}
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
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{member.name}</span>
                        {/* Member options */}
                        <div className="relative" ref={menuRef}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMemberMenuId(openMemberMenuId === member.id ? null : member.id)
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMemberMenuId === member.id && (
                            <div
                              className="absolute right-0 top-8 z-50 w-40 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setEditingMemberId(member.id)
                                  setEditingMemberName(member.name)
                                  setOpenMemberMenuId(null)
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                              >
                                <Edit3 className="h-3 w-3 text-slate-400" />
                                Rename Member
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />
                              <button
                                onClick={() => {
                                  onRemoveMember(activeGroup.id, member.id)
                                  setOpenMemberMenuId(null)
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove Member
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mobile / Screen-small Add Member Trigger */}
            <div className="sm:hidden pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setAddingMemberGroupId(activeGroup.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
              {addingMemberGroupId === activeGroup.id && (
                <MobileBottomSheet
                  isOpen={addingMemberGroupId === activeGroup.id}
                  onClose={() => {
                    setAddingMemberGroupId(null)
                    setNewMemberName("")
                  }}
                  title="Add Group Member"
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
                      onClick={() => handleAddMember(activeGroup.id)}
                      disabled={!newMemberName.trim()}
                    >
                      Add Member
                    </Button>
                  </div>
                </MobileBottomSheet>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Start Bill CTA Button */}
        <Button
          className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => {
            onSelectGroup(activeGroup.id)
          }}
          disabled={activeGroup.members.length === 0}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Start Bill with Group
        </Button>
      </div>
    )
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
            {/* Desktop Add/Join Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddGroup(true)
                setActiveAddTab("create")
              }}
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add or Join Group
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create groups or enter a share code to join a shared workspace
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No groups yet</p>
              <p className="text-sm">Create a group or join one to save sheet splits</p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="rounded-xl border border-border/50 bg-card"
              >
                {/* Group Header */}
                <div
                  className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                    expandedGroupId === group.id ? "rounded-t-xl" : "rounded-xl"
                  }`}
                  onClick={() => {
                    if (group.members.length >= 6) {
                      setActiveDetailGroupId(group.id)
                    } else {
                      setExpandedGroupId(expandedGroupId === group.id ? null : group.id)
                    }
                  }}
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" ref={menuRef}>
                    {/* Three-dot menu button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuGroupId(openMenuGroupId === group.id ? null : group.id)
                          setConfirmDeleteGroupId(null)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuGroupId === group.id && (
                        <div
                          className="absolute right-0 top-9 z-50 w-48 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Copy Share Code */}
                          {group.shareCode && (
                            <button
                              onClick={(e) => {
                                handleCopyCode(e, group)
                                setTimeout(() => setOpenMenuGroupId(null), 1500)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                            >
                              {copiedGroupId === group.id ? (
                                <><Check className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700">Copied!</span></>
                              ) : (
                                <><Copy className="h-3.5 w-3.5 text-slate-400" /><span>Copy Share Code</span></>
                              )}
                            </button>
                          )}

                          {/* Divider */}
                          {group.shareCode && <div className="h-px bg-slate-100 mx-3" />}

                          {/* Rename Group */}
                          <button
                            onClick={() => {
                              setEditingGroupId(group.id)
                              setEditingGroupName(group.name)
                              setOpenMenuGroupId(null)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                            Rename Group
                          </button>

                          <div className="h-px bg-slate-100 mx-3" />

                          {/* Delete — with confirm step */}
                          {confirmDeleteGroupId === group.id ? (
                            <div className="px-4 py-3 space-y-2">
                              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">Are you sure?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    onDeleteGroup(group.id)
                                    setOpenMenuGroupId(null)
                                    setConfirmDeleteGroupId(null)
                                  }}
                                  className="flex-1 py-1.5 text-[10px] font-extrabold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteGroupId(null)}
                                  className="flex-1 py-1.5 text-[10px] font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteGroupId(group.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Group
                            </button>
                          )}
                        </div>
                      )}
                    </div>

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
                                {/* Member three-dot menu */}
                                <div className="relative" ref={menuRef}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenMemberMenuId(openMemberMenuId === member.id ? null : member.id)
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>

                                  {openMemberMenuId === member.id && (
                                    <div
                                      className="absolute right-0 top-8 z-50 w-40 bg-white rounded-xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={() => {
                                          setEditingMemberId(member.id)
                                          setEditingMemberName(member.name)
                                          setOpenMemberMenuId(null)
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                                      >
                                        <Edit3 className="h-3 w-3 text-slate-400" />
                                        Rename
                                      </button>
                                      <div className="h-px bg-slate-100 mx-2" />
                                      <button
                                        onClick={() => {
                                          onRemoveMember(group.id, member.id)
                                          setOpenMemberMenuId(null)
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Remove
                                      </button>
                                    </div>
                                  )}
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
                      className="w-full mt-3"
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

          {/* Mobile Add/Join Button */}
          <div className="sm:hidden pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAddGroup(true)
                setActiveAddTab("create")
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add or Join Group
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Premium Add or Join Group Popup Modal */}
      <PremiumModal
        isOpen={showAddGroup}
        onClose={() => {
          setShowAddGroup(false)
          setNewGroupName("")
          setShareCodeInput("")
          setJoinError("")
          setJoinSuccess("")
          setActiveAddTab("create")
        }}
        title={activeAddTab === "create" ? "Create New Group" : "Join Shared Group"}
        description={activeAddTab === "create" ? "Establish a new shared workspace for your group bills" : "Enter a share code to join an existing group workspace"}
        icon={<Users className="h-5 w-5 text-emerald-600" />}
      >
        <div className="space-y-4 pt-1">
          {/* Tab Selector */}
          <div className="flex bg-slate-100/80 border border-slate-200/50 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveAddTab("create")
                setJoinError("")
                setJoinSuccess("")
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeAddTab === "create"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create New Group
            </button>
            <button
              onClick={() => {
                setActiveAddTab("join")
                setJoinError("")
                setJoinSuccess("")
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeAddTab === "join"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Join via Share Code
            </button>
          </div>

          {activeAddTab === "create" ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Group Name
                </label>
                <Input
                  placeholder="e.g. Roommates 2026, Goa Trip, Family"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  className="h-12 text-base border-border/80 focus:border-primary/80 focus:ring-primary/20 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddGroup()
                  }}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer pl-1">
                <input
                  type="checkbox"
                  checked={addSelfToGroup}
                  onChange={(e) => setAddSelfToGroup(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                Add me to this group
              </label>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddGroup(false)}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim()}
                  className="flex-1 h-12 rounded-xl text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Share Code
                </label>
                <Input
                  placeholder="Enter HP-XXXX code"
                  value={shareCodeInput}
                  onChange={(e) => {
                    setShareCodeInput(e.target.value.toUpperCase())
                    setJoinError("")
                  }}
                  className="font-mono text-center tracking-widest text-base font-black placeholder:font-sans placeholder:tracking-normal placeholder:text-sm uppercase h-12 border-border/80 focus:border-primary/80 focus:ring-primary/20 rounded-xl"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleJoinGroup()
                  }}
                />
              </div>
              
              {joinError && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl text-center animate-in fade-in duration-200">
                  {joinError}
                </p>
              )}

              {joinSuccess && (
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center animate-in fade-in duration-200">
                  {joinSuccess}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddGroup(false)}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinGroup}
                  disabled={!shareCodeInput.trim() || isJoining}
                  className="flex-1 h-12 rounded-xl text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isJoining ? "Joining..." : "Join Group"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PremiumModal>
    </div>
  )
}

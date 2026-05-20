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
                setShowAddGroup(!showAddGroup)
                setActiveAddTab("create")
              }}
              className="hidden sm:flex"
            >
              {showAddGroup ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add or Join Group
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create groups or enter a share code to join a shared workspace
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddGroup && (
            <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  {activeAddTab === "create" ? "Create New Group" : "Join via Share Code"}
                </h4>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-lg"
                  onClick={() => setShowAddGroup(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

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
                  <Input
                    placeholder="Enter group name (e.g., Roommates 2026)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddGroup()
                    }}
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer pl-1">
                    <input
                      type="checkbox"
                      checked={addSelfToGroup}
                      onChange={(e) => setAddSelfToGroup(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    Add me to this group
                  </label>
                  <Button
                    className="w-full py-5 rounded-xl font-bold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAddGroup}
                    disabled={!newGroupName.trim()}
                  >
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="Enter 9-character code (e.g., HP-A4F9)"
                    value={shareCodeInput}
                    onChange={(e) => {
                      setShareCodeInput(e.target.value.toUpperCase())
                      setJoinError("")
                    }}
                    className="font-mono text-center tracking-widest text-sm font-black placeholder:font-sans placeholder:tracking-normal placeholder:text-xs uppercase"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleJoinGroup()
                    }}
                  />
                  
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

                  <Button
                    className="w-full py-5 rounded-xl font-bold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleJoinGroup}
                    disabled={!shareCodeInput.trim() || isJoining}
                  >
                    {isJoining ? "Joining Workspace..." : "Join Group"}
                  </Button>
                </div>
              )}
            </div>
          )}

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
                setShowAddGroup(!showAddGroup)
                setActiveAddTab("create")
              }}
            >
              {showAddGroup ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add or Join Group
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

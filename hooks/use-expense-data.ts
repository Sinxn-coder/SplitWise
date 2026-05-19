"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"

export interface Person {
  id: string
  name: string
}

export interface ProductAssignment {
  personId: string
  percentage: number // treated as "count" or "shares" in the UI
}

export interface Product {
  id: string
  name: string
  price: number
  quantity: number
  assignedTo: string[]
  splitByPercentage: boolean // toggles custom count-based split
  percentages: ProductAssignment[] // custom count/shares assigned to each person
}

export interface Group {
  id: string
  name: string
  members: Person[]
  color: string
  createdAt: number
  shareCode?: string
}

export interface SavedBill {
  id: string
  createdAt: number
  expiresAt?: number
  people: Person[]
  products: Product[]
  paidBy: string | null
  payments?: Record<string, number>
  grandTotal: number
  groupId?: string
  groupName?: string
}

export interface ExpenseData {
  people: Person[]
  products: Product[]
  paidBy: string | null
  payments?: Record<string, number>
}

export function useExpenseData(userSession?: { id: string; username: string; full_name: string } | null) {
  const [people, setPeople] = useState<Person[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [paidBy, setPaidBy] = useState<string | null>(null)
  const [payments, setPayments] = useState<Record<string, number>>({})
  const [groups, setGroups] = useState<Group[]>([])
  const [savedBills, setSavedBills] = useState<SavedBill[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const grandTotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  // Scoped storage keys based on user session ID to prevent multi-account crossovers
  const userId = userSession?.id || "anonymous"
  const STORAGE_KEY = `homiepay-expense-data-${userId}`
  const BILLS_STORAGE_KEY = `homiepay-saved-bills-${userId}`
  const GROUPS_STORAGE_KEY = `homiepay-saved-groups-${userId}`

  // Load user data on mount / session change
  useEffect(() => {
    if (!userSession) {
      setIsLoaded(false)
      return
    }

    // Load Local Storage Fallbacks Scoped to this User
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: ExpenseData = JSON.parse(stored)
        setPeople(data.people || [])
        setProducts(data.products || [])
        setPaidBy(data.paidBy || null)
        setPayments(data.payments || {})
      } else {
        // Pre-populate with the current user as the first friend so they don't have to re-add themselves!
        setPeople([{ id: "user-self", name: userSession.full_name }])
        setProducts([])
        setPaidBy(null)
        setPayments({})
      }
    } catch (e) {
      console.error("Failed to load user local storage:", e)
    }

    try {
      const storedBills = localStorage.getItem(BILLS_STORAGE_KEY)
      if (storedBills) {
        setSavedBills(JSON.parse(storedBills))
      } else {
        setSavedBills([])
      }
    } catch (e) {
      console.error("Failed to load user saved bills:", e)
    }

    try {
      const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY)
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups))
      } else {
        setGroups([])
      }
    } catch (e) {
      console.error("Failed to load user groups:", e)
    }

    setIsLoaded(true)
  }, [userSession, STORAGE_KEY, BILLS_STORAGE_KEY, GROUPS_STORAGE_KEY])

  // Fetch from Supabase and synchronize/merge when userSession is ready
  useEffect(() => {
    if (!userSession || !isLoaded) return

    const currentUserId = userSession.id

    async function loadAndSyncFromSupabase() {
      try {
        // 1. Sync Groups (Created by us OR Joined by us via share code)
        const storedJoinedKey = `homiepay-joined-group-ids-${currentUserId}`
        const storedJoined = localStorage.getItem(storedJoinedKey)
        const joinedIds: string[] = storedJoined ? JSON.parse(storedJoined) : []

        let supabaseGroups: any[] = []
        const { data: createdGroups, error: groupsErr } = await supabase
          .from("groups")
          .select("*")
          .eq("user_id", currentUserId)

        if (!groupsErr && createdGroups) {
          supabaseGroups.push(...createdGroups)
        }

        if (joinedIds.length > 0) {
          const { data: joinedGroups, error: joinedErr } = await supabase
            .from("groups")
            .select("*")
            .in("id", joinedIds)
          if (!joinedErr && joinedGroups) {
            joinedGroups.forEach((jg: any) => {
              if (!supabaseGroups.some(cg => cg.id === jg.id)) {
                supabaseGroups.push(jg)
              }
            })
          }
        }

        let mergedGroups: Group[] = []
        if (supabaseGroups.length > 0) {
          const formattedGroups: Group[] = supabaseGroups.map((g: any) => ({
            id: g.id,
            name: g.name,
            members: g.members,
            color: g.color,
            createdAt: new Date(g.created_at).getTime(),
            shareCode: g.share_code
          }))

          const localStoredGroups = localStorage.getItem(GROUPS_STORAGE_KEY)
          const localGroups: Group[] = localStoredGroups ? JSON.parse(localStoredGroups) : []
          const groupsMap = new Map<string, Group>()

          localGroups.forEach(g => groupsMap.set(g.id, g))
          formattedGroups.forEach(g => {
            if (groupsMap.has(g.id)) {
              const existing = groupsMap.get(g.id)!
              if (g.createdAt > existing.createdAt) {
                groupsMap.set(g.id, g)
              }
            } else {
              groupsMap.set(g.id, g)
            }
          })

          mergedGroups = Array.from(groupsMap.values()).sort((a, b) => b.createdAt - a.createdAt)
          localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(mergedGroups))
          setGroups(mergedGroups)
        } else {
          const localStoredGroups = localStorage.getItem(GROUPS_STORAGE_KEY)
          mergedGroups = localStoredGroups ? JSON.parse(localStoredGroups) : []
        }

        // Get unified list of group IDs to sync bills
        const allGroupIds = mergedGroups.map(g => g.id)

        // 2. Sync Bills associated with either this user ID OR any of our group sheets
        let billsQuery = supabase.from("bills").select("*")
        if (allGroupIds.length > 0) {
          // Sync bills that belong to our user OR belong to our groups
          billsQuery = billsQuery.or(`user_id.eq.${currentUserId},group_id.in.(${allGroupIds.join(",")})`)
        } else {
          billsQuery = billsQuery.eq("user_id", currentUserId)
        }

        const { data: supabaseBills, error: billsErr } = await billsQuery.order("created_at", { ascending: false })

        if (!billsErr && supabaseBills) {
          const formattedBills: SavedBill[] = supabaseBills.map((b: any) => ({
            id: b.id,
            createdAt: new Date(b.created_at).getTime(),
            people: b.people,
            products: b.products,
            paidBy: b.paid_by,
            payments: b.payments,
            grandTotal: b.grand_total,
            groupId: b.group_id,
            groupName: b.group_name
          }))

          const localStored = localStorage.getItem(BILLS_STORAGE_KEY)
          const localBills: SavedBill[] = localStored ? JSON.parse(localStored) : []
          const billsMap = new Map<string, SavedBill>()

          localBills.forEach(b => billsMap.set(b.id, b))
          formattedBills.forEach(b => {
            if (billsMap.has(b.id)) {
              const existing = billsMap.get(b.id)!
              if (b.createdAt > existing.createdAt) {
                billsMap.set(b.id, b)
              }
            } else {
              billsMap.set(b.id, b)
            }
          })

          const mergedBills = Array.from(billsMap.values()).sort((a, b) => b.createdAt - a.createdAt)
          localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(mergedBills))
          setSavedBills(mergedBills)
        }
      } catch (err) {
        console.warn("Supabase background sync paused. Fallback to Local Storage:", err)
      }
    }

    loadAndSyncFromSupabase()
  }, [userSession, isLoaded, BILLS_STORAGE_KEY, GROUPS_STORAGE_KEY])

  // Save to localStorage when active bill data changes
  useEffect(() => {
    if (isLoaded && userSession) {
      const data = { people, products, paidBy, payments }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [people, products, paidBy, payments, isLoaded, STORAGE_KEY, userSession])

  // Save groups helper
  const saveGroupsToStorage = useCallback(async (newGroups: Group[]) => {
    setGroups(newGroups)
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(newGroups))

    if (!userSession) return

    // Async cloud backup to Supabase
    try {
      for (const group of newGroups) {
        await supabase.from("groups").upsert({
          id: group.id,
          user_id: userSession.id,
          name: group.name,
          members: group.members,
          color: group.color,
          created_at: new Date(group.createdAt).toISOString(),
          share_code: group.shareCode
        })
      }
    } catch (err) {
      console.warn("Supabase failed to backup groups:", err)
    }
  }, [userSession, GROUPS_STORAGE_KEY])

  // Person operations
  const addPerson = useCallback((name: string) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: name.trim(),
    }
    setPeople((prev) => [...prev, newPerson])
  }, [])

  const updatePerson = useCallback((id: string, name: string) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    )
  }, [])

  const removePerson = useCallback((id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id))
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        assignedTo: product.assignedTo.filter((personId) => personId !== id),
        percentages: product.percentages.filter((p) => p.personId !== id),
      }))
    )
    setPaidBy((prev) => (prev === id ? null : prev))
    setPayments((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  // Product operations
  const addProduct = useCallback((name: string, price: number, quantity: number = 1) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      price,
      quantity,
      assignedTo: [],
      splitByPercentage: false,
      percentages: [],
    }
    setProducts((prev) => [...prev, newProduct])
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, "id">>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const togglePersonForProduct = useCallback((productId: string, personId: string) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product

        const hasAssignment = product.assignedTo.includes(personId)
        let nextAssigned: string[]
        let nextPercentages = [...product.percentages]

        if (hasAssignment) {
          nextAssigned = product.assignedTo.filter((id) => id !== personId)
          nextPercentages = nextPercentages.filter((p) => p.personId !== personId)
        } else {
          nextAssigned = [...product.assignedTo, personId]
          nextPercentages.push({ personId, percentage: 1 })
        }

        return {
          ...product,
          assignedTo: nextAssigned,
          percentages: nextPercentages,
        }
      })
    )
  }, [])

  const assignAllPeopleToProduct = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product

        const allAssigned = people.every((p) => product.assignedTo.includes(p.id))
        if (allAssigned) {
          return {
            ...product,
            assignedTo: [],
            percentages: [],
          }
        } else {
          return {
            ...product,
            assignedTo: people.map((p) => p.id),
            percentages: people.map((p) => ({ personId: p.id, percentage: 1 })),
          }
        }
      })
    )
  }, [people])

  const toggleSplitByPercentage = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, splitByPercentage: !p.splitByPercentage } : p))
    )
  }, [])

  const updateProductPercentage = useCallback((productId: string, personId: string, percentage: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product

        const percentages = product.percentages.map((p) =>
          p.personId === personId ? { ...p, percentage } : p
        )

        return {
          ...product,
          percentages,
        }
      })
    )
  }, [])

  const calculateSplits = useCallback(() => {
    const splits: Record<
      string,
      { items: { name: string; amount: number; quantity: number }[]; total: number }
    > = {}

    people.forEach((p) => {
      splits[p.id] = { items: [], total: 0 }
    })

    products.forEach((product) => {
      if (product.assignedTo.length === 0) return

      if (product.splitByPercentage) {
        const totalPercentages = product.percentages.reduce(
          (sum, p) => (product.assignedTo.includes(p.personId) ? sum + p.percentage : sum),
          0
        )

        if (totalPercentages > 0) {
          product.assignedTo.forEach((personId) => {
            const assignment = product.percentages.find((p) => p.personId === personId)
            const share = assignment ? assignment.percentage / totalPercentages : 0
            const itemCost = product.price * product.quantity * share

            if (splits[personId] && itemCost > 0) {
              splits[personId].items.push({
                name: product.name,
                amount: itemCost,
                quantity: product.quantity * share,
              })
              splits[personId].total += itemCost
            }
          })
        }
      } else {
        const costPerPerson = (product.price * product.quantity) / product.assignedTo.length
        product.assignedTo.forEach((personId) => {
          if (splits[personId]) {
            splits[personId].items.push({
              name: product.name,
              amount: costPerPerson,
              quantity: product.quantity / product.assignedTo.length,
            })
            splits[personId].total += costPerPerson
          }
        })
      }
    })

    return splits
  }, [people, products])

  const calculateOwes = useCallback(() => {
    const splits = calculateSplits()
    const balances = people.map((person) => {
      const spent = splits[person.id]?.total || 0
      const paid = payments[person.id] || 0
      return {
        id: person.id,
        name: person.name,
        balance: paid - spent,
      }
    })

    const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance)
    const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance)

    const transactions: { from: string; to: string; amount: number }[] = []
    let dIdx = 0
    let cIdx = 0

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx]
      const creditor = creditors[cIdx]

      const owesAmount = Math.abs(debtor.balance)
      const creditAmount = creditor.balance
      const settleAmount = Math.min(owesAmount, creditAmount)

      if (settleAmount > 0.01) {
        transactions.push({
          from: debtor.id,
          to: creditor.id,
          amount: settleAmount,
        })
      }

      debtor.balance += settleAmount
      creditor.balance -= settleAmount

      if (Math.abs(debtor.balance) < 0.01) {
        dIdx++
      }
      if (Math.abs(creditor.balance) < 0.01) {
        cIdx++
      }
    }

    return transactions
  }, [people, payments, paidBy, grandTotal, calculateSplits])

  const resetAll = useCallback(() => {
    setPeople([])
    setProducts([])
    setPaidBy(null)
    setPayments({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Bill History Operations (Saved Forever)
  const saveBill = useCallback(async () => {
    const bill: SavedBill = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      people: [...people],
      products: [...products],
      paidBy,
      payments: { ...payments },
      grandTotal: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    }

    // 1. Save to Local Storage
    const stored = localStorage.getItem(BILLS_STORAGE_KEY)
    let bills: SavedBill[] = []
    if (stored) {
      try {
        bills = JSON.parse(stored)
      } catch (e) {
        console.error("Failed to parse saved bills:", e)
      }
    }
    bills.unshift(bill)
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills))
    setSavedBills(bills)

    // 2. Cloud Backup to Supabase
    if (userSession) {
      try {
        await supabase.from("bills").upsert({
          id: bill.id,
          user_id: userSession.id,
          created_at: new Date(bill.createdAt).toISOString(),
          people: bill.people,
          products: bill.products,
          paid_by: bill.paidBy,
          payments: bill.payments,
          grand_total: bill.grandTotal,
          group_id: bill.groupId,
          group_name: bill.groupName
        })
      } catch (err) {
        console.warn("Supabase failed to backup bill split:", err)
      }
    }

    return bill.id
  }, [people, products, paidBy, payments])

  const getSavedBills = useCallback((): SavedBill[] => {
    return savedBills
  }, [savedBills])

  const loadBill = useCallback((billId: string) => {
    const bill = savedBills.find((b) => b.id === billId)
    if (bill) {
      setPeople(bill.people)
      setProducts(bill.products)
      setPaidBy(bill.paidBy)
      setPayments(bill.payments || (bill.paidBy ? { [bill.paidBy]: bill.grandTotal } : {}))
    }
  }, [savedBills])

  const deleteSavedBill = useCallback(async (billId: string) => {
    // 1. Delete from Local Storage
    const filtered = savedBills.filter((b) => b.id !== billId)
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(filtered))
    setSavedBills(filtered)

    // 2. Delete from Supabase
    try {
      await supabase.from("bills").delete().eq("id", billId)
    } catch (err) {
      console.warn("Supabase failed to delete bill:", err)
    }
  }, [savedBills])

  // Group Operations
  const addGroup = useCallback((name: string) => {
    const colors = [
      "#0d9488", "#10b981", "#3b82f6", "#8b5cf6", 
      "#ec4899", "#f59e0b", "#ef4444", "#14b8a6"
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    // Generate human-readable short share code: e.g. HP-XF89D
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase()
    const shareCode = `HP-${randomHex}`

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: name.trim(),
      members: [],
      color: randomColor,
      createdAt: Date.now(),
      shareCode: shareCode
    }
    const updated = [newGroup, ...groups]
    saveGroupsToStorage(updated)
    return newGroup.id
  }, [groups, saveGroupsToStorage])

  const updateGroup = useCallback((id: string, updates: Partial<Omit<Group, "id">>) => {
    const updated = groups.map((g) => (g.id === id ? { ...g, ...updates } : g))
    saveGroupsToStorage(updated)
  }, [groups, saveGroupsToStorage])

  const deleteGroup = useCallback(async (id: string) => {
    const updated = groups.filter((g) => g.id !== id)
    saveGroupsToStorage(updated)

    // Delete from Supabase
    try {
      await supabase.from("groups").delete().eq("id", id)
    } catch (err) {
      console.warn("Supabase failed to delete group:", err)
    }
  }, [groups, saveGroupsToStorage])

  const addMemberToGroup = useCallback((groupId: string, name: string) => {
    const newMember: Person = {
      id: crypto.randomUUID(),
      name: name.trim(),
    }
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, members: [...g.members, newMember] }
      }
      return g
    })
    saveGroupsToStorage(updated)
    return newMember.id
  }, [groups, saveGroupsToStorage])

  const removeMemberFromGroup = useCallback((groupId: string, personId: string) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, members: g.members.filter((m) => m.id !== personId) }
      }
      return g
    })
    saveGroupsToStorage(updated)
  }, [groups, saveGroupsToStorage])

  const updateMemberInGroup = useCallback((groupId: string, personId: string, name: string) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.map((m) => (m.id === personId ? { ...m, name: name.trim() } : m)),
        }
      }
      return g
    })
    saveGroupsToStorage(updated)
  }, [groups, saveGroupsToStorage])

  const loadGroupIntoActiveSplit = useCallback((groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      setPeople([...group.members])
      setProducts([])
      setPaidBy(null)
      setPayments({})
    }
  }, [groups])

  const joinGroupByShareCode = useCallback(async (code: string) => {
    try {
      const cleanCode = code.trim().toUpperCase()
      if (!cleanCode) return { success: false, message: "Code cannot be empty." }

      // 1. Fetch group details from Supabase by share code
      const { data: groupData, error: groupErr } = await supabase
        .from("groups")
        .select("*")
        .eq("share_code", cleanCode)
        .single()

      if (groupErr || !groupData) {
        return { success: false, message: "Group not found. Please double check the share code." }
      }

      // Check if we are already a member of this group in our local groups state
      const alreadyMember = groups.some(g => g.id === groupData.id)
      if (alreadyMember) {
        return { success: false, message: "You are already a member of this group!" }
      }

      // 2. Format group
      const formattedGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        members: groupData.members,
        color: groupData.color,
        createdAt: new Date(groupData.created_at).getTime(),
        shareCode: groupData.share_code
      }

      // 3. Save to local storage for joined groups tracking
      const storedJoinedKey = `homiepay-joined-group-ids-${userId}`
      const storedJoined = localStorage.getItem(storedJoinedKey)
      const joinedIds: string[] = storedJoined ? JSON.parse(storedJoined) : []
      if (!joinedIds.includes(formattedGroup.id)) {
        joinedIds.push(formattedGroup.id)
        localStorage.setItem(storedJoinedKey, JSON.stringify(joinedIds))
      }

      // 4. Add to active groups list
      const updated = [formattedGroup, ...groups]
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated))
      setGroups(updated)

      return { success: true, message: "Joined group successfully!", groupName: formattedGroup.name }
    } catch (err: any) {
      console.error("Failed to join group:", err)
      return { success: false, message: err.message || "An error occurred while joining the group." }
    }
  }, [groups, userId, GROUPS_STORAGE_KEY])

  return {
    people,
    products,
    paidBy,
    groups,
    savedBills,
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
    payments,
    setPayments,
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
    joinGroupByShareCode,
    grandTotal,
  }
}

import { create } from 'zustand'
import { createActiveBillSlice, ActiveBillSlice } from './createActiveBillSlice'
import { createGroupsSlice, GroupsSlice } from './createGroupsSlice'
import { createSavedBillsSlice, SavedBillsSlice } from './createSavedBillsSlice'
import { supabase } from '../lib/supabase'

export type StoreState = ActiveBillSlice & GroupsSlice & SavedBillsSlice & {
  userSession: { id: string; username: string; full_name: string } | null
  setUserSession: (session: { id: string; username: string; full_name: string } | null) => void
  syncPendingData: () => Promise<void>
}

export const useStore = create<StoreState>()((set, get, api) => ({
  userSession: null,

  setUserSession: (session) => {
    set({ userSession: session })
    if (!session) {
      get().setIsLoaded(false)
      return
    }

    const userId = session.id
    const STORAGE_KEY = `homiepay-expense-data-${userId}`
    const BILLS_STORAGE_KEY = `homiepay-saved-bills-${userId}`
    const GROUPS_STORAGE_KEY = `homiepay-saved-groups-${userId}`

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        get().setPeople(data.people || [])
        get().setProducts(data.products || [])
        get().setPaidBy(data.paidBy || null)
        get().setPayments(data.payments || {})
      } else {
        get().setPeople([{ id: "user-self", name: session.full_name || session.username }])
        get().setProducts([])
        get().setPaidBy(null)
        get().setPayments({})
      }
    } catch (e) {
      console.error("Failed to load active bill:", e)
    }

    try {
      const storedBills = localStorage.getItem(BILLS_STORAGE_KEY)
      if (storedBills) {
        get().setSavedBills(JSON.parse(storedBills))
      } else {
        get().setSavedBills([])
      }
    } catch (e) {
      console.error("Failed to load saved bills:", e)
    }

    try {
      const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY)
      if (storedGroups) {
        get().setGroups(JSON.parse(storedGroups))
      } else {
        get().setGroups([])
      }
    } catch (e) {
      console.error("Failed to load groups:", e)
    }

    get().setIsLoaded(true)
  },

  syncPendingData: async () => {
    const { userSession } = get()
    if (!userSession || !navigator.onLine) return

    const currentUserId = userSession.id
    const pendingDeleteBillsKey = `homiepay-pending-delete-bills-${currentUserId}`
    const pendingDeleteGroupsKey = `homiepay-pending-delete-groups-${currentUserId}`

    // 1. Process Pending Deletes (Bills)
    try {
      const storedDeleteBills = localStorage.getItem(pendingDeleteBillsKey)
      const deleteBillIds: string[] = storedDeleteBills ? JSON.parse(storedDeleteBills) : []
      if (deleteBillIds.length > 0) {
        const { error } = await supabase.from("bills").delete().in("id", deleteBillIds)
        if (!error) localStorage.removeItem(pendingDeleteBillsKey)
      }
    } catch (e) {
      console.error("Failed to sync pending bill deletions:", e)
    }

    // 2. Process Pending Deletes (Groups)
    try {
      const storedDeleteGroups = localStorage.getItem(pendingDeleteGroupsKey)
      const deleteGroupIds: string[] = storedDeleteGroups ? JSON.parse(storedDeleteGroups) : []
      if (deleteGroupIds.length > 0) {
        const { error } = await supabase.from("groups").delete().in("id", deleteGroupIds).eq("user_id", currentUserId)
        if (!error) localStorage.removeItem(pendingDeleteGroupsKey)
      }
    } catch (e) {
      console.error("Failed to sync pending group deletions:", e)
    }

    // 3. Process Pending Groups (Create/Update)
    try {
      const localGroups = get().groups
      const unsyncedGroups = localGroups.filter(g => g.synced === false)

      if (unsyncedGroups.length > 0) {
        let succeededAny = false
        for (const group of unsyncedGroups) {
          const { error } = await supabase.from("groups").upsert({
            id: group.id,
            name: group.name,
            members: group.members,
            color: group.color,
            created_at: new Date(group.createdAt).toISOString(),
            share_code: group.shareCode,
            user_id: group.ownerId || currentUserId,
            settlements: group.settlements || []
          })

          if (!error) {
            group.synced = true
            succeededAny = true
          }
        }

        if (succeededAny) {
          const GROUPS_STORAGE_KEY = `homiepay-saved-groups-${currentUserId}`
          localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(localGroups))
          get().setGroups([...localGroups])
        }
      }
    } catch (e) {
      console.error("Failed to sync pending groups:", e)
    }

    // 4. Process Pending Bills (Create/Update)
    try {
      const localBills = get().savedBills
      const unsyncedBills = localBills.filter(b => b.synced === false)

      if (unsyncedBills.length > 0) {
        let succeededAny = false
        for (const bill of unsyncedBills) {
          const { error } = await supabase.from("bills").upsert({
            id: bill.id,
            user_id: currentUserId,
            created_at: new Date(bill.createdAt).toISOString(),
            people: bill.people,
            products: bill.products,
            paid_by: bill.paidBy,
            payments: bill.payments,
            grand_total: bill.grandTotal,
            group_id: bill.groupId,
            group_name: bill.groupName,
            is_settled: bill.isSettled || false
          })

          if (!error) {
            bill.synced = true
            succeededAny = true
          }
        }

        if (succeededAny) {
          const BILLS_STORAGE_KEY = `homiepay-saved-bills-${currentUserId}`
          localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(localBills))
          get().setSavedBills([...localBills])
        }
      }
    } catch (e) {
      console.error("Failed to sync pending bills:", e)
    }
  },

  ...createActiveBillSlice(set, get, api),
  ...createGroupsSlice(set, get, api),
  ...createSavedBillsSlice(set, get, api),
}))

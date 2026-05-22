import { StateCreator } from 'zustand'
import { SavedBill } from '../lib/types'
import { supabase } from '../lib/supabase'
import { StoreState } from './useStore'

export interface SavedBillsSlice {
  savedBills: SavedBill[]
  setSavedBills: (savedBills: SavedBill[]) => void

  saveBill: (groupId?: string, groupName?: string, billId?: string) => string
  getSavedBills: () => SavedBill[]
  loadBill: (billId: string) => void
  deleteSavedBill: (billId: string) => void
  markBillAsSettled: (billId: string) => void
}

export const createSavedBillsSlice: StateCreator<
  StoreState,
  [],
  [],
  SavedBillsSlice
> = (set, get) => ({
  savedBills: [],

  setSavedBills: (savedBills) => set({ savedBills }),

  saveBill: (groupId, groupName, billId) => {
    const userSession = get().userSession
    const { people, products, paidBy, payments, grandTotal } = get()
    
    const isEditing = !!billId
    const finalId = billId || crypto.randomUUID()
    
    let originalCreatedAt = Date.now()
    if (isEditing) {
      const existingBill = get().savedBills.find((b) => b.id === billId)
      if (existingBill) {
        originalCreatedAt = existingBill.createdAt
      }
    }

    const bill: SavedBill = {
      id: finalId,
      createdAt: originalCreatedAt,
      people: [...people],
      products: [...products],
      paidBy,
      payments: { ...payments },
      grandTotal,
      groupId: groupId || undefined,
      groupName: groupName || undefined,
      synced: false
    }

    // Optimistic Update
    const BILLS_STORAGE_KEY = `homiepay-saved-bills-${userSession?.id || "anonymous"}`
    let bills = [...get().savedBills]

    if (isEditing) {
      bills = bills.map((b) => (b.id === billId ? bill : b))
    } else {
      bills.unshift(bill)
    }

    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills))
    set({ savedBills: bills })

    // Supabase background sync
    if (userSession && navigator.onLine) {
      ;(async () => {
        try {
          const { error } = await supabase.from("bills").upsert({
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
          
          if (!error) {
            set((state) => {
              const updated = state.savedBills.map((b) => (b.id === bill.id ? { ...b, synced: true } : b))
              localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updated))
              return { savedBills: updated }
            })
          }
        } catch (err) {
          console.warn("Supabase background backup failed for bill:", err)
        }
      })()
    }

    return bill.id
  },

  getSavedBills: () => {
    return get().savedBills
  },

  loadBill: (billId) => {
    const bill = get().savedBills.find((b) => b.id === billId)
    if (bill) {
      get().setPeople(bill.people)
      get().setProducts(bill.products)
      get().setPaidBy(bill.paidBy)
      get().setPayments(bill.payments || (bill.paidBy ? { [bill.paidBy]: bill.grandTotal } : {}))
    }
  },

  deleteSavedBill: (billId) => {
    const userSession = get().userSession
    const BILLS_STORAGE_KEY = `homiepay-saved-bills-${userSession?.id || "anonymous"}`

    // Optimistic Update
    const filtered = get().savedBills.filter((b) => b.id !== billId)
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(filtered))
    set({ savedBills: filtered })

    // Supabase background deletion
    if (userSession) {
      const pendingDeleteBillsKey = `homiepay-pending-delete-bills-${userSession.id}`
      
      const addPendingDelete = () => {
        const stored = localStorage.getItem(pendingDeleteBillsKey)
        const list: string[] = stored ? JSON.parse(stored) : []
        if (!list.includes(billId)) {
          list.push(billId)
          localStorage.setItem(pendingDeleteBillsKey, JSON.stringify(list))
        }
      }

      ;(async () => {
        if (navigator.onLine) {
          try {
            const { error } = await supabase.from("bills").delete().eq("id", billId)
            if (!error) return
          } catch (err) {
            console.warn("Supabase failed to delete bill in background:", err)
          }
        }
        addPendingDelete()
      })()
    }
  },

  markBillAsSettled: (billId) => {
    const userSession = get().userSession
    const BILLS_STORAGE_KEY = `homiepay-saved-bills-${userSession?.id || "anonymous"}`

    // Optimistic Update
    const updated = get().savedBills.map((b) => (b.id === billId ? { ...b, isSettled: true, synced: false } : b))
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updated))
    set({ savedBills: updated })

    // Supabase background sync (same as saveBill)
    if (userSession && navigator.onLine) {
      const bill = updated.find((b) => b.id === billId)
      if (bill) {
        ;(async () => {
          try {
            const { error } = await supabase.from("bills").upsert({
              id: bill.id,
              user_id: userSession.id,
              created_at: new Date(bill.createdAt).toISOString(),
              people: bill.people,
              products: bill.products,
              paid_by: bill.paidBy,
              payments: bill.payments,
              grand_total: bill.grandTotal,
              group_id: bill.groupId,
              group_name: bill.groupName,
              is_settled: true
            })
            if (!error) {
              set((state) => {
                const next = state.savedBills.map((b) => (b.id === bill.id ? { ...b, synced: true } : b))
                localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(next))
                return { savedBills: next }
              })
            }
          } catch (err) {
            console.warn("Supabase background backup failed for settled bill:", err)
          }
        })()
      }
    }
  }
})

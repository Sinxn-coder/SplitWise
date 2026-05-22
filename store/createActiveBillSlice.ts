import { StateCreator } from 'zustand'
import { Person, Product, ProductAssignment } from '../lib/types'
import { calculateSplits as calculateSplitsEngine, calculateOwes as calculateOwesEngine, SplitResult, Transaction } from '../lib/finance-engine'
import Decimal from 'decimal.js'
import { StoreState } from './useStore'

export interface ActiveBillSlice {
  people: Person[]
  products: Product[]
  paidBy: string | null
  payments: Record<string, number>
  isLoaded: boolean
  
  // Computed values that we will generate on the fly or keep in sync
  grandTotal: number

  setPeople: (people: Person[]) => void
  setProducts: (products: Product[]) => void
  setPaidBy: (paidBy: string | null) => void
  setPayments: (payments: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void
  setIsLoaded: (isLoaded: boolean) => void

  addPerson: (name: string) => void
  updatePerson: (id: string, name: string) => void
  removePerson: (id: string) => void

  addProduct: (name: string, price: number, quantity?: number) => void
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void
  removeProduct: (id: string) => void
  togglePersonForProduct: (productId: string, personId: string) => void
  assignAllPeopleToProduct: (productId: string) => void
  toggleSplitByPercentage: (productId: string) => void
  updateProductPercentage: (productId: string, personId: string, percentage: number) => void

  calculateSplits: () => Record<string, SplitResult>
  calculateOwes: () => Transaction[]
  resetAll: () => void

  // Internal helper to update grandTotal when products change
  _updateGrandTotal: () => void
}

export const createActiveBillSlice: StateCreator<
  StoreState,
  [],
  [],
  ActiveBillSlice
> = (set, get) => ({
  people: [],
  products: [],
  paidBy: null,
  payments: {},
  isLoaded: false,
  grandTotal: 0,

  setPeople: (people) => set({ people }),
  setProducts: (products) => {
    set({ products })
    get()._updateGrandTotal()
  },
  setPaidBy: (paidBy) => set({ paidBy }),
  setPayments: (paymentsAction) => {
    if (typeof paymentsAction === 'function') {
      set((state) => ({ payments: paymentsAction(state.payments) }))
    } else {
      set({ payments: paymentsAction })
    }
  },
  setIsLoaded: (isLoaded) => set({ isLoaded }),

  _updateGrandTotal: () => {
    const products = get().products
    const total = products.reduce((sum, product) => {
      return new Decimal(sum).plus(new Decimal(product.price).times(product.quantity)).toNumber()
    }, 0)
    set({ grandTotal: total })
  },

  addPerson: (name) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: name.trim(),
    }
    set((state) => ({ people: [...state.people, newPerson] }))
  },

  updatePerson: (id, name) => {
    set((state) => ({
      people: state.people.map((p) => (p.id === id && !p.userId ? { ...p, name: name.trim() } : p))
    }))
  },

  removePerson: (id) => {
    set((state) => {
      const nextPayments = { ...state.payments }
      delete nextPayments[id]

      const nextProducts = state.products.map((product) => ({
        ...product,
        assignedTo: product.assignedTo.filter((personId) => personId !== id),
        percentages: product.percentages.filter((p) => p.personId !== id),
      }))

      return {
        people: state.people.filter((p) => p.id !== id),
        products: nextProducts,
        paidBy: state.paidBy === id ? null : state.paidBy,
        payments: nextPayments
      }
    })
    get()._updateGrandTotal()
  },

  addProduct: (name, price, quantity = 1) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      price,
      quantity,
      assignedTo: [],
      splitByPercentage: false,
      percentages: [],
    }
    set((state) => ({ products: [...state.products, newProduct] }))
    get()._updateGrandTotal()
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }))
    get()._updateGrandTotal()
  },

  removeProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)
    }))
    get()._updateGrandTotal()
  },

  togglePersonForProduct: (productId, personId) => {
    set((state) => ({
      products: state.products.map((product) => {
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
    }))
  },

  assignAllPeopleToProduct: (productId) => {
    set((state) => ({
      products: state.products.map((product) => {
        if (product.id !== productId) return product

        const allAssigned = state.people.every((p) => product.assignedTo.includes(p.id))
        if (allAssigned) {
          return { ...product, assignedTo: [], percentages: [] }
        } else {
          return {
            ...product,
            assignedTo: state.people.map((p) => p.id),
            percentages: state.people.map((p) => ({ personId: p.id, percentage: 1 })),
          }
        }
      })
    }))
  },

  toggleSplitByPercentage: (productId) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === productId ? { ...p, splitByPercentage: !p.splitByPercentage } : p))
    }))
  },

  updateProductPercentage: (productId, personId, percentage) => {
    set((state) => ({
      products: state.products.map((product) => {
        if (product.id !== productId) return product
        const percentages = product.percentages.map((p) =>
          p.personId === personId ? { ...p, percentage } : p
        )
        return { ...product, percentages }
      })
    }))
  },

  calculateSplits: () => {
    const { people, products } = get()
    return calculateSplitsEngine(people, products)
  },

  calculateOwes: () => {
    const { people, payments } = get()
    const splits = get().calculateSplits()
    return calculateOwesEngine(people, splits, payments)
  },

  resetAll: () => {
    set({ people: [], products: [], paidBy: null, payments: {} })
    get()._updateGrandTotal()
    
    // Clear from local storage based on active user session
    const session = get().userSession
    if (session) {
      localStorage.removeItem(`homiepay-expense-data-${session.id}`)
    }
  }
})

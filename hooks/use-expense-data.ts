"use client"

import { useState, useEffect, useCallback } from "react"

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
}

export interface SavedBill {
  id: string
  createdAt: number
  expiresAt?: number
  people: Person[]
  products: Product[]
  paidBy: string | null
  grandTotal: number
  groupId?: string
  groupName?: string
}

export interface ExpenseData {
  people: Person[]
  products: Product[]
  paidBy: string | null
}

const STORAGE_KEY = "splitwise-expense-data"
const BILLS_STORAGE_KEY = "splitwise-saved-bills"
const GROUPS_STORAGE_KEY = "splitwise-saved-groups"

export function useExpenseData() {
  const [people, setPeople] = useState<Person[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: ExpenseData = JSON.parse(stored)
          return data.people || []
        }
      } catch (e) {
        console.error("Failed to parse stored people:", e)
      }
    }
    return []
  })

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: ExpenseData = JSON.parse(stored)
          return data.products || []
        }
      } catch (e) {
        console.error("Failed to parse stored products:", e)
      }
    }
    return []
  })

  const [paidBy, setPaidBy] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: ExpenseData = JSON.parse(stored)
          return data.paidBy || null
        }
      } catch (e) {
        console.error("Failed to parse stored paidBy:", e)
      }
    }
    return null
  })

  const [groups, setGroups] = useState<Group[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY)
        if (storedGroups) {
          return JSON.parse(storedGroups)
        }
      } catch (e) {
        console.error("Failed to parse stored groups:", e)
      }
    }
    return []
  })

  const [isLoaded, setIsLoaded] = useState(true)

  // Empty mount effect as states are synchronized immediately
  useEffect(() => {}, [])

  // Save to localStorage when active bill data changes
  useEffect(() => {
    if (isLoaded) {
      const data: ExpenseData = { people, products, paidBy }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [people, products, paidBy, isLoaded])

  // Save groups helper
  const saveGroupsToStorage = useCallback((newGroups: Group[]) => {
    setGroups(newGroups)
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(newGroups))
  }, [])

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

  const updateProduct = useCallback(
    (id: string, updates: Partial<Omit<Product, "id">>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      )
    },
    []
  )

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const togglePersonForProduct = useCallback(
    (productId: string, personId: string) => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product
          const isAssigned = product.assignedTo.includes(personId)
          const newAssignedTo = isAssigned
            ? product.assignedTo.filter((id) => id !== personId)
            : [...product.assignedTo, personId]
          
          let newPercentages = product.percentages
          if (isAssigned) {
            newPercentages = product.percentages.filter((p) => p.personId !== personId)
          } else {
            // Initialize count/shares to 1 when a person is assigned
            newPercentages = [
              ...product.percentages.filter((p) => p.personId !== personId),
              { personId, percentage: 1 }
            ]
          }

          return {
            ...product,
            assignedTo: newAssignedTo,
            percentages: newPercentages,
          }
        })
      )
    },
    []
  )

  const assignAllPeopleToProduct = useCallback(
    (productId: string) => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product
          return {
            ...product,
            assignedTo: people.map((p) => p.id),
            percentages: people.map((p) => ({
              personId: p.id,
              percentage: 1, // initialize count to 1 for everyone
            })),
          }
        })
      )
    },
    [people]
  )

  const toggleSplitByPercentage = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product
        // When toggling to custom split, initialize all assigned people with count 1
        const initializedPercentages = product.percentages.length > 0 
          ? product.percentages 
          : product.assignedTo.map((pid) => ({ personId: pid, percentage: 1 }))
        return {
          ...product,
          splitByPercentage: !product.splitByPercentage,
          percentages: initializedPercentages
        }
      })
    )
  }, [])

  const updateProductPercentage = useCallback(
    (productId: string, personId: string, count: number) => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product
          const exists = product.percentages.some((p) => p.personId === personId)
          let newPercentages
          if (exists) {
            newPercentages = product.percentages.map((p) =>
              p.personId === personId ? { ...p, percentage: count } : p
            )
          } else {
            newPercentages = [...product.percentages, { personId, percentage: count }]
          }
          return {
            ...product,
            percentages: newPercentages,
          }
        })
      )
    },
    []
  )

  // Math Calculations (Proportional Split by Count)
  const calculateSplits = useCallback(() => {
    const splits: Record<
      string,
      { items: { name: string; amount: number; quantity: number }[]; total: number }
    > = {}

    // Initialize splits for all people
    people.forEach((person) => {
      splits[person.id] = { items: [], total: 0 }
    })

    // Calculate splits for each product
    products.forEach((product) => {
      if (product.assignedTo.length > 0) {
        const totalProductCost = product.price * product.quantity

        if (product.splitByPercentage && product.percentages.length > 0) {
          // Split by custom count (shares)
          const totalShares = product.percentages
            .filter((p) => product.assignedTo.includes(p.personId))
            .reduce((sum, p) => sum + p.percentage, 0)
          
          if (totalShares > 0) {
            product.percentages.forEach((assignment) => {
              if (product.assignedTo.includes(assignment.personId) && splits[assignment.personId]) {
                const amount = (totalProductCost * assignment.percentage) / totalShares
                splits[assignment.personId].items.push({
                  name: product.name,
                  amount,
                  quantity: product.quantity,
                })
                splits[assignment.personId].total += amount
              }
            })
          } else {
            // Fallback to equal split if all counts are 0
            const splitAmount = totalProductCost / product.assignedTo.length
            product.assignedTo.forEach((personId) => {
              if (splits[personId]) {
                splits[personId].items.push({
                  name: product.name,
                  amount: splitAmount,
                  quantity: product.quantity,
                })
                splits[personId].total += splitAmount
              }
            })
          }
        } else {
          // Equal split
          const splitAmount = totalProductCost / product.assignedTo.length
          product.assignedTo.forEach((personId) => {
            if (splits[personId]) {
              splits[personId].items.push({
                name: product.name,
                amount: splitAmount,
                quantity: product.quantity,
              })
              splits[personId].total += splitAmount
            }
          })
        }
      }
    })

    return splits
  }, [people, products])

  const calculateOwes = useCallback(() => {
    if (!paidBy) return {}
    
    const splits = calculateSplits()
    const owes: Record<string, number> = {}
    
    people.forEach((person) => {
      if (person.id !== paidBy && splits[person.id]) {
        owes[person.id] = splits[person.id].total
      }
    })
    
    return owes
  }, [paidBy, people, calculateSplits])

  const resetAll = useCallback(() => {
    setPeople([])
    setProducts([])
    setPaidBy(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Bill History Operations (Saved Forever)
  const saveBill = useCallback(() => {
    const bill: SavedBill = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      people: [...people],
      products: [...products],
      paidBy,
      grandTotal: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    }

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
    return bill.id
  }, [people, products, paidBy])

  const getSavedBills = useCallback((): SavedBill[] => {
    const stored = localStorage.getItem(BILLS_STORAGE_KEY)
    if (!stored) return []
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("Failed to parse saved bills:", e)
      return []
    }
  }, [])

  const loadBill = useCallback((billId: string) => {
    const bills = getSavedBills()
    const bill = bills.find((b) => b.id === billId)
    if (bill) {
      setPeople(bill.people)
      setProducts(bill.products)
      setPaidBy(bill.paidBy)
    }
  }, [getSavedBills])

  const deleteSavedBill = useCallback((billId: string) => {
    const bills = getSavedBills()
    const filtered = bills.filter((b) => b.id !== billId)
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(filtered))
  }, [getSavedBills])

  // Group Operations
  const addGroup = useCallback((name: string) => {
    const colors = [
      "#0d9488", "#10b981", "#3b82f6", "#8b5cf6", 
      "#ec4899", "#f59e0b", "#ef4444", "#14b8a6"
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: name.trim(),
      members: [],
      color: randomColor,
      createdAt: Date.now(),
    }
    const updated = [newGroup, ...groups]
    saveGroupsToStorage(updated)
    return newGroup.id
  }, [groups, saveGroupsToStorage])

  const updateGroup = useCallback((id: string, updates: Partial<Omit<Group, "id">>) => {
    const updated = groups.map((g) => (g.id === id ? { ...g, ...updates } : g))
    saveGroupsToStorage(updated)
  }, [groups, saveGroupsToStorage])

  const deleteGroup = useCallback((id: string) => {
    const updated = groups.filter((g) => g.id !== id)
    saveGroupsToStorage(updated)
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
    }
  }, [groups])

  const grandTotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  return {
    people,
    products,
    paidBy,
    groups,
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
    grandTotal,
  }
}

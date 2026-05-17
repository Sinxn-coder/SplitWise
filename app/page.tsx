"use client"

import dynamic from "next/dynamic"

// Import the main container dynamically with SSR disabled to make loading instantaneous
const ExpenseSplitter = dynamic(
  () => import("@/components/expense-splitter").then((mod) => mod.ExpenseSplitter),
  { ssr: false }
)

export default function Home() {
  return <ExpenseSplitter />
}

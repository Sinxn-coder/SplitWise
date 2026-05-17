"use client"

import { useCallback } from "react"
import {
  Calculator,
  IndianRupee,
  RotateCcw,
  Receipt,
  Share2,
  Download,
  ArrowRight,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Person } from "@/hooks/use-expense-data"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface FinalCalculationStepProps {
  people: Person[]
  paidBy: string | null
  calculateSplits: () => Record<
    string,
    { items: { name: string; amount: number; quantity: number }[]; total: number }
  >
  calculateOwes: () => Record<string, number>
  grandTotal: number
  onBack: () => void
  onReset: () => void
  onSaveBill: () => void
}

export function FinalCalculationStep({
  people,
  paidBy,
  calculateSplits,
  calculateOwes,
  grandTotal,
  onBack,
  onReset,
  onSaveBill,
}: FinalCalculationStepProps) {
  const splits = calculateSplits()
  const owes = calculateOwes()

  const payer = people.find((p) => p.id === paidBy)

  const generateShareText = useCallback(() => {
    let text = `*Bill Split Summary*\n`
    text += `━━━━━━━━━━━━━━━━━\n`
    text += `*Grand Total:* Rs.${grandTotal.toFixed(2)}\n`
    if (payer) {
      text += `*Paid by:* ${payer.name}\n`
    }
    text += `\n`

    people.forEach((person) => {
      const personSplit = splits[person.id]
      if (personSplit && personSplit.items.length > 0) {
        text += `*${person.name}:*\n`
        personSplit.items.forEach((item) => {
          const qtyText = item.quantity > 1 ? ` (x${item.quantity})` : ""
          text += `  • ${item.name}${qtyText}: Rs.${item.amount.toFixed(2)}\n`
        })
        text += `  *Total: Rs.${personSplit.total.toFixed(2)}*\n`
        if (payer && person.id !== paidBy && owes[person.id]) {
          text += `  ➜ Owes ${payer.name}: Rs.${owes[person.id].toFixed(2)}\n`
        }
        text += `\n`
      }
    })

    if (payer && Object.keys(owes).length > 0) {
      text += `*Settlement:*\n`
      Object.entries(owes).forEach(([personId, amount]) => {
        const person = people.find((p) => p.id === personId)
        if (person && amount > 0) {
          text += `${person.name} ➜ ${payer.name}: Rs.${amount.toFixed(2)}\n`
        }
      })
    }

    return text
  }, [grandTotal, owes, payer, paidBy, people, splits])

  const generatePDF = useCallback(() => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Colors
    const primaryColor: [number, number, number] = [20, 184, 166] // Teal
    const darkBg: [number, number, number] = [15, 23, 42]
    const lightText: [number, number, number] = [248, 250, 252]
    const mutedText: [number, number, number] = [148, 163, 184]
    
    // Header background
    doc.setFillColor(...darkBg)
    doc.rect(0, 0, pageWidth, 45, "F")
    
    // Title
    doc.setTextColor(...lightText)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("Bill Split Summary", pageWidth / 2, 20, { align: "center" })
    
    // Date
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...mutedText)
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}`, pageWidth / 2, 30, { align: "center" })
    
    // Grand Total Box
    doc.setFillColor(...primaryColor)
    doc.roundedRect(14, 50, pageWidth - 28, 25, 3, 3, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Grand Total", 20, 60)
    if (payer) {
      doc.setFontSize(9)
      doc.text(`Paid by: ${payer.name}`, 20, 68)
    }
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, pageWidth - 20, 65, { align: "right" })
    
    let yPos = 85
    
    // Settlement Summary
    if (payer && Object.keys(owes).length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...darkBg)
      doc.text("Settlement Summary", 14, yPos)
      yPos += 5
      
      const settlementData = Object.entries(owes)
        .filter(([, amount]) => amount > 0)
        .map(([personId, amount]) => {
          const person = people.find((p) => p.id === personId)
          return [person?.name || "", "→", payer.name, `Rs. ${amount.toFixed(2)}`]
        })
      
      if (settlementData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["From", "", "To", "Amount"]],
          body: settlementData,
          theme: "grid",
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
          },
          bodyStyles: {
            textColor: darkBg,
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 20 },
            2: { cellWidth: 50 },
            3: { cellWidth: 40, fontStyle: "bold" },
          },
          margin: { left: 14, right: 14 },
        })
        
        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
      }
    }
    
    // Individual Breakdowns
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...darkBg)
    doc.text("Individual Breakdown", 14, yPos)
    yPos += 5
    
    const breakdownData: (string | number)[][] = []
    
    people.forEach((person) => {
      const personSplit = splits[person.id]
      if (personSplit && personSplit.items.length > 0) {
        const isPayer = person.id === paidBy
        const personName = isPayer ? `${person.name} (Paid)` : person.name
        
        personSplit.items.forEach((item, idx) => {
          const qtyText = item.quantity > 1 ? ` (x${item.quantity})` : ""
          breakdownData.push([
            idx === 0 ? personName : "",
            `${item.name}${qtyText}`,
            `Rs. ${item.amount.toFixed(2)}`,
            idx === 0 ? `Rs. ${personSplit.total.toFixed(2)}` : "",
          ])
        })
        
        // Add separator row if not last person
        if (people.indexOf(person) < people.length - 1) {
          breakdownData.push(["", "", "", ""])
        }
      }
    })
    
    autoTable(doc, {
      startY: yPos,
      head: [["Person", "Item", "Amount", "Total"]],
      body: breakdownData,
      theme: "striped",
      headStyles: {
        fillColor: darkBg,
        textColor: lightText,
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: darkBg,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: "bold" },
        1: { cellWidth: 60 },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 40, halign: "right", fontStyle: "bold", textColor: primaryColor },
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        // Highlight payer rows
        if (data.section === "body" && data.row.raw && String(data.row.raw[0]).includes("(Paid)")) {
          data.cell.styles.fillColor = [204, 251, 241]
        }
      },
    })
    
    // Footer
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
    doc.setFontSize(9)
    doc.setTextColor(...mutedText)
    doc.text("Generated by SplitWise App", pageWidth / 2, finalY, { align: "center" })
    
    return doc
  }, [grandTotal, owes, payer, paidBy, people, splits])

  const handleDownloadPDF = useCallback(() => {
    const doc = generatePDF()
    const pdfBlob = doc.output("blob")
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    if (isIOS || isSafari) {
      // For iOS Safari, open in new tab - user can then share/save from there
      const newWindow = window.open(pdfUrl, "_blank")
      if (!newWindow) {
        // If popup blocked, create a temporary link and trigger click
        const link = document.createElement("a")
        link.href = pdfUrl
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      // Clean up URL after a delay to allow the new tab to load
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000)
    } else {
      // For other browsers, use download attribute
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `bill-split-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(pdfUrl)
    }
  }, [generatePDF])

  const handleShareWhatsApp = useCallback(() => {
    const text = generateShareText()
    const encoded = encodeURIComponent(text)
    // Use api.whatsapp.com for better mobile compatibility
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // On mobile, use the native WhatsApp URL scheme
      window.location.href = `whatsapp://send?text=${encoded}`
    } else {
      // On desktop, use web.whatsapp.com
      window.open(`https://web.whatsapp.com/send?text=${encoded}`, "_blank")
    }
  }, [generateShareText])

  const handleSaveAndReset = () => {
    onSaveBill()
    onReset()
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="h-5 w-5 text-primary" />
          Final Calculation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Here&apos;s how much each person owes
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grand Total Card */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
              {payer && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paid by <span className="font-medium text-foreground">{payer.name}</span>
                </p>
              )}
            </div>
            <span className="flex items-center text-2xl font-bold text-primary">
              <IndianRupee className="h-5 w-5" />
              {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Who Owes Who Section */}
        {payer && Object.keys(owes).length > 0 && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Settlement Summary</h4>
            <div className="space-y-2">
              {Object.entries(owes).map(([personId, amount]) => {
                const person = people.find((p) => p.id === personId)
                if (!person || amount === 0) return null
                return (
                  <div
                    key={personId}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{person.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {payer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-primary">{payer.name}</span>
                    </div>
                    <span className="flex items-center font-bold text-primary">
                      <IndianRupee className="h-4 w-4" />
                      {amount.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Individual Breakdowns */}
        <div className="space-y-3">
          {people.map((person, index) => {
            const personSplit = splits[person.id]
            if (!personSplit || personSplit.items.length === 0) return null

            const isPayer = person.id === paidBy

            return (
              <div
                key={person.id}
                className={`p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  isPayer
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/50 border-border/50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isPayer ? "bg-primary text-primary-foreground" : "bg-primary/20"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${isPayer ? "" : "text-primary"}`}>
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{person.name}</h3>
                      {isPayer && (
                        <span className="text-xs text-primary font-medium">Paid the bill</span>
                      )}
                    </div>
                  </div>
                  <span className="flex items-center text-lg font-bold text-primary">
                    <IndianRupee className="h-4 w-4" />
                    {personSplit.total.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 pl-10">
                  {personSplit.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="text-xs opacity-70">(x{item.quantity})</span>
                        )}
                      </span>
                      <span className="flex items-center font-medium">
                        <IndianRupee className="h-3 w-3" />
                        {item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* People with no assignments */}
        {people.some((p) => !splits[p.id] || splits[p.id].items.length === 0) && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">No items assigned: </span>
              {people
                .filter((p) => !splits[p.id] || splits[p.id].items.length === 0)
                .map((p) => p.name)
                .join(", ")}
            </p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSaveAndReset} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save & New Bill
            </Button>
            <Button variant="destructive" onClick={onReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

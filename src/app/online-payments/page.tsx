"use client"

import * as React from "react"
import {
  QrCode, Search, Plus, Trash2, Edit, CheckCircle2, XCircle, Clock,
  Smartphone, Building2, CreditCard, ArrowLeft, ArrowUpRight, DollarSign,
  TrendingUp, RefreshCw, Layers, Check, X, ShieldCheck, Upload, Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getScopedData, setScopedData, mockQrsGenerator, mockOnlineTransactionsGenerator, mockStudentsGenerator, mockFeesLedgerGenerator, getActiveRole } from "@/lib/tenant"

interface QRCodeConfig {
  id: string
  label: string
  upiId: string
  bankName: string
  status: "Active" | "Inactive"
  qrImageUrl?: string
}

interface OnlineTransaction {
  id: string
  studentName: string
  batch: string
  amount: string
  month: string
  upiIdUsed: string
  status: "Success" | "Pending" | "Failed"
  timestamp: string
}

interface Student {
  id: string
  name: string
  batch: string
}

interface FeeTransaction {
  id: string
  studentName: string
  batch: string
  amount: string
  month: string
  status: "Paid" | "Overdue" | "Partial"
  paymentDate: string
}

const initialQRs: QRCodeConfig[] = [
  { id: "QR-001", label: "Primary Admission QR", upiId: "tuitionflow.fees@okaxis", bankName: "Axis Bank", status: "Active" },
  { id: "QR-002", label: "Secondary HDFC QR", upiId: "tuitionflow@okhdfc", bankName: "HDFC Bank", status: "Active" },
]

const initialTransactions: OnlineTransaction[] = [
  { id: "TXN-ON-5001", studentName: "Sarah Smith", batch: "Batch Alpha", amount: "500", month: "June 2026", upiIdUsed: "tuitionflow.fees@okaxis", status: "Success", timestamp: "2026-06-18 10:15" },
  { id: "TXN-ON-5002", studentName: "Alex Brown", batch: "Batch Beta", amount: "500", month: "June 2026", upiIdUsed: "tuitionflow.fees@okaxis", status: "Pending", timestamp: "2026-06-18 11:30" },
  { id: "TXN-ON-5003", studentName: "Emma Watson", batch: "Batch Alpha", amount: "500", month: "June 2026", upiIdUsed: "tuitionflow@okhdfc", status: "Success", timestamp: "2026-06-17 14:02" },
]

const MockQRCodeSVG = ({ upiId }: { upiId: string }) => {
  return (
    <svg className="size-24 bg-white p-2 rounded-lg border shadow-xs text-slate-800" viewBox="0 0 100 100">
      {/* Corner squares (QR positioning indicators) */}
      <rect x="5" y="5" width="25" height="25" fill="currentColor" stroke="white" strokeWidth="2" />
      <rect x="10" y="10" width="15" height="15" fill="white" />
      <rect x="13" y="13" width="9" height="9" fill="currentColor" />

      <rect x="70" y="5" width="25" height="25" fill="currentColor" stroke="white" strokeWidth="2" />
      <rect x="75" y="10" width="15" height="15" fill="white" />
      <rect x="78" y="13" width="9" height="9" fill="currentColor" />

      <rect x="5" y="70" width="25" height="25" fill="currentColor" stroke="white" strokeWidth="2" />
      <rect x="10" y="75" width="15" height="15" fill="white" />
      <rect x="13" y="78" width="9" height="9" fill="currentColor" />

      {/* Scattered mock data squares */}
      <rect x="35" y="5" width="5" height="10" fill="currentColor" />
      <rect x="45" y="5" width="10" height="5" fill="currentColor" />
      <rect x="60" y="10" width="5" height="15" fill="currentColor" />
      <rect x="35" y="20" width="15" height="5" fill="currentColor" />
      <rect x="55" y="20" width="10" height="10" fill="currentColor" />
      
      <rect x="5" y="35" width="10" height="5" fill="currentColor" />
      <rect x="20" y="35" width="5" height="15" fill="currentColor" />
      <rect x="10" y="45" width="5" height="10" fill="currentColor" />
      <rect x="5" y="60" width="10" height="5" fill="currentColor" />
      
      <rect x="35" y="35" width="10" height="10" fill="currentColor" />
      <rect x="50" y="35" width="5" height="15" fill="currentColor" />
      <rect x="60" y="35" width="15" height="5" fill="currentColor" />
      <rect x="80" y="35" width="15" height="15" fill="white" stroke="currentColor" strokeWidth="2" />
      <rect x="85" y="40" width="5" height="5" fill="currentColor" />

      <rect x="35" y="50" width="20" height="5" fill="currentColor" />
      <rect x="60" y="45" width="5" height="20" fill="currentColor" />
      <rect x="70" y="55" width="10" height="5" fill="currentColor" />
      
      <rect x="35" y="60" width="5" height="15" fill="currentColor" />
      <rect x="45" y="65" width="10" height="10" fill="currentColor" />
      <rect x="60" y="70" width="5" height="5" fill="currentColor" />
      <rect x="75" y="70" width="20" height="5" fill="currentColor" />
      
      <rect x="35" y="80" width="15" height="5" fill="currentColor" />
      <rect x="55" y="80" width="5" height="15" fill="currentColor" />
      <rect x="65" y="80" width="15" height="10" fill="currentColor" />
      <rect x="85" y="85" width="10" height="10" fill="currentColor" />
      
      <rect x="35" y="90" width="15" height="5" fill="currentColor" />
      <rect x="70" y="90" width="10" height="5" fill="currentColor" />
    </svg>
  )
}

export default function OnlinePaymentsPage() {
  const { toast } = useToast()
  
  const [qrs, setQrs] = React.useState<QRCodeConfig[]>([])
  const [transactions, setTransactions] = React.useState<OnlineTransaction[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Search & filters
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Modal open states
  const [isQrOpen, setIsQrOpen] = React.useState(false)
  const [isSimulateOpen, setIsSimulateOpen] = React.useState(false)

  // Add/Edit QR form states
  const [qrLabel, setQrLabel] = React.useState("")
  const [qrUpi, setQrUpi] = React.useState("")
  const [qrBank, setQrBank] = React.useState("")
  const [qrStatus, setQrStatus] = React.useState<"Active" | "Inactive">("Active")
  const [qrImageUrl, setQrImageUrl] = React.useState<string>("")
  const [editingQr, setEditingQr] = React.useState<QRCodeConfig | null>(null)

  const handleOpenAddQr = () => {
    setEditingQr(null)
    setQrLabel("")
    setQrUpi("")
    setQrBank("")
    setQrStatus("Active")
    setQrImageUrl("")
    setIsQrOpen(true)
  }

  const handleOpenEditQr = (qr: QRCodeConfig) => {
    setEditingQr(qr)
    setQrLabel(qr.label)
    setQrUpi(qr.upiId)
    setQrBank(qr.bankName)
    setQrStatus(qr.status)
    setQrImageUrl(qr.qrImageUrl || "")
    setIsQrOpen(true)
  }

  const handleCloseQrModal = (open: boolean) => {
    setIsQrOpen(open)
    if (!open) {
      setEditingQr(null)
      setQrLabel("")
      setQrUpi("")
      setQrBank("")
      setQrStatus("Active")
      setQrImageUrl("")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setQrImageUrl(reader.result)
        toast({
          title: "Image Uploaded",
          description: "QR code image uploaded successfully.",
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // Simulate Payment form states
  const [simStudentId, setSimStudentId] = React.useState("")
  const [simAmount, setSimAmount] = React.useState("500")
  const [simMonth, setSimMonth] = React.useState("June 2026")
  const [simUpiId, setSimUpiId] = React.useState("")
  const [simStatus, setSimStatus] = React.useState<"Success" | "Pending">("Success")

  const [activeRole, setActiveRole] = React.useState("owner")

  // Load from local storage
  React.useEffect(() => {
    const loadedQRs = getScopedData<QRCodeConfig[]>("qrs", mockQrsGenerator)
    setQrs(loadedQRs)
    
    const loadedTransactions = getScopedData<OnlineTransaction[]>("online_transactions", mockOnlineTransactionsGenerator)
    setTransactions(loadedTransactions)

    const loadedStudents = getScopedData<any[]>("students", mockStudentsGenerator)
    setStudents(loadedStudents)

    setActiveRole(getActiveRole())
    setIsLoading(false)
  }, [])

  // Save changes helper
  const saveQRs = (updated: QRCodeConfig[]) => {
    setQrs(updated)
    setScopedData<QRCodeConfig[]>("qrs", updated)
  }

  const saveTransactions = (updated: OnlineTransaction[]) => {
    setTransactions(updated)
    setScopedData<OnlineTransaction[]>("online_transactions", updated)
  }

  const handleAddQR = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrLabel || !qrUpi || !qrBank) {
      toast({ variant: "destructive", title: "Required info missing", description: "Please fill in all inputs." })
      return
    }

    if (editingQr) {
      // Edit existing
      const updated = qrs.map(q =>
        q.id === editingQr.id
          ? { ...q, label: qrLabel, upiId: qrUpi, bankName: qrBank, status: qrStatus, qrImageUrl }
          : q
      )
      saveQRs(updated)
      toast({ title: "UPI QR Updated", description: `Updated ${qrLabel} successfully.` })
    } else {
      // Create new
      const newQR: QRCodeConfig = {
        id: `QR-${Math.floor(Math.random() * 9000) + 1000}`,
        label: qrLabel,
        upiId: qrUpi,
        bankName: qrBank,
        status: qrStatus,
        qrImageUrl
      }
      const updated = [newQR, ...qrs]
      saveQRs(updated)
      toast({ title: "UPI QR Created", description: `Added ${qrLabel} successfully.` })
    }

    setIsQrOpen(false)
    setEditingQr(null)
    setQrLabel(""); setQrUpi(""); setQrBank(""); setQrStatus("Active"); setQrImageUrl("")
  }

  const handleDeleteQR = (id: string) => {
    const updated = qrs.filter(q => q.id !== id)
    saveQRs(updated)
    toast({ title: "QR Removed", variant: "destructive" })
  }

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const getMockSvgMarkup = (): string => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100" fill="#1e293b" style="background:#ffffff;padding:20px;">
      <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
      <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
      <rect x="13" y="13" width="9" height="9" fill="#1e293b" />
      <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
      <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
      <rect x="78" y="13" width="9" height="9" fill="#1e293b" />
      <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
      <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
      <rect x="13" y="78" width="9" height="9" fill="#1e293b" />
      <rect x="35" y="5" width="5" height="10" fill="#1e293b" />
      <rect x="45" y="5" width="10" height="5" fill="#1e293b" />
      <rect x="60" y="10" width="5" height="15" fill="#1e293b" />
      <rect x="35" y="20" width="15" height="5" fill="#1e293b" />
      <rect x="55" y="20" width="10" height="10" fill="#1e293b" />
      <rect x="5" y="35" width="10" height="5" fill="#1e293b" />
      <rect x="20" y="35" width="5" height="15" fill="#1e293b" />
      <rect x="10" y="45" width="5" height="10" fill="#1e293b" />
      <rect x="5" y="60" width="10" height="5" fill="#1e293b" />
      <rect x="35" y="35" width="10" height="10" fill="#1e293b" />
      <rect x="50" y="35" width="5" height="15" fill="#1e293b" />
      <rect x="60" y="35" width="15" height="5" fill="#1e293b" />
      <rect x="80" y="35" width="15" height="15" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
      <rect x="85" y="40" width="5" height="5" fill="#1e293b" />
      <rect x="35" y="50" width="20" height="5" fill="#1e293b" />
      <rect x="60" y="45" width="5" height="20" fill="#1e293b" />
      <rect x="70" y="55" width="10" height="5" fill="#1e293b" />
      <rect x="35" y="60" width="5" height="15" fill="#1e293b" />
      <rect x="45" y="65" width="10" height="10" fill="#1e293b" />
      <rect x="60" y="70" width="5" height="5" fill="#1e293b" />
      <rect x="75" y="70" width="20" height="5" fill="#1e293b" />
      <rect x="35" y="80" width="15" height="5" fill="#1e293b" />
      <rect x="55" y="80" width="5" height="15" fill="#1e293b" />
      <rect x="65" y="80" width="15" height="10" fill="#1e293b" />
      <rect x="85" y="85" width="10" height="10" fill="#1e293b" />
      <rect x="35" y="90" width="15" height="5" fill="#1e293b" />
      <rect x="70" y="90" width="10" height="5" fill="#1e293b" />
    </svg>`
  }

  const svgToPngDataUrl = (svgMarkup: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          const pngUrl = canvas.toDataURL('image/png')
          URL.revokeObjectURL(url)
          resolve(pngUrl)
        } else {
          URL.revokeObjectURL(url)
          reject(new Error('Canvas context not available'))
        }
      }
      img.onerror = (e) => {
        URL.revokeObjectURL(url)
        reject(e)
      }
      img.src = url
    })
  }

  const handleShareQR = async (qr: QRCodeConfig) => {
    const text = `TuitionFlow Academy - Scan & Pay\nUPI ID: ${qr.upiId}\nBank: ${qr.bankName} (${qr.label})`
    const url = `upi://pay?pa=${qr.upiId}&pn=TuitionFlow%20Academy`

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(`${text}\nPayment Link: ${url}`)
        toast({
          title: "Payment Info Copied",
          description: "UPI details and deep link copied to clipboard. Paste into your third party app!"
        })
      } catch (clipErr) {
        console.error("Clipboard write failed", clipErr)
        toast({
          variant: "destructive",
          title: "Share Failed",
          description: "Could not share or copy UPI details."
        })
      }
    }

    try {
      // 1. Resolve target data URL (either custom base64 or converted SVG)
      let dataUrl = qr.qrImageUrl
      if (!dataUrl) {
        const svgMarkup = getMockSvgMarkup()
        dataUrl = await svgToPngDataUrl(svgMarkup, 300, 300)
      }

      // 2. Convert data URL to File object
      const qrFile = dataURLtoFile(dataUrl, `qr_code_${qr.id}.png`)
      const filesArray = [qrFile]

      // 3. Prepare share data
      const shareData = {
        title: `TuitionFlow QR - ${qr.label}`,
        text: `${text}\nPayment Link: ${url}`,
        files: filesArray
      }

      // 4. Share using browser Share API if possible
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast({
          title: "Shared Successfully",
          description: "QR code image and payment details shared."
        })
      } else {
        console.warn("Native file sharing not supported, falling back to text share or clipboard")
        // Try text-only sharing if file sharing fails but navigator.share exists
        if (navigator.share) {
          await navigator.share({
            title: `TuitionFlow QR - ${qr.label}`,
            text: `${text}\nPayment Link: ${url}`
          })
          toast({
            title: "Shared Successfully",
            description: "Payment info shared with external application."
          })
        } else {
          await copyToClipboard()
        }
      }
    } catch (err) {
      console.warn("Share attempt failed, falling back to clipboard copy:", err)
      await copyToClipboard()
    }
  }

  // Real-time synchronization logic
  const syncToFeesPage = (studentName: string, batch: string, amount: string, month: string) => {
    const currentLedger = getScopedData<any[]>("fees_ledger", mockFeesLedgerGenerator)

    const newReceipt = {
      id: `TF-${Math.floor(Math.random() * 9000) + 1000}`,
      studentName,
      batch,
      amount: Number(amount),
      month,
      status: "Paid",
      paymentDate: new Date().toISOString().split("T")[0]
    }

    const updatedLedger = [newReceipt, ...currentLedger]
    setScopedData("fees_ledger", updatedLedger)
  }

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!simStudentId || !simUpiId) {
      toast({ variant: "destructive", title: "Details required", description: "Please choose a student and target UPI." })
      return
    }

    const studentSelected = students.find(s => s.id === simStudentId)
    if (!studentSelected) return

    const newTx: OnlineTransaction = {
      id: `TXN-ON-${Math.floor(Math.random() * 9000) + 5000}`,
      studentName: studentSelected.name,
      batch: studentSelected.batch,
      amount: simAmount,
      month: simMonth,
      upiIdUsed: simUpiId,
      status: simStatus,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    }

    const updatedList = [newTx, ...transactions]
    saveTransactions(updatedList)

    // Sync to Fees database if status is SUCCESS
    if (simStatus === "Success") {
      syncToFeesPage(studentSelected.name, studentSelected.batch, simAmount, simMonth)
      toast({
        title: "Digital Payment Settled",
        description: `Successfully credited ₹${simAmount} for ${studentSelected.name} and synced to Fees Ledger.`,
      })
    } else {
      toast({
        title: "Pending Digital Request",
        description: `Transaction logged as pending for ${studentSelected.name}.`,
      })
    }

    setIsSimulateOpen(false)
    setSimStudentId(""); setSimAmount("500"); setSimMonth("June 2026"); setSimStatus("Success")
  }

  const handleMarkSuccess = (tx: OnlineTransaction) => {
    // Change online status
    const updated = transactions.map(t => t.id === tx.id ? { ...t, status: "Success" as const } : t)
    saveTransactions(updated)

    // Sync to Fees page
    syncToFeesPage(tx.studentName, tx.batch, tx.amount, tx.month)

    toast({
      title: "Transaction Succeeded",
      description: `Payment of ₹${tx.amount} by ${tx.studentName} marked successful and synced to Fees page.`,
    })
  }

  const handleDeleteTx = (id: string) => {
    const updated = transactions.filter(t => t.id !== id)
    saveTransactions(updated)
    toast({ title: "Transaction Log Deleted", variant: "destructive" })
  }

  const isStaff = activeRole === "owner" || activeRole === "teacher"
  const isStudentOrParent = activeRole === "student" || activeRole === "parent"

  const roleFilteredTransactions = isStudentOrParent 
    ? transactions.filter(t => t.studentName.toLowerCase().includes("sarah")) 
    : transactions

  // Filtered list
  const filteredTransactions = roleFilteredTransactions.filter(t => {
    const matchSearch = t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || t.status === statusFilter
    return matchSearch && matchStatus
  })

  // Calculations
  const totalSettled = roleFilteredTransactions.filter(t => t.status === "Success").reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalPending = roleFilteredTransactions.filter(t => t.status === "Pending").reduce((acc, curr) => acc + Number(curr.amount), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading Online Payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <QrCode className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Online Payments</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage QR scanners, digital merchant accounts & sync fee records</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {isStaff && (
            <Button size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" onClick={handleOpenAddQr}>
              <Plus className="size-3.5" /> Add QR Code
            </Button>
          )}
          <Dialog open={isSimulateOpen} onOpenChange={setIsSimulateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
                <ArrowUpRight className="size-3.5" /> Simulate Pay
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md h-[80vh] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="font-headline">Simulate UPI Payment</DialogTitle>
                <DialogDescription>Simulate a student digital QR scan transaction.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-full max-h-[calc(80vh-120px)] p-6 pt-0">
                <form onSubmit={handleSimulatePayment} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="sim-student" className="text-xs font-bold">Select Student</Label>
                    <Select value={simStudentId} onValueChange={(val) => {
                      setSimStudentId(val)
                      const st = students.find(s => s.id === val)
                      if (st) {
                        setSimUpiId(qrs.find(q => q.status === "Active")?.upiId || "")
                      }
                    }}>
                      <SelectTrigger id="sim-student" className="rounded-xl"><SelectValue placeholder="Choose student..." /></SelectTrigger>
                      <SelectContent>
                        {students
                          .filter(s => !isStudentOrParent || s.id === "1")
                          .map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name} ({s.batch})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="sim-amount" className="text-xs font-bold">Amount (₹)</Label>
                      <Input id="sim-amount" type="number" placeholder="500" value={simAmount} onChange={e => setSimAmount(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sim-month" className="text-xs font-bold">Cycle Month</Label>
                      <Input id="sim-month" placeholder="June 2026" value={simMonth} onChange={e => setSimMonth(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sim-upi" className="text-xs font-bold">Merchant UPI Target</Label>
                    <Select value={simUpiId} onValueChange={setSimUpiId}>
                      <SelectTrigger id="sim-upi" className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {qrs.filter(q => q.status === "Active").map(q => <SelectItem key={q.id} value={q.upiId} className="text-xs">{q.label} ({q.upiId})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sim-status" className="text-xs font-bold">Mock Gateway Status</Label>
                    <Select value={simStatus} onValueChange={(val: any) => setSimStatus(val)}>
                      <SelectTrigger id="sim-status" className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Success" className="text-xs font-semibold text-green-600">Success (Auto-credit Ledger)</SelectItem>
                        <SelectItem value="Pending" className="text-xs font-semibold text-amber-600">Pending Authorization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsSimulateOpen(false)}>Cancel</Button>
                    <Button type="submit" className="rounded-xl shadow-md">Record Payment</Button>
                  </DialogFooter>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {isStaff && (
            <Dialog open={isQrOpen} onOpenChange={handleCloseQrModal}>
              <DialogContent className="max-w-[95vw] sm:max-w-md h-[80vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                  <DialogTitle className="font-headline">{editingQr ? "Edit QR Code" : "Add UPI QR Code"}</DialogTitle>
                  <DialogDescription>
                    {editingQr ? "Update your merchant UPI QR details." : "Create a new merchant UPI QR scanner."}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full max-h-[calc(80vh-120px)] p-6 pt-0">
                  <form onSubmit={handleAddQR} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="qr-label" className="text-xs font-bold">QR Label Name</Label>
                      <Input 
                        id="qr-label" 
                        placeholder="e.g. Admission Desk QR" 
                        value={qrLabel} 
                        onChange={e => setQrLabel(e.target.value)} 
                        className="rounded-xl" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="qr-upi" className="text-xs font-bold">UPI ID / VPA</Label>
                        <Input 
                          id="qr-upi" 
                          placeholder="merchant@bank" 
                          value={qrUpi} 
                          onChange={e => setQrUpi(e.target.value)} 
                          className="rounded-xl" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qr-bank" className="text-xs font-bold">Settlement Bank</Label>
                        <Input 
                          id="qr-bank" 
                          placeholder="e.g. HDFC Bank" 
                          value={qrBank} 
                          onChange={e => setQrBank(e.target.value)} 
                          className="rounded-xl" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qr-status" className="text-xs font-bold">Status</Label>
                      <Select value={qrStatus} onValueChange={(val: "Active" | "Inactive") => setQrStatus(val)}>
                        <SelectTrigger id="qr-status" className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active" className="text-xs">Active (Show to Students)</SelectItem>
                          <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold">QR Code Image (Optional)</Label>
                      {qrImageUrl ? (
                        <div className="relative border rounded-xl p-2 bg-muted/10 flex items-center justify-between">
                          <img src={qrImageUrl} alt="QR Preview" className="size-16 object-contain rounded bg-white border" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive rounded-lg hover:bg-destructive/10"
                          onClick={() => setQrImageUrl("")}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/50 transition-colors bg-muted/5 relative group"
                        onClick={() => document.getElementById("qr-image-file")?.click()}
                      >
                        <input 
                          id="qr-image-file" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload} 
                        />
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Upload className="size-4" />
                        </div>
                        <p className="text-[10px] font-semibold text-muted-foreground">Click to upload QR Image</p>
                        <p className="text-[8px] text-muted-foreground/80">JPG, PNG, GIF up to 2MB</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleCloseQrModal(false)}>Cancel</Button>
                    <Button type="submit" className="rounded-xl shadow-md">{editingQr ? "Save Changes" : "Create QR"}</Button>
                  </DialogFooter>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Digital Collection", value: `₹${totalSettled.toLocaleString()}`, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", sub: "Cleared UPI" },
          { label: "Pending Payouts", value: `₹${totalPending.toLocaleString()}`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", sub: "Waiting gateway" },
          { label: "Active Gateways", value: qrs.filter(q => q.status === "Active").length, icon: Smartphone, color: "text-blue-600", bg: "bg-blue-50", sub: "UPI Handles" },
          { label: "Total Transactions", value: transactions.length, icon: CreditCard, color: "text-primary", bg: "bg-primary/5", sub: "Simulated logs" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("size-10 rounded-xl flex items-center justify-center", s.bg, s.color)}><s.icon className="size-5" /></div>
                <div>
                  <p className="text-lg md:text-xl font-headline font-bold leading-none">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 pl-[52px]">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Codes Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Digital Merchant QR codes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrs.map(qr => (
            <Card key={qr.id} className="border-none shadow-sm overflow-hidden flex flex-col justify-between">
              <CardContent className="p-5 flex items-center gap-4">
                {qr.qrImageUrl ? (
                  <img src={qr.qrImageUrl} alt={qr.label} className="size-24 object-contain rounded-lg border shadow-xs bg-white" />
                ) : (
                  <MockQRCodeSVG upiId={qr.upiId} />
                )}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-sm truncate">{qr.label}</h3>
                    <Badge variant="outline" className={cn(
                      "text-[9px] h-4 font-bold border-none",
                      qr.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                    )}>{qr.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{qr.upiId}</p>
                  <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                    <Building2 className="size-3" /> {qr.bankName}
                  </p>
                </div>
              </CardContent>
              {isStaff && (
                <CardFooter className="bg-muted/10 p-2.5 flex justify-end gap-1.5 border-t border-border/40 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={() => handleShareQR(qr)}>
                    <Share2 className="size-3.5 mr-1" /> Share
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={() => handleOpenEditQr(qr)}>
                    <Edit className="size-3.5 mr-1" /> Edit QR
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-destructive hover:bg-destructive/10" onClick={() => handleDeleteQR(qr.id)}>
                    <Trash2 className="size-3.5 mr-1" /> Delete QR
                  </Button>
                </CardFooter>
              )}
              {!isStaff && (
                <CardFooter className="bg-muted/10 p-2.5 flex justify-end border-t border-border/40 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground w-full" onClick={() => handleShareQR(qr)}>
                    <Share2 className="size-3.5 mr-1" /> Share Payment Details
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Transactions audit Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/40 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input placeholder="Search student or ID..." className="pl-9 bg-background rounded-xl h-9 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="Success" className="text-xs">Success</SelectItem>
                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="Failed" className="text-xs">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6">Transaction ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Student Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Course Batch</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Merchant UPI</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-16 text-muted-foreground text-sm">No transactions found.</TableCell></TableRow>
                ) : filteredTransactions.map(tx => (
                  <TableRow key={tx.id} className="hover:bg-muted/5 group">
                    <TableCell className="pl-6 font-bold text-xs text-primary">{tx.id}</TableCell>
                    <TableCell className="text-xs font-semibold">{tx.studentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold">{tx.batch}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-sm">₹{tx.amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{tx.upiIdUsed}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-[9px] px-2 border-none font-bold",
                        tx.status === "Success" ? "bg-green-100 text-green-700" :
                        tx.status === "Failed" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tx.timestamp}</TableCell>
                    {isStaff && (
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          {tx.status === "Pending" && (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-green-600 hover:bg-green-50 px-2" onClick={() => handleMarkSuccess(tx)}>
                              <Check className="size-3 mr-1" /> Confirm Success
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteTx(tx.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                    {!isStaff && (
                      <TableCell className="text-right pr-6 text-muted-foreground italic text-[11px]">
                        Scanned Via Gateway
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-border/30">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">No transactions found.</div>
            ) : filteredTransactions.map(tx => (
              <div key={tx.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-primary">{tx.id}</p>
                    <p className="text-sm font-bold mt-0.5">{tx.studentName}</p>
                  </div>
                  <Badge className={cn("text-[9px] px-2 border-none font-bold",
                    tx.status === "Success" ? "bg-green-100 text-green-700" :
                    tx.status === "Failed" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  )}>{tx.status}</Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Cycle: {tx.month} · {tx.batch}</span>
                  <span className="font-bold text-foreground">₹{tx.amount}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">{tx.upiIdUsed}</span>
                  <div className="flex gap-1.5">
                    {tx.status === "Pending" && (
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-lg text-green-600 border-green-200" onClick={() => handleMarkSuccess(tx)}>
                        <Check className="size-3 mr-1" /> Confirm
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTx(tx.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile Simulate payment action trigger */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <Button onClick={() => setIsSimulateOpen(true)} className="w-full shadow-lg h-12 text-base font-bold bg-accent text-accent-foreground hover:bg-accent/90">
          <ArrowUpRight className="mr-2 size-5" /> Simulate Payment Scan
        </Button>
      </div>
    </div>
  )
}

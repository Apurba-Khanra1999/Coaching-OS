"use client"

import * as React from "react"
import {
  Briefcase, Search, Plus, Calendar, Clock, CheckCircle2, XCircle,
  DollarSign, TrendingUp, Users, Filter, Download, ChevronRight,
  CreditCard, ArrowUpRight, AlertCircle, FileText, MoreVertical,
  CalendarDays, X, Loader2, Printer, Send, Building2
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getScopedData, setScopedData, getActiveRole, mockPayrollGenerator, mockLeavesGenerator, getTenantDetails, getActiveTenant } from "@/lib/tenant"

// --- Data ---
interface PayrollRecord {
  id: string
  teacherName: string
  teacherId: string
  payType: "monthly" | "batchwise" | "daily"
  baseAmount: number
  bonuses: number
  deductions: number
  netAmount: number
  month: string
  status: "Paid" | "Pending" | "Processing"
  paidDate?: string
}

interface LeaveRecord {
  id: string
  teacherName: string
  teacherId: string
  leaveType: "Casual" | "Sick" | "Personal" | "Emergency"
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: "Approved" | "Pending" | "Rejected"
  appliedDate: string
}

const payrollData: PayrollRecord[] = [
  { id: "PAY-001", teacherName: "Dr. Priya Sharma", teacherId: "T-001", payType: "monthly", baseAmount: 45000, bonuses: 5000, deductions: 2000, netAmount: 48000, month: "June 2026", status: "Paid", paidDate: "2026-06-01" },
  { id: "PAY-002", teacherName: "Rajesh Kumar", teacherId: "T-002", payType: "batchwise", baseAmount: 12000, bonuses: 0, deductions: 0, netAmount: 12000, month: "June 2026", status: "Pending" },
  { id: "PAY-003", teacherName: "Anita Desai", teacherId: "T-003", payType: "monthly", baseAmount: 40000, bonuses: 3000, deductions: 1500, netAmount: 41500, month: "June 2026", status: "Processing" },
  { id: "PAY-004", teacherName: "Suresh Patel", teacherId: "T-004", payType: "daily", baseAmount: 52500, bonuses: 0, deductions: 2500, netAmount: 50000, month: "June 2026", status: "Paid", paidDate: "2026-06-05" },
  { id: "PAY-005", teacherName: "Meena Gupta", teacherId: "T-005", payType: "monthly", baseAmount: 35000, bonuses: 2000, deductions: 1000, netAmount: 36000, month: "June 2026", status: "Pending" },
  { id: "PAY-006", teacherName: "Dr. Priya Sharma", teacherId: "T-001", payType: "monthly", baseAmount: 45000, bonuses: 5000, deductions: 2000, netAmount: 48000, month: "May 2026", status: "Paid", paidDate: "2026-05-01" },
  { id: "PAY-007", teacherName: "Rajesh Kumar", teacherId: "T-002", payType: "batchwise", baseAmount: 12000, bonuses: 1000, deductions: 0, netAmount: 13000, month: "May 2026", status: "Paid", paidDate: "2026-05-05" },
]

const leaveData: LeaveRecord[] = [
  { id: "LV-001", teacherName: "Anita Desai", teacherId: "T-003", leaveType: "Sick", fromDate: "2026-06-15", toDate: "2026-06-20", days: 5, reason: "Medical procedure and recovery", status: "Approved", appliedDate: "2026-06-12" },
  { id: "LV-002", teacherName: "Dr. Priya Sharma", teacherId: "T-001", leaveType: "Casual", fromDate: "2026-06-25", toDate: "2026-06-26", days: 2, reason: "Family function", status: "Pending", appliedDate: "2026-06-17" },
  { id: "LV-003", teacherName: "Suresh Patel", teacherId: "T-004", leaveType: "Personal", fromDate: "2026-07-01", toDate: "2026-07-03", days: 3, reason: "Personal travel", status: "Pending", appliedDate: "2026-06-18" },
  { id: "LV-004", teacherName: "Rajesh Kumar", teacherId: "T-002", leaveType: "Emergency", fromDate: "2026-06-10", toDate: "2026-06-11", days: 2, reason: "Family emergency", status: "Approved", appliedDate: "2026-06-10" },
  { id: "LV-005", teacherName: "Meena Gupta", teacherId: "T-005", leaveType: "Casual", fromDate: "2026-05-20", toDate: "2026-05-21", days: 2, reason: "Festival celebration", status: "Approved", appliedDate: "2026-05-15" },
]

export default function HRPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [payroll, setPayroll] = React.useState<PayrollRecord[]>([])
  const [leaves, setLeaves] = React.useState<LeaveRecord[]>([])
  const [paySearch, setPaySearch] = React.useState("")
  const [payStatusFilter, setPayStatusFilter] = React.useState("all")
  const [payMonthFilter, setPayMonthFilter] = React.useState("all")
  const [leaveSearch, setLeaveSearch] = React.useState("")
  const [leaveStatusFilter, setLeaveStatusFilter] = React.useState("all")

  // Add payroll dialog
  const [isPayDialogOpen, setIsPayDialogOpen] = React.useState(false)
  const [newPayTeacher, setNewPayTeacher] = React.useState("")
  const [newPayAmount, setNewPayAmount] = React.useState("")
  const [newPayBonus, setNewPayBonus] = React.useState("0")
  const [newPayDeduction, setNewPayDeduction] = React.useState("0")

  // Request leave dialog
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = React.useState(false)
  const [newLeaveType, setNewLeaveType] = React.useState<"Casual" | "Sick" | "Personal" | "Emergency">("Casual")
  const [newLeaveFrom, setNewLeaveFrom] = React.useState("")
  const [newLeaveTo, setNewLeaveTo] = React.useState("")
  const [newLeaveReason, setNewLeaveReason] = React.useState("")

  // Invoice states
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState<PayrollRecord | null>(null)

  const [activeRole, setActiveRole] = React.useState("owner")
  const [activeTenant, setActiveTenant] = React.useState("inst_001")

  React.useEffect(() => {
    const loadedPayroll = getScopedData<PayrollRecord[]>("payroll", mockPayrollGenerator)
    setPayroll(loadedPayroll)

    const loadedLeaves = getScopedData<LeaveRecord[]>("leaves", mockLeavesGenerator)
    setLeaves(loadedLeaves)

    setActiveRole(getActiveRole())
    setActiveTenant(getActiveTenant())
    setIsLoading(false)
  }, [])

  const myTeacherName = activeTenant === "inst_002" ? "Dr. Priya Apex" : activeTenant === "inst_003" ? "Dr. Priya Horizon" : "Dr. Priya Sharma"

  const savePayroll = (updated: PayrollRecord[]) => {
    setPayroll(updated)
    setScopedData<PayrollRecord[]>("payroll", updated)
  }

  const saveLeaves = (updated: LeaveRecord[]) => {
    setLeaves(updated)
    setScopedData<LeaveRecord[]>("leaves", updated)
  }

  const handleOpenInvoice = (record: PayrollRecord) => {
    setSelectedRecord(record)
    setIsInvoiceOpen(true)
  }

  const handleSendInvoice = () => {
    toast({
      title: "Payslip Sent",
      description: `The payslip has been successfully emailed to ${selectedRecord?.teacherName}.`,
    })
    setIsInvoiceOpen(false)
  }

  const handleDownloadInvoice = async () => {
    toast({
      title: "Generating PDF",
      description: "Preparing your teacher payroll receipt for download...",
    })

    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default

      const sourceElement = document.getElementById("invoice-capture-teacher")
      if (!sourceElement) {
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "Could not locate invoice content wrapper.",
        })
        return
      }

      const clone = sourceElement.cloneNode(true) as HTMLElement
      clone.id = "invoice-capture-teacher-clone"

      const container = document.createElement("div")
      container.id = "pdf-render-container-teacher"
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 650px;
        background: white;
        z-index: -1;
        padding: 0;
        margin: 0;
        overflow: visible;
      `
      container.appendChild(clone)
      document.body.appendChild(container)

      await new Promise(resolve => setTimeout(resolve, 500))

      const opt = {
        margin: 0.3,
        filename: `payroll_receipt_${selectedRecord?.id || "invoice"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 650,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { 
          unit: "in", 
          format: "a4", 
          orientation: "portrait" as const 
        },
        pagebreak: { mode: ['avoid-all'] }
      }

      await html2pdf().set(opt).from(clone).save()
      document.body.removeChild(container)

      toast({
        title: "Download Complete",
        description: "Payroll receipt has been successfully downloaded.",
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
      const container = document.getElementById("pdf-render-container-teacher")
      if (container) document.body.removeChild(container)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "An error occurred while generating the PDF.",
      })
    }
  }

  const handleMarkPaid = (id: string) => {
    const updated = payroll.map(p => p.id === id ? { ...p, status: "Paid" as const, paidDate: new Date().toISOString().split("T")[0] } : p)
    savePayroll(updated)
    toast({ title: "Payment Processed", description: "Salary has been marked as paid." })
  }

  const handleLeaveAction = (id: string, action: "Approved" | "Rejected") => {
    const updated = leaves.map(l => l.id === id ? { ...l, status: action } : l)
    saveLeaves(updated)
    toast({ title: `Leave ${action}`, description: `The leave request has been ${action.toLowerCase()}.` })
  }

  const handleAddPayroll = () => {
    if (!newPayTeacher || !newPayAmount) return
    const base = Number(newPayAmount)
    const bonus = Number(newPayBonus) || 0
    const deduction = Number(newPayDeduction) || 0
    const newRecord: PayrollRecord = {
      id: `PAY-${Math.floor(Math.random() * 9000) + 1000}`,
      teacherName: newPayTeacher,
      teacherId: "T-NEW",
      payType: "monthly",
      baseAmount: base,
      bonuses: bonus,
      deductions: deduction,
      netAmount: base + bonus - deduction,
      month: "June 2026",
      status: "Pending",
    }
    const updated = [newRecord, ...payroll]
    savePayroll(updated)
    toast({ title: "Payroll Created", description: `Payment record added for ${newPayTeacher}.` })
    setIsPayDialogOpen(false)
    setNewPayTeacher("")
    setNewPayAmount("")
    setNewPayBonus("0")
    setNewPayDeduction("0")
  }

  const handleRequestLeave = () => {
    if (!newLeaveFrom || !newLeaveTo || !newLeaveReason) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields." })
      return
    }

    const from = new Date(newLeaveFrom)
    const to = new Date(newLeaveTo)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    const newRecord: LeaveRecord = {
      id: `LV-${Math.floor(Math.random() * 9000) + 1000}`,
      teacherName: myTeacherName,
      teacherId: "T-001",
      leaveType: newLeaveType,
      fromDate: newLeaveFrom,
      toDate: newLeaveTo,
      days: diffDays,
      reason: newLeaveReason,
      status: "Pending",
      appliedDate: new Date().toISOString().split("T")[0]
    }

    const updated = [newRecord, ...leaves]
    saveLeaves(updated)
    toast({ title: "Leave Requested", description: `Submitted leave request for ${diffDays} day(s).` })
    setIsLeaveDialogOpen(false)
    setNewLeaveFrom("")
    setNewLeaveTo("")
    setNewLeaveReason("")
  }

  const isTeacher = activeRole === "teacher"

  // Role Filtering
  const roleFilteredPayroll = isTeacher 
    ? payroll.filter(p => p.teacherName.toLowerCase().includes(myTeacherName.toLowerCase()) || p.teacherName.toLowerCase().includes("priya") || p.teacherName.toLowerCase().includes("sarah")) 
    : payroll

  const roleFilteredLeaves = isTeacher
    ? leaves.filter(l => l.teacherName.toLowerCase().includes(myTeacherName.toLowerCase()) || l.teacherName.toLowerCase().includes("priya") || l.teacherName.toLowerCase().includes("sarah"))
    : leaves

  // Filters
  const filteredPayroll = roleFilteredPayroll.filter(p => {
    const matchSearch = p.teacherName.toLowerCase().includes(paySearch.toLowerCase())
    const matchStatus = payStatusFilter === "all" || p.status === payStatusFilter
    const matchMonth = payMonthFilter === "all" || p.month === payMonthFilter
    return matchSearch && matchStatus && matchMonth
  })

  const filteredLeaves = roleFilteredLeaves.filter(l => {
    const matchSearch = l.teacherName.toLowerCase().includes(leaveSearch.toLowerCase())
    const matchStatus = leaveStatusFilter === "all" || l.status === leaveStatusFilter
    return matchSearch && matchStatus
  })

  // Stats
  const totalPaid = roleFilteredPayroll.filter(p => p.status === "Paid" && p.month === "June 2026").reduce((a, b) => a + b.netAmount, 0)
  const totalPending = roleFilteredPayroll.filter(p => p.status !== "Paid" && p.month === "June 2026").reduce((a, b) => a + b.netAmount, 0)
  const pendingLeaves = roleFilteredLeaves.filter(l => l.status === "Pending").length
  const totalLeaveDays = roleFilteredLeaves.filter(l => l.status === "Approved").reduce((a, b) => a + b.days, 0)

  const uniqueMonths = [...new Set(roleFilteredPayroll.map(p => p.month))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse"><Briefcase className="size-6 text-primary" /></div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading HR dashboard...</p>
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
            <Briefcase className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">HR & Payroll</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage teacher payments, bonuses & leave requests</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {!isTeacher ? (
            <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2 shadow-lg shadow-primary/20">
                  <Plus className="size-3.5" /> Add Payroll
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-headline">Add Payroll Entry</DialogTitle>
                  <DialogDescription>Create a new payment record.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Teacher Name</label>
                    <Input placeholder="Dr. Priya Sharma" className="rounded-xl" value={newPayTeacher} onChange={e => setNewPayTeacher(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Base (₹)</label>
                      <Input type="number" placeholder="45000" className="rounded-xl" value={newPayAmount} onChange={e => setNewPayAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Bonus (₹)</label>
                      <Input type="number" placeholder="0" className="rounded-xl" value={newPayBonus} onChange={e => setNewPayBonus(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Deduct (₹)</label>
                      <Input type="number" placeholder="0" className="rounded-xl" value={newPayDeduction} onChange={e => setNewPayDeduction(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="rounded-xl" onClick={() => setIsPayDialogOpen(false)}>Cancel</Button>
                  <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleAddPayroll}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2 shadow-lg shadow-primary/20 bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Plus className="size-3.5" /> Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-headline">Request Leave</DialogTitle>
                  <DialogDescription>Submit a leave request for approval.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Leave Type</label>
                    <Select value={newLeaveType} onValueChange={(val: any) => setNewLeaveType(val)}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual" className="text-xs">Casual Leave</SelectItem>
                        <SelectItem value="Sick" className="text-xs">Sick Leave</SelectItem>
                        <SelectItem value="Personal" className="text-xs">Personal Leave</SelectItem>
                        <SelectItem value="Emergency" className="text-xs">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold">From Date</label>
                      <Input type="date" className="rounded-xl" value={newLeaveFrom} onChange={e => setNewLeaveFrom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">To Date</label>
                      <Input type="date" className="rounded-xl" value={newLeaveTo} onChange={e => setNewLeaveTo(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Reason</label>
                    <Input placeholder="Reason for leave" className="rounded-xl" value={newLeaveReason} onChange={e => setNewLeaveReason(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="rounded-xl" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button>
                  <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleRequestLeave}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Paid (June)", value: `₹${(totalPaid / 1000).toFixed(0)}K`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending", value: `₹${(totalPending / 1000).toFixed(0)}K`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Leave Requests", value: pendingLeaves, icon: CalendarDays, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Leave Days Used", value: totalLeaveDays, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("size-10 rounded-xl flex items-center justify-center", s.bg, s.color)}><s.icon className="size-5" /></div>
              <div>
                <p className="text-lg md:text-xl font-headline font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payroll" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-10 mb-4">
          <TabsTrigger value="payroll" className="rounded-lg px-5 text-xs font-bold gap-1.5"><CreditCard className="size-3" /> Payroll</TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-lg px-5 text-xs font-bold gap-1.5"><CalendarDays className="size-3" /> Leaves</TabsTrigger>
        </TabsList>

        {/* ===== PAYROLL TAB ===== */}
        <TabsContent value="payroll" className="m-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search teacher..." className="pl-9 bg-background rounded-xl h-9 text-xs" value={paySearch} onChange={e => setPaySearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={payStatusFilter} onValueChange={setPayStatusFilter}>
                    <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Status</SelectItem>
                      <SelectItem value="Paid" className="text-xs">Paid</SelectItem>
                      <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                      <SelectItem value="Processing" className="text-xs">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={payMonthFilter} onValueChange={setPayMonthFilter}>
                    <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Months</SelectItem>
                      {uniqueMonths.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/5">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6">Teacher</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Pay Type</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Base</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Bonus</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Deduct</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Net Pay</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Month</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayroll.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-16 text-muted-foreground text-sm">No payroll records found.</TableCell></TableRow>
                    ) : filteredPayroll.map(p => (
                      <TableRow key={p.id} className="hover:bg-muted/5">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8 ring-1 ring-border/30"><AvatarImage src={`https://picsum.photos/seed/${p.teacherId}/32/32`} /><AvatarFallback className="text-[9px] font-bold bg-muted">{p.teacherName.charAt(0)}</AvatarFallback></Avatar>
                            <div>
                              <p className="text-xs font-bold leading-tight">{p.teacherName}</p>
                              <p className="text-[9px] text-muted-foreground font-mono">{p.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px] font-bold capitalize">{p.payType}</Badge></TableCell>
                        <TableCell className="text-xs font-medium">₹{p.baseAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-medium text-emerald-600">+₹{p.bonuses.toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-medium text-red-600">-₹{p.deductions.toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-sm">₹{p.netAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.month}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[9px] px-2 border-none font-bold",
                            p.status === "Paid" ? "bg-green-100 text-green-700" :
                            p.status === "Processing" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          )}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isTeacher && p.status !== "Paid" && (
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary px-2" onClick={() => handleMarkPaid(p.id)}>
                                <CheckCircle2 className="size-3 mr-1" /> Pay
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary px-2" onClick={() => handleOpenInvoice(p)}>
                              <FileText className="size-3 mr-1" /> Invoice
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-border/30">
                {filteredPayroll.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground text-sm">No records found.</div>
                ) : filteredPayroll.map(p => (
                  <div key={p.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-9 ring-1 ring-border/30"><AvatarFallback className="text-[10px] font-bold bg-muted">{p.teacherName.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-sm font-bold">{p.teacherName}</p>
                          <p className="text-[10px] text-muted-foreground">{p.month} · <span className="capitalize">{p.payType}</span></p>
                        </div>
                      </div>
                      <Badge className={cn("text-[9px] px-2 border-none font-bold",
                        p.status === "Paid" ? "bg-green-100 text-green-700" :
                        p.status === "Processing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      )}>{p.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-[10px]">
                        <span>Base: <span className="font-bold">₹{p.baseAmount.toLocaleString()}</span></span>
                        <span className="text-emerald-600">+₹{p.bonuses.toLocaleString()}</span>
                        <span className="text-red-600">-₹{p.deductions.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-headline font-bold">₹{p.netAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {!isTeacher && p.status !== "Paid" && (
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg" onClick={() => handleMarkPaid(p.id)}>
                          <CheckCircle2 className="size-3 mr-1.5" /> Mark Paid
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg" onClick={() => handleOpenInvoice(p)}>
                        <FileText className="size-3 mr-1.5" /> Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== LEAVES TAB ===== */}
        <TabsContent value="leaves" className="m-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search teacher..." className="pl-9 bg-background rounded-xl h-9 text-xs" value={leaveSearch} onChange={e => setLeaveSearch(e.target.value)} />
                </div>
                <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                  <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Status</SelectItem>
                    <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="Approved" className="text-xs">Approved</SelectItem>
                    <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {filteredLeaves.length === 0 ? (
                  <div className="p-16 text-center text-muted-foreground text-sm">No leave records found.</div>
                ) : filteredLeaves.map(l => (
                  <div key={l.id} className="p-4 md:p-5 hover:bg-muted/5 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-10 ring-1 ring-border/30 shrink-0">
                          <AvatarImage src={`https://picsum.photos/seed/${l.teacherId}/40/40`} />
                          <AvatarFallback className="text-xs font-bold bg-muted">{l.teacherName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold">{l.teacherName}</h4>
                            <Badge variant="outline" className="text-[9px] font-bold">{l.leaveType}</Badge>
                            <Badge className={cn("text-[9px] px-2 border-none font-bold",
                              l.status === "Approved" ? "bg-green-100 text-green-700" :
                              l.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                            )}>{l.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{l.reason}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3" /> {l.fromDate} → {l.toDate}
                            </span>
                            <Badge variant="secondary" className="text-[9px] font-bold">{l.days} day{l.days > 1 ? "s" : ""}</Badge>
                          </div>
                        </div>
                      </div>
                      {!isTeacher && l.status === "Pending" && (
                        <div className="flex items-center gap-2 ml-13 md:ml-0 shrink-0">
                          <Button size="sm" className="h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => handleLeaveAction(l.id, "Approved")}>
                            <CheckCircle2 className="size-3" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-lg text-destructive border-destructive/30 gap-1" onClick={() => handleLeaveAction(l.id, "Rejected")}>
                            <XCircle className="size-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Teacher Payroll Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[650px] p-0 overflow-hidden bg-white shadow-2xl border-none text-slate-800">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6 sm:p-12 print:p-8 space-y-8" id="invoice-capture-teacher">
              {/* Header: Brand */}
              <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 sm:size-16 print:size-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shrink-0">
                    <Building2 className="size-7 sm:size-8" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h2 className="text-xl sm:text-2xl print:text-2xl font-headline font-bold text-primary tracking-tight">{getTenantDetails().name}</h2>
                    <p className="text-[10px] sm:text-xs print:text-xs text-muted-foreground font-semibold uppercase tracking-[0.2em]">{getTenantDetails().tagline || "Excellence in Education"}</p>
                    <p className="text-[9px] sm:text-[10px] print:text-[10px] text-muted-foreground/80 mt-1">123 Learning Street, Tech City, 400001</p>
                  </div>
                </div>
                <div className="text-left sm:text-right print:text-right space-y-1 w-full sm:w-auto print:w-auto">
                  <h1 className="text-2xl sm:text-3xl print:text-3xl font-headline font-bold uppercase text-foreground tracking-tighter">Payslip</h1>
                  <div className="flex flex-col sm:items-end print:items-end text-[10px] sm:text-xs print:text-xs font-medium text-muted-foreground">
                    <p>Payslip ID: <span className="text-foreground font-bold">{selectedRecord?.id}</span></p>
                    <p>Pay Month: <span className="text-foreground font-bold">{selectedRecord?.month}</span></p>
                    <p>Date Disbursed: <span className="text-foreground font-bold">{selectedRecord?.paidDate || "—"}</span></p>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Billing Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-8 text-left">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">Billed To (Faculty)</h4>
                  <div className="bg-muted/5 p-4 rounded-xl border border-border/50">
                    <p className="text-base sm:text-lg print:text-lg font-bold text-foreground">{selectedRecord?.teacherName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Faculty ID: <span className="font-semibold text-foreground/80">{selectedRecord?.teacherId || "T-NEW"}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pay Settlement: <span className="font-semibold text-foreground/80 capitalize">{selectedRecord?.payType}</span></p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-primary/60 tracking-widest sm:text-right print:text-right">Earnings Summary</h4>
                  <div className="bg-muted/5 p-4 rounded-xl border border-border/50 sm:text-right print:text-right space-y-1">
                    <p className="text-xs text-muted-foreground">Net Payout Amount: <span className="font-bold text-foreground">₹{selectedRecord?.netAmount.toLocaleString()}</span></p>
                    <p className="text-xs text-muted-foreground">Status: 
                      <Badge variant="outline" className={cn(
                        "ml-2 text-[9px] h-4 font-bold border-none",
                        selectedRecord?.status === "Paid" ? "bg-green-100 text-green-700" :
                        selectedRecord?.status === "Processing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {selectedRecord?.status.toUpperCase()}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Method: <span className="font-bold text-foreground">Bank Disbursal</span></p>
                  </div>
                </div>
              </div>

              {/* Detailed Ledger Breakdown Table */}
              <div className="rounded-2xl border overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 py-0 pl-6">Description</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 py-0 text-right pr-6">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-none">
                      <TableCell className="py-4 pl-6 text-left">
                        <p className="font-bold text-sm text-foreground">Base Salary / Session Payout</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Standard contract hours rate</p>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6 font-bold text-sm">
                        ₹{selectedRecord?.baseAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t border-border/40">
                      <TableCell className="py-4 pl-6 text-left">
                        <p className="font-bold text-sm text-emerald-600">Bonuses & Performance Credits</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Incentives credited for cycle</p>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6 font-bold text-sm text-emerald-600">
                        +₹{selectedRecord?.bonuses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t border-border/40">
                      <TableCell className="py-4 pl-6 text-left">
                        <p className="font-bold text-sm text-red-600">Deductions & Unexcused Absences</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Unpaid leaves and compliance deductions</p>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6 font-bold text-sm text-red-600">
                        -₹{selectedRecord?.deductions.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    {/* Grand Net total */}
                    <TableRow className="border-t border-border/50 bg-muted/5">
                      <TableCell className="py-4 text-right text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                        Net Payout
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6 font-headline font-bold text-lg sm:text-xl text-primary">
                        ₹{selectedRecord?.netAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row print:flex-row justify-between items-end gap-8 pt-4">
                <div className="space-y-4 w-full sm:max-w-xs text-left">
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold uppercase text-foreground/80 tracking-widest">Disclaimer</h5>
                    <p className="text-[9px] sm:text-[10px] print:text-[10px] text-muted-foreground leading-relaxed">
                      This is a computer-generated salary slip and does not require a physical signature unless audited. For discrepancies, contact HR.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Payout</span>
                  </div>
                </div>
                
                <div className="text-center sm:text-right print:text-right w-full sm:w-auto print:w-auto space-y-4">
                  <div className="space-y-1">
                    <div className="h-10 w-32 sm:w-40 print:w-40 border-b border-muted-foreground/30 ml-auto" />
                    <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Authorized Signatory</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />
              
              <div className="text-center space-y-1">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.3em]">Thank you for your service</p>
                <p className="text-[8px] text-muted-foreground font-medium">For support: hr@{getTenantDetails().name.toLowerCase().replace(/\s+/g, "")}.edu | +91 000-000-0000</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 sm:p-6 bg-muted/20 border-t flex flex-col sm:flex-row gap-2 shrink-0 print:hidden">
            <Button variant="outline" className="flex-1 rounded-xl h-11 text-xs font-bold" onClick={handleDownloadInvoice}>
              <Printer className="size-4 mr-2" /> Download Payslip
            </Button>
            <Button className="flex-1 bg-primary rounded-xl h-11 text-xs font-bold shadow-lg shadow-primary/20" onClick={handleSendInvoice}>
              <Send className="size-4 mr-2" /> Email Faculty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

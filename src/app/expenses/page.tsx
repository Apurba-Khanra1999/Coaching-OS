"use client"

import * as React from "react"
import {
  Receipt, Search, Plus, Filter, TrendingUp, TrendingDown, DollarSign,
  Calendar, Clock, CheckCircle2, AlertCircle, MoreVertical, Trash2,
  Edit, Download, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Building2, Zap, BookOpen, Wrench, Coffee, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getScopedData, setScopedData, mockExpensesGenerator } from "@/lib/tenant"

// --- Types ---
interface Expense {
  id: string
  title: string
  category: string
  amount: number
  date: string
  paidTo: string
  paymentMode: string
  status: "Paid" | "Pending" | "Recurring"
  notes: string
}

const categories = [
  { name: "Rent", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Utilities", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Study Material", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Maintenance", icon: Wrench, color: "text-violet-600", bg: "bg-violet-50" },
  { name: "Refreshments", icon: Coffee, color: "text-pink-600", bg: "bg-pink-50" },
  { name: "Marketing", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  { name: "Other", icon: Receipt, color: "text-slate-600", bg: "bg-slate-100" },
]

const initialExpenses: Expense[] = [
  { id: "EXP-001", title: "Monthly Office Rent", category: "Rent", amount: 25000, date: "2026-06-01", paidTo: "Landmark Properties", paymentMode: "Bank Transfer", status: "Paid", notes: "June rent for coaching center" },
  { id: "EXP-002", title: "Electricity Bill", category: "Utilities", amount: 8500, date: "2026-06-05", paidTo: "State Electricity Board", paymentMode: "Online", status: "Paid", notes: "May-June billing cycle" },
  { id: "EXP-003", title: "Practice Worksheets Printing", category: "Study Material", amount: 4200, date: "2026-06-10", paidTo: "QuickPrint Services", paymentMode: "Cash", status: "Paid", notes: "500 copies for Batch Alpha & Beta" },
  { id: "EXP-004", title: "AC Servicing", category: "Maintenance", amount: 6000, date: "2026-05-12", paidTo: "CoolTech Services", paymentMode: "UPI", status: "Pending", notes: "Annual maintenance for 3 ACs" },
  { id: "EXP-005", title: "Tea & Snacks Monthly", category: "Refreshments", amount: 3500, date: "2026-04-15", paidTo: "Local Vendor", paymentMode: "Cash", status: "Recurring", notes: "Monthly refreshment budget" },
  { id: "EXP-006", title: "Google Ads Campaign", category: "Marketing", amount: 15000, date: "2026-03-08", paidTo: "Google Ads", paymentMode: "Online", status: "Paid", notes: "Student enrollment campaign - June" },
  { id: "EXP-007", title: "Lab Equipment Repair", category: "Maintenance", amount: 2800, date: "2026-02-14", paidTo: "SciLab Instruments", paymentMode: "UPI", status: "Pending", notes: "Physics lab oscilloscope repair" },
  { id: "EXP-008", title: "Water Supply", category: "Utilities", amount: 1200, date: "2025-12-03", paidTo: "Municipal Corporation", paymentMode: "Online", status: "Paid", notes: "Quarterly water bill" },
  { id: "EXP-009", title: "Internet & WiFi", category: "Utilities", amount: 2500, date: "2025-09-01", paidTo: "Airtel Business", paymentMode: "Auto-debit", status: "Recurring", notes: "100 Mbps fiber plan" },
  { id: "EXP-010", title: "Reference Books Purchase", category: "Study Material", amount: 7800, date: "2025-06-16", paidTo: "Academic Book Store", paymentMode: "Cash", status: "Paid", notes: "NCERT & HC Verma - 20 sets" },
]

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Add form state
  const [newTitle, setNewTitle] = React.useState("")
  const [newCategory, setNewCategory] = React.useState("Other")
  const [newAmount, setNewAmount] = React.useState("")
  const [newPaidTo, setNewPaidTo] = React.useState("")
  const [newPaymentMode, setNewPaymentMode] = React.useState("Cash")
  const [newNotes, setNewNotes] = React.useState("")
  const [newStatus, setNewStatus] = React.useState<"Paid" | "Pending" | "Recurring">("Paid")

  // Edit form state
  const [editTitle, setEditTitle] = React.useState("")
  const [editCategory, setEditCategory] = React.useState("Other")
  const [editAmount, setEditAmount] = React.useState("")
  const [editPaidTo, setEditPaidTo] = React.useState("")
  const [editPaymentMode, setEditPaymentMode] = React.useState("Cash")
  const [editNotes, setEditNotes] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<"Paid" | "Pending" | "Recurring">("Paid")

  // Date filter state
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")

  React.useEffect(() => {
    const loadedExpenses = getScopedData<Expense[]>("expenses", mockExpensesGenerator)
    setExpenses(loadedExpenses)
    setIsLoading(false)
  }, [])

  const saveExpenses = (updated: Expense[]) => {
    setExpenses(updated)
    setScopedData<Expense[]>("expenses", updated)
  }

  const handleAdd = () => {
    if (!newTitle || !newAmount) { toast({ variant: "destructive", title: "Missing Info", description: "Title and amount are required." }); return }
    const exp: Expense = {
      id: `EXP-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newTitle, category: newCategory, amount: Number(newAmount), date: new Date().toISOString().split("T")[0],
      paidTo: newPaidTo, paymentMode: newPaymentMode, status: newStatus, notes: newNotes,
    }
    const updated = [exp, ...expenses]
    saveExpenses(updated)
    toast({ title: "Expense Added", description: `₹${Number(newAmount).toLocaleString()} recorded under ${newCategory}.` })
    setIsAddOpen(false)
    setNewTitle(""); setNewAmount(""); setNewPaidTo(""); setNewNotes(""); setNewCategory("Other"); setNewStatus("Paid")
  }

  const handleDelete = (id: string) => {
    const updated = expenses.filter(e => e.id !== id)
    saveExpenses(updated)
    toast({ title: "Expense Deleted", variant: "destructive" })
  }

  const handleMarkPaid = (id: string) => {
    const updated = expenses.map(e => e.id === id ? { ...e, status: "Paid" as const } : e)
    saveExpenses(updated)
    toast({ title: "Marked as Paid" })
  }

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setEditTitle(expense.title)
    setEditCategory(expense.category)
    setEditAmount(String(expense.amount))
    setEditPaidTo(expense.paidTo)
    setEditPaymentMode(expense.paymentMode)
    setEditNotes(expense.notes)
    setEditStatus(expense.status)
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editingExpense || !editTitle || !editAmount) return
    const updated = expenses.map(e =>
      e.id === editingExpense.id
        ? { ...e, title: editTitle, category: editCategory, amount: Number(editAmount), paidTo: editPaidTo, paymentMode: editPaymentMode, notes: editNotes, status: editStatus }
        : e
    )
    saveExpenses(updated)
    toast({ title: "Expense Updated", description: `${editTitle} has been updated.` })
    setIsEditOpen(false)
    setEditingExpense(null)
  }

  // Filters by Date first for insights
  const dateFiltered = expenses.filter(e => {
    if (dateFilter === "all") return true
    const expenseDate = new Date(e.date)
    const today = new Date()

    if (dateFilter === "this-month") {
      return expenseDate.getFullYear() === today.getFullYear() && expenseDate.getMonth() === today.getMonth()
    } else if (dateFilter === "last-3-months") {
      const limit = new Date()
      limit.setMonth(limit.getMonth() - 3)
      return expenseDate >= limit && expenseDate <= today
    } else if (dateFilter === "last-6-months") {
      const limit = new Date()
      limit.setMonth(limit.getMonth() - 6)
      return expenseDate >= limit && expenseDate <= today
    } else if (dateFilter === "last-year") {
      const limit = new Date()
      limit.setFullYear(limit.getFullYear() - 1)
      return expenseDate >= limit && expenseDate <= today
    } else if (dateFilter === "custom") {
      const expenseTime = expenseDate.getTime()
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (expenseTime < start.getTime()) return false
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (expenseTime > end.getTime()) return false
      }
      return true
    }
    return true
  })

  // Further filter for table view
  const filtered = dateFiltered.filter(e => {
    const mSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.paidTo.toLowerCase().includes(searchTerm.toLowerCase())
    const mCat = categoryFilter === "all" || e.category === categoryFilter
    const mStatus = statusFilter === "all" || e.status === statusFilter
    return mSearch && mCat && mStatus
  })

  // Insights based on date-filtered items
  const totalSpent = dateFiltered.filter(e => e.status === "Paid").reduce((a, b) => a + b.amount, 0)
  const totalPending = dateFiltered.filter(e => e.status === "Pending").reduce((a, b) => a + b.amount, 0)
  const totalRecurring = dateFiltered.filter(e => e.status === "Recurring").reduce((a, b) => a + b.amount, 0)
  const totalAll = dateFiltered.reduce((a, b) => a + b.amount, 0)

  // Category breakdown based on date-filtered items
  const categoryBreakdown = categories.map(c => ({
    ...c,
    total: dateFiltered.filter(e => e.category === c.name).reduce((a, b) => a + b.amount, 0),
    count: dateFiltered.filter(e => e.category === c.name).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse"><Receipt className="size-6 text-primary" /></div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading expenses...</p>
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
            <Receipt className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Expenses</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Track institute spending & get financial insights</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-10 text-xs font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="size-3.5" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline">Add Expense</DialogTitle>
              <DialogDescription>Record a new expense entry.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-bold">Title</label>
                <Input placeholder="Monthly Office Rent" className="rounded-xl" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold">Category</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">Amount (₹)</label>
                  <Input type="number" placeholder="25000" className="rounded-xl" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold">Paid To</label>
                  <Input placeholder="Vendor name" className="rounded-xl" value={newPaidTo} onChange={e => setNewPaidTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">Payment Mode</label>
                  <Select value={newPaymentMode} onValueChange={setNewPaymentMode}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                      <SelectItem value="UPI" className="text-xs">UPI</SelectItem>
                      <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                      <SelectItem value="Online" className="text-xs">Online</SelectItem>
                      <SelectItem value="Auto-debit" className="text-xs">Auto-debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Status</label>
                <Select value={newStatus} onValueChange={v => setNewStatus(v as "Paid" | "Pending" | "Recurring")}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid" className="text-xs">Paid</SelectItem>
                    <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="Recurring" className="text-xs">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Notes</label>
                <Textarea placeholder="Additional details..." className="rounded-xl min-h-[60px] text-xs" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleAdd}>Add Expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Spent", value: `₹${(totalSpent / 1000).toFixed(1)}K`, icon: ArrowDownRight, color: "text-red-600", bg: "bg-red-50", sub: `${dateFiltered.filter(e => e.status === "Paid").length} transactions` },
          { label: "Pending", value: `₹${(totalPending / 1000).toFixed(1)}K`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", sub: `${dateFiltered.filter(e => e.status === "Pending").length} pending` },
          { label: "Recurring", value: `₹${(totalRecurring / 1000).toFixed(1)}K`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", sub: "monthly" },
          { label: "Total Budget", value: `₹${(totalAll / 1000).toFixed(1)}K`, icon: BarChart3, color: "text-primary", bg: "bg-primary/5", sub: `${dateFiltered.length} entries` },
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Expense Table */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search expenses..." className="pl-9 bg-background rounded-xl h-9 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs"><SelectValue placeholder="Date Range" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Time</SelectItem>
                      <SelectItem value="this-month" className="text-xs">This Month</SelectItem>
                      <SelectItem value="last-3-months" className="text-xs">Last 3 Months</SelectItem>
                      <SelectItem value="last-6-months" className="text-xs">Last 6 Months</SelectItem>
                      <SelectItem value="last-year" className="text-xs">Last Year</SelectItem>
                      <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                      {categories.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[110px] rounded-xl text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Status</SelectItem>
                      <SelectItem value="Paid" className="text-xs">Paid</SelectItem>
                      <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                      <SelectItem value="Recurring" className="text-xs">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">From:</span>
                    <Input type="date" className="h-8 w-[130px] rounded-lg text-xs bg-background" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">To:</span>
                    <Input type="date" className="h-8 w-[130px] rounded-lg text-xs bg-background" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                  {(startDate || endDate) && (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" onClick={() => { setStartDate(""); setEndDate("") }}>
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/5">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6">Expense</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Category</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">No expenses found.</TableCell></TableRow>
                    ) : filtered.map(e => {
                      const catConf = categories.find(c => c.name === e.category) || categories[categories.length - 1]
                      const CatIcon = catConf.icon
                      return (
                        <TableRow key={e.id} className="hover:bg-muted/5 group">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", catConf.bg, catConf.color)}>
                                <CatIcon className="size-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold leading-tight">{e.title}</p>
                                <p className="text-[10px] text-muted-foreground">{e.paidTo} · {e.paymentMode}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px] font-bold">{e.category}</Badge></TableCell>
                          <TableCell className="font-bold text-sm">₹{e.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[9px] px-2 border-none font-bold",
                              e.status === "Paid" ? "bg-green-100 text-green-700" :
                              e.status === "Recurring" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                            )}>{e.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              {e.status === "Pending" && (
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary px-2" onClick={() => handleMarkPaid(e.id)}>
                                  <CheckCircle2 className="size-3 mr-1" /> Pay
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="size-3.5" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => openEditExpense(e)}><Edit className="size-3 mr-2" /> Edit</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-xs cursor-pointer text-destructive" onClick={() => handleDelete(e.id)}>
                                    <Trash2 className="size-3 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-border/30">
                {filtered.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground text-sm">No expenses found.</div>
                ) : filtered.map(e => {
                  const catConf = categories.find(c => c.name === e.category) || categories[categories.length - 1]
                  const CatIcon = catConf.icon
                  return (
                    <div key={e.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("size-9 rounded-xl flex items-center justify-center", catConf.bg, catConf.color)}>
                            <CatIcon className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{e.title}</p>
                            <p className="text-[10px] text-muted-foreground">{e.paidTo} · {e.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-headline font-bold">₹{e.amount.toLocaleString()}</p>
                          <Badge className={cn("text-[9px] px-2 border-none font-bold",
                            e.status === "Paid" ? "bg-green-100 text-green-700" :
                            e.status === "Recurring" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          )}>{e.status}</Badge>
                        </div>
                      </div>
                      {(e.status === "Pending" || true) && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg" onClick={() => openEditExpense(e)}>
                            <Edit className="size-3 mr-1" /> Edit
                          </Button>
                          {e.status === "Pending" && (
                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg" onClick={() => handleMarkPaid(e.id)}>
                              <CheckCircle2 className="size-3 mr-1" /> Mark Paid
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Category Breakdown */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted/20 overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <PieChart className="size-3" /> Spending Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {categoryBreakdown.map(cat => {
                const percent = totalAll > 0 ? Math.round((cat.total / totalAll) * 100) : 0
                const CatIcon = cat.icon
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-6 rounded-md flex items-center justify-center", cat.bg, cat.color)}>
                          <CatIcon className="size-3" />
                        </div>
                        <span className="text-xs font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold">₹{(cat.total / 1000).toFixed(1)}K</span>
                        <span className="text-[9px] text-muted-foreground ml-1.5">{percent}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700",
                        cat.name === "Rent" ? "bg-blue-500" :
                        cat.name === "Utilities" ? "bg-amber-500" :
                        cat.name === "Study Material" ? "bg-emerald-500" :
                        cat.name === "Maintenance" ? "bg-violet-500" :
                        cat.name === "Refreshments" ? "bg-pink-500" :
                        cat.name === "Marketing" ? "bg-indigo-500" : "bg-slate-400"
                      )} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <BarChart3 className="size-3" /> Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Total Expenses</span>
                  <span className="text-sm font-bold">₹{totalAll.toLocaleString()}</span>
                </div>
                <Separator className="bg-border/30" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Already Paid</span>
                  <span className="text-sm font-bold text-emerald-600">₹{totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Pending Payment</span>
                  <span className="text-sm font-bold text-amber-600">₹{totalPending.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Monthly Recurring</span>
                  <span className="text-sm font-bold text-blue-600">₹{totalRecurring.toLocaleString()}</span>
                </div>
                <Separator className="bg-border/30" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-bold text-muted-foreground">Avg per Transaction</span>
                  <span className="text-sm font-headline font-bold text-primary">₹{dateFiltered.length > 0 ? Math.round(totalAll / dateFiltered.length).toLocaleString() : 0}</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Top Expense</p>
                {dateFiltered.length > 0 && (() => {
                  const top = [...dateFiltered].sort((a, b) => b.amount - a.amount)[0]
                  const catConf = categories.find(c => c.name === top.category) || categories[categories.length - 1]
                  const TopIcon = catConf.icon
                  return (
                    <div className={cn("flex items-center gap-3 p-3 rounded-xl", catConf.bg)}>
                      <div className={cn("size-9 rounded-lg flex items-center justify-center bg-white/80 shadow-sm", catConf.color)}>
                        <TopIcon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{top.title}</p>
                        <p className="text-lg font-headline font-bold leading-none mt-0.5">₹{top.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border z-40">
        <Button onClick={() => setIsAddOpen(true)} className="w-full h-12 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Plus className="size-4" /> Add Expense
        </Button>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Expense</DialogTitle>
            <DialogDescription>Update expense details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold">Title</label>
              <Input placeholder="Monthly Office Rent" className="rounded-xl" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold">Category</label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Amount (₹)</label>
                <Input type="number" placeholder="25000" className="rounded-xl" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold">Paid To</label>
                <Input placeholder="Vendor name" className="rounded-xl" value={editPaidTo} onChange={e => setEditPaidTo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Payment Mode</label>
                <Select value={editPaymentMode} onValueChange={setEditPaymentMode}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                    <SelectItem value="UPI" className="text-xs">UPI</SelectItem>
                    <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                    <SelectItem value="Online" className="text-xs">Online</SelectItem>
                    <SelectItem value="Auto-debit" className="text-xs">Auto-debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Status</label>
              <Select value={editStatus} onValueChange={v => setEditStatus(v as "Paid" | "Pending" | "Recurring")}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="text-xs">Paid</SelectItem>
                  <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="Recurring" className="text-xs">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Notes</label>
              <Textarea placeholder="Additional details..." className="rounded-xl min-h-[60px] text-xs" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import * as React from "react"
import { 
  CreditCard, 
  Search, 
  Plus, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Receipt,
  Filter,
  X,
  Loader2,
  Trash2,
  MoreVertical,
  Printer,
  Send,
  Building2,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getScopedData, setScopedData, mockFeesLedgerGenerator, getActiveRole } from "@/lib/tenant"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

const paymentSchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  batch: z.string().min(1, "Batch is required"),
  amount: z.string().min(1, "Amount is required"),
  month: z.string().min(1, "Billing cycle is required"),
  status: z.enum(["Paid", "Overdue", "Partial"]),
  paymentDate: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface Transaction extends PaymentFormValues {
  id: string;
  studentId?: string;
}

const initialLedger: Transaction[] = [
  { id: "TF-1001", studentName: "Sarah Smith", month: "May 2024", amount: "500", status: "Paid", paymentDate: "2024-05-10", batch: "Batch Alpha" },
  { id: "TF-1002", studentName: "Alex Brown", month: "May 2024", amount: "500", status: "Overdue", paymentDate: "", batch: "Batch Beta" },
  { id: "TF-1003", studentName: "Emma Watson", month: "May 2024", amount: "500", status: "Partial", paymentDate: "2024-05-12", batch: "Batch Alpha" },
  { id: "TF-1004", studentName: "James Wilson", month: "May 2024", amount: "500", status: "Paid", paymentDate: "2024-05-08", batch: "Batch Gamma" },
  { id: "TF-1005", studentName: "Olivia Davis", month: "May 2024", amount: "500", status: "Paid", paymentDate: "2024-05-15", batch: "Batch Alpha" },
]

export default function FeesPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialLedger)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [batchFilter, setBatchFilter] = React.useState("all")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false)
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const [activeRole, setActiveRole] = React.useState("owner")

  React.useEffect(() => {
    const loadedTransactions = getScopedData<Transaction[]>("fees_ledger", mockFeesLedgerGenerator)
    setTransactions(loadedTransactions)
    setActiveRole(getActiveRole())

    const params = new URLSearchParams(window.location.search)
    if (params.has('print')) {
      setIsLoading(false)
    } else {
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  React.useEffect(() => {
    if (!isLoading) {
      setScopedData<Transaction[]>("fees_ledger", transactions)
    }
  }, [transactions, isLoading])

  React.useEffect(() => {
    if (!isLoading) {
      const params = new URLSearchParams(window.location.search);
      const printId = params.get('print');
      if (printId) {
        const tx = transactions.find(t => t.id === printId);
        if (tx) {
          setSelectedTransaction(tx);
          setIsInvoiceOpen(true);
        }
      }
    }
  }, [isLoading, transactions])

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentName: "",
      batch: "",
      amount: "",
      month: "May 2024",
      status: "Paid",
      paymentDate: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = (values: PaymentFormValues) => {
    const newTransaction: Transaction = {
      ...values,
      id: `TF-${Math.floor(Math.random() * 9000) + 1000}`,
    }
    setTransactions(prev => [newTransaction, ...prev])
    toast({
      title: "Payment Recorded",
      description: `Successfully added ${values.amount} for ${values.studentName}.`,
    })
    setIsDialogOpen(false)
    form.reset()
  }

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    toast({
      title: "Transaction Deleted",
      description: "The payment record has been removed.",
      variant: "destructive"
    })
  }

  const handleOpenInvoice = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsInvoiceOpen(true)
  }

  const handleSendInvoice = () => {
    toast({
      title: "Invoice Sent",
      description: `The invoice has been sent to ${selectedTransaction?.studentName}'s primary contact.`,
    })
    setIsInvoiceOpen(false)
  }

  const handleDownloadInvoice = async () => {
    toast({
      title: "Generating PDF",
      description: "Preparing your professional invoice for download...",
    })

    try {
      // Dynamically import html2pdf.js on client side
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default

      const sourceElement = document.getElementById("invoice-capture")
      if (!sourceElement) {
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "Could not locate invoice content wrapper.",
        })
        return
      }

      // Clone the invoice content OUT of the Dialog portal so html2canvas can capture it.
      // html2canvas cannot reliably render elements inside Radix portals / ScrollArea.
      const clone = sourceElement.cloneNode(true) as HTMLElement
      clone.id = "invoice-capture-clone"

      // Create an off-screen container that is visible to html2canvas but not to the user
      const container = document.createElement("div")
      container.id = "pdf-render-container"
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

      // Wait for browser to paint the cloned content
      await new Promise(resolve => setTimeout(resolve, 500))

      const opt = {
        margin: 0.3,
        filename: `receipt_${selectedTransaction?.id || "invoice"}.pdf`,
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

      // Generate and save the PDF from the cloned element
      await html2pdf().set(opt).from(clone).save()

      // Clean up the temporary container
      document.body.removeChild(container)

      toast({
        title: "Download Complete",
        description: "Your receipt has been successfully downloaded.",
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
      // Clean up on error too
      const container = document.getElementById("pdf-render-container")
      if (container) document.body.removeChild(container)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "An error occurred while generating the PDF.",
      })
    }
  }

  const isStaff = activeRole === "owner" || activeRole === "teacher"
  const isStudentOrParent = activeRole === "student" || activeRole === "parent"

  const roleFilteredTransactions = isStudentOrParent 
    ? transactions.filter(t => t.studentId === "1" || t.studentName.toLowerCase().includes("sarah")) 
    : transactions

  const filteredTransactions = roleFilteredTransactions.filter(t => {
    const matchesSearch = t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    const matchesBatch = batchFilter === "all" || t.batch === batchFilter
    return matchesSearch && matchesStatus && matchesBatch
  })

  const stats = {
    totalCollection: roleFilteredTransactions.filter(t => t.status === "Paid").reduce((acc, curr) => acc + Number(curr.amount), 0),
    outstandingCount: roleFilteredTransactions.filter(t => t.status === "Overdue").length,
    pendingCount: roleFilteredTransactions.filter(t => t.status === "Partial").length
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Advanced Fee Ledger</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track billing cycles, payments, and digital receipts.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none">
             <Receipt className="mr-2 size-4" /> Vouchers
           </Button>
           
            {isStaff ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 md:flex-none bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 size-4" /> New Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                    <DialogDescription>Add a student payment record to the ledger.</DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                   <FormField
                     control={form.control}
                     name="studentName"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Student Name</FormLabel>
                         <FormControl>
                           <Input placeholder="Enter student name" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="batch"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Batch</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Select batch" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               <SelectItem value="Batch Alpha">Batch Alpha</SelectItem>
                               <SelectItem value="Batch Beta">Batch Beta</SelectItem>
                               <SelectItem value="Batch Gamma">Batch Gamma</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="amount"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Amount (₹)</FormLabel>
                           <FormControl>
                             <Input type="number" placeholder="500" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="month"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Billing Cycle</FormLabel>
                           <FormControl>
                             <Input placeholder="e.g. May 2024" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="status"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Status</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Select status" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               <SelectItem value="Paid">Paid</SelectItem>
                               <SelectItem value="Partial">Partial</SelectItem>
                               <SelectItem value="Overdue">Overdue</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   <FormField
                     control={form.control}
                     name="paymentDate"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Payment Date</FormLabel>
                         <FormControl>
                           <Input type="date" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <DialogFooter className="pt-4">
                     <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                     <Button type="submit">Save Transaction</Button>
                   </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : (
              <Link href="/online-payments" className="flex-1 md:flex-none">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                  <CreditCard className="mr-2 size-4" /> Pay Fee Online
                </Button>
              </Link>
            )}
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm opacity-80 font-medium">Monthly Collection</span>
              <span className="text-3xl md:text-4xl font-bold font-headline">₹{stats.totalCollection.toLocaleString()}</span>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                <TrendingUp className="size-3" /> 15% increase from last month
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <CreditCard className="size-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground font-medium">Outstanding Balances</span>
              <span className="text-3xl md:text-4xl font-bold font-headline text-red-600">₹{(stats.outstandingCount * 500).toLocaleString()}</span>
              <div className="flex items-center gap-1 mt-2 text-xs text-red-500 font-bold uppercase tracking-wider">
                <AlertCircle className="size-3" /> {stats.outstandingCount} accounts overdue
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground font-medium">Pending Approvals</span>
              <span className="text-3xl md:text-4xl font-bold font-headline text-amber-600">{stats.pendingCount}</span>
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 font-bold uppercase tracking-wider">
                <CheckCircle2 className="size-3" /> System stable
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search students or ID..." 
                className="pl-9 bg-background focus:ring-primary/20" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-background border border-border/50 rounded-md px-2 h-10">
                <Filter className="size-3.5 text-muted-foreground ml-1" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-none focus:ring-0 w-[120px] h-full shadow-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 bg-background border border-border/50 rounded-md px-2 h-10">
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="border-none focus:ring-0 w-[140px] h-full shadow-none">
                    <SelectValue placeholder="Filter Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="Batch Alpha">Batch Alpha</SelectItem>
                    <SelectItem value="Batch Beta">Batch Beta</SelectItem>
                    <SelectItem value="Batch Gamma">Batch Gamma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || statusFilter !== "all" || batchFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setBatchFilter("all")
                  }}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Student Details</TableHead>
                <TableHead className="font-bold">Batch Assignment</TableHead>
                <TableHead className="font-bold">Cycle</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="size-8 animate-spin" />
                      <p className="text-sm">Synchronizing ledger records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground opacity-30">
                      <Receipt className="size-12" />
                      <p>No transaction records found matching your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/10 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{row.studentName}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">ID: {row.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/20 text-[10px] font-bold border-none">
                        {row.batch}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium text-xs">{row.month}</TableCell>
                    <TableCell className="font-headline font-bold text-sm">₹{row.amount}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[10px] px-2 py-0 border-none font-bold",
                        row.status === "Paid" ? "bg-green-100 text-green-700" :
                        row.status === "Overdue" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {row.paymentDate || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-primary font-bold text-[10px] gap-1 px-2"
                          onClick={() => handleOpenInvoice(row)}
                        >
                          <FileText className="size-3" /> INVOICE
                        </Button>
                        {isStaff && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => {
                                setTransactions(prev => prev.map(t => t.id === row.id ? { ...t, status: "Paid" as const, paymentDate: new Date().toISOString().split("T")[0] } : t))
                                toast({ title: "Receipt Paid", description: "Successfully updated payment status to Paid." })
                              }}>
                                <CheckCircle2 className="size-3 mr-2 text-green-500" /> Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDelete(row.id)}>
                                <Trash2 className="size-3 mr-2" /> Remove Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Professional Invoice Template */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[650px] p-0 overflow-hidden bg-white shadow-2xl border-none">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6 sm:p-12 print:p-8 space-y-8" id="invoice-capture">
              {/* Header: Institute Brand */}
              <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 sm:size-16 print:size-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shrink-0">
                    <Building2 className="size-7 sm:size-8" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl print:text-2xl font-headline font-bold text-primary tracking-tight">Coaching OS Academy</h2>
                    <p className="text-[10px] sm:text-xs print:text-xs text-muted-foreground font-semibold uppercase tracking-[0.2em]">Excellence in Education</p>
                    <p className="text-[9px] sm:text-[10px] print:text-[10px] text-muted-foreground/80 mt-1">123 Learning Street, Tech City, 400001</p>
                  </div>
                </div>
                <div className="text-left sm:text-right print:text-right space-y-1 w-full sm:w-auto print:w-auto">
                  <h1 className="text-2xl sm:text-3xl print:text-3xl font-headline font-bold uppercase text-foreground tracking-tighter">Receipt</h1>
                  <div className="flex flex-col sm:items-end print:items-end text-[10px] sm:text-xs print:text-xs font-medium text-muted-foreground">
                    <p>Receipt ID: <span className="text-foreground font-bold">{selectedTransaction?.id}</span></p>
                    <p>Date: <span className="text-foreground font-bold">{selectedTransaction?.paymentDate || new Date().toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Billing Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">Billed To</h4>
                  <div className="bg-muted/5 p-4 rounded-xl border border-border/50">
                    <p className="text-base sm:text-lg print:text-lg font-bold text-foreground">{selectedTransaction?.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Enrolled in: <span className="font-semibold text-foreground/80">{selectedTransaction?.batch}</span></p>
                    <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 uppercase">Student ID: {selectedTransaction?.id.split('-')[1]}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-primary/60 tracking-widest sm:text-right print:text-right">Payment Summary</h4>
                  <div className="bg-muted/5 p-4 rounded-xl border border-border/50 sm:text-right print:text-right space-y-1">
                    <p className="text-xs text-muted-foreground">Billing Cycle: <span className="font-bold text-foreground">{selectedTransaction?.month}</span></p>
                    <p className="text-xs text-muted-foreground">Status: 
                      <Badge variant="outline" className={cn(
                        "ml-2 text-[9px] h-4 font-bold border-none",
                        selectedTransaction?.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {selectedTransaction?.status.toUpperCase()}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Method: <span className="font-bold text-foreground">Digital/UPI</span></p>
                  </div>
                </div>
              </div>

              {/* Professional Table */}
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
                      <TableCell className="py-6 pl-6">
                        <p className="font-bold text-sm sm:text-base print:text-base text-foreground">Tuition Fee - {selectedTransaction?.month}</p>
                        <p className="text-[10px] sm:text-xs print:text-xs text-muted-foreground mt-1 italic">Monthly academic subscription for {selectedTransaction?.batch}</p>
                      </TableCell>
                      <TableCell className="text-right py-6 pr-6 font-headline font-bold text-base sm:text-lg print:text-lg">
                        ₹{selectedTransaction?.amount}
                      </TableCell>
                    </TableRow>
                    {/* Add extra spacing row for professional look */}
                    <TableRow className="border-t border-border/50 bg-muted/5">
                      <TableCell className="py-4 text-right text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                        Grand Total
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6 font-headline font-bold text-lg sm:text-xl print:text-xl text-primary">
                        ₹{selectedTransaction?.amount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Footer Section */}
              <div className="flex flex-col sm:flex-row print:flex-row justify-between items-end gap-8 pt-4">
                <div className="space-y-4 w-full sm:max-w-xs">
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold uppercase text-foreground/80 tracking-widest">Notes</h5>
                    <p className="text-[9px] sm:text-[10px] print:text-[10px] text-muted-foreground leading-relaxed">
                      Fees once paid are non-refundable. Please keep this receipt for your records. Late payment may incur additional charges in the next cycle.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Payment</span>
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
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.3em]">Thank you for choosing Coaching OS</p>
                <p className="text-[8px] text-muted-foreground font-medium">For support: support@coachingos.edu | +91 000-000-0000</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 sm:p-6 bg-muted/20 border-t flex flex-col sm:flex-row gap-2 shrink-0 print:hidden">
            <Button variant="outline" className="flex-1 rounded-xl h-11 text-xs font-bold" onClick={handleDownloadInvoice}>
              <Printer className="size-4 mr-2" /> Download Receipt
            </Button>
            <Button className="flex-1 bg-primary rounded-xl h-11 text-xs font-bold shadow-lg shadow-primary/20" onClick={handleSendInvoice}>
              <Send className="size-4 mr-2" /> Send to Guardian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Sticky Action */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <Button onClick={() => setIsDialogOpen(true)} className="w-full shadow-lg h-12 text-base font-bold bg-primary hover:bg-primary/90">
          <Plus className="mr-2 size-5" /> Quick Payment Entry
        </Button>
      </div>
    </div>
  )
}

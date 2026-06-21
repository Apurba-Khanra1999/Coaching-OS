"use client"

import * as React from "react"
import {
  CreditCard, DollarSign, ArrowUpRight, TrendingUp, Filter,
  Download, Search, RefreshCw, CheckCircle2, Clock, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { TENANTS } from "@/lib/tenant"
import { cn } from "@/lib/utils"

interface PlatformInvoice {
  invoiceId: string
  tenantName: string
  amount: number
  date: string
  status: "Paid" | "Pending" | "Failed"
  plan: string
}

export default function PlatformBillingPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = React.useState<PlatformInvoice[]>([
    { invoiceId: "PINV-001", tenantName: "Coaching OS Academy", amount: 15000, date: "2026-06-01", status: "Paid", plan: "Enterprise Premium" },
    { invoiceId: "PINV-002", tenantName: "Apex Science Institute", amount: 15000, date: "2026-06-01", status: "Paid", plan: "Enterprise Premium" },
    { invoiceId: "PINV-003", tenantName: "Horizon Prep Academy", amount: 15000, date: "2026-06-01", status: "Paid", plan: "Enterprise Premium" },
    { invoiceId: "PINV-004", tenantName: "Coaching OS Academy", amount: 15000, date: "2026-05-01", status: "Paid", plan: "Enterprise Premium" },
    { invoiceId: "PINV-005", tenantName: "Apex Science Institute", amount: 15000, date: "2026-05-01", status: "Paid", plan: "Enterprise Premium" },
    { invoiceId: "PINV-006", tenantName: "Horizon Prep Academy", amount: 15000, date: "2026-05-01", status: "Pending", plan: "Enterprise Premium" }
  ])

  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const handleCollectNow = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.invoiceId === invoiceId ? { ...inv, status: "Paid" as const } : inv
    ))
    toast({
      title: "Invoice Cleared ✓",
      description: `Invoice ${invoiceId} has been marked as paid.`
    })
  }

  const collectedSaaS = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingSaaS = invoices.filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.amount, 0)

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || inv.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-headline font-bold text-foreground">SaaS Platform Billing</h1>
        <p className="text-xs text-muted-foreground">Monitor platform monthly recurring revenue (MRR), subscription collections, and invoices.</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Licensing MRR</span>
              <p className="text-2xl font-bold">₹45,000</p>
            </div>
            <div className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Total Collected</span>
              <p className="text-2xl font-bold text-emerald-600">₹{collectedSaaS.toLocaleString()}</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Pending Invoices</span>
              <p className="text-2xl font-bold text-amber-600">₹{pendingSaaS.toLocaleString()}</p>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Active Plans</span>
              <p className="text-2xl font-bold">{TENANTS.length} Premium</p>
            </div>
            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <CreditCard className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Invoices */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices by tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border rounded-xl text-xs px-3 h-9 font-semibold text-muted-foreground focus:ring-0 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl flex items-center gap-1 text-xs"
            onClick={() => {
              toast({
                title: "Report Downloaded",
                description: "Licensing ledger exported successfully."
              })
            }}
          >
            <Download className="size-3.5" /> Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Invoice list */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/20 text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">Invoice ID</th>
                  <th className="p-4 font-bold">Coaching Institute</th>
                  <th className="p-4 font-bold">Billing Date</th>
                  <th className="p-4 font-bold">Plan Details</th>
                  <th className="p-4 font-bold">SaaS Fee</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(inv => (
                  <tr key={inv.invoiceId} className="hover:bg-muted/5 transition-all">
                    <td className="p-4 font-semibold text-muted-foreground">{inv.invoiceId}</td>
                    <td className="p-4 font-bold text-foreground">{inv.tenantName}</td>
                    <td className="p-4 text-muted-foreground">{inv.date}</td>
                    <td className="p-4 font-medium">{inv.plan}</td>
                    <td className="p-4 font-bold text-foreground">₹{inv.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge className={cn(
                        inv.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {inv.status === "Pending" ? (
                        <Button
                          size="sm"
                          onClick={() => handleCollectNow(inv.invoiceId)}
                          className="h-7 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded-lg"
                        >
                          Collect
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

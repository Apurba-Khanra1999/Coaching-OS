"use client"

import * as React from "react"
import {
  Activity, Search, ShieldCheck, Database, FileText, AlertCircle,
  Download, RefreshCw, Filter, ShieldAlert, Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SystemLog {
  id: string
  timestamp: string
  level: "INFO" | "WARNING" | "ERROR" | "SECURITY"
  tenantId: string
  message: string
  module: string
}

export default function SystemLogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = React.useState<SystemLog[]>([
    { id: "LOG-901", timestamp: "2026-06-19 04:32:11 PM", level: "SECURITY", tenantId: "inst_001", message: "User Admin logged in from IP 192.168.1.15", module: "AUTH" },
    { id: "LOG-902", timestamp: "2026-06-19 04:28:45 PM", level: "INFO", tenantId: "inst_002", message: "Student record Sarah Apex (id: 2) updated successfully", module: "STUDENTS" },
    { id: "LOG-903", timestamp: "2026-06-19 04:15:30 PM", level: "INFO", tenantId: "inst_001", message: "UPI Payment OTXN-101 of ₹5,000 processed", module: "PAYMENTS" },
    { id: "LOG-904", timestamp: "2026-06-19 03:55:00 PM", level: "WARNING", tenantId: "inst_003", message: "Database read latency spike: 230ms in region aws-ap-south-1", module: "DATABASE" },
    { id: "LOG-905", timestamp: "2026-06-19 03:10:12 PM", level: "ERROR", tenantId: "inst_002", message: "Failed to upload teacher avatar: S3 permission error", module: "UPLOADS" },
    { id: "LOG-906", timestamp: "2026-06-19 02:45:10 PM", level: "SECURITY", tenantId: "GLOBAL", message: "Global DB snapshot backup completed", module: "SYSTEM" },
    { id: "LOG-907", timestamp: "2026-06-19 01:30:15 PM", level: "INFO", tenantId: "inst_003", message: "Class scheduling generated for Horizon Alpha", module: "SCHEDULE" }
  ])

  const [searchTerm, setSearchTerm] = React.useState("")
  const [levelFilter, setLevelFilter] = React.useState("all")

  const filtered = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.module.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level.toLowerCase() === levelFilter.toLowerCase()
    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Global System Audit Logs</h1>
          <p className="text-xs text-muted-foreground">Inspect real-time operations, error reports, databases transactions, and authentication security logs.</p>
        </div>
        <Button
          size="sm"
          className="rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5"
          onClick={() => {
            toast({
              title: "System Logs Exported",
              description: "Full audit trail downloaded in CSV format."
            })
          }}
        >
          <Download className="size-4" /> Download Audit Trail
        </Button>
      </div>

      {/* Log Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Global DB Queries</span>
              <p className="text-2xl font-bold">12,492 / hr</p>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Database className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Security Checks</span>
              <p className="text-2xl font-bold text-emerald-600">Passed</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Warnings</span>
              <p className="text-2xl font-bold text-amber-600">1 Active</p>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">API Exceptions</span>
              <p className="text-2xl font-bold text-red-500">0</p>
            </div>
            <div className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and logs list */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search audit trail message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl text-xs"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-background border rounded-xl text-xs px-3 h-9 font-semibold text-muted-foreground focus:ring-0 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="info">INFO</option>
              <option value="warning">WARNING</option>
              <option value="error">ERROR</option>
              <option value="security">SECURITY</option>
            </select>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground uppercase">
            Showing {filtered.length} of {logs.length} logs
          </Badge>
        </CardContent>
      </Card>

      {/* Logs Event Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/20 text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">Event ID</th>
                  <th className="p-4 font-bold">Timestamp</th>
                  <th className="p-4 font-bold">Level</th>
                  <th className="p-4 font-bold">Tenant</th>
                  <th className="p-4 font-bold">Module</th>
                  <th className="p-4 font-bold">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-muted/5 transition-all">
                    <td className="p-4 text-muted-foreground">{log.id}</td>
                    <td className="p-4 text-muted-foreground">{log.timestamp}</td>
                    <td className="p-4">
                      <Badge className={cn(
                        "text-[9px] font-bold",
                        log.level === "INFO" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        log.level === "WARNING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        log.level === "ERROR" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-purple-50 text-purple-700 border-purple-200"
                      )}>
                        {log.level}
                      </Badge>
                    </td>
                    <td className="p-4 font-semibold text-primary">{log.tenantId}</td>
                    <td className="p-4 font-medium text-foreground">{log.module}</td>
                    <td className="p-4 text-foreground font-sans">{log.message}</td>
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

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Calendar,
  DollarSign,
  Activity,
  ChevronRight,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Bookmark,
  Award,
  Shield,
  FileText,
  BarChart3,
  Building2,
  Database,
  CalendarDays,
  Layers
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  AreaChart,
  Area
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  getActiveRole,
  getActiveTenant,
  getScopedData,
  mockStudentsGenerator,
  mockTeachersGenerator,
  mockBatchesGenerator,
  mockFeesLedgerGenerator,
  mockExpensesGenerator,
  mockPayrollGenerator,
  mockLeavesGenerator,
  mockAttendanceGenerator,
  TENANTS,
  ROLES
} from "@/lib/tenant"
import SaasLandingPage from "@/components/saas-landing-page"

// --- Performance Chart Data ---
const performanceData = [
  { month: "Jan", students: 850, revenue: 92000, attendance: 91 },
  { month: "Feb", students: 920, revenue: 98000, attendance: 93 },
  { month: "Mar", students: 990, revenue: 104000, attendance: 92 },
  { month: "Apr", students: 1080, revenue: 115000, attendance: 94 },
  { month: "May", students: 1180, revenue: 121000, attendance: 95 },
  { month: "Jun", students: 1248, revenue: 124500, attendance: 94 },
]

// --- Super Admin Chart Data ---
const saRevenueData = [
  { month: "Jan", platformRevenue: 15000, activeInstitutes: 1 },
  { month: "Feb", platformRevenue: 15000, activeInstitutes: 1 },
  { month: "Mar", platformRevenue: 30000, activeInstitutes: 2 },
  { month: "Apr", platformRevenue: 30000, activeInstitutes: 2 },
  { month: "May", platformRevenue: 45000, activeInstitutes: 3 },
  { month: "Jun", platformRevenue: 45000, activeInstitutes: 3 },
]

// --- Parent Portal Test Score Data ---
const childAcademicData = [
  { test: "Test 1", score: 78 },
  { test: "Test 2", score: 85 },
  { test: "Test 3", score: 92 },
  { test: "Test 4", score: 88 },
  { test: "Final Exam", score: 95 },
]

export default function DashboardPage() {
  const [greeting, setGreeting] = React.useState("Welcome Back")
  const [activeRole, setActiveRole] = React.useState<string>("owner")
  const [activeTenant, setActiveTenant] = React.useState<string>("inst_001")
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false)
  const [mounted, setMounted] = React.useState(false)
  const [chartTab, setChartTab] = React.useState<"students" | "revenue" | "attendance">("students")

  React.useEffect(() => {
    const loggedIn = localStorage.getItem("tuitionflow_logged_in") === "true"
    setIsLoggedIn(loggedIn)
    setActiveRole(getActiveRole())
    setActiveTenant(getActiveTenant())
    setMounted(true)

    const hrs = new Date().getHours()
    if (hrs < 12) setGreeting("Good Morning")
    else if (hrs < 17) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading Platform Workspace...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <SaasLandingPage />
  }

  // Route to the appropriate dashboard component
  switch (activeRole) {
    case "super_admin":
      return <SuperAdminDashboard greeting={greeting} />
    case "teacher":
      return <TeacherDashboard greeting={greeting} activeTenant={activeTenant} />
    case "student":
      return <StudentDashboard greeting={greeting} activeTenant={activeTenant} />
    case "parent":
      return <ParentDashboard greeting={greeting} activeTenant={activeTenant} />
    case "owner":
    default:
      return (
        <OwnerDashboard
          greeting={greeting}
          activeTenant={activeTenant}
          chartTab={chartTab}
          setChartTab={setChartTab}
        />
      )
  }
}

// ============================================================================
// 1. SUPER ADMIN PLATFORM HUB DASHBOARD
// ============================================================================
function SuperAdminDashboard({ greeting }: { greeting: string }) {
  const institutesCount = TENANTS.length
  const platformRevenue = institutesCount * 15000 // SaaS subscription monthly

  const systemLogs = [
    { id: 1, type: "billing", message: "Auto-billing processed successfully for Coaching OS Academy", time: "1 hour ago", category: "success" },
    { id: 2, type: "settings", message: "Domain Mapping modified for Apex Science Institute (inst_002)", time: "4 hours ago", category: "info" },
    { id: 3, type: "security", message: "Weekly full platform database backup verified", time: "12 hours ago", category: "success" },
    { id: 4, type: "tenant", message: "New Tenant Registration: Horizon Prep Academy initialized", time: "1 day ago", category: "warning" },
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Super Admin Glassmorphic Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
              <Shield className="size-3" /> Root Platform Access Control
            </span>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              {greeting}, Super Admin 👑
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              You are logged into the global control panel. Monitor SaaS registrations, system resource states, platform licensing income, and security audits across all sub-tenants.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/super-admin/institutes">
              <Button size="sm" className="rounded-xl shadow-md bg-red-600 hover:bg-red-500 text-white">
                Manage Institutes
              </Button>
            </Link>
            <Link href="/super-admin/logs">
              <Button size="sm" variant="outline" className="rounded-xl border-red-500/30 text-red-500 hover:bg-red-500/10">
                View System Audit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SaaS Global Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Tenants"
          value={institutesCount}
          trend="Stable"
          trendDirection="neutral"
          subtext="3 Premium Tiers"
          icon={Building2}
          progress={100}
        />
        <StatCard
          title="Platform Monthly Income"
          value={`₹${platformRevenue.toLocaleString()}`}
          trend="+50%"
          trendDirection="up"
          subtext="₹15k/month base per tenant"
          icon={CreditCard}
          progress={100}
        />
        <StatCard
          title="Global Students Count"
          value="3,124"
          trend="+18%"
          trendDirection="up"
          subtext="Platform-wide active accounts"
          icon={Users}
          progress={75}
        />
        <StatCard
          title="Server Health Status"
          value="99.98%"
          trend="Healthy"
          trendDirection="up"
          subtext="All systems operational"
          icon={Database}
          progress={99.9}
        />
      </div>

      {/* Platform Chart & Sub-Tenants Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-bold">Platform SaaS Income Growth</CardTitle>
            <CardDescription>Visualizing Monthly platform subscription revenues & active tenants</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={saRevenueData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSaRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="platformRevenue" name="SaaS Revenue" stroke="rgb(239, 68, 68)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operational System Logs */}
        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
              <Activity className="size-4 text-red-500" /> Platform Audit Trail
            </CardTitle>
            <CardDescription>Live database and licensing security events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 space-y-4 max-h-[220px] overflow-y-auto pb-4">
              {systemLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className={cn("size-2 rounded-full mt-1.5 shrink-0",
                    log.category === "success" ? "bg-emerald-500" : log.category === "warning" ? "bg-amber-500" : "bg-blue-500"
                  )} />
                  <div>
                    <p className="font-semibold text-foreground">{log.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Tenants List */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-base font-bold">Sub-Tenant Licensing Directory</CardTitle>
          <CardDescription>Manage active coaching institute workspaces on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2.5 font-bold">Tenant ID</th>
                  <th className="py-2.5 font-bold">Institute Name</th>
                  <th className="py-2.5 font-bold">Billing Cycle</th>
                  <th className="py-2.5 font-bold">Pricing Tier</th>
                  <th className="py-2.5 font-bold">Subscribed Date</th>
                  <th className="py-2.5 font-bold">SaaS Fee</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {TENANTS.map(t => (
                  <tr key={t.id} className="hover:bg-muted/10">
                    <td className="py-3 font-semibold text-primary">{t.id}</td>
                    <td className="py-3 font-bold">{t.name}</td>
                    <td className="py-3"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge></td>
                    <td className="py-3 font-medium">Enterprise Premium</td>
                    <td className="py-3 text-muted-foreground">Jan 10, 2024</td>
                    <td className="py-3 font-semibold text-foreground">₹15,000 / mo</td>
                    <td className="py-3 text-right">
                      <Link href="/super-admin/institutes">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg">
                          Configure
                        </Button>
                      </Link>
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

// ============================================================================
// 2. TEACHER DASHBOARD PORTAL
// ============================================================================
function TeacherDashboard({ greeting, activeTenant }: { greeting: string; activeTenant: string }) {
  const teacherName = "Prof. Sarah Smith"
  const batches = getScopedData<any[]>("batches", mockBatchesGenerator)
  const payroll = getScopedData<any[]>("payroll", mockPayrollGenerator)
  const leaves = getScopedData<any[]>("leaves", mockLeavesGenerator)
  
  // Filter batches assigned to this teacher
  const assignedBatches = batches.filter(b => b.teacher.includes("Sarah") || b.teacher.includes("Priya") || b.teacher.includes("Apex") || b.teacher.includes("Horizon"))
  const salaryRecord = payroll.find(p => p.teacherName.includes("Sarah") || p.teacherName.includes("Priya") || p.teacherName.includes("Apex") || p.teacherName.includes("Horizon"))
  const leaveCount = leaves.filter(l => l.status === "Approved").reduce((sum, l) => sum + l.days, 0)

  const mockTeacherClasses = [
    { id: 1, batch: assignedBatches[0]?.name || "Batch Alpha", time: "09:00 AM - 10:30 AM", subject: "Mathematics", room: "Room 102", status: "completed" },
    { id: 2, batch: assignedBatches[1]?.name || "Batch Gamma", time: "06:00 PM - 07:30 PM", subject: "Advanced Math", room: "Lab A", status: "upcoming" }
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Teacher Welcoming Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
              <Sparkles className="size-3" /> Teacher Portal Dashboard
            </span>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              {greeting}, {teacherName} 👋
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              You are assigned to <span className="font-semibold text-foreground">{assignedBatches.length} active batches</span>. You have <span className="font-semibold text-foreground">1 upcoming class</span> left for today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/attendance">
              <Button size="sm" className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-500 text-white">
                Take Attendance
              </Button>
            </Link>
            <Link href="/hr">
              <Button size="sm" variant="outline" className="rounded-xl bg-background/50 hover:bg-background">
                Apply Leave
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Teacher Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Batches"
          value={assignedBatches.length}
          trend="Active"
          trendDirection="up"
          subtext="Total academic programs"
          icon={Layers}
          progress={100}
        />
        <StatCard
          title="Classes Today"
          value={mockTeacherClasses.length}
          trend={`${mockTeacherClasses.filter(c=>c.status==="completed").length} Completed`}
          trendDirection="up"
          subtext="1 pending scheduled class"
          icon={CalendarCheck}
          progress={50}
        />
        <StatCard
          title="Current Payroll Pay"
          value={`₹${salaryRecord ? salaryRecord.netAmount.toLocaleString() : "45,000"}`}
          trend={salaryRecord ? salaryRecord.status : "Processing"}
          trendDirection="neutral"
          subtext="Net Salary (June)"
          icon={CreditCard}
          progress={salaryRecord?.status === "Paid" ? 100 : 75}
        />
        <StatCard
          title="Approved Leaves"
          value={`${leaveCount} Days`}
          trend="Leaves Balance"
          trendDirection="neutral"
          subtext="10 Days remaining in cycle"
          icon={Calendar}
          progress={80}
        />
      </div>

      {/* Timetable & Assigned Batches Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Classes Scheduled Today */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold">My Timetable Today</CardTitle>
            <CardDescription>Mark attendance and check timings for your lectures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-border/30">
              {mockTeacherClasses.map(cls => (
                <div key={cls.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold leading-none">{cls.batch} · {cls.subject}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> {cls.time} | Room: {cls.room}
                    </p>
                  </div>
                  <div>
                    {cls.status === "completed" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Batches Performance */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
              <Award className="size-4 text-indigo-500" /> Assigned Batches Overview
            </CardTitle>
            <CardDescription>Academic and syllabus completion tracks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {assignedBatches.map(b => (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">{b.name} ({b.subject})</span>
                    <span>{b.studentsCount} Students</span>
                  </div>
                  <Progress value={78} className="h-1.5 bg-secondary" />
                  <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                    <span>Syllabus Completed: 78%</span>
                    <span>Attd Avg: 96%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// 3. STUDENT PORTAL DASHBOARD
// ============================================================================
function StudentDashboard({ greeting, activeTenant }: { greeting: string; activeTenant: string }) {
  const studentName = "Sarah Smith"
  const studentId = "1"
  const batches = getScopedData<any[]>("batches", mockBatchesGenerator)
  const ledger = getScopedData<any[]>("fees_ledger", mockFeesLedgerGenerator)
  const attendanceLogs = getScopedData<any>("attendance_data", mockAttendanceGenerator)

  const myBatches = batches.slice(0, 1) // Slice to get first batch (Batch Alpha)
  const unpaidInvoice = ledger.find(txn => txn.studentId === studentId && txn.status === "Pending")
  const totalPaid = ledger.filter(txn => txn.studentId === studentId && txn.status === "Paid").reduce((sum, txn) => sum + Number(txn.amount), 0)

  // Compute attendance percentage
  const totalDays = Object.keys(attendanceLogs).length
  const presentDays = Object.values(attendanceLogs).filter((day: any) => day[studentId] === "Present" || day[studentId] === "Late").length
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 96.4

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Student Welcoming Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <Sparkles className="size-3" /> Student Portal Hub
            </span>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              {greeting}, {studentName} 🎓
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Check your attendance logs, outstanding tuition fees invoices, batch announcements, and class timings for today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/fees">
              <Button size="sm" className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-500 text-white">
                Pay Outstanding Fees
              </Button>
            </Link>
            <Link href="/schedule">
              <Button size="sm" variant="outline" className="rounded-xl bg-background/50 hover:bg-background">
                View Calendar Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Student Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate.toFixed(1)}%`}
          trend="Excellent"
          trendDirection="up"
          subtext={`${presentDays} classes attended`}
          icon={CalendarCheck}
          progress={attendanceRate}
        />
        <StatCard
          title="My Batches"
          value={myBatches.length}
          trend="Enrolled"
          trendDirection="up"
          subtext={myBatches[0]?.name || "Batch Alpha"}
          icon={Layers}
          progress={100}
        />
        <StatCard
          title="Fees Due Invoice"
          value={unpaidInvoice ? `₹${unpaidInvoice.amount.toLocaleString()}` : "₹0"}
          trend={unpaidInvoice ? "Pending" : "Cleared"}
          trendDirection={unpaidInvoice ? "down" : "up"}
          subtext={unpaidInvoice ? "Payable online" : "No outstanding bills"}
          icon={CreditCard}
          progress={unpaidInvoice ? 20 : 100}
        />
        <StatCard
          title="Academic Ranking"
          value="3rd (Top 10%)"
          trend="Consistent"
          trendDirection="up"
          subtext="A+ Average grade"
          icon={Award}
          progress={90}
        />
      </div>

      {/* Classes & Financial Portal Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Classes Scheduled Today */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold">My Lecture Schedule Today</CardTitle>
            <CardDescription>Always be on time! Here are your lectures for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl border border-border/40 bg-muted/5 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold leading-none">{myBatches[0]?.name || "Batch Alpha"} · {myBatches[0]?.subject || "Mathematics"}</h4>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> {myBatches[0]?.timing || "09:00 AM - 10:30 AM"} | Faculty: {myBatches[0]?.teacher || "Dr. Priya Sharma"}
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
            </div>
            <div className="text-xs text-muted-foreground font-medium px-1 flex items-center gap-1">
              <AlertCircle className="size-3 text-primary" /> Next test scheduled: June 25, 2026 - Algebra I.
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Invoice Portal */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
              <DollarSign className="size-4 text-emerald-500" /> Fees Billing Portal
            </CardTitle>
            <CardDescription>Make immediate UPI QR code payments and check transactions history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unpaidInvoice ? (
              <div className="p-4 rounded-xl border border-amber-200/50 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Pending Invoice</span>
                  <h4 className="text-sm font-bold mt-1">June Fees - Batch Alpha</h4>
                  <p className="text-xs text-muted-foreground">Amount Due: <span className="font-bold text-foreground">₹{unpaidInvoice.amount.toLocaleString()}</span></p>
                </div>
                <Link href="/fees">
                  <Button size="sm" className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                    Pay Online
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200/50 bg-emerald-500/5 flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">All Fees Cleared!</h4>
                  <p className="text-[10px] text-muted-foreground">You have paid all current month tuition fee bills. Thank you!</p>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Total Paid to Date:</span>
              <span className="font-bold text-foreground">₹{totalPaid.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// 4. PARENT PORTAL DASHBOARD
// ============================================================================
function ParentDashboard({ greeting, activeTenant }: { greeting: string; activeTenant: string }) {
  const childName = "Sarah Smith"
  const studentId = "1"
  const batches = getScopedData<any[]>("batches", mockBatchesGenerator)
  const ledger = getScopedData<any[]>("fees_ledger", mockFeesLedgerGenerator)
  const attendanceLogs = getScopedData<any>("attendance_data", mockAttendanceGenerator)

  const childBatches = batches.slice(0, 1)
  const unpaidInvoice = ledger.find(txn => txn.studentId === studentId && txn.status === "Pending")

  // Compute attendance percentage
  const totalDays = Object.keys(attendanceLogs).length
  const presentDays = Object.values(attendanceLogs).filter((day: any) => day[studentId] === "Present" || day[studentId] === "Late").length
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 96.4

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Parent Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-pink-500/5 to-transparent p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
              <Users className="size-3" /> Parent Dashboard Portal
            </span>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              {greeting}, Parent Account 👋
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Monitoring workspace profile for child: <span className="font-bold text-foreground">{childName}</span>. Check their mock test charts, pending bills, and calendar classes below.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {unpaidInvoice && (
              <Link href="/fees">
                <Button size="sm" className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-500 text-white">
                  Pay Child Invoice (₹{unpaidInvoice.amount.toLocaleString()})
                </Button>
              </Link>
            )}
            <Link href="/schedule">
              <Button size="sm" variant="outline" className="rounded-xl bg-background/50 hover:bg-background">
                View Calendar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Parent Monitor Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Child Attendance"
          value={`${attendanceRate.toFixed(1)}%`}
          trend="Good"
          trendDirection="up"
          subtext={`${presentDays} lectures present`}
          icon={CalendarCheck}
          progress={attendanceRate}
        />
        <StatCard
          title="Enrolled Batches"
          value={childBatches.length}
          trend="Academic Program"
          trendDirection="neutral"
          subtext={childBatches[0]?.name || "Batch Alpha"}
          icon={Layers}
          progress={100}
        />
        <StatCard
          title="Outstanding Invoice"
          value={unpaidInvoice ? `₹${unpaidInvoice.amount.toLocaleString()}` : "₹0"}
          trend={unpaidInvoice ? "Due" : "Cleared"}
          trendDirection={unpaidInvoice ? "down" : "up"}
          subtext={unpaidInvoice ? "Payable immediately" : "All clear"}
          icon={CreditCard}
          progress={unpaidInvoice ? 20 : 100}
        />
        <StatCard
          title="Latest Grade Score"
          value="95% (Final Exam)"
          trend="Excellent"
          trendDirection="up"
          subtext="Advanced Mathematics"
          icon={Award}
          progress={95}
        />
      </div>

      {/* Child Performance & Quick Bills Portal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Child Mock Test Performance */}
        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold">Child Academic Progress</CardTitle>
            <CardDescription>Mock test series scores tracking (Space Grotesk Syllabus)</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={childAcademicData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="test" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" name="Marks Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Timetable & Billing Widget */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Lecture Timing */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base font-bold">Child Lecture Timing</CardTitle>
              <CardDescription>Live classroom scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold leading-none">{childName} · Math Class</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {childBatches[0]?.timing || "09:00 AM - 10:30 AM"} | Room 102
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Pay Invoice */}
          <Card className="border-none shadow-sm flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base font-bold">Pending Tuition Invoices</CardTitle>
              <CardDescription>Process QR or UPI pay directly</CardDescription>
            </CardHeader>
            <CardContent>
              {unpaidInvoice ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border border-red-500/20 bg-red-500/5 rounded-xl">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">June Tuition Fees Invoice</p>
                    <p className="text-[10px] text-muted-foreground">Due: ₹{unpaidInvoice.amount.toLocaleString()}</p>
                  </div>
                  <Link href="/fees">
                    <Button size="sm" className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8">
                      Pay Bill Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-emerald-200/50 bg-emerald-500/5 flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold">All child invoices are fully paid. Thank you!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 5. MAIN INSTITUTE OWNER DASHBOARD (EXISTING REDESIGNED VIEW)
// ============================================================================
interface OwnerDashboardProps {
  greeting: string
  activeTenant: string
  chartTab: "students" | "revenue" | "attendance"
  setChartTab: React.Dispatch<React.SetStateAction<"students" | "revenue" | "attendance">>
}

function OwnerDashboard({ greeting, activeTenant, chartTab, setChartTab }: OwnerDashboardProps) {
  // Load dynamic counts from scoped localStorage arrays to ensure multi-tenant works dynamically
  const studentsList = getScopedData<any[]>("students", mockStudentsGenerator)
  const teachersList = getScopedData<any[]>("teachers", mockTeachersGenerator)
  const batchesList = getScopedData<any[]>("batches", mockBatchesGenerator)
  const ledgerList = getScopedData<any[]>("fees_ledger", mockFeesLedgerGenerator)

  const activeStudentsCount = studentsList.filter(s => s.status === "Active").length
  const activeTeachersCount = teachersList.filter(t => t.status === "Active").length
  const totalRevenue = ledgerList.filter(txn => txn.status === "Paid").reduce((sum, txn) => sum + Number(txn.amount), 0)
  
  // Custom categories for expenses breakdown
  const expenseCategories = [
    { category: "Teacher Salaries", amount: `₹${(activeTeachersCount * 45000).toLocaleString()}`, pct: 60, color: "bg-primary" },
    { category: "Rent & Utilities", amount: "₹60,000", pct: 25, color: "bg-accent" },
    { category: "Marketing & Admins", amount: "₹36,000", pct: 15, color: "bg-emerald-500" },
  ]

  const mockTodayClasses = [
    { id: 1, batch: batchesList[0]?.name || "Batch Alpha Morning", time: "09:00 AM - 10:30 AM", teacher: batchesList[0]?.teacher || "Prof. Sarah Smith", subject: batchesList[0]?.subject || "Mathematics", status: "completed" },
    { id: 2, batch: batchesList[1]?.name || "Batch Beta Evening", time: "04:00 PM - 05:30 PM", teacher: batchesList[1]?.teacher || "Dr. Alex Brown", subject: batchesList[1]?.subject || "Physics", status: "live" },
    { id: 3, batch: batchesList[2]?.name || "Batch Gamma Chemistry", time: "06:00 PM - 07:30 PM", teacher: batchesList[2]?.teacher || "Anita Desai", subject: batchesList[2]?.subject || "Chemistry", status: "upcoming" },
  ]

  const quickActions = [
    { label: "New Admission", href: "/students", icon: Plus, desc: "Add student record", color: "text-primary bg-primary/10 border-primary/20 hover:bg-primary/20" },
    { label: "Mark Attendance", href: "/attendance", icon: Calendar, desc: "Take class logs", color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
    { label: "Collect Fees", href: "/fees", icon: DollarSign, desc: "Record new payments", color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
    { label: "Send broadcast", href: "/communications", icon: MessageSquare, desc: "WhatsApp, Email & App", color: "text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100" },
  ]

  const recentActivity = [
    { id: 1, type: 'admission', user: studentsList[0]?.name || 'James Wilson', detail: `Enrolled in ${batchesList[0]?.name || 'Batch Alpha'} — Chemistry`, time: '10 mins ago', initials: 'JW' },
    { id: 2, type: 'payment', user: studentsList[1]?.name || 'Sarah Smith', detail: `Paid tuition fees of ₹${ledgerList[0]?.amount.toLocaleString() || '5,200'}`, time: '45 mins ago', initials: 'SS' },
    { id: 3, type: 'leave', user: teachersList[0]?.name || 'Anita Desai (Teacher)', detail: 'Applied for Casual Leave (2 days)', time: '2 hours ago', initials: 'AD' },
    { id: 4, type: 'expense', user: 'Admin Office', detail: 'Recorded expense: Lab Equipment ₹8,500', time: '4 hours ago', initials: 'AO' },
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Dynamic Glassmorphic Greeting Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles className="size-3" /> Live Analytics Hub
              </span>
            </div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">
              {greeting}, Owner 👋
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Workspace analytics are operating smoothly today. You have <span className="font-semibold text-foreground">1 live class</span> running, <span className="font-semibold text-foreground">{batchesList.length} total programs</span>, and <span className="font-semibold text-foreground">94% attendance</span> marked.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/attendance">
              <Button size="sm" variant="outline" className="rounded-xl bg-background/50 hover:bg-background">
                View Schedule
              </Button>
            </Link>
            <Link href="/notifications">
              <Button size="sm" className="rounded-xl shadow-md shadow-primary/10">
                Trigger Alerts
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-primary/10 to-transparent pointer-events-none opacity-50" />
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Students"
          value={activeStudentsCount}
          trend="+12%"
          trendDirection="up"
          subtext={`${studentsList.length} Total Accounts`}
          icon={Users}
          progress={75}
        />
        <StatCard
          title="Today's Attendance"
          value="94.2%"
          trend="+2.1%"
          trendDirection="up"
          subtext="1,173 Present · 75 Absent"
          icon={CalendarCheck}
          progress={94.2}
        />
        <StatCard
          title="Revenue (June)"
          value={`₹${totalRevenue.toLocaleString()}`}
          trend="+8.3%"
          trendDirection="up"
          subtext="82% of monthly target met"
          icon={CreditCard}
          progress={82}
        />
        <StatCard
          title="Active Batches"
          value={batchesList.length}
          trend="Stable"
          trendDirection="neutral"
          subtext={`Avg ${Math.round(activeStudentsCount / (batchesList.length || 1))} students/batch`}
          icon={TrendingUp}
          progress={90}
        />
      </div>

      {/* Main Bento Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Interactive Charts Hub (2 columns) */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-lg font-bold">Academic & Financial Hub</CardTitle>
                <CardDescription>Track growth metrics, revenue flows and classroom attendance</CardDescription>
              </div>
              <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setChartTab("students")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    chartTab === "students" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Students
                </button>
                <button
                  onClick={() => setChartTab("revenue")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    chartTab === "revenue" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartTab("attendance")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    chartTab === "attendance" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Attendance
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === "students" ? (
                  <AreaChart data={performanceData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'inherit' }}
                      labelClassName="font-bold text-xs"
                    />
                    <Area type="monotone" dataKey="students" name="Enrolled Students" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudents)" />
                  </AreaChart>
                ) : chartTab === "revenue" ? (
                  <BarChart data={performanceData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelClassName="font-bold text-xs"
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} barSize={38} />
                  </BarChart>
                ) : (
                  <LineChart data={performanceData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelClassName="font-bold text-xs"
                      formatter={(value) => [`${value}%`, "Avg Attendance"]}
                    />
                    <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#10b981" strokeWidth={3} dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="border-t border-border/40 bg-muted/10 px-6 py-3 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5 font-medium"><Activity className="size-3.5 text-primary" /> Live calculations updated at 12:45 PM</span>
            <span className="font-bold text-primary flex items-center gap-0.5 cursor-pointer hover:underline">Full Reports <ArrowRight className="size-3" /></span>
          </div>
        </Card>

        {/* Operational Side-Panel (1 column) */}
        <div className="space-y-6 flex flex-col">
          {/* Quick Shortcuts */}
          <Card className="border-none shadow-sm flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base font-bold">Quick Administrative Tools</CardTitle>
              <CardDescription>Direct navigation shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href} className="block">
                    <div className={cn("p-3 rounded-xl border border-border/30 flex flex-col gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm", action.color)}>
                      <action.icon className="size-5" />
                      <div>
                        <p className="text-xs font-bold leading-tight">{action.label}</p>
                        <p className="text-[9px] opacity-80 mt-0.5 line-clamp-1">{action.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Classes Timetable */}
          <Card className="border-none shadow-sm flex-1">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-headline text-base font-bold">Today's Schedule</CardTitle>
                <CardDescription>Live timetable overview</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase py-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30 max-h-[220px] overflow-y-auto px-6">
                {mockTodayClasses.map((cls) => (
                  <div key={cls.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold leading-none">{cls.batch}</h4>
                        <span className="text-[9px] text-muted-foreground">· {cls.subject}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3 shrink-0" /> {cls.time}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Faculty: {cls.teacher}</p>
                    </div>
                    <div>
                      {cls.status === "completed" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-50 text-[9px] font-bold">Completed</Badge>
                      ) : cls.status === "live" ? (
                        <Badge className="bg-red-50 text-red-700 border-red-200/50 hover:bg-red-50 text-[9px] font-bold animate-pulse flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-red-500" /> Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] font-bold">Upcoming</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Expense Breakdown Insights */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
              <DollarSign className="size-4 text-primary" /> Monthly Expense Health
            </CardTitle>
            <CardDescription>Operational cost distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {expenseCategories.map((exp) => (
                <div key={exp.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">{exp.category}</span>
                    <span>{exp.amount} <span className="text-[10px] text-muted-foreground">({exp.pct}%)</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", exp.color)} style={{ width: `${exp.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
              <span>Financial Status</span>
              <span className="text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="size-3" /> Within Budget
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
              <Activity className="size-4 text-primary" /> Live Activity Feed
            </CardTitle>
            <CardDescription>Real-time events at Coaching OS</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 space-y-4 max-h-[190px] overflow-y-auto pb-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-xs">
                  <Avatar className="size-7 shrink-0 border border-border/30">
                    <AvatarFallback className="text-[9px] font-bold bg-muted-foreground/10 text-muted-foreground">
                      {activity.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground leading-none">{activity.user}</span>
                      <span className="text-[9px] text-muted-foreground font-medium">{activity.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-normal">{activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batch Quality Standing Leaderboard */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
              <Award className="size-4 text-primary" /> Batch Performance Rank
            </CardTitle>
            <CardDescription>Academic and attendance performance leaderboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: batchesList[0]?.name || "Batch Alpha", attendance: "98%", avgScore: "85%", color: "hsl(var(--primary))" },
                { title: batchesList[1]?.name || "Batch Beta", attendance: "92%", avgScore: "78%", color: "hsl(var(--accent))" },
                { title: batchesList[2]?.name || "Batch Gamma", attendance: "88%", avgScore: "82%", color: "#10b981" },
                { title: batchesList[3]?.name || "Batch Delta", attendance: "94%", avgScore: "88%", color: "#f59e0b" },
              ].map((batch) => (
                <div key={batch.title} className="p-3 rounded-xl border border-border/40 bg-muted/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: batch.color }} />
                    <h4 className="text-xs font-bold leading-none truncate">{batch.title}</h4>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Attd: <span className="font-bold text-foreground">{batch.attendance}</span></span>
                    <span className="text-muted-foreground">Avg: <span className="font-bold text-foreground">{batch.avgScore}</span></span>
                  </div>
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: batch.attendance, backgroundColor: batch.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// HELPER CARD COMPONENT
// ============================================================================
function StatCard({ title, value, trend, trendDirection, subtext, icon: Icon, progress }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
      <CardContent className="p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
            <p className="text-xl md:text-2xl font-bold leading-none tracking-tight">{value}</p>
          </div>
          <div className="size-9 md:size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0 shadow-sm">
            <Icon className="size-4 md:size-5" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-muted-foreground leading-none">{subtext}</span>
            {trend !== "Stable" && (
              <span className={cn("px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5 shrink-0",
                trendDirection === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}>
                {trendDirection === "up" ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

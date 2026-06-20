"use client"

import * as React from "react"
import {
  CalendarCheck,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
  Clock,
  Save,
  RotateCcw,
  CheckCircle,
  Sparkles,
  BarChart3,
  CalendarDays,
  Filter,
  TrendingUp,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { getScopedData, setScopedData, mockStudentsGenerator, mockAttendanceGenerator, getActiveRole } from "@/lib/tenant"

// --- Data ---
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface Student {
  id: number
  name: string
  roll: string
  batch: string
  status: "Not Marked" | "Present" | "Absent" | "Late"
}

const batches = [
  { value: "all", label: "All Batches", color: "bg-primary" },
  { value: "batch-alpha", label: "Batch Alpha — Math", color: "bg-indigo-500" },
  { value: "batch-beta", label: "Batch Beta — Physics", color: "bg-emerald-500" },
  { value: "batch-gamma", label: "Batch Gamma — Chemistry", color: "bg-amber-500" },
]

// Helper: Get calendar grid for a month
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: { date: number; month: number; year: number; isCurrentMonth: boolean; dateStr: string }[] = []

  // Fill previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    days.push({ date: d, month: m, year: y, isCurrentMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` })
  }

  // Fill current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: d, month, year, isCurrentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` })
  }

  // Fill next month's leading days to complete the grid (always 42 cells = 6 rows)
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    days.push({ date: d, month: m, year: y, isCurrentMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` })
  }

  return days
}

// Helper: Get attendance summary for a date
function getDateAttendanceSummary(dateStr: string, attendanceData: Record<string, Record<string, string>>) {
  const data = attendanceData[dateStr]
  if (!data) return null
  const values = Object.values(data)
  const present = values.filter(v => v === "Present" || v === "Late").length
  const total = values.length
  const ratio = present / (total || 1)
  return { present, total, ratio }
}

export default function AttendancePage() {
  const { toast } = useToast()
  const today = new Date()

  // Calendar state
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth())
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = React.useState(today.toISOString().split("T")[0])
  const [viewMode, setViewMode] = React.useState<"month" | "year">("month")

  // Student filtering
  const [selectedBatch, setSelectedBatch] = React.useState("all")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Attendance marking
  const [markedList, setMarkedList] = React.useState<Student[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Scoped states
  const [studentsList, setStudentsList] = React.useState<any[]>([])
  const [attendanceData, setAttendanceData] = React.useState<Record<string, Record<string, string>>>({})
  const [activeRole, setActiveRole] = React.useState("owner")

  // Animation trigger key
  const [animKey, setAnimKey] = React.useState(0)

  // Load from localStorage on mount
  React.useEffect(() => {
    const loadedStudents = getScopedData<any[]>("students", mockStudentsGenerator)
    setStudentsList(loadedStudents)
    const loadedAttendance = getScopedData<any>("attendance", mockAttendanceGenerator)
    setAttendanceData(loadedAttendance)
    setActiveRole(getActiveRole())
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    if (isLoading) return

    // Filter students by batch
    const batchFiltered = selectedBatch === "all"
      ? studentsList
      : studentsList.filter(s => s.batch.toLowerCase().replace(" ", "-") === selectedBatch)

    // Check if we have saved data for this date
    const savedData = attendanceData[selectedDate]

    const loaded = batchFiltered.map(s => ({
      id: Number(s.id),
      name: s.name,
      roll: `A00${s.id}`,
      batch: s.batch,
      status: (savedData?.[s.id] || "Not Marked") as Student["status"],
    }))

    setMarkedList(loaded)
    setAnimKey(prev => prev + 1)
  }, [selectedBatch, selectedDate, studentsList, attendanceData, isLoading])

  // Calendar nav
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(today.toISOString().split("T")[0])
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
  }

  const handleMonthClickInYearView = (monthIndex: number) => {
    setCurrentMonth(monthIndex)
    setViewMode("month")
  }

  // Attendance actions
  const handleStatusChange = (id: number, status: Student["status"]) => {
    const isTeacherOrOwner = activeRole === "owner" || activeRole === "teacher"
    if (!isTeacherOrOwner) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only faculty and administrators can mark student attendance."
      })
      return
    }
    setMarkedList(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }

  const markAllPresent = () => {
    const isTeacherOrOwner = activeRole === "owner" || activeRole === "teacher"
    if (!isTeacherOrOwner) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only faculty and administrators can mark student attendance."
      })
      return
    }
    setMarkedList(prev => prev.map(item => ({ ...item, status: "Present" })))
    toast({
      title: "All Marked Present",
      description: "Every student in the current view has been marked present.",
    })
  }

  const resetAttendance = () => {
    const isTeacherOrOwner = activeRole === "owner" || activeRole === "teacher"
    if (!isTeacherOrOwner) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only faculty and administrators can mark student attendance."
      })
      return
    }
    setMarkedList(prev => prev.map(item => ({ ...item, status: "Not Marked" })))
    toast({
      title: "Reset Complete",
      description: "All attendance marks have been cleared for this session.",
    })
  }

  const handleSave = () => {
    const isTeacherOrOwner = activeRole === "owner" || activeRole === "teacher"
    if (!isTeacherOrOwner) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only faculty and administrators can save attendance records."
      })
      return
    }
    const pending = markedList.filter(s => s.status === "Not Marked").length
    if (pending > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Records",
        description: `Please mark attendance for all ${pending} remaining student(s).`,
      })
      return
    }

    const updatedData = { ...attendanceData }
    const dayRecords: Record<string, string> = {}
    markedList.forEach(s => {
      dayRecords[s.id] = s.status
    })
    updatedData[selectedDate] = dayRecords

    setAttendanceData(updatedData)
    setScopedData("attendance", updatedData)

    toast({
      title: "Attendance Saved ✓",
      description: `Records for ${selectedDate} have been saved successfully.`,
    })
  }

  // Stats
  const stats = {
    present: markedList.filter(s => s.status === "Present").length,
    absent: markedList.filter(s => s.status === "Absent").length,
    late: markedList.filter(s => s.status === "Late").length,
    pending: markedList.filter(s => s.status === "Not Marked").length,
    total: markedList.length,
  }

  const progressPercent = stats.total > 0
    ? Math.round(((stats.total - stats.pending) / stats.total) * 100)
    : 0

  // Filtered students for display
  const filteredList = markedList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calendar data
  const calendarDays = getCalendarDays(currentYear, currentMonth)
  const todayStr = today.toISOString().split("T")[0]

  const selectedDateObj = new Date(selectedDate + "T00:00:00")
  const formattedSelectedDate = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const batchLabel = batches.find(b => b.value === selectedBatch)?.label || "All Batches"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <CalendarCheck className="size-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading attendance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <CalendarCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Attendance</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Track & manage daily student presence</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2" onClick={goToToday}>
            <CalendarDays className="size-3.5" /> Today
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2">
            <History className="size-3.5" /> Reports
          </Button>
          <Button size="sm" className="flex-1 md:flex-none bg-primary hover:bg-primary/90 rounded-xl h-10 text-xs font-bold gap-2 shadow-lg shadow-primary/20" onClick={handleSave}>
            <Save className="size-3.5" /> Save All
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ====== LEFT PANEL: Calendar + Stats ====== */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-5">

          {/* Calendar Card */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-0 pt-5 px-5">
              {/* Batch Selector inside calendar */}
              <div className="mb-4">
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="w-full h-10 rounded-xl border-border/60 text-xs font-bold bg-muted/30">
                    <span className="flex items-center gap-2">
                      <span className={cn("size-2.5 rounded-full", batches.find(b => b.value === selectedBatch)?.color || "bg-primary")} />
                      <SelectValue placeholder="Select Batch" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map(b => (
                      <SelectItem key={b.value} value={b.value} className="text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span className={cn("size-2 rounded-full", b.color)} />
                          {b.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month / Year Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={goToPrevMonth}>
                  <ChevronLeft className="size-4" />
                </Button>
                <button
                  className="text-sm font-headline font-bold text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-muted/50"
                  onClick={() => setViewMode(viewMode === "month" ? "year" : "month")}
                >
                  {viewMode === "month"
                    ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
                    : `${currentYear}`}
                </button>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={goToNextMonth}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-5 pt-3">
              {viewMode === "month" ? (
                /* ---- Month View: Day Grid ---- */
                <div className="space-y-1">
                  {/* Day labels */}
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_LABELS.map(d => (
                      <div key={d} className="text-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider py-1.5">
                        {d}
                      </div>
                    ))}
                  </div>
                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((day, idx) => {
                      const isToday = day.dateStr === todayStr
                      const isSelected = day.dateStr === selectedDate
                      const summary = getDateAttendanceSummary(day.dateStr, attendanceData)
                      const isFuture = new Date(day.dateStr + "T00:00:00") > today

                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(day.dateStr)}
                          className={cn(
                            "relative flex flex-col items-center justify-center py-1.5 rounded-xl text-xs font-medium transition-all duration-200 group",
                            "hover:bg-primary/5 cursor-pointer",
                            !day.isCurrentMonth && "opacity-30",
                            isSelected && "bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90",
                            isToday && !isSelected && "ring-2 ring-primary/30 bg-primary/5 font-bold",
                            isFuture && day.isCurrentMonth && "text-muted-foreground/50"
                          )}
                          style={{ minHeight: "40px" }}
                        >
                          <span className={cn("text-[13px] leading-none", isSelected ? "font-bold" : "")}>
                            {day.date}
                          </span>
                          {/* Attendance indicator dot */}
                          {summary && !isSelected && (
                            <div className="flex gap-[2px] mt-1">
                              <div className={cn(
                                "size-[5px] rounded-full transition-all",
                                summary.ratio >= 0.9 ? "bg-emerald-500" :
                                  summary.ratio >= 0.7 ? "bg-amber-500" :
                                    "bg-red-500"
                              )} />
                            </div>
                          )}
                          {isSelected && summary && (
                            <span className="text-[8px] font-bold mt-0.5 text-white/80">{summary.present}/{summary.total}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 pt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-muted-foreground font-medium">≥90%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-amber-500" />
                      <span className="text-[9px] text-muted-foreground font-medium">70-89%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-red-500" />
                      <span className="text-[9px] text-muted-foreground font-medium">&lt;70%</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ---- Year View: Month Grid ---- */
                <div className="grid grid-cols-3 gap-2 py-2">
                  {MONTH_NAMES.map((name, idx) => {
                    const isCurrentViewMonth = idx === currentMonth
                    const isThisMonth = idx === today.getMonth() && currentYear === today.getFullYear()
                    return (
                      <button
                        key={name}
                        onClick={() => handleMonthClickInYearView(idx)}
                        className={cn(
                          "py-3 px-2 rounded-xl text-xs font-bold transition-all duration-200",
                          "hover:bg-primary/5 cursor-pointer",
                          isCurrentViewMonth && "bg-primary text-white shadow-md shadow-primary/30",
                          isThisMonth && !isCurrentViewMonth && "ring-2 ring-primary/30 bg-primary/5"
                        )}
                      >
                        {name.slice(0, 3)}
                      </button>
                    )
                  })}
                  {/* Year navigation */}
                  <div className="col-span-3 flex items-center justify-center gap-3 pt-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold rounded-lg" onClick={() => setCurrentYear(prev => prev - 1)}>
                      <ChevronLeft className="size-3.5 mr-1" /> {currentYear - 1}
                    </Button>
                    <span className="text-sm font-headline font-bold text-primary">{currentYear}</span>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold rounded-lg" onClick={() => setCurrentYear(prev => prev + 1)}>
                      {currentYear + 1} <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <BarChart3 className="size-3" /> Daily Snapshot — {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4" key={animKey}>
              <div className="grid grid-cols-2 gap-3">
                <StatMini icon={UserCheck} label="Present" value={stats.present} color="text-emerald-600" bg="bg-emerald-50" />
                <StatMini icon={UserX} label="Absent" value={stats.absent} color="text-red-600" bg="bg-red-50" />
                <StatMini icon={Clock} label="Late" value={stats.late} color="text-amber-600" bg="bg-amber-50" />
                <StatMini icon={Users} label="Pending" value={stats.pending} color="text-slate-600" bg="bg-slate-50" />
              </div>

              <Separator className="bg-border/30" />

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progress</span>
                  <span className="text-xs font-headline font-bold text-primary">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {stats.total - stats.pending} of {stats.total} students marked
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====== RIGHT PANEL: Student Marking ====== */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Context bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="space-y-0.5">
              <h2 className="text-base md:text-lg font-headline font-bold text-foreground">{formattedSelectedDate}</h2>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span className={cn("size-2 rounded-full", batches.find(b => b.value === selectedBatch)?.color || "bg-primary")} />
                {batchLabel} · {stats.total} students
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs font-medium border-border/60">
                  <span className="flex items-center gap-1.5">
                    <Filter className="size-3 text-muted-foreground" />
                    <SelectValue placeholder="Filter" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="Present" className="text-xs">Present</SelectItem>
                  <SelectItem value="Absent" className="text-xs">Absent</SelectItem>
                  <SelectItem value="Late" className="text-xs">Late</SelectItem>
                  <SelectItem value="Not Marked" className="text-xs">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Card */}
          <Card className="border-none shadow-sm overflow-hidden">
            {/* Toolbar */}
            <CardHeader className="bg-muted/10 border-b border-border/40 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or roll..."
                    className="pl-9 bg-background rounded-xl h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 font-bold text-[10px] h-8 rounded-lg gap-1.5 px-3 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={markAllPresent}
                  >
                    <CheckCircle className="size-3" /> ALL PRESENT
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground font-bold text-[10px] h-8 rounded-lg gap-1.5 px-3"
                    onClick={resetAttendance}
                  >
                    <RotateCcw className="size-3" /> RESET
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Student List */}
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {filteredList.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="size-16 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
                      <Users className="size-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No students found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your batch or search filters</p>
                  </div>
                ) : (
                  filteredList.map((student, i) => (
                    <div
                      key={student.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 hover:bg-muted/5 transition-all duration-200 group"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Index */}
                        <span className="text-[10px] font-mono text-muted-foreground/50 w-5 text-right shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <Avatar className="size-10 border-2 border-background shadow-sm ring-1 ring-border/30">
                          <AvatarImage src={`https://picsum.photos/seed/${student.id + 20}/40/40`} />
                          <AvatarFallback className="text-xs font-bold bg-muted">{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-sm leading-tight truncate">{student.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-mono">{student.roll}</span>
                            <div className={cn("size-1.5 rounded-full", batches.find(b => b.value === student.batch)?.color || "bg-primary")} />
                          </div>
                        </div>
                      </div>

                      {/* Marking buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center ml-8 sm:ml-0">
                        <Button
                          onClick={() => handleStatusChange(student.id, "Present")}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-3 rounded-lg text-[11px] font-bold transition-all duration-200 gap-1.5",
                            student.status === "Present"
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                              : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                          )}
                        >
                          <Check className="size-3.5" />
                          <span className="hidden sm:inline">Present</span>
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(student.id, "Absent")}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-3 rounded-lg text-[11px] font-bold transition-all duration-200 gap-1.5",
                            student.status === "Absent"
                              ? "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20"
                              : "text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                          )}
                        >
                          <X className="size-3.5" />
                          <span className="hidden sm:inline">Absent</span>
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(student.id, "Late")}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-3 rounded-lg text-[11px] font-bold transition-all duration-200 gap-1.5",
                            student.status === "Late"
                              ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20"
                              : "text-muted-foreground hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200"
                          )}
                        >
                          <Clock className="size-3.5" />
                          <span className="hidden sm:inline">Late</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Save Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
        <Button onClick={handleSave} className="w-full bg-primary h-12 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Save className="size-4" /> Save Attendance ({stats.total - stats.pending}/{stats.total})
        </Button>
      </div>
    </div>
  )
}

// --- Sub Components ---

function StatMini({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl", bg)}>
      <div className={cn("size-8 rounded-lg flex items-center justify-center bg-white/80 shadow-sm", color)}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-lg font-headline font-bold leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

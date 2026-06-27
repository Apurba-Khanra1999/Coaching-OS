"use client"

import * as React from "react"
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  AlertCircle, 
  Calendar,
  Check, 
  X,
  MapPin,
  CalendarCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { 
  getActiveTenant, 
  getActiveRole, 
  getScopedData, 
  setScopedData
} from "@/lib/tenant"

// --- TypeScript Interfaces ---
export interface Holiday {
  id: string
  title: string
  description: string
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD (supports multi-day holidays)
  type: "National" | "Regional" | "Academic" | "Emergency" | "Other"
  createdBy: string
}

interface GridDay {
  dayNum: number
  dateStr: string
  isCurrentMonth: boolean
}

// --- High-Fidelity Mock Holidays Generator ---
export const mockHolidaysGenerator = (tenantId: string): Holiday[] => {
  const isApex = tenantId === "inst_002"
  const isHorizon = tenantId === "inst_003"
  const creator = isApex ? "owner@apexscience.edu" : isHorizon ? "owner@horizonprep.edu" : "owner@coachingos.edu"

  return [
    {
      id: "HOL-101",
      title: isApex ? "Apex Summer Research Break" : isHorizon ? "College Prep Summer Recess" : "Summer Semester Break",
      description: "Annual summer holidays for students and instructors. Central administrative offices will operate on reduced schedules.",
      startDate: "2026-06-28",
      endDate: "2026-07-04",
      type: "Academic",
      createdBy: creator
    },
    {
      id: "HOL-102",
      title: "Independence Day Observance",
      description: "National closure in honor of Independence Day.",
      startDate: "2026-07-04",
      endDate: "2026-07-04",
      type: "National",
      createdBy: creator
    },
    {
      id: "HOL-103",
      title: "Labor Day Holiday",
      description: "National closure celebrating Labor Day.",
      startDate: "2026-09-07",
      endDate: "2026-09-07",
      type: "National",
      createdBy: creator
    },
    {
      id: "HOL-104",
      title: "Autumn Faculty Development Summit",
      description: "Syllabus review and staff training. No classroom lectures scheduled for students.",
      startDate: "2026-10-12",
      endDate: "2026-10-13",
      type: "Academic",
      createdBy: creator
    },
    {
      id: "HOL-105",
      title: "Regional Festival Holidays",
      description: "Closure for regional cultural festivals and holidays.",
      startDate: "2026-11-20",
      endDate: "2026-11-22",
      type: "Regional",
      createdBy: creator
    }
  ]
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function HolidaysPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")
  const [userEmail, setUserEmail] = React.useState("")

  // Scoped State
  const [holidays, setHolidays] = React.useState<Holiday[]>([])

  // Calendar State Logic
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth())
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear())
  const [selectedDateStr, setSelectedDateStr] = React.useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )

  // Search & Filter UI States (Applied in List Tab)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Modal Open States
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedHoliday, setSelectedHoliday] = React.useState<Holiday | null>(null)

  // Add Form States
  const [addTitle, setAddTitle] = React.useState("")
  const [addType, setAddType] = React.useState<Holiday["type"]>("National")
  const [addStartDate, setAddStartDate] = React.useState("")
  const [addEndDate, setAddEndDate] = React.useState("")
  const [addDescription, setAddDescription] = React.useState("")
  const [addOverlapWarning, setAddOverlapWarning] = React.useState<string | null>(null)

  // Edit Form States
  const [editTitle, setEditTitle] = React.useState("")
  const [editType, setEditType] = React.useState<Holiday["type"]>("National")
  const [editStartDate, setEditStartDate] = React.useState("")
  const [editEndDate, setEditEndDate] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editOverlapWarning, setEditOverlapWarning] = React.useState<string | null>(null)

  React.useEffect(() => {
    const role = getActiveRole()
    const tenant = getActiveTenant()
    const email = localStorage.getItem("tuitionflow_logged_in_email") || ""

    setActiveRole(role)
    setActiveTenantId(tenant)
    setUserEmail(email)

    const loadedHolidays = getScopedData<Holiday[]>("holidays", mockHolidaysGenerator)
    setHolidays(loadedHolidays)

    setMounted(true)
  }, [])

  // ==========================================
  // LOGIC: Overlap Warning Engine
  // ==========================================
  const checkOverlap = (startStr: string, endStr: string, excludeId?: string): string | null => {
    if (!startStr || !endStr) return null
    const start = new Date(startStr).getTime()
    const end = new Date(endStr).getTime()

    if (start > end) return null

    for (const hol of holidays) {
      if (excludeId && hol.id === excludeId) continue
      const holStart = new Date(hol.startDate).getTime()
      const holEnd = new Date(hol.endDate).getTime()

      if (start <= holEnd && end >= holStart) {
        return `Overlaps with "${hol.title}" (${hol.startDate} to ${hol.endDate})`
      }
    }
    return null
  }

  React.useEffect(() => {
    if (addStartDate && addEndDate) {
      setAddOverlapWarning(checkOverlap(addStartDate, addEndDate))
    } else {
      setAddOverlapWarning(null)
    }
  }, [addStartDate, addEndDate, holidays])

  React.useEffect(() => {
    if (selectedHoliday && editStartDate && editEndDate) {
      setEditOverlapWarning(checkOverlap(editStartDate, editEndDate, selectedHoliday.id))
    } else {
      setEditOverlapWarning(null)
    }
  }, [editStartDate, editEndDate, selectedHoliday, holidays])

  const isOwner = activeRole === "owner" || activeRole === "super_admin"

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Mounting Calendar Workspace...</p>
        </div>
      </div>
    )
  }

  // ==========================================
  // UTILITIES: Calendar Generation Logic
  // ==========================================
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateGrid = (year: number, month: number): GridDay[] => {
    const grid: GridDay[] = []
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInMonth = getDaysInMonth(year, month)
    
    const prevYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
    
    // Padding from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      grid.push({ dayNum: day, dateStr, isCurrentMonth: false })
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      grid.push({ dayNum: i, dateStr, isCurrentMonth: true })
    }

    // Padding from next month to complete 42 cells
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    const remaining = 42 - grid.length
    
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      grid.push({ dayNum: i, dateStr, isCurrentMonth: false })
    }
    
    return grid
  }

  const getHolidaysForDate = (dateStr: string) => {
    return holidays.filter(h => dateStr >= h.startDate && dateStr <= h.endDate)
  }

  const getHolidayStatus = (startStr: string, endStr: string): "Upcoming" | "Active" | "Past" => {
    const currentToday = new Date()
    currentToday.setHours(0, 0, 0, 0)
    const start = new Date(startStr)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endStr)
    end.setHours(23, 59, 59, 999)

    if (currentToday.getTime() >= start.getTime() && currentToday.getTime() <= end.getTime()) {
      return "Active"
    } else if (currentToday.getTime() < start.getTime()) {
      return "Upcoming"
    } else {
      return "Past"
    }
  }

  const getNextHolidayCountdown = () => {
    const currentToday = new Date()
    currentToday.setHours(0, 0, 0, 0)

    const futureHolidays = holidays.map(h => {
      const start = new Date(h.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(h.endDate)
      end.setHours(23, 59, 59, 999)
      const status = getHolidayStatus(h.startDate, h.endDate)
      return { ...h, start, end, status }
    }).filter(h => h.status !== "Past")

    if (futureHolidays.length === 0) return null

    futureHolidays.sort((a, b) => a.start.getTime() - b.start.getTime())
    const next = futureHolidays[0]

    if (next.status === "Active") {
      const remainingDays = Math.ceil((next.end.getTime() - currentToday.getTime()) / (1000 * 60 * 60 * 24))
      return {
        status: "Active" as const,
        title: next.title,
        days: remainingDays,
        message: `Ongoing Closure: "${next.title}" (${remainingDays} days remaining)`
      }
    } else {
      const countdownDays = Math.ceil((next.start.getTime() - currentToday.getTime()) / (1000 * 60 * 60 * 24))
      return {
        status: "Upcoming" as const,
        title: next.title,
        days: countdownDays,
        message: `Next scheduled Break: "${next.title}" in ${countdownDays} days`
      }
    }
  }

  // ==========================================
  // CRUD Actions
  // ==========================================
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!addTitle.trim() || !addStartDate || !addEndDate || !addDescription.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all holiday fields." })
      return
    }

    if (new Date(addStartDate).getTime() > new Date(addEndDate).getTime()) {
      toast({ variant: "destructive", title: "Invalid Dates", description: "End Date must be on or after the Start Date." })
      return
    }

    const newHoliday: Holiday = {
      id: `HOL-${Date.now().toString().slice(-4)}`,
      title: addTitle.trim(),
      description: addDescription.trim(),
      startDate: addStartDate,
      endDate: addEndDate,
      type: addType,
      createdBy: userEmail || "owner@coachingos.edu"
    }

    const updatedHolidays = [newHoliday, ...holidays]
    setHolidays(updatedHolidays)
    setScopedData<Holiday[]>("holidays", updatedHolidays)

    setIsAddOpen(false)
    resetAddForm()

    toast({
      title: "Holiday Scheduled ✓",
      description: `Successfully added and broadcasted "${newHoliday.title}".`
    })
  }

  const handleOpenEdit = (hol: Holiday) => {
    setSelectedHoliday(hol)
    setEditTitle(hol.title)
    setEditType(hol.type)
    setEditStartDate(hol.startDate)
    setEditEndDate(hol.endDate)
    setEditDescription(hol.description)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHoliday) return

    if (!editTitle.trim() || !editStartDate || !editEndDate || !editDescription.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all holiday fields." })
      return
    }

    if (new Date(editStartDate).getTime() > new Date(editEndDate).getTime()) {
      toast({ variant: "destructive", title: "Invalid Dates", description: "End Date must be on or after the Start Date." })
      return
    }

    const updatedHolidays = holidays.map(h => {
      if (h.id === selectedHoliday.id) {
        return {
          ...h,
          title: editTitle.trim(),
          type: editType,
          startDate: editStartDate,
          endDate: editEndDate,
          description: editDescription.trim()
        }
      }
      return h
    })

    setHolidays(updatedHolidays)
    setScopedData<Holiday[]>("holidays", updatedHolidays)

    setIsEditOpen(false)
    setSelectedHoliday(null)

    toast({
      title: "Holiday Modified ✓",
      description: `Successfully adjusted dates for "${editTitle.trim()}".`
    })
  }

  const handleDeleteHoliday = (holId: string) => {
    if (!window.confirm("Are you sure you want to delete this scheduled break?")) return

    const updatedHolidays = holidays.filter(h => h.id !== holId)
    setHolidays(updatedHolidays)
    setScopedData<Holiday[]>("holidays", updatedHolidays)

    toast({
      title: "Holiday Retracted",
      description: "The holiday event was removed from the database."
    })
  }

  const resetAddForm = () => {
    setAddTitle("")
    setAddType("National")
    setAddStartDate("")
    setAddEndDate("")
    setAddDescription("")
    setAddOverlapWarning(null)
  }

  const handleOpenAddWithDate = (dateStr: string) => {
    if (!isOwner) return
    resetAddForm()
    setAddStartDate(dateStr)
    setAddEndDate(dateStr)
    setIsAddOpen(true)
  }

  // ==========================================
  // CALENDAR NAVIGATION
  // ==========================================
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleResetToToday = () => {
    const todayObj = new Date()
    setCurrentMonth(todayObj.getMonth())
    setCurrentYear(todayObj.getFullYear())
    setSelectedDateStr(
      `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`
    )
  }

  // ==========================================
  // DATA FILTERING FOR TIMELINE
  // ==========================================
  const filteredHolidays = holidays.filter(h => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = h.title.toLowerCase().includes(query) || h.description.toLowerCase().includes(query)
    
    let matchesType = true
    if (typeFilter !== "all") {
      matchesType = h.type === typeFilter
    }

    let matchesStatus = true
    if (statusFilter !== "all") {
      const status = getHolidayStatus(h.startDate, h.endDate)
      matchesStatus = status.toLowerCase() === statusFilter.toLowerCase()
    }

    return matchesSearch && matchesType && matchesStatus
  })

  const sortedHolidays = [...filteredHolidays].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  // ==========================================
  // METRICS CALCULATIONS
  // ==========================================
  const totalHolidaysCount = holidays.length
  const upcomingClosures = holidays.filter(h => getHolidayStatus(h.startDate, h.endDate) === "Upcoming").length
  const emergencyClosures = holidays.filter(h => h.type === "Emergency").length

  let longestBreakDays = 0
  holidays.forEach(h => {
    const days = Math.round((new Date(h.endDate).getTime() - new Date(h.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (days > longestBreakDays) longestBreakDays = days
  })

  const countdownInfo = getNextHolidayCountdown()
  const gridCells = generateGrid(currentYear, currentMonth)

  // Resolve selected date details
  const selectedHolidaysList = getHolidaysForDate(selectedDateStr)
  const isSelectedDateToday = selectedDateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      
      {/* Ticker Banner */}
      {countdownInfo && (
        <div className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-xl p-5 shadow-sm animate-fade-in",
          countdownInfo.status === "Active" 
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-emerald-950" 
            : "bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary/20 text-indigo-950"
        )}>
          <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[120%] opacity-[0.02] pointer-events-none rounded-full blur-2xl bg-indigo-600" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md",
                countdownInfo.status === "Active" ? "bg-emerald-600" : "bg-primary"
              )}>
                <Clock className="size-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Break Ticker</h3>
                <p className="text-sm font-bold text-slate-700 mt-0.5 leading-tight">{countdownInfo.message}</p>
              </div>
            </div>
            
            <div className="bg-white/80 border border-slate-200/50 backdrop-blur-xl px-4 py-1.5 rounded-xl shadow-xs flex flex-col text-center justify-center min-w-28 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Countdown</span>
              <span className={cn(
                "text-lg font-black leading-none mt-0.5",
                countdownInfo.status === "Active" ? "text-emerald-600" : "text-primary"
              )}>
                {countdownInfo.days} {countdownInfo.days === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-transparent p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
              <Sparkles className="size-3" /> Calendar Operations
            </span>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Institute Holidays Schedule 📅
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {isOwner 
                ? "Configure official closures, manage regional and national holiday schedules, and broadcast calendar alerts to all classrooms."
                : "View official public, regional, and academic break calendars. Track scheduled closures and plan timetables."
              }
            </p>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-3 shrink-0">
              <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetAddForm() }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white font-bold gap-1.5 uppercase tracking-wider text-xs px-4 h-9">
                    <Plus className="size-4" /> Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <DialogTitle className="font-headline text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="size-5 text-primary" /> Schedule New Holiday
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Create a new closure entry. Users will receive real-time notifications on publication.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="add-title" className="text-xs font-bold text-slate-700">Holiday Title</Label>
                      <Input 
                        id="add-title" 
                        className="rounded-xl h-10 text-xs border-slate-200" 
                        placeholder="e.g. Independence Day Break" 
                        value={addTitle}
                        onChange={e => setAddTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="add-type" className="text-xs font-bold text-slate-700">Holiday Category</Label>
                        <Select value={addType} onValueChange={(val: Holiday["type"]) => setAddType(val)}>
                          <SelectTrigger id="add-type" className="rounded-xl h-10 text-xs border-slate-200 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="National" className="text-xs">National</SelectItem>
                            <SelectItem value="Regional" className="text-xs">Regional</SelectItem>
                            <SelectItem value="Academic" className="text-xs">Academic</SelectItem>
                            <SelectItem value="Emergency" className="text-xs">Emergency</SelectItem>
                            <SelectItem value="Other" className="text-xs">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="add-start" className="text-xs font-bold text-slate-700">Start Date</Label>
                        <Input 
                          id="add-start" 
                          type="date"
                          className="rounded-xl h-10 text-xs border-slate-200" 
                          value={addStartDate}
                          onChange={e => setAddStartDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="add-end" className="text-xs font-bold text-slate-700">End Date</Label>
                        <Input 
                          id="add-end" 
                          type="date"
                          className="rounded-xl h-10 text-xs border-slate-200" 
                          value={addEndDate}
                          onChange={e => setAddEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Overlap Warning Engine Output */}
                    {addOverlapWarning && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs animate-shake">
                        <Info className="size-4 shrink-0 mt-0.5 text-amber-600" />
                        <p className="font-semibold">{addOverlapWarning}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="add-desc" className="text-xs font-bold text-slate-700">Description / Details</Label>
                      <Textarea 
                        id="add-desc" 
                        className="rounded-xl min-h-20 text-xs border-slate-200 resize-none" 
                        placeholder="Provide reasons, advisory details, or class rescheduling notes..." 
                        value={addDescription}
                        onChange={e => setAddDescription(e.target.value)}
                      />
                    </div>

                    <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" className="rounded-xl text-xs font-bold border-slate-200" onClick={() => setIsAddOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white">
                        Create Schedule
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Graded Holidays"
          value={totalHolidaysCount}
          trend="Total Breaks"
          trendDirection="neutral"
          subtext="Annual academic cycle"
          icon={Calendar}
          progress={100}
        />
        <StatCard
          title="Upcoming Closures"
          value={upcomingClosures}
          trend="Scheduled Breaks"
          trendDirection="up"
          subtext="Coming weeks closures"
          icon={Clock}
          progress={totalHolidaysCount > 0 ? (upcomingClosures / totalHolidaysCount) * 100 : 0}
        />
        <StatCard
          title="Longest Recess"
          value={`${longestBreakDays} Days`}
          trend="Consecutive Off"
          trendDirection="up"
          subtext="Maximum vacation span"
          icon={CalendarCheck}
          progress={100}
        />
        <StatCard
          title="Emergency Closures"
          value={emergencyClosures}
          trend="Advisory Alerts"
          trendDirection="down"
          subtext="Unplanned storm/etc closures"
          icon={ShieldAlert}
          progress={totalHolidaysCount > 0 ? (emergencyClosures / totalHolidaysCount) * 100 : 0}
        />
      </div>

      {/* Main Interactive Tab Workspace */}
      <Tabs defaultValue="calendar" className="space-y-6 w-full">
        <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-10">
            <TabsTrigger value="calendar" className="rounded-lg font-bold text-xs uppercase tracking-wider h-8">
              <Calendar className="size-3.5 mr-1.5" /> Calendar Grid
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg font-bold text-xs uppercase tracking-wider h-8">
              <ListFilter className="size-3.5 mr-1.5" /> Timeline Ledger
            </TabsTrigger>
          </TabsList>

          {/* Type filters for sidebar list, aligned nicely */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Seeded: {holidays.length}</span>
          </div>
        </div>

        {/* Tab 1: Interactive Monthly Calendar Grid */}
        <TabsContent value="calendar" className="space-y-6 outline-hidden">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            
            {/* The Monthly Calendar View */}
            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
              {/* Calendar Month Selector Header */}
              <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50/50 border-b">
                <div className="flex items-center gap-1">
                  <h2 className="text-lg font-black text-slate-800 font-headline leading-none">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-primary font-bold px-2 py-0.5 rounded-full uppercase ml-2 select-none">
                    Month View
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" onClick={handlePrevMonth}>
                    <ChevronLeft className="size-4 text-slate-600" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold border-slate-200" onClick={handleResetToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" onClick={handleNextMonth}>
                    <ChevronRight className="size-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid Container */}
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                  {/* Weekday Labels */}
                  {WEEKDAYS.map(day => (
                    <div key={day} className="bg-slate-50 text-center py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                      {day}
                    </div>
                  ))}

                  {/* Day Cells */}
                  {gridCells.map((cell, idx) => {
                    const dayHolidays = getHolidaysForDate(cell.dateStr)
                    const isSelected = selectedDateStr === cell.dateStr
                    
                    // Check if cell represents today
                    const isToday = cell.dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "aspect-square bg-white hover:bg-slate-50 p-1 sm:p-2 cursor-pointer flex flex-col justify-between transition-all duration-150 relative border-2 border-transparent group select-none",
                          !cell.isCurrentMonth && "bg-slate-50/50 text-slate-300 hover:bg-slate-50/70",
                          isSelected ? "border-primary bg-indigo-500/[0.02]" : "",
                          dayHolidays.length > 0 && "bg-slate-50/30"
                        )}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        onDoubleClick={() => handleOpenAddWithDate(cell.dateStr)}
                      >
                        {/* Day Number */}
                        <div className="flex items-center justify-between w-full">
                          {isToday ? (
                            <span className="size-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {cell.dayNum}
                            </span>
                          ) : (
                            <span className={cn(
                              "text-xs font-bold leading-none",
                              cell.isCurrentMonth ? "text-slate-700" : "text-slate-300"
                            )}>
                              {cell.dayNum}
                            </span>
                          )}

                          {/* Action Cue for Owners */}
                          {isOwner && isSelected && (
                            <span 
                              className="size-4 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); handleOpenAddWithDate(cell.dateStr) }}
                              title="Schedule a break on this date"
                            >
                              <Plus className="size-2.5" />
                            </span>
                          )}
                        </div>

                        {/* Holiday Indicators */}
                        <div className="w-full mt-1.5 flex flex-col gap-0.5">
                          {/* Desktop Render: Colored Text Badges */}
                          <div className="hidden sm:flex flex-col gap-0.5">
                            {dayHolidays.map(h => (
                              <div
                                key={h.id}
                                className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-md font-bold truncate leading-tight w-full border text-left",
                                  h.type === "National" ? "bg-red-50 text-red-700 border-red-200" :
                                  h.type === "Academic" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                  h.type === "Regional" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                  h.type === "Emergency" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-slate-50 text-slate-600 border-slate-200"
                                )}
                              >
                                {h.title}
                              </div>
                            ))}
                          </div>

                          {/* Mobile Render: Colored Indicator Dots */}
                          <div className="flex sm:hidden gap-1 flex-wrap mt-auto">
                            {dayHolidays.map(h => (
                              <div
                                key={h.id}
                                className={cn(
                                  "size-1.5 rounded-full shrink-0",
                                  h.type === "National" ? "bg-red-500" :
                                  h.type === "Academic" ? "bg-indigo-500" :
                                  h.type === "Regional" ? "bg-purple-500" :
                                  h.type === "Emergency" ? "bg-amber-500" : "bg-slate-400"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Selected Date Details Panel (Right Column) */}
            <Card className="border-none shadow-sm flex flex-col min-h-[400px]">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="font-headline text-base font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="size-4.5 text-primary" /> Daily Schedule Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect closures scheduled for selected date.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col">
                {/* Selected Date Indicator Header */}
                <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(selectedDateStr).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
                      {isSelectedDateToday ? "TODAY" : "Selected Date"}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-1.5 uppercase tracking-wider"
                      onClick={() => handleOpenAddWithDate(selectedDateStr)}
                    >
                      <Plus className="size-3.5" /> Schedule Break
                    </Button>
                  )}
                </div>

                {/* Holiday Listing */}
                {selectedHolidaysList.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                      <Calendar className="size-6" />
                    </div>
                    <p className="font-bold text-xs text-slate-700">No Scheduled Closures</p>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mt-1 leading-normal">
                      The institute will operate normal classes and administrative timetables on this date.
                    </p>
                    {isOwner && (
                      <Button
                        variant="link"
                        className="text-xs font-bold text-primary mt-2 p-0 h-auto"
                        onClick={() => handleOpenAddWithDate(selectedDateStr)}
                      >
                        Schedule holiday closure now
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1">
                    {selectedHolidaysList.map(hol => {
                      const isMulti = hol.startDate !== hol.endDate
                      const spanDays = Math.round((new Date(hol.endDate).getTime() - new Date(hol.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                      
                      return (
                        <div key={hol.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3 relative group/card">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-800">{hol.title}</h4>
                              <Badge className={cn(
                                "text-[8px] px-1 py-0 font-bold border",
                                hol.type === "National" ? "bg-red-50 text-red-700 border-red-200" :
                                hol.type === "Academic" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                hol.type === "Regional" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                hol.type === "Emergency" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-slate-50 text-slate-600 border-slate-200"
                              )}>
                                {hol.type}
                              </Badge>
                            </div>
                            
                            <p className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="size-2.5 text-slate-400" />
                              {new Date(hol.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {isMulti && ` to ${new Date(hol.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                              {` (${spanDays} ${spanDays === 1 ? "day" : "days"})`}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 font-medium leading-normal">
                            {hol.description}
                          </p>

                          {/* Quick Admin Actions Inside Sidebar Details Cards */}
                          {isOwner && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 px-2"
                                onClick={() => handleOpenEdit(hol)}
                              >
                                <Edit3 className="size-3" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] font-bold rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-1 px-2"
                                onClick={() => handleDeleteHoliday(hol.id)}
                              >
                                <Trash2 className="size-3" /> Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Chronological Timeline Ledger List */}
        <TabsContent value="timeline" className="space-y-6 outline-hidden">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            
            {/* The Timeline Ledger */}
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <CardTitle className="font-headline text-base font-bold">Holiday Timeline Ledger</CardTitle>
                  <CardDescription>Chronological registry of holidays. Search and filter items below.</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-40">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                      placeholder="Search holiday..."
                      className="rounded-xl h-8 pl-8 pr-3 text-xs border-slate-200 w-full bg-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Category Filter */}
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-xl h-8 text-xs border-slate-200 bg-white w-full sm:w-28">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                      <SelectItem value="National" className="text-xs">National</SelectItem>
                      <SelectItem value="Regional" className="text-xs">Regional</SelectItem>
                      <SelectItem value="Academic" className="text-xs">Academic</SelectItem>
                      <SelectItem value="Emergency" className="text-xs">Emergency</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="rounded-xl h-8 text-xs border-slate-200 bg-white w-full sm:w-28">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="text-xs">All Status</SelectItem>
                      <SelectItem value="upcoming" className="text-xs">Upcoming</SelectItem>
                      <SelectItem value="active" className="text-xs">Ongoing</SelectItem>
                      <SelectItem value="past" className="text-xs">Concluded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {sortedHolidays.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 font-medium italic">
                    <AlertCircle className="size-6 mx-auto mb-2 text-slate-300" />
                    No holidays recorded matching the active filters.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-8 py-2">
                    {sortedHolidays.map(hol => {
                      const status = getHolidayStatus(hol.startDate, hol.endDate)
                      const isMultiDay = hol.startDate !== hol.endDate
                      const days = Math.round((new Date(hol.endDate).getTime() - new Date(hol.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                      
                      return (
                        <div key={hol.id} className="relative group animate-fade-in">
                          {/* Timeline Dot Indicator */}
                          <div className={cn(
                            "absolute -left-[31px] top-0.5 size-4 rounded-full border-2 border-white flex items-center justify-center shadow-md shrink-0 transition-transform duration-200 group-hover:scale-110",
                            status === "Active" ? "bg-emerald-500 animate-ping" :
                            status === "Upcoming" ? "bg-primary" : "bg-slate-300"
                          )} />
                          {status === "Active" && (
                            <div className="absolute -left-[31px] top-0.5 size-4 rounded-full border-2 border-white bg-emerald-500 shadow-md" />
                          )}

                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{hol.title}</h4>
                                  <Badge className={cn(
                                    "text-[9px] py-0.2 px-1.5 font-bold border",
                                    hol.type === "National" ? "bg-red-50 text-red-700 border-red-200" :
                                    hol.type === "Academic" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                    hol.type === "Regional" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                    hol.type === "Emergency" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    "bg-slate-50 text-slate-600 border-slate-200"
                                  )}>
                                    {hol.type}
                                  </Badge>
                                  <Badge className={cn(
                                    "text-[9px] py-0.2 px-1.5 font-bold border",
                                    status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    status === "Upcoming" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    "bg-slate-50 text-slate-400 border-slate-200"
                                  )}>
                                    {status === "Active" ? "Ongoing" : status === "Upcoming" ? "Upcoming" : "Concluded"}
                                  </Badge>
                                </div>
                                
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 font-mono uppercase">
                                  <Calendar className="size-3 text-slate-400" /> 
                                  {new Date(hol.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                  {isMultiDay && ` to ${new Date(hol.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}`}
                                  {` · (${days} ${days === 1 ? "Day" : "Days"})`}
                                </p>
                              </div>

                              {isOwner && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="size-7 p-0 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                    onClick={() => handleOpenEdit(hol)}
                                  >
                                    <Edit3 className="size-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="size-7 p-0 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                                    onClick={() => handleDeleteHoliday(hol.id)}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl pr-4">
                              {hol.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Distribution Panel (Right) */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-base font-bold">Category Distribution</CardTitle>
                <CardDescription>Aggregate break breakdown for scheduling analysis</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3.5">
                  {(() => {
                    const types: Holiday["type"][] = ["National", "Regional", "Academic", "Emergency", "Other"]
                    return types.map(t => {
                      const count = holidays.filter(h => h.type === t).length
                      const pct = totalHolidaysCount > 0 ? (count / totalHolidaysCount) * 100 : 0
                      
                      return (
                        <div key={t} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>{t} Breaks</span>
                            <span className="font-mono text-[11px] font-bold text-slate-800">{count} Events</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-300",
                                t === "National" ? "bg-red-500" :
                                t === "Academic" ? "bg-indigo-500" :
                                t === "Regional" ? "bg-purple-500" :
                                t === "Emergency" ? "bg-amber-500" : "bg-slate-400"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {selectedHoliday && (
        <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setSelectedHoliday(null) }}>
          <DialogContent className="max-w-md w-full rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="bg-slate-50 border-b border-slate-100 p-6">
              <DialogTitle className="font-headline text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="size-5 text-primary" /> Modify Holiday: {selectedHoliday.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update date ranges, category, and remarks for the scheduled break.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-bold text-slate-700">Holiday Title</Label>
                <Input 
                  id="edit-title" 
                  className="rounded-xl h-10 text-xs border-slate-200" 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-type" className="text-xs font-bold text-slate-700">Holiday Category</Label>
                  <Select value={editType} onValueChange={(val: Holiday["type"]) => setEditType(val)}>
                    <SelectTrigger id="edit-type" className="rounded-xl h-10 text-xs border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="National" className="text-xs">National</SelectItem>
                      <SelectItem value="Regional" className="text-xs">Regional</SelectItem>
                      <SelectItem value="Academic" className="text-xs">Academic</SelectItem>
                      <SelectItem value="Emergency" className="text-xs">Emergency</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-start" className="text-xs font-bold text-slate-700">Start Date</Label>
                  <Input 
                    id="edit-start" 
                    type="date"
                    className="rounded-xl h-10 text-xs border-slate-200" 
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-end" className="text-xs font-bold text-slate-700">End Date</Label>
                  <Input 
                    id="edit-end" 
                    type="date"
                    className="rounded-xl h-10 text-xs border-slate-200" 
                    value={editEndDate}
                    onChange={e => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Overlap Warning Engine Output */}
              {editOverlapWarning && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs animate-shake">
                  <Info className="size-4 shrink-0 mt-0.5 text-amber-600" />
                  <p className="font-semibold">{editOverlapWarning}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc" className="text-xs font-bold text-slate-700">Description / Details</Label>
                <Textarea 
                  id="edit-desc" 
                  className="rounded-xl min-h-20 text-xs border-slate-200 resize-none" 
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" className="rounded-xl text-xs font-bold border-slate-200" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white">
                  Save Modifications
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
function StatCard({
  title,
  value,
  trend,
  trendDirection,
  subtext,
  icon: Icon,
  progress = 0
}: {
  title: string
  value: string | number
  trend: string
  trendDirection: "up" | "down" | "neutral"
  subtext: string
  icon: React.ComponentType<any>
  progress?: number
}) {
  return (
    <Card className="border-none shadow-xs hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100 overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500",
            trendDirection === "up" ? "bg-emerald-500" : trendDirection === "down" ? "bg-amber-500" : "bg-indigo-500"
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
        <div className={cn(
          "size-7 rounded-lg flex items-center justify-center border transition-all duration-200 group-hover:scale-105",
          trendDirection === "up" ? "bg-emerald-50 text-emerald-500 border-emerald-200/50" :
          trendDirection === "down" ? "bg-amber-50 text-amber-500 border-amber-200/50" :
          "bg-indigo-50 text-indigo-500 border-indigo-200/50"
        )}>
          <Icon className="size-4 shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-black font-headline tracking-tight text-slate-800 leading-none">
          {value}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-[9px] font-extrabold uppercase tracking-widest leading-none",
            trendDirection === "up" ? "text-emerald-600" : trendDirection === "down" ? "text-amber-600" : "text-indigo-600"
          )}>
            {trend}
          </span>
          <span className="text-[9px] font-bold text-slate-400 leading-none">{subtext}</span>
        </div>
      </CardContent>
    </Card>
  )
}

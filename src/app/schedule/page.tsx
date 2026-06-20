"use client"

import * as React from "react"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Layers, 
  SlidersHorizontal,
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  MapPin,
  HelpCircle,
  Users
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getScopedData, mockBatchesGenerator, getActiveRole } from "@/lib/tenant"

// --- Cohesive Types ---
interface ClassEvent {
  id: string
  batchId: string
  batchName: string
  subject: string
  teacherName: string
  time: string
  startHour: number // 24h format for timeline
  durationHours: number
  days: string[] // e.g. ["Mon", "Wed", "Fri"]
  room: string
  color: string
  capacity: number
  enrolled: number
  startDate?: string
}

interface Batch {
  id: string
  name: string
  subjects: string[]
  teacher: string
  time: string
  days: string[]
  students: number
  capacity: number
  color: string
  startDate?: string
}

const teachers = ["All Teachers", "Prof. Sarah Smith", "Dr. Alex Brown", "Anita Desai", "Suresh Patel", "Meena Gupta"]
const batches = ["All Batches", "Alpha Morning", "Beta Evening", "Gamma Chemistry", "Delta Biology", "English Board Prep"]
const daysOfWeekFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const daysOfWeekShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function SchedulePage() {
  const [viewMode, setViewMode] = React.useState<"day" | "week" | "month">("day")
  const [selectedTeacher, setSelectedTeacher] = React.useState("All Teachers")
  const [selectedBatch, setSelectedBatch] = React.useState("All Batches")
  
  // Date State
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 5, 18)) // Mock base date: Thursday, June 18, 2026
  const [selectedDayTab, setSelectedDayTab] = React.useState<number>(3) // Index representing Thursday (Mon=0, Tue=1... Sun=6)

  // Loaded batches list from localStorage
  const [batchesList, setBatchesList] = React.useState<Batch[]>([])

  const [activeRole, setActiveRole] = React.useState("owner")

  // Load from localStorage on mount
  React.useEffect(() => {
    const loadedBatches = getScopedData<any[]>("batches", mockBatchesGenerator)
    setBatchesList(loadedBatches)
    setActiveRole(getActiveRole())
  }, [])

  const isTeacher = activeRole === "teacher"
  const isStudentOrParent = activeRole === "student" || activeRole === "parent"

  const roleFilteredBatches = isTeacher
    ? batchesList.filter(b => b.teacher.includes("Sarah") || b.teacher.includes("Priya") || b.teacher.includes("Apex") || b.teacher.includes("Horizon"))
    : isStudentOrParent
      ? batchesList.filter(b => b.name.includes("Alpha") || b.name.includes("Prep A") || b.name.includes("Apex Alpha"))
      : batchesList

  // Parse time and map batches dynamically into ClassEvents
  const eventsList = React.useMemo<ClassEvent[]>(() => {
    return roleFilteredBatches.map((b, idx) => {
      let startHour = 9
      let durationHours = 1.5
      try {
        const parts = b.time.split(" - ")
        const startParts = parts[0].split(":")
        let hr = parseInt(startParts[0])
        const isPM = parts[0].toLowerCase().includes("pm")
        if (isPM && hr < 12) hr += 12
        if (!isPM && hr === 12) hr = 0
        startHour = hr
        
        if (parts.length > 1) {
          const endParts = parts[1].split(":")
          let endHr = parseInt(endParts[0])
          const endPM = parts[1].toLowerCase().includes("pm")
          if (endPM && endHr < 12) endHr += 12
          if (!endPM && endHr === 12) endHr = 0
          const startMin = parseInt(startParts[1].substring(0, 2))
          const endMin = parseInt(endParts[1].substring(0, 2))
          durationHours = (endHr - hr) + (endMin - startMin) / 60
        }
      } catch (err) {
        console.error("Error parsing time for batch in schedule", b.name, err)
      }

      return {
        id: `e-${b.id}`,
        batchId: b.id,
        batchName: b.name,
        subject: b.subjects[0] || "General",
        teacherName: b.teacher,
        time: b.time,
        startHour: startHour,
        durationHours: durationHours,
        days: b.days,
        room: `Room ${101 + idx}`,
        color: b.color || "hsl(var(--primary))",
        capacity: b.capacity,
        enrolled: b.students,
        startDate: b.startDate
      }
    })
  }, [batchesList])

  // Navigate dates
  const handlePrevDate = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setMonth(currentDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNextDate = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + 7)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Get active day short name (e.g. "Thu")
  const getSelectedDayShort = () => {
    if (viewMode === "day") {
      const dayIndex = currentDate.getDay() // Sun = 0, Mon = 1, ...
      return daysOfWeekShort[dayIndex === 0 ? 6 : dayIndex - 1]
    }
    return daysOfWeekShort[selectedDayTab]
  }

  // Filters check & Date comparison check
  const filterEvents = (events: ClassEvent[], dayShort: string, targetDate?: Date) => {
    return events.filter(e => {
      const matchesDay = e.days.includes(dayShort)
      const matchesTeacher = selectedTeacher === "All Teachers" || e.teacherName === selectedTeacher
      const matchesBatch = selectedBatch === "All Batches" || e.batchName === selectedBatch
      
      let matchesStartDate = true
      if (targetDate && e.startDate) {
        const batchStart = new Date(e.startDate)
        batchStart.setHours(0, 0, 0, 0)
        const cellDate = new Date(targetDate)
        cellDate.setHours(0, 0, 0, 0)
        matchesStartDate = cellDate >= batchStart
      }
      
      return matchesDay && matchesTeacher && matchesBatch && matchesStartDate
    })
  }

  const activeDayShort = getSelectedDayShort()
  const activeEvents = filterEvents(eventsList, activeDayShort, currentDate)

  // Generate calendar grid for Month View
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonthIndex = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert to Mon=0...
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayIndex = getFirstDayOfMonthIndex(year, month)
  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const calendarDays = []
  // Prepend blanks for starting index
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null)
  }
  // Fill calendar days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d))
  }

  // Calculate schedule utilization metrics dynamically based on filters
  const totalClassesWeek = eventsList.filter(c => {
    const matchesTeacher = selectedTeacher === "All Teachers" || c.teacherName === selectedTeacher
    const matchesBatch = selectedBatch === "All Batches" || c.batchName === selectedBatch
    return matchesTeacher && matchesBatch
  }).length * 3 // Multiplied by frequency
  
  const totalHoursWeek = eventsList.reduce((acc, c) => {
    const matchesTeacher = selectedTeacher === "All Teachers" || c.teacherName === selectedTeacher
    const matchesBatch = selectedBatch === "All Batches" || c.batchName === selectedBatch
    if (matchesTeacher && matchesBatch) {
      return acc + (c.durationHours * c.days.length)
    }
    return acc
  }, 0)

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-6">
      {/* Header and Toggle Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Schedule Planner</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Detailed schedule insights, utilization, and timeline controls.</p>
          </div>
        </div>

        {/* Day / Week / Month Toggle Selector */}
        <div className="flex items-center bg-muted p-1 rounded-xl w-full md:w-auto self-start md:self-center">
          <button 
            onClick={() => setViewMode("day")}
            className={cn("flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all", 
              viewMode === "day" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Day
          </button>
          <button 
            onClick={() => setViewMode("week")}
            className={cn("flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all", 
              viewMode === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Week
          </button>
          <button 
            onClick={() => setViewMode("month")}
            className={cn("flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all", 
              viewMode === "month" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Month
          </button>
        </div>
      </header>

      {/* Analytics Insights Dashboard Panel */}
      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="text-sm font-headline font-bold leading-none">{totalHoursWeek} Hours</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Scheduled / Week</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-sm font-headline font-bold leading-none">{totalClassesWeek} Slots</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Active Classes / Week</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <p className="text-sm font-headline font-bold leading-none">82.5%</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Teacher Utilization</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <BookOpen className="size-4" />
            </div>
            <div>
              <p className="text-sm font-headline font-bold leading-none">04:00 PM</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Peak Academic Hour</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Control Filters Bar */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-center gap-3 bg-muted/10">
          <div className="flex items-center gap-2 w-full">
            <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
            <div className="grid grid-cols-2 gap-2 w-full">
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="h-9 rounded-xl bg-background text-xs">
                  <SelectValue placeholder="Filter Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="h-9 rounded-xl bg-background text-xs">
                  <SelectValue placeholder="Filter Batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(b => (
                    <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handlePrevDate}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs font-bold whitespace-nowrap px-1">
                {viewMode === "day" && currentDate.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                {viewMode === "week" && `Week of ${new Date(currentDate.getTime() - currentDate.getDay() * 24*60*60*1000).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}`}
                {viewMode === "month" && monthLabel}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleNextDate}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
            
            {(selectedTeacher !== "All Teachers" || selectedBatch !== "All Batches") && (
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-destructive" onClick={() => {
                setSelectedTeacher("All Teachers")
                setSelectedBatch("All Batches")
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Core Timetable Planners */}
      <section>
        {/* ===================== DAY VIEW ===================== */}
        {viewMode === "day" && (
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Timeline hour-by-hour (2 cols) */}
            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-2 border-b border-border/40 bg-muted/10">
                <CardTitle className="font-headline text-base font-bold flex items-center justify-between">
                  <span>Timeline View</span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {activeEvents.length} Classes Scheduled
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative divide-y divide-border/20">
                  {/* Hours timeline loop */}
                  {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((hour) => {
                    const hourLabel = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`
                    const classesInSlot = activeEvents.filter(e => e.startHour === hour)
                    
                    return (
                      <div key={hour} className="flex min-h-[70px] relative group hover:bg-muted/5 transition-colors">
                        <div className="w-20 md:w-24 px-4 py-3 border-r border-border/10 text-[10px] font-bold text-muted-foreground text-right shrink-0">
                          {hourLabel}
                        </div>
                        <div className="flex-1 p-2 flex flex-col gap-2">
                          {classesInSlot.length === 0 ? (
                            <div className="h-full flex items-center text-[10px] text-muted-foreground/40 italic px-2">
                              No active slots
                            </div>
                          ) : (
                            classesInSlot.map((cls) => (
                              <div 
                                key={cls.id} 
                                className="p-3 rounded-xl border border-l-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm transition-all hover:scale-[1.005]"
                                style={{ borderLeftColor: cls.color, backgroundColor: `${cls.color}08` }}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold leading-none">{cls.batchName}</h4>
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{cls.subject}</Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                    <Clock className="size-3" /> {cls.time} · <MapPin className="size-3" /> {cls.room}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="size-6 shrink-0 ring-1 ring-border/20">
                                      <AvatarFallback className="text-[9px] font-bold bg-muted">{cls.teacherName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-medium text-muted-foreground">{cls.teacherName}</span>
                                  </div>
                                  <div className="text-right text-[10px] hidden sm:block">
                                    <p className="font-bold">{cls.enrolled}/{cls.capacity}</p>
                                    <p className="text-[8px] text-muted-foreground font-semibold uppercase">Capacity</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Teacher statuses & Availability right column */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-base font-bold">Faculty Availability Today</CardTitle>
                  <CardDescription>Track teaching schedules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Prof. Sarah Smith", subject: "Math & Physics", status: "Active", load: "3.0h scheduled", color: "bg-green-100 text-green-700" },
                    { name: "Dr. Alex Brown", subject: "Physics", status: "Active", load: "1.5h scheduled", color: "bg-green-100 text-green-700" },
                    { name: "Anita Desai", subject: "Chemistry", status: "Active", load: "1.5h scheduled", color: "bg-green-100 text-green-700" },
                    { name: "Suresh Patel", subject: "Biology", status: "Off-duty", load: "No sessions", color: "bg-amber-100 text-amber-700" },
                    { name: "Meena Gupta", subject: "English", status: "Leave", load: "On Leave", color: "bg-red-100 text-red-700" }
                  ].map((teacher) => (
                    <div key={teacher.name} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px] bg-muted font-bold">{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold leading-tight">{teacher.name}</p>
                          <p className="text-[9px] text-muted-foreground">{teacher.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn("text-[9px] border-none font-bold py-0.5", teacher.color)}>
                          {teacher.status}
                        </Badge>
                        <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{teacher.load}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ===================== WEEK VIEW ===================== */}
        {viewMode === "week" && (
          <div className="space-y-6">
            {/* Desktop Week Grid */}
            <div className="hidden lg:grid grid-cols-7 gap-4">
              {daysOfWeekShort.map((day, idx) => {
                const dayEvents = filterEvents(eventsList, day, new Date(currentDate.getTime() + (idx - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000))
                const isSelected = selectedDayTab === idx
                return (
                  <Card 
                    key={day} 
                    onClick={() => setSelectedDayTab(idx)}
                    className={cn("border-none shadow-sm hover:shadow-md transition-all cursor-pointer border-t-4",
                      isSelected ? "ring-2 ring-primary/45 border-t-primary" : "border-t-muted/40"
                    )}
                  >
                    <CardHeader className="p-3 text-center bg-muted/10 border-b border-border/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{daysOfWeekFull[idx]}</p>
                      <p className="text-sm font-headline font-bold mt-0.5">{day}</p>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3 min-h-[280px]">
                      {dayEvents.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground/30 italic text-center py-20">
                          Empty schedule
                        </div>
                      ) : (
                        dayEvents.map((evt) => (
                          <div 
                            key={evt.id} 
                            className="p-2.5 rounded-lg border text-[10px] font-medium flex flex-col gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                            style={{ borderLeft: `3px solid ${evt.color}`, backgroundColor: `${evt.color}05` }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold truncate leading-none">{evt.batchName}</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground truncate">{evt.teacherName}</span>
                            <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-semibold">
                              <Clock className="size-2.5" />
                              <span className="truncate">{evt.time.split(" - ")[0]}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Mobile / Tablet Week Tab Swiper */}
            <div className="lg:hidden space-y-4">
              {/* Day selection pill tabs row */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {daysOfWeekShort.map((day, idx) => {
                  const dayEvents = filterEvents(eventsList, day, new Date(currentDate.getTime() + (idx - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000))
                  const isActive = selectedDayTab === idx
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayTab(idx)}
                      className={cn("px-4 py-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 min-w-[65px] transition-all",
                        isActive 
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.03]" 
                          : "bg-background border-border/60 text-muted-foreground hover:bg-muted/10"
                      )}
                    >
                      <span>{day}</span>
                      <Badge className={cn("text-[9px] px-1 py-0 border-none shrink-0", 
                        isActive ? "bg-white text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {dayEvents.length}
                      </Badge>
                    </button>
                  )
                })}
              </div>

              {/* Event card list for selected mobile day */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                  <CardTitle className="font-headline text-base font-bold flex items-center justify-between">
                    <span>{daysOfWeekFull[selectedDayTab]}'s Timing List</span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {filterEvents(eventsList, daysOfWeekShort[selectedDayTab], new Date(currentDate.getTime() + (selectedDayTab - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000)).length} Active classes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {filterEvents(eventsList, daysOfWeekShort[selectedDayTab], new Date(currentDate.getTime() + (selectedDayTab - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000)).length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-xs italic">
                      No classes scheduled for {daysOfWeekFull[selectedDayTab]}.
                    </div>
                  ) : (
                    filterEvents(eventsList, daysOfWeekShort[selectedDayTab], new Date(currentDate.getTime() + (selectedDayTab - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000)).map((evt) => (
                      <div 
                        key={evt.id} 
                        className="p-4 rounded-xl border border-l-4 space-y-3 shadow-sm"
                        style={{ borderLeftColor: evt.color, backgroundColor: `${evt.color}05` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold">{evt.batchName}</h4>
                              <Badge variant="secondary" className="text-[9px]">{evt.subject}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{evt.room}</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[9px] border-none font-bold">
                            {evt.enrolled}/{evt.capacity} students
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-border/30 pt-2 text-[10px]">
                          <span className="flex items-center gap-1 text-muted-foreground font-medium">
                            <Clock className="size-3.5" /> {evt.time}
                          </span>
                          <span className="flex items-center gap-1.5 font-bold text-foreground">
                            <Avatar className="size-5">
                              <AvatarFallback className="text-[8px] bg-muted font-bold">{evt.teacherName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {evt.teacherName}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ===================== MONTH VIEW ===================== */}
        {viewMode === "month" && (
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Calendar Month Grid (2 cols) */}
            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                <CardTitle className="font-headline text-base font-bold flex items-center justify-between">
                  <span>Calendar Planner</span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {monthLabel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {/* Calendar Days Headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
                  {daysOfWeekShort.map(d => <span key={d} className="py-1">{d}</span>)}
                </div>
                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`blank-${idx}`} className="aspect-square bg-muted/10 rounded-lg opacity-40" />
                    
                    const dateNum = day.getDate()
                    const dayShort = daysOfWeekShort[day.getDay() === 0 ? 6 : day.getDay() - 1]
                    const eventsForDay = filterEvents(eventsList, dayShort, day)
                    const isSelected = currentDate.getDate() === dateNum

                    return (
                      <div 
                        key={idx}
                        onClick={() => {
                          const newD = new Date(currentDate)
                          newD.setDate(dateNum)
                          setCurrentDate(newD)
                        }}
                        className={cn("aspect-square p-1 rounded-xl border border-border/20 flex flex-col justify-between transition-all cursor-pointer group hover:bg-muted/10 relative",
                          isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-background",
                          eventsForDay.length > 0 && "font-bold"
                        )}
                      >
                        <span className={cn("text-[10px] px-1 rounded-md self-start",
                          isSelected ? "bg-primary text-white" : "text-muted-foreground"
                        )}>
                          {dateNum}
                        </span>
                        
                        {/* Dot indicator indicators */}
                        {eventsForDay.length > 0 && (
                          <div className="flex gap-0.5 justify-center py-1 mt-auto w-full">
                            {eventsForDay.slice(0, 3).map((evt, i) => (
                              <span key={i} className="size-1 rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                            ))}
                            {eventsForDay.length > 3 && (
                              <span className="text-[6px] text-muted-foreground font-bold leading-none shrink-0">+</span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected day timeline details sidebar */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-headline text-base font-bold">
                      Day Detail
                    </CardTitle>
                    <CardDescription>
                      {currentDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                    {activeEvents.length} Sessions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {activeEvents.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-xs italic">
                    No classes scheduled on this day.
                  </div>
                ) : (
                  activeEvents.map((evt) => (
                    <div 
                      key={evt.id} 
                      className="p-3 rounded-xl border border-l-4 space-y-2.5 transition-all hover:scale-[1.01]"
                      style={{ borderLeftColor: evt.color, backgroundColor: `${evt.color}05` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold leading-tight">{evt.batchName}</h4>
                        <span className="text-[8px] text-muted-foreground shrink-0 font-bold uppercase">{evt.room}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium"><Clock className="size-3" /> {evt.time}</span>
                        <span className="font-bold text-foreground truncate">{evt.teacherName}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}

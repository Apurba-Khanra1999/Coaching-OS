"use client"

import * as React from "react"
import {
  Bell,
  BellRing,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  X,
  MoreVertical,
  AlertCircle,
  CreditCard,
  CalendarCheck,
  MessageSquare,
  Users,
  Settings,
  ChevronDown,
  Archive,
  Star,
  Clock,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

// --- Types & Data ---
interface Notification {
  id: string
  title: string
  description: string
  type: "fee" | "attendance" | "communication" | "system" | "student"
  priority: "high" | "medium" | "low"
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  timestamp: string
  relativeTime: string
}

const initialNotifications: Notification[] = [
  {
    id: "N-001",
    title: "Fee Payment Overdue",
    description: "Alex Brown's tuition fee for June 2026 is 15 days overdue. Total due: ₹5,000. Please follow up with the guardian.",
    type: "fee",
    priority: "high",
    isRead: false,
    isStarred: false,
    isArchived: false,
    timestamp: "2026-06-17T10:30:00",
    relativeTime: "2 hours ago",
  },
  {
    id: "N-002",
    title: "Attendance Below Threshold",
    description: "Sophie Turner's attendance in Batch Gamma has dropped below 75% this month. Consider sending an alert to parents.",
    type: "attendance",
    priority: "high",
    isRead: false,
    isStarred: true,
    isArchived: false,
    timestamp: "2026-06-17T09:15:00",
    relativeTime: "3 hours ago",
  },
  {
    id: "N-003",
    title: "WhatsApp Group Created",
    description: "Batch Alpha WhatsApp group has been successfully created. 8 students have been added via invite link.",
    type: "communication",
    priority: "low",
    isRead: false,
    isStarred: false,
    isArchived: false,
    timestamp: "2026-06-17T08:00:00",
    relativeTime: "4 hours ago",
  },
  {
    id: "N-004",
    title: "New Student Enrollment",
    description: "Priya Sharma has been enrolled in Batch Beta (Physics). Guardian contact and fee structure have been configured.",
    type: "student",
    priority: "medium",
    isRead: true,
    isStarred: false,
    isArchived: false,
    timestamp: "2026-06-16T16:45:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-005",
    title: "Bulk SMS Delivered",
    description: "Monthly fee reminder sent to 42 parents across all batches. 40 delivered, 2 failed. Check communication logs for details.",
    type: "communication",
    priority: "medium",
    isRead: true,
    isStarred: false,
    isArchived: false,
    timestamp: "2026-06-16T14:20:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-006",
    title: "System Maintenance Completed",
    description: "Database backup and system maintenance completed successfully. All services are running normally.",
    type: "system",
    priority: "low",
    isRead: true,
    isStarred: false,
    isArchived: false,
    timestamp: "2026-06-16T06:00:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-007",
    title: "5 Students Absent Today",
    description: "Batch Alpha: 2 absent, Batch Beta: 1 absent, Batch Gamma: 2 absent. Absent students have been notified via WhatsApp.",
    type: "attendance",
    priority: "medium",
    isRead: true,
    isStarred: false,
    isArchived: false,
    timestamp: "2026-06-15T17:30:00",
    relativeTime: "2 days ago",
  },
  {
    id: "N-008",
    title: "Fee Collection Target Reached",
    description: "Congratulations! 95% of June 2026 fees have been collected. Outstanding amount: ₹12,500 from 3 students.",
    type: "fee",
    priority: "low",
    isRead: true,
    isStarred: true,
    isArchived: false,
    timestamp: "2026-06-15T12:00:00",
    relativeTime: "2 days ago",
  },
]

const notificationTypeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  fee: { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50", label: "Finance" },
  attendance: { icon: CalendarCheck, color: "text-indigo-600", bg: "bg-indigo-50", label: "Attendance" },
  communication: { icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50", label: "Communication" },
  system: { icon: Settings, color: "text-slate-600", bg: "bg-slate-100", label: "System" },
  student: { icon: Users, color: "text-violet-600", bg: "bg-violet-50", label: "Students" },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  high: { color: "text-red-700", bg: "bg-red-50 border-red-200" },
  medium: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  low: { color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = React.useState(initialNotifications)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [activeTab, setActiveTab] = React.useState("all")
  const [isLoading, setIsLoading] = React.useState(true)

  // Settings
  const [emailNotifs, setEmailNotifs] = React.useState(true)
  const [whatsappNotifs, setWhatsappNotifs] = React.useState(true)
  const [appNotifs, setAppNotifs] = React.useState(true)
  const [feeAlerts, setFeeAlerts] = React.useState(true)
  const [attendanceAlerts, setAttendanceAlerts] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Actions
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast({ title: "All Marked Read", description: "All notifications have been marked as read." })
  }

  const toggleStar = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n))
  }

  const archiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: true, isRead: true } : n))
    toast({ title: "Archived", description: "Notification moved to archive." })
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast({ title: "Deleted", description: "Notification has been removed.", variant: "destructive" })
  }

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isArchived: true, isRead: true })))
    toast({ title: "Cleared", description: "All notifications moved to archive." })
  }

  // Filtered notifications
  const getFilteredNotifications = () => {
    let filtered = notifications

    // Tab filtering
    if (activeTab === "unread") filtered = filtered.filter(n => !n.isRead && !n.isArchived)
    else if (activeTab === "starred") filtered = filtered.filter(n => n.isStarred && !n.isArchived)
    else if (activeTab === "archived") filtered = filtered.filter(n => n.isArchived)
    else filtered = filtered.filter(n => !n.isArchived)

    // Type filter
    if (typeFilter !== "all") filtered = filtered.filter(n => n.type === typeFilter)

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length
  const starredCount = notifications.filter(n => n.isStarred && !n.isArchived).length
  const archivedCount = notifications.filter(n => n.isArchived).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Bell className="size-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Bell className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Notifications</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage alerts, updates & system messages</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2" onClick={markAllAsRead}>
              <CheckCheck className="size-3.5" /> Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold gap-2" onClick={clearAll}>
            <Archive className="size-3.5" /> Clear All
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <TabsList className="bg-muted/50 p-1 rounded-xl h-10">
                <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-4">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="rounded-lg text-xs font-bold px-4 gap-1.5">
                  Unread
                  {unreadCount > 0 && (
                    <span className="size-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="starred" className="rounded-lg text-xs font-bold px-4 gap-1.5">
                  Starred
                  {starredCount > 0 && (
                    <span className="text-[10px] text-amber-600 font-bold">({starredCount})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived" className="rounded-lg text-xs font-bold px-4">Archive</TabsTrigger>
              </TabsList>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[140px] rounded-xl text-xs font-medium border-border/60">
                  <span className="flex items-center gap-1.5">
                    <Filter className="size-3 text-muted-foreground" />
                    <SelectValue placeholder="All Types" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="fee" className="text-xs">Finance</SelectItem>
                  <SelectItem value="attendance" className="text-xs">Attendance</SelectItem>
                  <SelectItem value="communication" className="text-xs">Communication</SelectItem>
                  <SelectItem value="student" className="text-xs">Students</SelectItem>
                  <SelectItem value="system" className="text-xs">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-9 bg-background rounded-xl h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 size-7" onClick={() => setSearchTerm("")}>
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Notification List */}
            <div className="mt-4">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-16 text-center">
                      <div className="size-16 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
                        <BellOff className="size-7 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {activeTab === "unread" ? "You're all caught up!" : "Try adjusting your filters"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {filteredNotifications.map((notification, i) => {
                        const typeConf = notificationTypeConfig[notification.type]
                        const Icon = typeConf.icon
                        const prioConf = priorityConfig[notification.priority]

                        return (
                          <div
                            key={notification.id}
                            className={cn(
                              "flex gap-3 p-4 transition-all duration-200 group cursor-pointer hover:bg-muted/5",
                              !notification.isRead && "bg-primary/[0.02] border-l-2 border-l-primary"
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            {/* Icon */}
                            <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", typeConf.bg, typeConf.color)}>
                              <Icon className="size-4.5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={cn("text-sm font-bold leading-tight", !notification.isRead && "text-foreground", notification.isRead && "text-foreground/80")}>
                                    {notification.title}
                                  </h4>
                                  {notification.priority === "high" && (
                                    <Badge className="text-[8px] h-4 px-1.5 bg-red-100 text-red-700 border-none font-black uppercase">
                                      Urgent
                                    </Badge>
                                  )}
                                  {!notification.isRead && (
                                    <span className="size-2 rounded-full bg-primary shrink-0" />
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0 mt-0.5">
                                  {notification.relativeTime}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                                {notification.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider border-border/50">
                                    {typeConf.label}
                                  </Badge>
                                </div>
                                {/* Action buttons (visible on hover) */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={(e) => { e.stopPropagation(); toggleStar(notification.id) }}
                                  >
                                    <Star className={cn("size-3.5", notification.isStarred ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={(e) => { e.stopPropagation(); archiveNotification(notification.id) }}
                                  >
                                    <Archive className="size-3.5 text-muted-foreground" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="size-7" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="size-3.5 text-muted-foreground" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => markAsRead(notification.id)}>
                                        <Check className="size-3 mr-2" /> Mark as Read
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => toggleStar(notification.id)}>
                                        <Star className="size-3 mr-2" /> {notification.isStarred ? "Unstar" : "Star"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => archiveNotification(notification.id)}>
                                        <Archive className="size-3 mr-2" /> Archive
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-xs cursor-pointer text-destructive" onClick={() => deleteNotification(notification.id)}>
                                        <Trash2 className="size-3 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </div>

        {/* Right Panel: Quick Stats + Settings */}
        <div className="lg:col-span-4 space-y-5">
          {/* Summary Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted/20 overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Sparkles className="size-3" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                  <div className="size-9 rounded-lg flex items-center justify-center bg-white/80 shadow-sm text-primary">
                    <BellRing className="size-4" />
                  </div>
                  <div>
                    <p className="text-xl font-headline font-bold leading-none">{unreadCount}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Unread</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                  <div className="size-9 rounded-lg flex items-center justify-center bg-white/80 shadow-sm text-amber-600">
                    <Star className="size-4" />
                  </div>
                  <div>
                    <p className="text-xl font-headline font-bold leading-none">{starredCount}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Starred</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
                  <div className="size-9 rounded-lg flex items-center justify-center bg-white/80 shadow-sm text-emerald-600">
                    <CheckCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xl font-headline font-bold leading-none">{notifications.filter(n => n.isRead && !n.isArchived).length}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Read</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="size-9 rounded-lg flex items-center justify-center bg-white/80 shadow-sm text-slate-600">
                    <Archive className="size-4" />
                  </div>
                  <div>
                    <p className="text-xl font-headline font-bold leading-none">{archivedCount}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Archived</p>
                  </div>
                </div>
              </div>

              {/* Priority breakdown */}
              <Separator className="bg-border/30" />
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By Priority</p>
                {(["high", "medium", "low"] as const).map(prio => {
                  const count = notifications.filter(n => n.priority === prio && !n.isArchived).length
                  const total = notifications.filter(n => !n.isArchived).length
                  const percent = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={prio} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold capitalize w-14 text-muted-foreground">{prio}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            prio === "high" ? "bg-red-500" : prio === "medium" ? "bg-amber-500" : "bg-slate-400"
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Settings className="size-3" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {/* Channel Preferences */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Channels</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <svg className="size-3.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </div>
                      <span className="text-xs font-medium">WhatsApp</span>
                    </div>
                    <Switch checked={whatsappNotifs} onCheckedChange={setWhatsappNotifs} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <MessageSquare className="size-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium">Email</span>
                    </div>
                    <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Bell className="size-3.5 text-violet-600" />
                      </div>
                      <span className="text-xs font-medium">App Notifications</span>
                    </div>
                    <Switch checked={appNotifs} onCheckedChange={setAppNotifs} />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Alert Preferences */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Auto Alerts</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <CreditCard className="size-3.5 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium">Fee Due Alerts</span>
                    </div>
                    <Switch checked={feeAlerts} onCheckedChange={setFeeAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <CalendarCheck className="size-3.5 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium">Low Attendance</span>
                    </div>
                    <Switch checked={attendanceAlerts} onCheckedChange={setAttendanceAlerts} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

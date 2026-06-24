"use client"

import * as React from "react"
import {
  MessageSquare,
  Send,
  History,
  Bell,
  Smartphone,
  Mail,
  Plus,
  Search,
  Filter,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  MoreVertical,
  Users,
  User,
  Link2,
  ExternalLink,
  Settings,
  Sparkles,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  getScopedData, 
  setScopedData, 
  mockNotificationsGenerator, 
  mockStudentsGenerator,
  mockBatchesGenerator,
  Notification,
  Student,
  Batch,
  getActiveRole,
  getActiveTenant
} from "@/lib/tenant"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

// WhatsApp SVG icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// --- Data ---
interface WhatsAppGroup {
  batchId: string
  batchName: string
  groupLink: string
  membersCount: number
  isActive: boolean
}

// Batch/student color palette for visual distinction
const batchColors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-violet-500"]

const initialTemplates = [
  { id: 1, name: "Attendance Alert", category: "Daily", content: "Dear Parent, [Student Name] was absent from the [Batch Name] session today. Please contact us for details." },
  { id: 2, name: "Fee Reminder", category: "Finance", content: "Reminder: Tuition fees for the month of [Month] are due on [Date]. Ignore if already paid." },
  { id: 3, name: "Holiday Notice", category: "Daily", content: "The institute will remain closed on [Date] due to [Occasion]. Classes resume on [Resume Date]." },
  { id: 4, name: "WhatsApp Welcome", category: "Communication", content: "Welcome to [Batch Name] WhatsApp group! Please keep this group for academic discussions and important updates only." },
]

const initialLogs = [
  { id: "LOG-001", recipient: "All Parents", channel: "WhatsApp", message: "Monthly performance reports have been dispatched.", status: "Sent", time: "2026-06-17 10:00 AM" },
  { id: "LOG-002", recipient: "Batch Alpha", channel: "Email", message: "Chemistry lab session moved to Friday 4 PM.", status: "Delivered", time: "2026-06-16 02:30 PM" },
  { id: "LOG-003", recipient: "Sarah Smith", channel: "WhatsApp", message: "Personal fee reminder sent.", status: "Delivered", time: "2026-06-16 11:15 AM" },
  { id: "LOG-004", recipient: "Fee Overdue", channel: "App", message: "Final reminder: Please clear pending dues to avoid suspension.", status: "Failed", time: "2026-06-15 09:15 AM" },
  { id: "LOG-005", recipient: "Batch Beta", channel: "Email", message: "Weekly test scheduled for Saturday 10 AM.", status: "Delivered", time: "2026-06-15 08:00 AM" },
]

type ChannelType = "WhatsApp" | "Email" | "App"
type AudienceType = "batchwise" | "individual"

export default function CommunicationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")

  // Live scoped data — always in sync with the rest of the application
  const [studentList, setStudentList] = React.useState<Student[]>([])
  const [batchList, setBatchList] = React.useState<(Batch & { color: string })[]>([])

  // Compose state
  const [message, setMessage] = React.useState("")
  const [channels, setChannels] = React.useState<Record<ChannelType, boolean>>({
    WhatsApp: true,
    Email: true,
    App: true,
  })
  const [audienceType, setAudienceType] = React.useState<AudienceType>("batchwise")
  const [selectedBatch, setSelectedBatch] = React.useState("")
  const [selectedStudent, setSelectedStudent] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)

  // Template state
  const [templateSearch, setTemplateSearch] = React.useState("")
  const [templateCategory, setTemplateCategory] = React.useState("all")

  // Log state
  const [logSearch, setLogSearch] = React.useState("")
  const [logChannelFilter, setLogChannelFilter] = React.useState("all")
  const [logs, setLogs] = React.useState<any[]>([])

  // WhatsApp Groups state
  const [whatsappGroups, setWhatsappGroups] = React.useState<WhatsAppGroup[]>([])
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null)
  const [editGroupLink, setEditGroupLink] = React.useState("")

  React.useEffect(() => {
    setActiveRole(getActiveRole())
    setActiveTenantId(getActiveTenant())
    setLogs(getScopedData<any[]>("communication_logs", () => initialLogs))

    // Load live students from scoped data — this reflects profile edits made anywhere
    const liveStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    setStudentList(liveStudents)

    // Load live batches from scoped data
    const liveBatches = getScopedData<Batch[]>("batches", mockBatchesGenerator)
    const batchesWithColor = liveBatches.map((b, i) => ({
      ...b,
      color: batchColors[i % batchColors.length],
    }))
    setBatchList(batchesWithColor)

    // Set default selected batch
    if (liveBatches.length > 0) {
      setSelectedBatch(liveBatches[0].id)
    }

    // Load or initialize WhatsApp groups from scoped data
    const savedGroups = getScopedData<WhatsAppGroup[]>("whatsapp_groups", () => {
      return liveBatches.map(b => ({
        batchId: b.id,
        batchName: b.name,
        groupLink: "",
        membersCount: 0,
        isActive: false,
      }))
    })
    // Ensure all current batches have a group entry
    const groupMap = new Map(savedGroups.map(g => [g.batchId, g]))
    const mergedGroups = liveBatches.map(b => {
      const existing = groupMap.get(b.id)
      if (existing) return { ...existing, batchName: b.name }
      return { batchId: b.id, batchName: b.name, groupLink: "", membersCount: 0, isActive: false }
    })
    setWhatsappGroups(mergedGroups)

    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // When audience type changes to batchwise, enable all channels
  React.useEffect(() => {
    if (audienceType === "batchwise") {
      setChannels({ WhatsApp: true, Email: true, App: true })
    }
  }, [audienceType])

  // Toggle a channel
  const toggleChannel = (ch: ChannelType) => {
    setChannels(prev => ({ ...prev, [ch]: !prev[ch] }))
  }

  // Helper to resolve placeholders for practical daily use
  // Uses live studentList and batchList from state (loaded from scoped data)
  const resolvePlaceholders = (text: string, audience: AudienceType, batchId: string, studentId: string) => {
    let resolved = text
    
    // Resolve date and month first
    const monthName = new Date().toLocaleString("default", { month: "long" })
    const currentDate = new Date().toLocaleDateString()
    
    resolved = resolved.replace(/\[Month\]/g, monthName)
    resolved = resolved.replace(/\[Date\]/g, currentDate)
    resolved = resolved.replace(/\[Occasion\]/g, "Holiday")
    resolved = resolved.replace(/\[Resume Date\]/g, "next Monday")

    if (audience === "individual") {
      const student = studentList.find(s => s.id === studentId)
      if (student) {
        resolved = resolved.replace(/\[Student Name\]/g, student.name)
        // Match batch by id or by name (students store batch as name string)
        const batch = batchList.find(b => b.id === student.batch || b.name === student.batch)
        if (batch) {
          resolved = resolved.replace(/\[Batch Name\]/g, batch.name)
        }
      }
    } else {
      const batch = batchList.find(b => b.id === batchId)
      if (batch) {
        resolved = resolved.replace(/\[Batch Name\]/g, batch.name)
      }
      resolved = resolved.replace(/\[Student Name\]/g, "your ward")
    }
    return resolved
  }

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Message",
        description: "Please enter some content before sending.",
      })
      return
    }

    const activeChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k) as ChannelType[]
    if (activeChannels.length === 0) {
      toast({
        variant: "destructive",
        title: "No Channel Selected",
        description: "Please select at least one delivery channel.",
      })
      return
    }

    if (audienceType === "individual" && !selectedStudent) {
      toast({
        variant: "destructive",
        title: "No Student Selected",
        description: "Please select a student for individual messaging.",
      })
      return
    }

    setIsSending(true)

    // Re-fetch latest student data at send time to guarantee freshest phone numbers
    const freshStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    
    // Resolve placeholders in message body
    const resolvedMessage = resolvePlaceholders(message, audienceType, selectedBatch, selectedStudent)

    // Find recipient target label
    const target = audienceType === "batchwise"
      ? batchList.find(b => b.id === selectedBatch)?.name || selectedBatch
      : freshStudents.find(s => s.id === selectedStudent)?.name || "Student"

    // 1. Process APP NOTIFICATION Dispatch
    if (channels.App) {
      const currentNotifs = getScopedData<Notification[]>("notifications", mockNotificationsGenerator)
      const newNotif: Notification = {
        id: `N-${Math.floor(100000 + Math.random() * 900000)}`,
        title: audienceType === "batchwise" ? `Announcement: ${target}` : `Alert: ${target}`,
        description: resolvedMessage,
        type: "communication",
        priority: "medium",
        isRead: false,
        isStarred: false,
        isArchived: false,
        timestamp: new Date().toISOString(),
        relativeTime: "Just now"
      }
      const updatedNotifs = [newNotif, ...currentNotifs]
      setScopedData<Notification[]>("notifications", updatedNotifs)
    }

    // 2. Process WHATSAPP REDIRECTION with prefilled resolved messages
    let whatsappOpened = false
    if (channels.WhatsApp) {
      if (audienceType === "individual") {
        // Use freshly fetched student data for the most up-to-date phone number
        const student = freshStudents.find(s => s.id === selectedStudent)
        if (student) {
          // Clean phone number (strip spaces/plus/symbols), prepend 91 if needed
          let cleanPhone = student.phone.replace(/[^0-9]/g, "")
          // Ensure country code is present (default: India +91)
          if (cleanPhone.length === 10) {
            cleanPhone = "91" + cleanPhone
          }
          const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(resolvedMessage)}`
          window.open(waUrl, "_blank")
          whatsappOpened = true
        }
      } else {
        // Group broadcast: check if WhatsApp group link is configured
        const group = whatsappGroups.find(g => g.batchId === selectedBatch)
        if (group?.isActive && group.groupLink) {
          // Open the group link directly (message can be copied)
          window.open(group.groupLink, "_blank")
          whatsappOpened = true
        } else {
          // Fallback: Open WhatsApp web with prefilled message for manual send
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(resolvedMessage)}`
          window.open(waUrl, "_blank")
          whatsappOpened = true
        }
      }
    }

    // 3. Process logs and save to scoped store
    const currentLogs = getScopedData<any[]>("communication_logs", () => initialLogs)
    const newLogs = activeChannels.map(ch => ({
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      recipient: target,
      channel: ch,
      message: resolvedMessage,
      status: "Sent",
      time: new Date().toLocaleString()
    }))

    const updatedLogs = [...newLogs, ...currentLogs]
    setLogs(updatedLogs)
    setScopedData<any[]>("communication_logs", updatedLogs)

    setIsSending(false)
    toast({
      title: "Message Dispatched ✓",
      description: `Sent to ${target} via ${activeChannels.join(", ")}.${whatsappOpened ? " WhatsApp interface opened in browser." : ""}`,
    })
    setMessage("")
  }

  const applyTemplate = (content: string) => {
    setMessage(content)
    toast({
      title: "Template Applied",
      description: "Content has been copied to the message editor.",
    })
  }

  const handleSaveGroupLink = (batchId: string) => {
    const studentsInBatch = studentList.filter(s => s.batch === batchId || batchList.find(b => b.id === batchId)?.name === s.batch)
    const updatedGroups = whatsappGroups.map(g =>
      g.batchId === batchId
        ? { ...g, groupLink: editGroupLink, isActive: !!editGroupLink, membersCount: editGroupLink ? studentsInBatch.length || batchList.find(b => b.id === batchId)?.studentsCount || 0 : 0 }
        : g
    )
    setWhatsappGroups(updatedGroups)
    setScopedData<WhatsAppGroup[]>("whatsapp_groups", updatedGroups)
    setEditingGroupId(null)
    setEditGroupLink("")
    toast({
      title: "Group Link Updated",
      description: editGroupLink ? "WhatsApp group link has been saved successfully." : "Group link removed.",
    })
  }

  const filteredTemplates = initialTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.content.toLowerCase().includes(templateSearch.toLowerCase())
    const matchesCategory = templateCategory === "all" || t.category === templateCategory
    return matchesSearch && matchesCategory
  })

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.recipient.toLowerCase().includes(logSearch.toLowerCase())
    const matchesChannel = logChannelFilter === "all" || l.channel === logChannelFilter
    return matchesSearch && matchesChannel
  })

  const charCount = message.length
  const activeChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k)

  const channelConfig: Record<ChannelType, { icon: React.ElementType | typeof WhatsAppIcon; color: string; bg: string; activeBg: string }> = {
    WhatsApp: { icon: WhatsAppIcon, color: "text-emerald-600", bg: "bg-emerald-50", activeBg: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" },
    Email: { icon: Mail, color: "text-blue-600", bg: "bg-blue-50", activeBg: "bg-blue-600 text-white shadow-md shadow-blue-600/20" },
    App: { icon: Bell, color: "text-violet-600", bg: "bg-violet-50", activeBg: "bg-violet-600 text-white shadow-md shadow-violet-600/20" },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <MessageSquare className="size-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading communications...</p>
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
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Communication Hub</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Send announcements via WhatsApp, Email & App notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-9 px-3 bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-2 font-bold text-xs">
            <WhatsAppIcon className="size-3.5" /> Groups Active: {whatsappGroups.filter(g => g.isActive).length}/{whatsappGroups.length}
          </Badge>
        </div>
      </header>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6 h-10">
          <TabsTrigger value="compose" className="rounded-lg px-5 text-xs font-bold gap-1.5">
            <Send className="size-3" /> Compose
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="rounded-lg px-5 text-xs font-bold gap-1.5">
            <WhatsAppIcon className="size-3" /> WhatsApp Groups
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-5 text-xs font-bold gap-1.5">
            <History className="size-3" /> Message Logs
          </TabsTrigger>
        </TabsList>

        {/* ========== COMPOSE TAB ========== */}
        <TabsContent value="compose" className="m-0">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Compose Form */}
            <Card className="lg:col-span-2 border-none shadow-sm flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-primary" /> New Message
                </CardTitle>
                <CardDescription>Broadcast to batches or send personal messages to individual students.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-1">
                {/* Target Audience Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em]">Target Audience</label>
                  <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl">
                    <Button
                      variant={audienceType === "batchwise" ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex-1 rounded-lg text-xs h-9 font-bold gap-2 transition-all",
                        audienceType === "batchwise" && "shadow-md"
                      )}
                      onClick={() => setAudienceType("batchwise")}
                    >
                      <Users className="size-3.5" /> Batchwise
                    </Button>
                    <Button
                      variant={audienceType === "individual" ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex-1 rounded-lg text-xs h-9 font-bold gap-2 transition-all",
                        audienceType === "individual" && "shadow-md"
                      )}
                      onClick={() => setAudienceType("individual")}
                    >
                      <User className="size-3.5" /> Individual
                    </Button>
                  </div>

                  {/* Batch / Student Selection */}
                  <div className="space-y-2">
                    {audienceType === "batchwise" ? (
                      <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger className="bg-muted/10 rounded-xl h-10">
                          <SelectValue placeholder="Select Batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batchList.map(b => (
                            <SelectItem key={b.id} value={b.id} className="text-xs font-medium">
                              <span className="flex items-center gap-2">
                                <span className={cn("size-2 rounded-full", b.color)} />
                                {b.name} ({b.studentsCount || b.students || 0} students)
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger className="bg-muted/10 rounded-xl h-10">
                          <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent>
                          {studentList.filter(s => s.status === "Active" || s.status === "On Leave").map(s => (
                            <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                              <span className="flex items-center gap-2">
                                <User className="size-3 text-muted-foreground" />
                                {s.name}
                                <span className="text-muted-foreground">— {s.phone || "No phone"}</span>
                                <span className="text-muted-foreground/50 text-[9px]">({s.batch})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Delivery Channels */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em]">Delivery Channels</label>
                  <div className="flex items-center gap-2">
                    {(Object.keys(channelConfig) as ChannelType[]).map(ch => {
                      const conf = channelConfig[ch]
                      const Icon = conf.icon
                      const isActive = channels[ch]

                      return (
                        <button
                          key={ch}
                          onClick={() => toggleChannel(ch)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-1 justify-center",
                            isActive ? conf.activeBg : `${conf.bg} ${conf.color} hover:opacity-80`
                          )}
                        >
                          <Icon className="size-4" />
                          {ch}
                        </button>
                      )
                    })}
                  </div>
                  {audienceType === "batchwise" && channels.WhatsApp && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <WhatsAppIcon className="size-3.5 text-emerald-600 shrink-0" />
                      <p className="text-[10px] text-emerald-700 font-medium">
                        WhatsApp messages will be sent to the <span className="font-bold">{batchList.find(b => b.id === selectedBatch)?.name}</span> group.
                        {!whatsappGroups.find(g => g.batchId === selectedBatch)?.isActive && (
                          <span className="text-red-600 font-bold"> No group link configured — set it up in WhatsApp Groups tab.</span>
                        )}
                      </p>
                    </div>
                  )}
                  {audienceType === "individual" && channels.WhatsApp && selectedStudent && (() => {
                    const student = studentList.find(s => s.id === selectedStudent)
                    return student ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <WhatsAppIcon className="size-3.5 text-emerald-600 shrink-0" />
                        <p className="text-[10px] text-emerald-700 font-medium">
                          WhatsApp message will be sent personally to <span className="font-bold">{student.name}</span> at <span className="font-bold">{student.phone || "No phone configured"}</span>
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>

                {/* Message Content */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em]">Message Content</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-destructive font-bold text-[10px]"
                      onClick={() => setMessage("")}
                      disabled={!message}
                    >
                      <X className="size-3 mr-1" /> CLEAR
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Type your message here... use [Student Name], [Batch Name] as placeholders."
                    className="min-h-[180px] bg-muted/5 border-border/50 focus:ring-primary/20 text-sm leading-relaxed rounded-xl"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between bg-muted/10 p-5 rounded-b-xl border-t">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    <span className="text-foreground font-bold">{charCount}</span> characters · {activeChannels.length} channel{activeChannels.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-1">
                    {activeChannels.map(ch => (
                      <Badge key={ch} variant="secondary" className="text-[9px] h-4 font-bold uppercase">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-primary hover:bg-primary/90 min-w-[140px] rounded-xl font-bold shadow-lg shadow-primary/20"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <span className="flex items-center gap-2">
                        <Clock className="size-4 animate-spin" /> Sending...
                      </span>
                    ) : (
                      <>Send Now <Send className="ml-2 size-4" /></>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Templates Sidebar */}
            <div className="space-y-5">
              <Card className="border-none shadow-sm flex flex-col max-h-[650px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-headline flex items-center justify-between">
                    Message Templates
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <Plus className="size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Template</DialogTitle>
                          <DialogDescription>Save frequently used messages for quick access.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Template Name</label>
                            <Input placeholder="e.g. Test Result Alert" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Category</label>
                            <Select defaultValue="Daily">
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Academic">Academic</SelectItem>
                                <SelectItem value="Communication">Communication</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Content</label>
                            <Textarea placeholder="Type template body..." className="rounded-xl" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" className="rounded-xl">Cancel</Button>
                          <Button className="rounded-xl" onClick={() => toast({ title: "Template Saved", description: "You can now use this template." })}>Save Template</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <div className="space-y-2 mt-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        className="pl-8 h-8 text-xs bg-muted/20 rounded-lg"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["all", "Daily", "Finance", "Academic", "Communication"].map(cat => (
                        <Badge
                          key={cat}
                          variant={templateCategory === cat ? "default" : "secondary"}
                          className="text-[9px] cursor-pointer font-bold uppercase tracking-wider"
                          onClick={() => setTemplateCategory(cat)}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {filteredTemplates.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-xs italic">
                          No templates match your search.
                        </div>
                      ) : (
                        filteredTemplates.map(t => (
                          <div key={t.id} className="p-4 hover:bg-primary/5 cursor-pointer transition-colors group relative">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold group-hover:text-primary transition-colors">{t.name}</span>
                              <Badge variant="outline" className="text-[9px] uppercase font-black tracking-tighter opacity-70">{t.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 pr-6">{t.content}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute bottom-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => applyTemplate(t.content)}
                            >
                              <Copy className="size-3.5 text-primary" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </ScrollArea>
                <div className="p-3 bg-muted/10 border-t">
                  <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                    {filteredTemplates.length} Templates Available
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========== WHATSAPP GROUPS TAB ========== */}
        <TabsContent value="whatsapp" className="m-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                      <WhatsAppIcon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-base">WhatsApp Group Management</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Configure invite links for each batch. All students in the batch will be added to the group.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {whatsappGroups.map(group => {
                      const batch = batchList.find(b => b.id === group.batchId)
                      const isEditing = editingGroupId === group.batchId

                      return (
                        <div key={group.batchId} className="p-5 hover:bg-muted/5 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("size-10 rounded-xl flex items-center justify-center text-white", batch?.color || "bg-primary")}>
                                <Users className="size-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold">{group.batchName}</h4>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] h-4 px-1.5 font-bold uppercase border-none",
                                      group.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                    )}
                                  >
                                    {group.isActive ? "Active" : "Not Configured"}
                                  </Badge>
                                  {group.isActive && (
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                      {group.membersCount} members
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-13 sm:ml-0">
                              {isEditing ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    placeholder="https://chat.whatsapp.com/..."
                                    className="h-9 text-xs rounded-lg flex-1 min-w-[200px]"
                                    value={editGroupLink}
                                    onChange={(e) => setEditGroupLink(e.target.value)}
                                  />
                                  <Button size="sm" className="h-9 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveGroupLink(group.batchId)}>
                                    Save
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-9 rounded-lg text-xs" onClick={() => { setEditingGroupId(null); setEditGroupLink("") }}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {group.isActive && group.groupLink && (
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600 font-bold gap-1.5 rounded-lg" onClick={() => window.open(group.groupLink, "_blank")}>
                                      <ExternalLink className="size-3" /> Open Group
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-bold gap-1.5 rounded-lg"
                                    onClick={() => { setEditingGroupId(group.batchId); setEditGroupLink(group.groupLink) }}
                                  >
                                    <Link2 className="size-3" /> {group.isActive ? "Edit Link" : "Add Link"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {group.isActive && group.groupLink && !isEditing && (
                            <div className="mt-3 ml-13 flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                              <Link2 className="size-3 text-muted-foreground shrink-0" />
                              <span className="text-[11px] text-muted-foreground font-mono truncate flex-1">{group.groupLink}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0"
                                onClick={() => {
                                  navigator.clipboard.writeText(group.groupLink)
                                  toast({ title: "Copied", description: "Group link copied to clipboard." })
                                }}
                              >
                                <Copy className="size-3 text-primary" />
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

            {/* WhatsApp Info Sidebar */}
            <div className="space-y-5">
              <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-card overflow-hidden">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700 flex items-center gap-2">
                    <WhatsAppIcon className="size-3" /> How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <div className="space-y-3">
                    {[
                      { step: "1", title: "Create a WhatsApp Group", desc: "Create a group on WhatsApp for each batch." },
                      { step: "2", title: "Get the Invite Link", desc: "Go to Group Info → Invite to group via link → Copy link." },
                      { step: "3", title: "Paste Link Here", desc: "Click 'Add Link' for the batch and paste the invite link." },
                      { step: "4", title: "Students Join", desc: "Share the link with students so they can join the group." },
                    ].map(item => (
                      <div key={item.step} className="flex gap-3">
                        <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-emerald-100" />

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Batchwise vs Individual</p>
                    <div className="space-y-2">
                      <div className="flex gap-2 p-2.5 bg-white/60 rounded-lg">
                        <Users className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-foreground">Batchwise</p>
                          <p className="text-[9px] text-muted-foreground">Messages go to the batch WhatsApp group. All channels enabled.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 p-2.5 bg-white/60 rounded-lg">
                        <User className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-foreground">Individual</p>
                          <p className="text-[9px] text-muted-foreground">Personal WhatsApp message sent to the student's phone number.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========== MESSAGE LOGS TAB ========== */}
        <TabsContent value="history" className="m-0 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/10 border-b p-4 md:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search recipients or content..."
                    className="pl-9 bg-background rounded-xl h-9 text-xs"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={logChannelFilter} onValueChange={setLogChannelFilter}>
                    <SelectTrigger className="w-[140px] bg-background rounded-xl h-9 text-xs">
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Channels</SelectItem>
                      <SelectItem value="WhatsApp" className="text-xs">WhatsApp</SelectItem>
                      <SelectItem value="Email" className="text-xs">Email</SelectItem>
                      <SelectItem value="App" className="text-xs">App</SelectItem>
                    </SelectContent>
                  </Select>
                  {(logSearch || logChannelFilter !== "all") && (
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => { setLogSearch(""); setLogChannelFilter("all") }}>
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {filteredLogs.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">
                    No communication history found.
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    const channelIcons: Record<string, { icon: React.ElementType | typeof WhatsAppIcon; color: string; bg: string }> = {
                      WhatsApp: { icon: WhatsAppIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
                      Email: { icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
                      App: { icon: Bell, color: "text-violet-600", bg: "bg-violet-50" },
                    }
                    const chConf = channelIcons[log.channel] || channelIcons["App"]
                    const Icon = chConf.icon

                    return (
                      <div key={log.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/5 transition-colors group">
                        <div className="flex gap-3">
                          <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", chConf.bg, chConf.color)}>
                            <Icon className="size-4.5" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-sm">{log.recipient}</h4>
                              <span className="text-[10px] text-muted-foreground font-mono">{log.id}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{log.message}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3" /> {log.time}
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider">
                                {log.channel}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] h-4 font-bold border-none",
                                  log.status === "Sent" || log.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}
                              >
                                {log.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary rounded-lg">
                            Resend <ChevronRight className="ml-1 size-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/5 p-4 flex items-center justify-center border-t">
              <Button variant="link" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Load Older Communications
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Sticky Action */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
        <Button onClick={handleSend} disabled={isSending} className="w-full shadow-lg h-12 text-sm font-bold bg-primary rounded-xl gap-2">
          <Send className="size-4" /> {isSending ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </div>
  )
}

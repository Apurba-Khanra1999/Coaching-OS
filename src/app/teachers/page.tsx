"use client"

import * as React from "react"
import Link from "next/link"
import {
  GraduationCap, Search, Plus, MoreVertical, Mail, Phone, Trash2, Edit,
  Loader2, X, Users, MapPin, User, BookOpen, Layers, Star, Clock,
  CheckCircle2, AlertCircle, Filter, ChevronRight, Briefcase, Award,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { getScopedData, setScopedData, mockTeachersGenerator } from "@/lib/tenant"


const teacherSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  subject: z.string().min(1, "Subject required"),
  qualification: z.string().min(1, "Qualification required"),
  payType: z.enum(["monthly", "batchwise", "daily"]),
  payAmount: z.string().min(1, "Pay amount required"),
  status: z.enum(["Active", "On Leave", "Inactive"]),
  avatarUrl: z.string().optional(),
})

type TeacherFormValues = z.infer<typeof teacherSchema>

interface Teacher extends TeacherFormValues {
  id: string
  assignedBatches: string[]
  joinDate: string
  rating: number
}

const batchOptions = [
  { id: "batch-alpha", name: "Batch Alpha — Math" },
  { id: "batch-beta", name: "Batch Beta — Physics" },
  { id: "batch-gamma", name: "Batch Gamma — Chemistry" },
  { id: "batch-delta", name: "Batch Delta — Biology" },
]

const initialTeachers: Teacher[] = [
  { id: "T-001", name: "Dr. Priya Sharma", email: "priya@tuitionflow.edu", phone: "+91 98765 00001", subject: "Mathematics", qualification: "Ph.D Mathematics", payType: "monthly", payAmount: "45000", status: "Active", assignedBatches: ["batch-alpha"], joinDate: "2024-01-15", rating: 4.8 },
  { id: "T-002", name: "Rajesh Kumar", email: "rajesh@tuitionflow.edu", phone: "+91 98765 00002", subject: "Physics", qualification: "M.Sc Physics", payType: "batchwise", payAmount: "12000", status: "Active", assignedBatches: ["batch-beta"], joinDate: "2024-03-01", rating: 4.5 },
  { id: "T-003", name: "Anita Desai", email: "anita@tuitionflow.edu", phone: "+91 98765 00003", subject: "Chemistry", qualification: "M.Sc Chemistry", payType: "monthly", payAmount: "40000", status: "On Leave", assignedBatches: ["batch-gamma"], joinDate: "2023-08-20", rating: 4.7 },
  { id: "T-004", name: "Suresh Patel", email: "suresh@tuitionflow.edu", phone: "+91 98765 00004", subject: "Biology", qualification: "M.Sc Biology", payType: "daily", payAmount: "2500", status: "Active", assignedBatches: ["batch-delta", "batch-beta"], joinDate: "2024-06-10", rating: 4.2 },
  { id: "T-005", name: "Meena Gupta", email: "meena@tuitionflow.edu", phone: "+91 98765 00005", subject: "English", qualification: "M.A English", payType: "monthly", payAmount: "35000", status: "Active", assignedBatches: ["batch-alpha", "batch-gamma"], joinDate: "2023-11-05", rating: 4.9 },
]

export default function TeachersPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [subjectFilter, setSubjectFilter] = React.useState("all")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null)
  const [isAssignOpen, setIsAssignOpen] = React.useState(false)
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null)
  const [assignBatch, setAssignBatch] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)

  // Edit form state
  const [editName, setEditName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [editSubject, setEditSubject] = React.useState("")
  const [editQualification, setEditQualification] = React.useState("")
  const [editPayType, setEditPayType] = React.useState<"monthly" | "batchwise" | "daily">("monthly")
  const [editPayAmount, setEditPayAmount] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<"Active" | "On Leave" | "Inactive">("Active")
  const [editAvatarUrl, setEditAvatarUrl] = React.useState("")

  React.useEffect(() => {
    const loadedTeachers = getScopedData<Teacher[]>("teachers", mockTeachersGenerator)
    setTeachers(loadedTeachers)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    if (!isLoading) {
      setScopedData<Teacher[]>("teachers", teachers)
    }
  }, [teachers, isLoading])

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", qualification: "", payType: "monthly", payAmount: "", status: "Active", avatarUrl: "" },
  })

  const onSubmit = (values: TeacherFormValues) => {
    const newTeacher: Teacher = { ...values, id: `T-${Math.floor(Math.random() * 9000) + 1000}`, assignedBatches: [], joinDate: new Date().toISOString().split("T")[0], rating: 0 }
    setTeachers(prev => [newTeacher, ...prev])
    toast({ title: "Teacher Added", description: `${values.name} has been added to the team.` })
    setIsDialogOpen(false)
    form.reset()
  }

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setEditName(teacher.name)
    setEditEmail(teacher.email)
    setEditPhone(teacher.phone)
    setEditSubject(teacher.subject)
    setEditQualification(teacher.qualification)
    setEditPayType(teacher.payType)
    setEditPayAmount(teacher.payAmount)
    setEditStatus(teacher.status)
    setEditAvatarUrl(teacher.avatarUrl || "")
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editingTeacher || !editName || !editEmail) return
    setTeachers(prev => prev.map(t =>
      t.id === editingTeacher.id
        ? { ...t, name: editName, email: editEmail, phone: editPhone, subject: editSubject, qualification: editQualification, payType: editPayType, payAmount: editPayAmount, status: editStatus, avatarUrl: editAvatarUrl }
        : t
    ))
    toast({ title: "Teacher Updated", description: `${editName}'s details have been saved.` })
    setIsEditOpen(false)
    setEditingTeacher(null)
  }

  const handleDelete = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id))
    toast({ title: "Teacher Removed", description: "The teacher record has been deleted.", variant: "destructive" })
  }

  const handleAssignBatch = () => {
    if (!selectedTeacher || !assignBatch) return
    setTeachers(prev => prev.map(t =>
      t.id === selectedTeacher.id
        ? { ...t, assignedBatches: [...new Set([...t.assignedBatches, assignBatch])] }
        : t
    ))
    toast({ title: "Batch Assigned", description: `${batchOptions.find(b => b.id === assignBatch)?.name} assigned to ${selectedTeacher.name}.` })
    setIsAssignOpen(false)
    setAssignBatch("")
    setSelectedTeacher(null)
  }

  const handleRemoveBatch = (teacherId: string, batchId: string) => {
    setTeachers(prev => prev.map(t =>
      t.id === teacherId ? { ...t, assignedBatches: t.assignedBatches.filter(b => b !== batchId) } : t
    ))
    toast({ title: "Batch Removed", description: "Teacher has been unassigned from the batch." })
  }

  const filteredTeachers = teachers.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || t.status === statusFilter
    const matchSubject = subjectFilter === "all" || t.subject === subjectFilter
    return matchSearch && matchStatus && matchSubject
  })

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === "Active").length,
    onLeave: teachers.filter(t => t.status === "On Leave").length,
    totalBatches: teachers.reduce((acc, t) => acc + t.assignedBatches.length, 0),
  }

  const uniqueSubjects = [...new Set(teachers.map(t => t.subject))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse"><GraduationCap className="size-6 text-primary" /></div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">Teachers</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage faculty, assign batches & track performance</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-10 text-xs font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="size-3.5" /> Add Teacher
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-headline">Add New Teacher</DialogTitle>
                <DialogDescription>Fill in the teacher details below.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  
                  {/* Profile Picture Uploader */}
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-muted/10">
                    <Avatar className="size-14 border-2 border-primary/20">
                      <AvatarImage src={form.watch("avatarUrl") || `https://picsum.photos/seed/placeholder/64/64`} />
                      <AvatarFallback>{form.watch("name")?.charAt(0) || "T"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <FormLabel className="text-xs font-bold">Profile Picture</FormLabel>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="h-8 text-xs cursor-pointer bg-background"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              form.setValue("avatarUrl", reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </div>
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs font-bold">Full Name</FormLabel>
                      <FormControl><Input placeholder="Dr. John Smith" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Email</FormLabel>
                      <FormControl><Input placeholder="john@example.com" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Phone</FormLabel>
                      <FormControl><Input placeholder="+91 98765 43210" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Subject</FormLabel>
                      <FormControl><Input placeholder="Mathematics" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="qualification" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Qualification</FormLabel>
                      <FormControl><Input placeholder="Ph.D, M.Sc" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="payType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Pay Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly Salary</SelectItem>
                          <SelectItem value="batchwise">Per Batch</SelectItem>
                          <SelectItem value="daily">Daily Wage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="payAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Pay Amount (₹)</FormLabel>
                      <FormControl><Input placeholder="45000" type="number" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20">Add Teacher</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Teachers", value: stats.total, icon: GraduationCap, color: "text-primary", bg: "bg-primary/5" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "On Leave", value: stats.onLeave, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Batch Assignments", value: stats.totalBatches, icon: Layers, color: "text-violet-600", bg: "bg-violet-50" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("size-10 rounded-xl flex items-center justify-center", s.bg, s.color)}>
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="text-xl font-headline font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/40 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-9 bg-background rounded-xl h-9 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs font-medium border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="Active" className="text-xs">Active</SelectItem>
                  <SelectItem value="On Leave" className="text-xs">On Leave</SelectItem>
                  <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs font-medium border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Subjects</SelectItem>
                  {uniqueSubjects.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6">Teacher</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Subject</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Batches</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Pay</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">No teachers found.</TableCell></TableRow>
                ) : filteredTeachers.map(teacher => (
                  <TableRow key={teacher.id} className="group hover:bg-muted/5">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border-2 border-background shadow-sm ring-1 ring-border/30">
                          <AvatarImage src={teacher.avatarUrl || `https://picsum.photos/seed/${teacher.id}/36/36`} />
                          <AvatarFallback className="text-[10px] font-bold bg-muted">{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold leading-tight">{teacher.name}</p>
                          <p className="text-[10px] text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold">{teacher.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedBatches.length === 0 ? (
                          <span className="text-[10px] text-muted-foreground italic">None</span>
                        ) : teacher.assignedBatches.map(bId => (
                          <Badge key={bId} variant="secondary" className="text-[9px] font-bold gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => handleRemoveBatch(teacher.id, bId)}>
                            {batchOptions.find(b => b.id === bId)?.name?.split(" — ")[0] || bId}
                            <X className="size-2.5" />
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-bold">₹{Number(teacher.payAmount).toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">
                          {teacher.payType === "monthly" ? "/ month" : teacher.payType === "batchwise" ? "/ batch" : "/ day"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[9px] px-2 border-none font-bold",
                        teacher.status === "Active" ? "bg-green-100 text-green-700" :
                        teacher.status === "On Leave" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>{teacher.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-primary gap-1 px-2" onClick={() => { setSelectedTeacher(teacher); setIsAssignOpen(true) }}>
                          <Layers className="size-3" /> Assign
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="size-3.5" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/teachers/${teacher.id}`} className="flex items-center cursor-pointer">
                                <User className="size-3 mr-2" /> View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => openEditDialog(teacher)}><Edit className="size-3 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer"><Phone className="size-3 mr-2" /> Call</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs cursor-pointer text-destructive" onClick={() => handleDelete(teacher.id)}>
                              <Trash2 className="size-3 mr-2" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border/30">
            {filteredTeachers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">No teachers found.</div>
            ) : filteredTeachers.map(teacher => (
              <div key={teacher.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border-2 border-background shadow-sm ring-1 ring-border/30">
                      <AvatarImage src={teacher.avatarUrl || `https://picsum.photos/seed/${teacher.id}/40/40`} />
                      <AvatarFallback className="text-xs font-bold bg-muted">{teacher.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{teacher.name}</p>
                      <p className="text-[10px] text-muted-foreground">{teacher.subject} · {teacher.qualification}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-[9px] px-2 border-none font-bold",
                    teacher.status === "Active" ? "bg-green-100 text-green-700" :
                    teacher.status === "On Leave" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  )}>{teacher.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pay: <span className="font-bold text-foreground">₹{Number(teacher.payAmount).toLocaleString()}</span> {teacher.payType === "monthly" ? "/ month" : teacher.payType === "batchwise" ? "/ batch" : "/ day"}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary px-2" onClick={() => openEditDialog(teacher)}>
                      <Edit className="size-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary px-2" onClick={() => { setSelectedTeacher(teacher); setIsAssignOpen(true) }}>
                      <Layers className="size-3 mr-1" /> Assign
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(teacher.id)}>
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                {teacher.assignedBatches.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {teacher.assignedBatches.map(bId => (
                      <Badge key={bId} variant="secondary" className="text-[9px] font-bold">{batchOptions.find(b => b.id === bId)?.name?.split(" — ")[0] || bId}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assign Batch Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-headline">Assign Batch</DialogTitle>
            <DialogDescription>Assign a batch to {selectedTeacher?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={assignBatch} onValueChange={setAssignBatch}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Batch" /></SelectTrigger>
              <SelectContent>
                {batchOptions.filter(b => !selectedTeacher?.assignedBatches.includes(b.id)).map(b => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleAssignBatch} disabled={!assignBatch}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Teacher</DialogTitle>
            <DialogDescription>Update {editingTeacher?.name}&apos;s details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            
            {/* Edit Picture Uploader */}
            <div className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-muted/10">
              <Avatar className="size-14 border-2 border-primary/20">
                <AvatarImage src={editAvatarUrl || `https://picsum.photos/seed/placeholder/64/64`} />
                <AvatarFallback>{editName?.charAt(0) || "T"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold block mb-1">Profile Picture</label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="h-8 text-xs cursor-pointer bg-background"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setEditAvatarUrl(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold">Full Name</label>
                <Input placeholder="Dr. John Smith" className="rounded-xl" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Email</label>
                <Input placeholder="john@example.com" className="rounded-xl" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Phone</label>
                <Input placeholder="+91 98765 43210" className="rounded-xl" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Subject</label>
                <Input placeholder="Mathematics" className="rounded-xl" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Qualification</label>
                <Input placeholder="Ph.D, M.Sc" className="rounded-xl" value={editQualification} onChange={e => setEditQualification(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Pay Type</label>
                <Select value={editPayType} onValueChange={v => setEditPayType(v as "monthly" | "batchwise" | "daily")}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Salary</SelectItem>
                    <SelectItem value="batchwise">Per Batch</SelectItem>
                    <SelectItem value="daily">Daily Wage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Pay Amount (₹)</label>
                <Input placeholder="45000" type="number" className="rounded-xl" value={editPayAmount} onChange={e => setEditPayAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Status</label>
                <Select value={editStatus} onValueChange={v => setEditStatus(v as "Active" | "On Leave" | "Inactive")}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border z-40">
        <Button onClick={() => setIsDialogOpen(true)} className="w-full h-12 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Plus className="size-4" /> Add New Teacher
        </Button>
      </div>
    </div>
  )
}

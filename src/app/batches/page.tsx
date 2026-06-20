
"use client"

import * as React from "react"
import { 
  Layers, 
  Plus, 
  Clock, 
  User, 
  BookOpen, 
  MoreHorizontal,
  ChevronRight,
  Search,
  Filter,
  Trash2,
  Edit,
  MoreVertical,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getScopedData, setScopedData, mockBatchesGenerator, getActiveRole } from "@/lib/tenant"

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const batchSchema = z.object({
  name: z.string().min(2, "Batch name must be at least 2 characters"),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
  teacher: z.string().min(2, "Teacher name is required"),
  time: z.string().min(1, "Class timing is required"),
  days: z.array(z.string()).min(1, "Please select at least one day"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  students: z.coerce.number().min(0, "Students count cannot be negative"),
  color: z.string().default("hsl(var(--primary))"),
  startDate: z.string().optional(),
})

type BatchFormValues = z.infer<typeof batchSchema>

interface Batch extends BatchFormValues {
  id: string;
}

const initialBatches: Batch[] = [
  { id: "1", name: "Alpha Morning", subjects: ["Mathematics", "Physics"], teacher: "Prof. Sarah Smith", time: "09:00 AM - 10:30 AM", days: ["Mon", "Wed", "Fri"], students: 24, capacity: 30, color: "hsl(var(--primary))", startDate: "2026-06-15" },
  { id: "2", name: "Beta Evening", subjects: ["Physics"], teacher: "Dr. Alex Brown", time: "04:00 PM - 05:30 PM", days: ["Tue", "Thu", "Sat"], students: 18, capacity: 20, color: "hsl(var(--accent))", startDate: "2026-06-16" },
]

const timeSlots = [
  "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
  "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM"
]

const availableTeachers = [
  "Prof. Sarah Smith",
  "Dr. Alex Brown",
  "Dr. Priya Sharma",
  "Rajesh Kumar",
  "Anita Desai",
  "Suresh Patel",
  "Meena Gupta",
]

const initialSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"]

export default function BatchesPage() {
  const { toast } = useToast()
  const [batches, setBatches] = React.useState<Batch[]>(initialBatches)
  const [availableSubjects, setAvailableSubjects] = React.useState<string[]>(initialSubjects)
  const [newSubjectName, setNewSubjectName] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingBatch, setEditingBatch] = React.useState<Batch | null>(null)

  // Calendar states
  const [startTime, setStartTime] = React.useState("09:00 AM")
  const [endTime, setEndTime] = React.useState("10:30 AM")
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date(2026, 5, 18))

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      subjects: [],
      teacher: "",
      time: "09:00 AM - 10:30 AM",
      days: [],
      capacity: 30,
      students: 0,
      color: "hsl(var(--primary))",
      startDate: "2026-06-18",
    },
  })

  const [activeRole, setActiveRole] = React.useState("owner")

  // Load from localStorage on mount
  React.useEffect(() => {
    const loadedBatches = getScopedData<Batch[]>("batches", mockBatchesGenerator)
    setBatches(loadedBatches)
    setActiveRole(getActiveRole())
  }, [])

  // Sync state helpers to update React Hook Form
  React.useEffect(() => {
    if (startTime && endTime) {
      form.setValue("time", `${startTime} - ${endTime}`)
    }
  }, [startTime, endTime, form])

  React.useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]
      form.setValue("startDate", formattedDate)
    }
  }, [selectedDate, form])

  // Reset form when dialog opens/closes or editingBatch changes
  React.useEffect(() => {
    if (isDialogOpen) {
      if (editingBatch) {
        form.reset(editingBatch)
        if (editingBatch.startDate) {
          setSelectedDate(new Date(editingBatch.startDate))
        } else {
          setSelectedDate(new Date(2026, 5, 18))
        }
        try {
          const parts = editingBatch.time.split(" - ")
          if (parts.length === 2) {
            setStartTime(parts[0])
            setEndTime(parts[1])
          }
        } catch (e) {
          console.error("Failed to parse edit time", e)
        }
      } else {
        form.reset({
          name: "",
          subjects: [],
          teacher: "",
          time: "09:00 AM - 10:30 AM",
          days: [],
          capacity: 30,
          students: 0,
          color: "hsl(var(--primary))",
          startDate: "2026-06-18",
        })
        setSelectedDate(new Date(2026, 5, 18))
        setStartTime("09:00 AM")
        setEndTime("10:30 AM")
      }
    }
  }, [editingBatch, isDialogOpen, form])

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return
    if (availableSubjects.includes(newSubjectName.trim())) {
      toast({ title: "Subject exists", description: "This subject is already in the list." })
      return
    }
    setAvailableSubjects(prev => [...prev, newSubjectName.trim()])
    setNewSubjectName("")
    toast({ title: "Subject Added", description: `${newSubjectName} is now available.` })
  }

  const onSubmit = (values: BatchFormValues) => {
    let updated: Batch[] = []
    if (editingBatch) {
      updated = batches.map(b => b.id === editingBatch.id ? { ...b, ...values } : b)
      toast({ title: "Batch Updated", description: `${values.name} modified successfully.` })
    } else {
      const newBatch: Batch = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
      }
      updated = [...batches, newBatch]
      toast({ title: "Batch Created", description: `${values.name} is now active.` })
    }
    setBatches(updated)
    setScopedData<Batch[]>("batches", updated)
    setIsDialogOpen(false)
    setEditingBatch(null)
  }

  const handleDelete = (id: string) => {
    const updated = batches.filter(b => b.id !== id)
    setBatches(updated)
    setScopedData<Batch[]>("batches", updated)
    toast({
      title: "Batch Removed",
      description: "Batch deleted permanently.",
      variant: "destructive"
    })
  }

  const isTeacher = activeRole === "teacher"
  const isStudentOrParent = activeRole === "student" || activeRole === "parent"

  const roleFilteredBatches = isTeacher
    ? batches.filter(b => b.teacher.includes("Sarah") || b.teacher.includes("Priya") || b.teacher.includes("Apex") || b.teacher.includes("Horizon"))
    : isStudentOrParent
      ? batches.filter(b => b.name.includes("Alpha") || b.name.includes("Prep A") || b.name.includes("Apex Alpha"))
      : batches

  const filteredBatches = roleFilteredBatches.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = subjectFilter === "all" || b.subjects.includes(subjectFilter)
    return matchesSearch && matchesSubject
  })

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Batch Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage schedules, subjects, and teacher assignments.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingBatch(null)
            form.reset()
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-primary">
              <Plus className="mr-2 size-4" /> Create New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[90vh] p-0 flex flex-col overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                  <DialogTitle>{editingBatch ? "Edit Batch Details" : "Configure New Batch"}</DialogTitle>
                  <DialogDescription>
                    Set up timing, subjects, and days for this academic session.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Batch Alpha 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel>Select Subjects</FormLabel>
                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {availableSubjects.map((subject) => (
                          <FormField
                            key={subject}
                            control={form.control}
                            name="subjects"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(subject)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, subject])
                                        : field.onChange(field.value?.filter((value) => value !== subject))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer leading-none">
                                  {subject}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Input 
                          placeholder="Add other subject..." 
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="h-9 text-sm"
                        />
                        <Button type="button" size="sm" variant="secondary" onClick={handleAddSubject}>
                          Add
                        </Button>
                      </div>
                      <FormMessage />
                    </div>

                    <div className="space-y-3">
                      <FormLabel>Days of Week</FormLabel>
                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {daysOfWeek.map((day) => (
                          <FormField
                            key={day}
                            control={form.control}
                            name="days"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day])
                                        : field.onChange(field.value?.filter((value) => value !== day))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer leading-none">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="teacher"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Teacher</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTeachers.map((teacher) => (
                                  <SelectItem key={teacher} value={teacher}>
                                    {teacher}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel>Class Schedule & Timing</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col space-y-2">
                                <FormLabel className="text-xs font-semibold text-muted-foreground">Start Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal rounded-xl h-10 border-input bg-background hover:bg-muted/10",
                                          !selectedDate && "text-muted-foreground"
                                        )}
                                      >
                                        {selectedDate ? (
                                          format(selectedDate, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-primary" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={selectedDate}
                                      onSelect={(date) => {
                                        setSelectedDate(date)
                                        if (date) {
                                          field.onChange(date.toISOString().split("T")[0])
                                        }
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormItem className="flex flex-col space-y-2">
                            <FormLabel className="text-xs font-semibold text-muted-foreground">Start Time</FormLabel>
                            <Select value={startTime} onValueChange={setStartTime}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-10">
                                  <SelectValue placeholder="Start Time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    {slot}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>

                          <FormItem className="flex flex-col space-y-2">
                            <FormLabel className="text-xs font-semibold text-muted-foreground">End Time</FormLabel>
                            <Select value={endTime} onValueChange={setEndTime}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-10">
                                  <SelectValue placeholder="End Time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    {slot}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Capacity</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="students"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrolled</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter className="p-6 shrink-0 border-t bg-background">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary">
                    {editingBatch ? "Save Changes" : "Create Batch"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-center gap-4 bg-muted/20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search batches, teachers..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {availableSubjects.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm || subjectFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm("")
                  setSubjectFilter("all")
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBatches.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            <Layers className="size-10 opacity-20 mb-2" />
            <p className="text-sm">No batches found matching your criteria.</p>
          </div>
        ) : (
          filteredBatches.map((batch) => (
            <Card key={batch.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden border-t-4" style={{ borderTopColor: batch.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 overflow-hidden">
                    <CardTitle className="font-headline text-lg truncate pr-2">{batch.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {batch.subjects.map(sub => (
                        <Badge key={sub} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingBatch(batch)
                        setIsDialogOpen(true)
                      }}>
                        <Edit className="mr-2 size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(batch.id)}>
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="size-3.5 text-primary shrink-0" />
                    <div className="flex gap-1">
                      {daysOfWeek.map(d => (
                        <span key={d} className={cn(
                          "px-1 rounded-sm",
                          batch.days.includes(d) ? "bg-primary/10 text-primary font-bold" : "opacity-30"
                        )}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-primary shrink-0" />
                    <span>{batch.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{batch.teacher}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Enrollment Status</span>
                    <span className={batch.students >= batch.capacity ? "text-red-500" : ""}>
                      {batch.students} / {batch.capacity}
                    </span>
                  </div>
                  <Progress 
                    value={(batch.students / batch.capacity) * 100} 
                    className="h-1.5"
                  />
                  {batch.students >= batch.capacity && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 justify-end">
                      <AlertCircle className="size-2.5" /> Full
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/5 p-3 flex items-center justify-between border-t border-border/10">
                <span className="text-[10px] text-muted-foreground uppercase">UID: {batch.id.toUpperCase()}</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold flex items-center gap-1">
                  MANAGE <ChevronRight className="size-3" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

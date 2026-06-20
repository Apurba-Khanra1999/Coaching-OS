"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  Mail, 
  Phone, 
  Trash2, 
  Edit, 
  MessageSquare,
  UserPlus,
  Loader2,
  X,
  Users,
  MapPin,
  Calendar as CalendarIcon,
  User,
  School,
  BookOpen
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getScopedData, setScopedData, mockStudentsGenerator } from "@/lib/tenant"


const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  batch: z.string().min(1, "Please select a batch"),
  status: z.enum(["Active", "Inactive", "On Leave"]),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().min(1, "Date of birth is required"),
  guardianName: z.string().min(2, "Guardian name is required"),
  guardianPhone: z.string().min(10, "Guardian phone must be at least 10 digits"),
  address: z.string().min(5, "Address is too short"),
  schoolName: z.string().min(2, "School name is required"),
  studentClass: z.string().min(1, "Class is required"),
  avatarUrl: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

interface Student extends StudentFormValues {
  id: string;
  joinedDate: string;
}

const initialStudents: Student[] = [
  { 
    id: "1", 
    name: "Sarah Smith", 
    email: "sarah@example.com", 
    phone: "9876543210", 
    batch: "Batch Alpha", 
    status: "Active", 
    joinedDate: "2024-01-10",
    gender: "Female",
    dob: "2008-05-15",
    guardianName: "Robert Smith",
    guardianPhone: "9123456780",
    address: "45 Green Valley, New York",
    schoolName: "Lincoln High School",
    studentClass: "Grade 10"
  },
  { 
    id: "2", 
    name: "Alex Brown", 
    email: "alex@example.com", 
    phone: "9876543211", 
    batch: "Batch Beta", 
    status: "Inactive", 
    joinedDate: "2024-02-15",
    gender: "Male",
    dob: "2007-11-20",
    guardianName: "Linda Brown",
    guardianPhone: "9123456781",
    address: "12 Baker Street, London",
    schoolName: "St. Mary's Academy",
    studentClass: "Grade 11"
  },
  { 
    id: "3", 
    name: "Emma Watson", 
    email: "emma@example.com", 
    phone: "9876543212", 
    batch: "Batch Gamma", 
    status: "Active", 
    joinedDate: "2024-03-20",
    gender: "Female",
    dob: "2009-01-10",
    guardianName: "Chris Watson",
    guardianPhone: "9123456782",
    address: "78 Park Avenue, Sydney",
    schoolName: "Riverside International",
    studentClass: "Grade 9"
  },
  { 
    id: "4", 
    name: "James Wilson", 
    email: "james@example.com", 
    phone: "9876543213", 
    batch: "Batch Delta", 
    status: "On Leave", 
    joinedDate: "2024-04-05",
    gender: "Male",
    dob: "2008-08-25",
    guardianName: "Mark Wilson",
    guardianPhone: "9123456783",
    address: "23 Lakeview, Chicago",
    schoolName: "Central City High",
    studentClass: "Grade 10"
  },
  { 
    id: "5", 
    name: "Olivia Davis", 
    email: "olivia@example.com", 
    phone: "9876543214", 
    batch: "Batch Alpha", 
    status: "Active", 
    joinedDate: "2024-05-12",
    gender: "Female",
    dob: "2010-02-14",
    guardianName: "Sophia Davis",
    guardianPhone: "9123456784",
    address: "89 Sunset Blvd, LA",
    schoolName: "Westview Prep",
    studentClass: "Grade 8"
  },
]

export default function StudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = React.useState<Student[]>(initialStudents)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [batchFilter, setBatchFilter] = React.useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadedStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    setStudents(loadedStudents)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    if (!isLoading) {
      setScopedData<Student[]>("students", students)
    }
  }, [students, isLoading])

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      batch: "Batch Alpha",
      status: "Active",
      gender: "Male",
      dob: "",
      guardianName: "",
      guardianPhone: "",
      address: "",
      schoolName: "",
      studentClass: "",
      avatarUrl: "",
    },
  })

  React.useEffect(() => {
    if (editingStudent) {
      form.reset({
        name: editingStudent.name,
        email: editingStudent.email,
        phone: editingStudent.phone,
        batch: editingStudent.batch,
        status: editingStudent.status,
        gender: editingStudent.gender,
        dob: editingStudent.dob,
        guardianName: editingStudent.guardianName,
        guardianPhone: editingStudent.guardianPhone,
        address: editingStudent.address,
        schoolName: editingStudent.schoolName,
        studentClass: editingStudent.studentClass,
        avatarUrl: editingStudent.avatarUrl || "",
      })
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        batch: "Batch Alpha",
        status: "Active",
        gender: "Male",
        dob: "",
        guardianName: "",
        guardianPhone: "",
        address: "",
        schoolName: "",
        studentClass: "",
        avatarUrl: "",
      })
    }
  }, [editingStudent, form])

  const onSubmit = (values: StudentFormValues) => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...values } : s))
      toast({
        title: "Record Updated",
        description: `${values.name}'s information has been successfully updated.`,
      })
    } else {
      const newStudent: Student = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
        joinedDate: new Date().toISOString().split('T')[0],
      }
      setStudents(prev => [...prev, newStudent])
      toast({
        title: "Admission Confirmed",
        description: `${values.name} has been enrolled in ${values.batch}.`,
      })
    }
    setIsDialogOpen(false)
    setEditingStudent(null)
  }

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
    toast({
      title: "Record Removed",
      description: "The student record has been permanently deleted.",
      variant: "destructive"
    })
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    const matchesBatch = batchFilter === "all" || s.batch === batchFilter
    return matchesSearch && matchesStatus && matchesBatch
  })

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Guardian", "Guardian Phone", "School", "Class", "Batch", "Status", "DOB", "Address", "Joined Date"]
    const rows = filteredStudents.map(s => [
      s.name, s.email, s.phone, s.guardianName, s.guardianPhone, s.schoolName, s.studentClass, s.batch, s.status, s.dob, s.address, s.joinedDate
    ])
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "students_full_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Student Directory</h1>
          <p className="text-muted-foreground">Comprehensive student records and admission lifecycle management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex" onClick={exportCSV}>
            <Download className="mr-2 size-4" /> Export Data
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingStudent(null)
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="mr-2 size-4" /> New Admission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>{editingStudent ? "Update Student Profile" : "Enroll New Student"}</DialogTitle>
                <DialogDescription>
                  Provide detailed information to complete the enrollment process.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-full max-h-[calc(90vh-140px)] p-6 pt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Personal Information</h4>
                      
                      {/* Profile Picture Uploader */}
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/10">
                        <Avatar className="size-16 border-2 border-primary/20">
                          <AvatarImage src={form.watch("avatarUrl") || `https://picsum.photos/seed/placeholder/64/64`} />
                          <AvatarFallback>{form.watch("name")?.charAt(0) || "S"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1.5 flex-1">
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
                          <p className="text-[10px] text-muted-foreground">Select an image from your device.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter student's full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Contact & Guardian */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Contact & Guardian Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="10-digit mobile number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardianName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian/Parent Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Full name of parent/guardian" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardianPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent Contact No</FormLabel>
                              <FormControl>
                                <Input placeholder="10-digit mobile number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Residential Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Full residential address" className="resize-none h-20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Academic Background & Placement</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="schoolName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current/Previous School</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter school name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="studentClass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Class/Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Grade 10, Year 11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="batch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institute Batch</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Batch" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Batch Alpha">Batch Alpha (Math)</SelectItem>
                                  <SelectItem value="Batch Beta">Batch Beta (Physics)</SelectItem>
                                  <SelectItem value="Batch Gamma">Batch Gamma (Chem)</SelectItem>
                                  <SelectItem value="Batch Delta">Batch Delta (Bio)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enrollment Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Inactive">Inactive</SelectItem>
                                  <SelectItem value="On Leave">On Leave</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" className="flex-1 bg-primary">
                        {editingStudent ? "Update Profile" : "Confirm Admission"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 border-b border-border/50 bg-muted/20">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search students, guardian, or school..." 
                className="pl-9 bg-background border-border/50 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>

              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="Batch Alpha">Batch Alpha</SelectItem>
                  <SelectItem value="Batch Beta">Batch Beta</SelectItem>
                  <SelectItem value="Batch Gamma">Batch Gamma</SelectItem>
                  <SelectItem value="Batch Delta">Batch Delta</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || batchFilter !== "all" || searchTerm !== "") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setBatchFilter("all")
                  }}
                  className="h-9 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4 mr-1" /> Reset
                </Button>
              )}
              
              <Badge variant="secondary" className="font-medium ml-auto">
                {filteredStudents.length} Students Listed
              </Badge>
            </div>
          </div>
          
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[250px]">Student Info</TableHead>
                <TableHead>Academic Info</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Guardian Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="size-8 animate-spin" />
                      <p>Synchronizing directory...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Users className="size-8 opacity-20" />
                      <p>No student records found matching your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30 cursor-pointer group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-border/50">
                          <AvatarImage src={student.avatarUrl || `https://picsum.photos/seed/${student.id}/40/40`} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-semibold truncate group-hover:text-primary transition-colors">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="size-2.5" /> {student.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <School className="size-3 text-primary" /> {student.schoolName}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <BookOpen className="size-2.5" /> {student.studentClass}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/30 font-medium text-[11px]">
                        {student.batch}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{student.guardianName}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="size-2.5" /> {student.guardianPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm flex items-center gap-1">
                          <Phone className="size-3 text-primary" /> {student.phone}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-2.5" /> {student.address.split(',')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        student.status === "Active" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                        student.status === "Inactive" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/students/${student.id}`} className="flex items-center cursor-pointer">
                              <User className="size-4 mr-2" /> View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingStudent(student)
                            setIsDialogOpen(true)
                          }}>
                            <Edit className="size-4 mr-2" /> Edit Info
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            toast({
                              title: "Contacting Guardian",
                              description: `Dialing ${student.guardianName} (${student.guardianPhone})...`,
                            })
                          }}>
                            <Phone className="size-4 mr-2" /> Call Guardian
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="size-4 mr-2" /> Expel Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, User, Phone, Mail, MapPin, School, BookOpen, Layers,
  CheckCircle2, Clock, AlertCircle, Save, Camera, Plus, Trash2,
  Calendar, Award, CreditCard, ArrowUpRight, Check, FileText, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { getScopedData, setScopedData, mockStudentsGenerator } from "@/lib/tenant"


interface Student {
  id: string
  name: string
  email: string
  phone: string
  batch: string
  status: "Active" | "Inactive" | "On Leave"
  gender: "Male" | "Female" | "Other"
  dob: string
  guardianName: string
  guardianPhone: string
  address: string
  schoolName: string
  studentClass: string
  joinedDate: string
  avatarUrl?: string
}

const batchDetailsMap: Record<string, { subject: string, teacher: string, time: string, room: string }> = {
  "Batch Alpha": { subject: "Mathematics", teacher: "Dr. Sarah Connor", time: "Mon, Wed, Fri - 3:00 PM to 4:30 PM", room: "Lab A" },
  "Batch Beta": { subject: "Physics", teacher: "Prof. Alan Turing", time: "Tue, Thu, Sat - 4:30 PM to 6:00 PM", room: "Room 101" },
  "Batch Gamma": { subject: "Chemistry", teacher: "Dr. Marie Curie", time: "Mon, Wed, Fri - 5:00 PM to 6:30 PM", room: "Lab B" },
  "Batch Delta": { subject: "Biology", teacher: "Dr. Gregor Mendel", time: "Tue, Thu, Sat - 3:00 PM to 4:30 PM", room: "Room 102" },
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [students, setStudents] = React.useState<Student[]>([])
  const [student, setStudent] = React.useState<Student | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Local form states
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [batch, setBatch] = React.useState("Batch Alpha")
  const [status, setStatus] = React.useState<"Active" | "Inactive" | "On Leave">("Active")
  const [gender, setGender] = React.useState<"Male" | "Female" | "Other">("Male")
  const [dob, setDob] = React.useState("")
  const [guardianName, setGuardianName] = React.useState("")
  const [guardianPhone, setGuardianPhone] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [schoolName, setSchoolName] = React.useState("")
  const [studentClass, setStudentClass] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState("")

  // Load students from localStorage
  React.useEffect(() => {
    const loadedStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    setStudents(loadedStudents)
    
    const found = loadedStudents.find(s => s.id === params.id)
    if (found) {
      setStudent(found)
      // Initialize form
      setName(found.name)
      setEmail(found.email)
      setPhone(found.phone)
      setBatch(found.batch)
      setStatus(found.status)
      setGender(found.gender)
      setDob(found.dob)
      setGuardianName(found.guardianName)
      setGuardianPhone(found.guardianPhone)
      setAddress(found.address)
      setSchoolName(found.schoolName)
      setStudentClass(found.studentClass)
      setAvatarUrl(found.avatarUrl || "")
    }
    setIsLoading(false)
  }, [params.id])

  const handleSave = (updatedFields: Partial<Student>) => {
    if (!student) return

    const updatedStudent = { ...student, ...updatedFields }
    
    // Update local state
    setStudent(updatedStudent)
    if (updatedFields.avatarUrl !== undefined) setAvatarUrl(updatedFields.avatarUrl)
    if (updatedFields.status !== undefined) setStatus(updatedFields.status)

    // Update students list
    const updatedList = students.map(s => s.id === student.id ? updatedStudent : s)
    setStudents(updatedList)
    setScopedData<Student[]>("students", updatedList)

    toast({
      title: "Changes Saved",
      description: "Student details have been successfully updated.",
    })
  }

  const handleFullFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name, email, and phone are required.",
      })
      return
    }

    handleSave({
      name,
      email,
      phone,
      batch,
      status,
      gender,
      dob,
      guardianName,
      guardianPhone,
      address,
      schoolName,
      studentClass,
      avatarUrl
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        handleSave({ avatarUrl: base64String })
        toast({
          title: "Avatar Updated",
          description: "Profile picture has been uploaded.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Clock className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="text-xl font-bold">Student Record Not Found</h2>
        <p className="text-muted-foreground">The student ID could not be loaded from directory database.</p>
        <Button asChild className="rounded-xl mt-2">
          <Link href="/students">
            <ArrowLeft className="mr-2 size-4" /> Return to Directory
          </Link>
        </Button>
      </div>
    )
  }

  const batchInfo = batchDetailsMap[batch] || batchDetailsMap["Batch Alpha"]

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      {/* Back navigation & Quick status indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" asChild className="rounded-xl hover:bg-muted/50">
          <Link href="/students" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to Directory
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Quick Status:</span>
          <Select value={status} onValueChange={(val) => handleSave({ status: val as any })}>
            <SelectTrigger className="w-[140px] h-9 rounded-xl font-bold text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active" className="text-xs font-semibold text-green-600">Active</SelectItem>
              <SelectItem value="Inactive" className="text-xs font-semibold text-red-600">Inactive</SelectItem>
              <SelectItem value="On Leave" className="text-xs font-semibold text-amber-600">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Photo, Status Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden text-center">
            <div className="h-24 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border-b border-border/20 relative" />
            <CardContent className="p-6 pt-0 -mt-12 relative flex flex-col items-center">
              {/* Photo widget with edit overlay */}
              <div className="relative group size-24 rounded-full border-4 border-background overflow-hidden bg-muted shadow-md mb-3">
                <Avatar className="size-full">
                  <AvatarImage src={avatarUrl || `https://picsum.photos/seed/${student.id}/96/96`} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold gap-1">
                  <Camera className="size-4" /> Change
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              <h2 className="text-xl font-headline font-bold text-foreground">{name}</h2>
              <p className="text-xs text-muted-foreground mb-4">Joined {student.joinedDate}</p>
              
              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                <Badge variant="outline" className="text-[10px] font-semibold">{batch}</Badge>
                <Badge className={
                  status === "Active" ? "bg-green-500/10 text-green-600 border-none hover:bg-green-500/10 text-[10px] font-semibold" :
                  status === "Inactive" ? "bg-red-500/10 text-red-600 border-none hover:bg-red-500/10 text-[10px] font-semibold" :
                  "bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/10 text-[10px] font-semibold"
                }>
                  {status}
                </Badge>
              </div>

              <div className="w-full space-y-3.5 border-t pt-5 text-left text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{address.split(",")[0]}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics Cards */}
          <Card className="border-none shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Directory Quick stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Attendance Percentage</span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
                <Progress value={94} className="h-2 bg-muted [&>div]:bg-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
                  <p className="text-lg font-headline font-bold text-foreground">₹0</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Pending Dues</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
                  <p className="text-lg font-headline font-bold text-foreground">Grade A</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Avg Performance</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Navigation Tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="profile" className="w-full space-y-6">
            <TabsList className="grid grid-cols-5 w-full h-11 bg-muted p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg text-xs font-semibold">Profile</TabsTrigger>
              <TabsTrigger value="academic" className="rounded-lg text-xs font-semibold">Batches</TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-lg text-xs font-semibold">Attendance</TabsTrigger>
              <TabsTrigger value="fees" className="rounded-lg text-xs font-semibold">Fees</TabsTrigger>
              <TabsTrigger value="performance" className="rounded-lg text-xs font-semibold">Grades</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Manage Student details</CardTitle>
                  <CardDescription>View or edit full student registration details below.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFullFormSubmit} className="space-y-6">
                    {/* Personal Segment */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Personal Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-xs font-bold">Full Name</Label>
                          <Input id="name" value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-10" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="gender" className="text-xs font-bold">Gender</Label>
                            <Select value={gender} onValueChange={(val: any) => setGender(val)}>
                              <SelectTrigger id="gender" className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male" className="text-xs">Male</SelectItem>
                                <SelectItem value="Female" className="text-xs">Female</SelectItem>
                                <SelectItem value="Other" className="text-xs">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="dob" className="text-xs font-bold">Date of Birth</Label>
                            <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="rounded-xl h-10" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Contact & Guardian Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs font-bold">Student Email</Label>
                          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-xs font-bold">Student Phone</Label>
                          <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="gname" className="text-xs font-bold">Guardian Name</Label>
                          <Input id="gname" value={guardianName} onChange={e => setGuardianName(e.target.value)} className="rounded-xl h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="gphone" className="text-xs font-bold">Guardian Contact No</Label>
                          <Input id="gphone" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} className="rounded-xl h-10" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label htmlFor="address" className="text-xs font-bold">Residential Address</Label>
                          <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} className="rounded-xl min-h-[70px] text-xs resize-none" />
                        </div>
                      </div>
                    </div>

                    {/* Academic info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Academic Background</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="school" className="text-xs font-bold">Current School</Label>
                          <Input id="school" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="rounded-xl h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="class" className="text-xs font-bold">Current Grade/Class</Label>
                          <Input id="class" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="rounded-xl h-10" />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-xl font-bold bg-primary shadow-lg shadow-primary/10 flex items-center justify-center gap-2">
                      <Save className="size-4" /> Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Tab */}
            <TabsContent value="academic" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Batch Enrollment</CardTitle>
                  <CardDescription>Check primary batch info or switch the student to another batch.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current enrollment info */}
                  <div className="flex flex-col md:flex-row gap-5 items-start justify-between p-4 rounded-xl border border-border/40 bg-muted/10">
                    <div className="space-y-2 flex-1">
                      <Badge variant="secondary" className="font-semibold text-primary">{batch}</Badge>
                      <h4 className="font-bold text-base">{batchInfo.subject} Course</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" /> Assigned: <span className="font-semibold text-foreground">{batchInfo.teacher}</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" /> Schedule: <span className="font-semibold text-foreground">{batchInfo.time}</span>
                      </p>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-background border border-border/30 min-w-[120px] shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Classroom</span>
                      <p className="text-lg font-headline font-bold text-primary">{batchInfo.room}</p>
                    </div>
                  </div>

                  {/* Batch migration */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Switch Batch Placement</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={batch} onValueChange={(val) => handleSave({ batch: val })}>
                        <SelectTrigger className="flex-1 rounded-xl h-10 bg-background">
                          <SelectValue placeholder="Select Batch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Batch Alpha">Batch Alpha (Math)</SelectItem>
                          <SelectItem value="Batch Beta">Batch Beta (Physics)</SelectItem>
                          <SelectItem value="Batch Gamma">Batch Gamma (Chem)</SelectItem>
                          <SelectItem value="Batch Delta">Batch Delta (Bio)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => toast({ title: "Placement Switched", description: `Re-enrolled student in ${batch}.` })} className="rounded-xl h-10 px-5 font-bold">
                        Confirm Migration
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Attendance Records</CardTitle>
                  <CardDescription>Track monthly attendances and check status history logs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Attendance Rate", value: "94%", color: "text-green-600", bg: "bg-green-50" },
                      { label: "Total Sessions", value: "51", color: "text-foreground", bg: "bg-muted/30" },
                      { label: "Present Days", value: "47", color: "text-green-600", bg: "bg-green-50" },
                      { label: "Absences/Leaves", value: "4", color: "text-red-600", bg: "bg-red-50" },
                    ].map((m, i) => (
                      <div key={i} className="p-3 text-center rounded-xl bg-background border border-border/30 shadow-xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">{m.label}</span>
                        <span className={`text-lg font-headline font-bold ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Attendance Log table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent History Logs</h4>
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-[10px] font-bold uppercase pl-4">Session Date</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Batch Name</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Subject</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase pr-4">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { date: "2026-06-17", batch: "Batch Alpha", subject: "Mathematics", status: "Present" },
                            { date: "2026-06-15", batch: "Batch Alpha", subject: "Mathematics", status: "Present" },
                            { date: "2026-06-12", batch: "Batch Alpha", subject: "Mathematics", status: "Present" },
                            { date: "2026-06-10", batch: "Batch Alpha", subject: "Mathematics", status: "Absent" },
                            { date: "2026-06-08", batch: "Batch Alpha", subject: "Mathematics", status: "Present" },
                          ].map((log, i) => (
                            <TableRow key={i} className="hover:bg-muted/10">
                              <TableCell className="text-xs pl-4 font-semibold">{log.date}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{log.batch}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{log.subject}</TableCell>
                              <TableCell className="pr-4">
                                <Badge className={
                                  log.status === "Present" ? "bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px]" : "bg-red-100 text-red-700 hover:bg-red-100 border-none font-bold text-[10px]"
                                }>{log.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fees Tab */}
            <TabsContent value="fees" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Tuition Fees & Payments Ledger</CardTitle>
                  <CardDescription>Check current balance summary and review past invoices history.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ledger Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-green-500/20 bg-green-500/5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 className="size-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">All Invoices Cleared</h4>
                        <p className="text-xs text-muted-foreground">The student has zero pending fee balances for the current month.</p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Monthly Charge</span>
                      <p className="text-lg font-headline font-bold text-green-700">₹5,000</p>
                    </div>
                  </div>

                  {/* Payment Logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoices Payment Ledger</h4>
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-[10px] font-bold uppercase pl-4">Invoice No</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Billing Date</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Amount</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Payment Mode</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase pr-4">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { inv: "INV-2026-005", date: "2026-06-05", amount: 5000, mode: "UPI Transfer", status: "Paid" },
                            { inv: "INV-2026-004", date: "2026-05-05", amount: 5000, mode: "Cash Payment", status: "Paid" },
                            { inv: "INV-2026-003", date: "2026-04-05", amount: 5000, mode: "UPI Transfer", status: "Paid" },
                            { inv: "INV-2026-002", date: "2026-03-05", amount: 5000, mode: "UPI Transfer", status: "Paid" },
                          ].map((pay, i) => (
                            <TableRow key={i} className="hover:bg-muted/10">
                              <TableCell className="text-xs pl-4 font-bold text-primary flex items-center gap-1.5">
                                <FileText className="size-3.5" /> {pay.inv}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{pay.date}</TableCell>
                              <TableCell className="text-xs font-bold">₹{pay.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{pay.mode}</TableCell>
                              <TableCell className="pr-4">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px]">
                                  {pay.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Academic Performance Card</CardTitle>
                  <CardDescription>Track grades history and assessment quiz outcomes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Assessments list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Test Assessment Log</h4>
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-[10px] font-bold uppercase pl-4">Assessment Name</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Date Taken</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Obtained Marks</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase pr-4">Letter Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { name: "Monthly Assessment (Math)", date: "2026-06-10", score: "92 / 100", grade: "A" },
                            { name: "Weekly Quiz (Physics)", date: "2026-06-05", score: "18 / 20", grade: "A+" },
                            { name: "Midterm Examination", date: "2026-05-15", score: "85 / 100", grade: "B+" },
                            { name: "Subjective Test (Chem)", date: "2026-04-20", score: "45 / 50", grade: "A" },
                          ].map((perf, i) => (
                            <TableRow key={i} className="hover:bg-muted/10">
                              <TableCell className="text-xs pl-4 font-semibold flex items-center gap-1.5">
                                <Award className="size-3.5 text-primary shrink-0" /> {perf.name}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{perf.date}</TableCell>
                              <TableCell className="text-xs font-bold">{perf.score}</TableCell>
                              <TableCell className="pr-4">
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold text-[10px]">
                                  {perf.grade}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

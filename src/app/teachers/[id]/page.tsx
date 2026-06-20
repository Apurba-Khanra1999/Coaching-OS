"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, User, Phone, Mail, MapPin, GraduationCap, BookOpen, Layers,
  CheckCircle2, Clock, AlertCircle, Save, Camera, Plus, Trash2,
  Calendar, Award, CreditCard, Star, ChevronRight, Briefcase, XCircle
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
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getScopedData, setScopedData, mockTeachersGenerator } from "@/lib/tenant"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  qualification: string
  payType: "monthly" | "batchwise" | "daily"
  payAmount: string
  status: "Active" | "On Leave" | "Inactive"
  assignedBatches: string[]
  joinDate: string
  rating: number
  avatarUrl?: string
}

const batchOptions = [
  { id: "batch-alpha", name: "Batch Alpha — Math" },
  { id: "batch-beta", name: "Batch Beta — Physics" },
  { id: "batch-gamma", name: "Batch Gamma — Chemistry" },
  { id: "batch-delta", name: "Batch Delta — Biology" },
]

export default function TeacherProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [teachers, setTeachers] = React.useState<Teacher[]>([])
  const [teacher, setTeacher] = React.useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Local form states
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [qualification, setQualification] = React.useState("")
  const [payType, setPayType] = React.useState<"monthly" | "batchwise" | "daily">("monthly")
  const [payAmount, setPayAmount] = React.useState("")
  const [status, setStatus] = React.useState<"Active" | "On Leave" | "Inactive">("Active")
  const [avatarUrl, setAvatarUrl] = React.useState("")
  const [assignedBatches, setAssignedBatches] = React.useState<string[]>([])

  // State to assign a new batch
  const [newBatchToAssign, setNewBatchToAssign] = React.useState("")

  // Load teacher from localStorage
  React.useEffect(() => {
    const loadedTeachers = getScopedData<Teacher[]>("teachers", mockTeachersGenerator)
    setTeachers(loadedTeachers)

    const found = loadedTeachers.find(t => t.id === params.id)
    if (found) {
      setTeacher(found)
      setName(found.name)
      setEmail(found.email)
      setPhone(found.phone)
      setSubject(found.subject)
      setQualification(found.qualification)
      setPayType(found.payType)
      setPayAmount(found.payAmount)
      setStatus(found.status)
      setAvatarUrl(found.avatarUrl || "")
      setAssignedBatches(found.assignedBatches || [])
    }
    setIsLoading(false)
  }, [params.id])

  const handleSave = (updatedFields: Partial<Teacher>) => {
    if (!teacher) return

    const updatedTeacher = { ...teacher, ...updatedFields }

    setTeacher(updatedTeacher)
    if (updatedFields.avatarUrl !== undefined) setAvatarUrl(updatedFields.avatarUrl)
    if (updatedFields.status !== undefined) setStatus(updatedFields.status)
    if (updatedFields.assignedBatches !== undefined) setAssignedBatches(updatedFields.assignedBatches)

    const updatedList = teachers.map(t => t.id === teacher.id ? updatedTeacher : t)
    setTeachers(updatedList)
    setScopedData<Teacher[]>("teachers", updatedList)

    toast({
      title: "Faculty Details Saved",
      description: "Teacher registration files have been updated.",
    })
  }

  const handleFullFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone || !subject || !payAmount) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    handleSave({
      name,
      email,
      phone,
      subject,
      qualification,
      payType,
      payAmount,
      status,
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

  const handleAssignBatch = () => {
    if (!newBatchToAssign) return
    const updated = [...new Set([...assignedBatches, newBatchToAssign])]
    handleSave({ assignedBatches: updated })
    toast({
      title: "Batch Assigned",
      description: `${batchOptions.find(b => b.id === newBatchToAssign)?.name} assigned.`,
    })
    setNewBatchToAssign("")
  }

  const handleUnassignBatch = (batchId: string) => {
    const updated = assignedBatches.filter(b => b !== batchId)
    handleSave({ assignedBatches: updated })
    toast({
      title: "Batch Unassigned",
      description: "Teacher has been unassigned from the batch.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Clock className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading teacher profile...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="text-xl font-bold">Teacher Record Not Found</h2>
        <p className="text-muted-foreground">The faculty ID could not be retrieved.</p>
        <Button asChild className="rounded-xl mt-2">
          <Link href="/teachers">
            <ArrowLeft className="mr-2 size-4" /> Return to directory
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      {/* Back button and quick status change */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" asChild className="rounded-xl hover:bg-muted/50">
          <Link href="/teachers" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to Teachers
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Select value={status} onValueChange={(val) => handleSave({ status: val as any })}>
            <SelectTrigger className="w-[140px] h-9 rounded-xl font-bold text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active" className="text-xs font-semibold text-green-600">Active</SelectItem>
              <SelectItem value="On Leave" className="text-xs font-semibold text-amber-600">On Leave</SelectItem>
              <SelectItem value="Inactive" className="text-xs font-semibold text-red-600">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column info summary card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden text-center">
            <div className="h-24 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border-b border-border/20 relative" />
            <CardContent className="p-6 pt-0 -mt-12 relative flex flex-col items-center">
              <div className="relative group size-24 rounded-full border-4 border-background overflow-hidden bg-muted shadow-md mb-3">
                <Avatar className="size-full">
                  <AvatarImage src={avatarUrl || `https://picsum.photos/seed/${teacher.id}/96/96`} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold gap-1">
                  <Camera className="size-4" /> Change
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              <h2 className="text-xl font-headline font-bold text-foreground">{name}</h2>
              <p className="text-xs text-muted-foreground mb-4">Faculty since {teacher.joinDate || "2024-01-01"}</p>

              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                <Badge variant="outline" className="text-[10px] font-semibold">{subject}</Badge>
                <Badge className={
                  status === "Active" ? "bg-green-500/10 text-green-600 border-none hover:bg-green-500/10 text-[10px] font-semibold" :
                  status === "On Leave" ? "bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/10 text-[10px] font-semibold" :
                  "bg-red-500/10 text-red-600 border-none hover:bg-red-500/10 text-[10px] font-semibold"
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
                  <BookOpen className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{qualification}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll and rating indicators */}
          <Card className="border-none shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Faculty Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Faculty Rating</span>
                <span className="font-bold flex items-center gap-1 text-amber-500">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" /> {teacher.rating || 4.5} / 5.0
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Course Allocation Load</span>
                  <span className="font-bold text-foreground">{assignedBatches.length} Batches</span>
                </div>
                <Progress value={Math.min((assignedBatches.length / 4) * 100, 100)} className="h-2 bg-muted [&>div]:bg-primary" />
              </div>
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Payout Scale</span>
                  <p className="text-sm font-headline font-bold text-primary mt-0.5">₹{Number(payAmount).toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="capitalize text-[10px] font-bold">
                  {payType === "monthly" ? "monthly" : payType === "batchwise" ? "per batch" : "daily rate"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column details tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="details" className="w-full space-y-6">
            <TabsList className="grid grid-cols-4 w-full h-11 bg-muted p-1 rounded-xl">
              <TabsTrigger value="details" className="rounded-lg text-xs font-semibold">Profile</TabsTrigger>
              <TabsTrigger value="batches" className="rounded-lg text-xs font-semibold">Batches</TabsTrigger>
              <TabsTrigger value="payroll" className="rounded-lg text-xs font-semibold">Payroll</TabsTrigger>
              <TabsTrigger value="leaves" className="rounded-lg text-xs font-semibold">Leaves</TabsTrigger>
            </TabsList>

            {/* Profile details editor */}
            <TabsContent value="details" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Edit Faculty details</CardTitle>
                  <CardDescription>Update contact, educational background, or billing profiles.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFullFormSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Personal Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <Label htmlFor="tname" className="text-xs font-bold">Full Name *</Label>
                          <Input id="tname" value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-10" required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="temail" className="text-xs font-bold">Email Address *</Label>
                          <Input id="temail" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-10" required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tphone" className="text-xs font-bold">Contact Phone *</Label>
                          <Input id="tphone" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl h-10" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Academic Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="tsub" className="text-xs font-bold">Core Subject *</Label>
                          <Input id="tsub" value={subject} onChange={e => setSubject(e.target.value)} className="rounded-xl h-10" required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tqual" className="text-xs font-bold">Educational Qualifications *</Label>
                          <Input id="tqual" value={qualification} onChange={e => setQualification(e.target.value)} className="rounded-xl h-10" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest border-b pb-1">Payroll Setup</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="tpaytype" className="text-xs font-bold">Pay Settlement Plan</Label>
                          <Select value={payType} onValueChange={(val: any) => setPayType(val)}>
                            <SelectTrigger id="tpaytype" className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly" className="text-xs">Monthly Fixed Salary</SelectItem>
                              <SelectItem value="batchwise" className="text-xs">Per Batch Settlement</SelectItem>
                              <SelectItem value="daily" className="text-xs">Daily Session Wage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tpayamount" className="text-xs font-bold">Amount (₹) *</Label>
                          <Input id="tpayamount" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="rounded-xl h-10" required />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-xl font-bold bg-primary shadow-lg shadow-primary/10 flex items-center justify-center gap-2">
                      <Save className="size-4" /> Save Faculty Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assigned Batches Tab */}
            <TabsContent value="batches" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Course Allocation</CardTitle>
                  <CardDescription>Allocate new teaching sessions or remove current allocations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Allocation listing */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Batches ({assignedBatches.length})</h4>
                    {assignedBatches.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-4 rounded-xl border border-dashed border-border text-center bg-muted/5">
                        No active classes assigned to this teacher.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {assignedBatches.map(bId => {
                          const conf = batchOptions.find(b => b.id === bId)
                          return (
                            <div key={bId} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10">
                              <div>
                                <p className="text-xs font-bold">{conf ? conf.name.split(" — ")[0] : bId}</p>
                                <p className="text-[10px] text-muted-foreground">{conf ? conf.name.split(" — ")[1] : "Subject"}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleUnassignBatch(bId)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Allocate form */}
                  <div className="space-y-3 border-t pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign New Batch</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={newBatchToAssign} onValueChange={setNewBatchToAssign}>
                        <SelectTrigger className="flex-1 rounded-xl h-10 bg-background">
                          <SelectValue placeholder="Select Batch to Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {batchOptions.filter(b => !assignedBatches.includes(b.id)).map(b => (
                            <SelectItem key={b.id} value={b.id} className="text-xs">{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignBatch} disabled={!newBatchToAssign} className="rounded-xl h-10 px-5 font-bold">
                        <Plus className="mr-1.5 size-4" /> Assign Batch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payroll History */}
            <TabsContent value="payroll" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Payroll Ledger</CardTitle>
                  <CardDescription>Track monthly salaries, batch credits, and session disbursements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary info banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="size-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Disbursement Up to Date</h4>
                        <p className="text-xs text-muted-foreground">All session and monthly salaries have been fully cleared.</p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Salary Scale</span>
                      <p className="text-lg font-headline font-bold text-emerald-700">₹{Number(payAmount).toLocaleString()} {payType === "monthly" ? "/m" : payType === "batchwise" ? "/b" : "/d"}</p>
                    </div>
                  </div>

                  {/* Transactions list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payroll Transaction logs</h4>
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-[10px] font-bold uppercase pl-4">Transaction Reference</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Pay Period</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Amount</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Method</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase pr-4">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { ref: "TXN-PAY-088", period: "June 2026", amount: payAmount, method: "UPI Transfer", status: "Paid" },
                            { ref: "TXN-PAY-056", period: "May 2026", amount: payAmount, method: "Bank Transfer", status: "Paid" },
                            { ref: "TXN-PAY-031", period: "April 2026", amount: payAmount, method: "UPI Transfer", status: "Paid" },
                          ].map((pay, i) => (
                            <TableRow key={i} className="hover:bg-muted/10">
                              <TableCell className="text-xs pl-4 font-bold text-primary flex items-center gap-1.5">
                                <CreditCard className="size-3.5" /> {pay.ref}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{pay.period}</TableCell>
                              <TableCell className="text-xs font-bold">₹{Number(pay.amount).toLocaleString()}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{pay.method}</TableCell>
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

            {/* Leaves Tab */}
            <TabsContent value="leaves" className="m-0">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Leave Records & Requests</CardTitle>
                  <CardDescription>Track leave balance, annual logs, and submit leave allocations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Leaves metric summary */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Leaves Quota", value: "12 days", color: "text-foreground" },
                      { label: "Leaves Taken", value: "3 days", color: "text-amber-600" },
                      { label: "Available Days", value: "9 days", color: "text-green-600" },
                    ].map((m, i) => (
                      <div key={i} className="p-3 text-center rounded-xl bg-background border border-border/30 shadow-xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">{m.label}</span>
                        <span className={`text-base sm:text-lg font-headline font-bold ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Requests log list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Leaves History</h4>
                    <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-[10px] font-bold uppercase pl-4">Leave Type</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Duration</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase">Reason</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase pr-4">Approval</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { type: "Sick Leave", dates: "2026-06-12 (1 day)", reason: "Medical Appointment", status: "Approved" },
                            { type: "Casual Leave", dates: "2026-05-18 to 2026-05-19 (2 days)", reason: "Family Event", status: "Approved" },
                          ].map((leave, i) => (
                            <TableRow key={i} className="hover:bg-muted/10">
                              <TableCell className="text-xs pl-4 font-bold flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-primary" /> {leave.type}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{leave.dates}</TableCell>
                              <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{leave.reason}</TableCell>
                              <TableCell className="pr-4">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px]">
                                  {leave.status}
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

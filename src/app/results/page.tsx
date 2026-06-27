"use client"

import * as React from "react"
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  ChevronDown, 
  Check, 
  X, 
  Search, 
  AlertCircle, 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  GraduationCap,
  Copy,
  ChevronRight,
  ShieldAlert,
  User,
  Activity,
  FileText
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line 
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  getActiveTenant, 
  getActiveRole, 
  getScopedData, 
  setScopedData, 
  mockStudentsGenerator,
  mockBatchesGenerator,
  mockExamsGenerator,
  Student,
  Batch,
  Exam,
  getTenantDetails,
  getUserCredentials,
  UserCredential
} from "@/lib/tenant"

// --- TypeScript Interfaces ---
export interface StudentResult {
  studentId: string
  studentName: string
  marksObtained: number
  remarks?: string
}

export interface ExamResult {
  id: string
  examId: string
  examTitle: string
  batchId?: string
  batchName?: string
  totalMarks: number
  passingMarks: number
  examDate: string
  publishDate: string
  studentResults: StudentResult[]
  createdBy: string
}

// --- High-Fidelity Mock Results Generator ---
export const mockResultsGenerator = (
  tenantId: string, 
  tenantExams: Exam[], 
  tenantStudents: Student[], 
  tenantBatches: Batch[]
): ExamResult[] => {
  const baseResults: ExamResult[] = []
  const isApex = tenantId === "inst_002"
  const isHorizon = tenantId === "inst_003"
  const creator = isApex ? "owner@apexscience.edu" : isHorizon ? "owner@horizonprep.edu" : "owner@coachingos.edu"
  
  // Try to seed results dynamically based on existing tenant exams
  if (tenantExams.length > 0) {
    const exam1 = tenantExams[0]
    // Filter students belonging to this exam's batch or default
    const targetStudents = tenantStudents.filter(s => {
      if (exam1.targetType === "student") return s.id === exam1.targetStudentId
      const batchObj = tenantBatches.find(b => b.id === exam1.targetBatchId)
      const matchesName = batchObj && s.batch === batchObj.name
      const matchesId = s.batch === exam1.targetBatchId
      const normalizedStudentBatch = s.batch.toLowerCase().replace(/[\s-_]+/g, "")
      const matchesNormalized = exam1.targetBatchId?.toLowerCase().replace(/[\s-_]+/g, "") === normalizedStudentBatch
      return matchesId || matchesName || matchesNormalized
    })
    
    if (targetStudents.length > 0) {
      baseResults.push({
        id: "RES-101",
        examId: exam1.id,
        examTitle: exam1.title,
        batchId: exam1.targetBatchId || "batch-alpha",
        batchName: exam1.targetBatchId ? (tenantBatches.find(b => b.id === exam1.targetBatchId)?.name || "Batch Alpha") : "Batch Alpha",
        totalMarks: exam1.totalMarks,
        passingMarks: Math.ceil(exam1.totalMarks * 0.4),
        examDate: exam1.scheduledDate || "2026-06-15",
        publishDate: "2026-06-20",
        createdBy: creator,
        studentResults: targetStudents.map((s, idx) => ({
          studentId: s.id,
          studentName: s.name,
          marksObtained: idx === 0 ? Math.ceil(exam1.totalMarks * 0.92) : idx === 1 ? Math.ceil(exam1.totalMarks * 0.81) : Math.ceil(exam1.totalMarks * 0.62),
          remarks: idx === 0 ? "Exceptional performance, topped the class!" : idx === 1 ? "Very strong work. Keep it up." : "Good attempt, needs revision on core concepts."
        }))
      })
    }
  }

  if (tenantExams.length > 1) {
    const exam2 = tenantExams[1]
    const targetStudents = tenantStudents.filter(s => {
      if (exam2.targetType === "student") return s.id === exam2.targetStudentId
      const batchObj = tenantBatches.find(b => b.id === exam2.targetBatchId)
      const matchesName = batchObj && s.batch === batchObj.name
      const matchesId = s.batch === exam2.targetBatchId
      const normalizedStudentBatch = s.batch.toLowerCase().replace(/[\s-_]+/g, "")
      const matchesNormalized = exam2.targetBatchId?.toLowerCase().replace(/[\s-_]+/g, "") === normalizedStudentBatch
      return matchesId || matchesName || matchesNormalized
    })
    
    if (targetStudents.length > 0) {
      baseResults.push({
        id: "RES-102",
        examId: exam2.id,
        examTitle: exam2.title,
        batchId: exam2.targetBatchId || "batch-beta",
        batchName: exam2.targetBatchId ? (tenantBatches.find(b => b.id === exam2.targetBatchId)?.name || "Batch Beta") : "Batch Beta",
        totalMarks: exam2.totalMarks,
        passingMarks: Math.ceil(exam2.totalMarks * 0.4),
        examDate: exam2.scheduledDate || "2026-06-16",
        publishDate: "2026-06-21",
        createdBy: creator,
        studentResults: targetStudents.map((s, idx) => ({
          studentId: s.id,
          studentName: s.name,
          marksObtained: idx === 0 ? Math.ceil(exam2.totalMarks * 0.88) : idx === 1 ? Math.ceil(exam2.totalMarks * 0.74) : Math.ceil(exam2.totalMarks * 0.53),
          remarks: idx === 0 ? "Outstanding score. Well done." : idx === 1 ? "Good score, can improve algebraic steps." : "Satisfactory. Focus on coordinate graphing exercises."
        }))
      })
    }
  }

  // Fallback seeder if no exams were found
  if (baseResults.length === 0) {
    baseResults.push({
      id: "RES-101",
      examId: "EXM-101",
      examTitle: isApex ? "Physics Mechanics & Kinematics Prep" : isHorizon ? "SAT Diagnostic Practice Exam" : "Mathematics Algebra Term Assessment",
      batchId: "batch-alpha",
      batchName: isApex ? "Apex Alpha" : isHorizon ? "Horizon Alpha" : "Batch Alpha",
      totalMarks: 80,
      passingMarks: 32,
      examDate: "2026-06-15",
      publishDate: "2026-06-20",
      createdBy: creator,
      studentResults: [
        { studentId: "1", studentName: isApex ? "Sarah Apex" : isHorizon ? "Sarah Horizon" : "Sarah Smith", marksObtained: 74, remarks: "Excellent conceptual clarity and problem-solving skills." },
        { studentId: "3", studentName: isApex ? "Emma Apex" : isHorizon ? "Emma Horizon" : "Emma Watson", marksObtained: 65, remarks: "Good performance, solid grasp of equations." },
        { studentId: "2", studentName: isApex ? "Alex Apex" : isHorizon ? "Alex Horizon" : "Alex Brown", marksObtained: 38, remarks: "Passed, but needs to work on speed and time management." }
      ]
    })
    baseResults.push({
      id: "RES-102",
      examId: "EXM-102",
      examTitle: isApex ? "Organic Chemistry Basic Nomenclature" : isHorizon ? "Vocabulary and Grammar Diagnostic" : "Basic Geometry & Coordinate Systems",
      batchId: "batch-beta",
      batchName: isApex ? "Apex Beta" : isHorizon ? "Horizon Beta" : "Batch Beta",
      totalMarks: 50,
      passingMarks: 20,
      examDate: "2026-06-16",
      publishDate: "2026-06-21",
      createdBy: creator,
      studentResults: [
        { studentId: "2", studentName: isApex ? "Alex Apex" : isHorizon ? "Alex Horizon" : "Alex Brown", marksObtained: 42, remarks: "Superb geometry proof work. Excellent logic." },
        { studentId: "5", studentName: isApex ? "Olivia Apex" : isHorizon ? "Olivia Horizon" : "Olivia Davis", marksObtained: 36, remarks: "Solid work, coordinate transformations are accurate." },
        { studentId: "4", studentName: isApex ? "James Apex" : isHorizon ? "James Horizon" : "James Wilson", marksObtained: 15, remarks: "Failed. Struggles with basic theorem applications. Requires remedial sessions." }
      ]
    })
  }

  return baseResults
}

export default function ResultsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")
  const [userEmail, setUserEmail] = React.useState("")

  // Scoped Workspace Data
  const [results, setResults] = React.useState<ExamResult[]>([])
  const [exams, setExams] = React.useState<Exam[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [batches, setBatches] = React.useState<Batch[]>([])
  const [activeStudent, setActiveStudent] = React.useState<Student | null>(null)

  // Filters & UI States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [batchFilter, setBatchFilter] = React.useState("all")
  const [isPublishOpen, setIsPublishOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedResult, setSelectedResult] = React.useState<ExamResult | null>(null)

  // Publish Form States
  const [pubExamId, setPubExamId] = React.useState("")
  const [pubExamDate, setPubExamDate] = React.useState("")
  const [pubPublishDate, setPubPublishDate] = React.useState("")
  const [pubPassingMarks, setPubPassingMarks] = React.useState<number>(0)
  const [pubStudentMarks, setPubStudentMarks] = React.useState<{ [sId: string]: number }>({})
  const [pubStudentRemarks, setPubStudentRemarks] = React.useState<{ [sId: string]: string }>({})

  // Edit Form States
  const [editStudentMarks, setEditStudentMarks] = React.useState<{ [sId: string]: number }>({})
  const [editStudentRemarks, setEditStudentRemarks] = React.useState<{ [sId: string]: string }>({})

  React.useEffect(() => {
    const role = getActiveRole()
    const tenant = getActiveTenant()
    const email = localStorage.getItem("tuitionflow_logged_in_email") || ""
    
    setActiveRole(role)
    setActiveTenantId(tenant)
    setUserEmail(email)

    // Fetch related scoped states from local-first DB sync
    const loadedExams = getScopedData<Exam[]>("exams", mockExamsGenerator)
    const loadedStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    const loadedBatches = getScopedData<Batch[]>("batches", mockBatchesGenerator)
    
    setExams(loadedExams)
    setStudents(loadedStudents)
    setBatches(loadedBatches)

    // Load results, passing generator that links back to seeded records
    const loadedResults = getScopedData<ExamResult[]>("exams_results", (tId) => 
      mockResultsGenerator(tId, loadedExams, loadedStudents, loadedBatches)
    )
    setResults(loadedResults)

    // Resolve student context if logged in as student or parent
    if (email) {
      if (role === "student") {
        const match = loadedStudents.find(s => s.email.toLowerCase() === email.toLowerCase())
        setActiveStudent(match || loadedStudents[0] || null)
      } else if (role === "parent") {
        const parentCred = getUserCredentials().find((c: UserCredential) => c.email.toLowerCase() === email.toLowerCase() && c.role === "parent")
        const parentName = parentCred ? parentCred.name : ""
        
        let child = loadedStudents.find(s => {
          if (parentName && s.guardianName.toLowerCase().includes(parentName.toLowerCase())) return true
          return false
        })

        if (!child) {
          // Fallback selectors based on tenant domains
          if (email.includes("apex")) {
            child = loadedStudents.find(s => s.name.toLowerCase().includes("apex"))
          } else if (email.includes("horizon")) {
            child = loadedStudents.find(s => s.name.toLowerCase().includes("horizon"))
          }
        }
        setActiveStudent(child || loadedStudents[0] || null)
      }
    }

    setMounted(true)
  }, [])

  // Dynamic Roster Loader when Publish Exam Selection Changes
  React.useEffect(() => {
    if (!pubExamId) return
    const selectedExam = exams.find(e => e.id === pubExamId)
    if (!selectedExam) return

    // Set default passing marks to 40%
    setPubPassingMarks(Math.ceil(selectedExam.totalMarks * 0.4))
    
    const targetStudents = students.filter(s => {
      if (selectedExam.targetType === "student") {
        return s.id === selectedExam.targetStudentId
      }
      const batchObj = batches.find(b => b.id === selectedExam.targetBatchId)
      const matchesName = batchObj && s.batch === batchObj.name
      const matchesId = s.batch === selectedExam.targetBatchId
      const normalizedStudentBatch = s.batch.toLowerCase().replace(/[\s-_]+/g, "")
      const matchesNormalized = selectedExam.targetBatchId?.toLowerCase().replace(/[\s-_]+/g, "") === normalizedStudentBatch
      return matchesId || matchesName || matchesNormalized
    })

    const initialMarks: { [sId: string]: number } = {}
    const initialRemarks: { [sId: string]: string } = {}
    targetStudents.forEach(s => {
      initialMarks[s.id] = 0
      initialRemarks[s.id] = ""
    })
    setPubStudentMarks(initialMarks)
    setPubStudentRemarks(initialRemarks)
    setPubExamDate(selectedExam.scheduledDate || new Date().toISOString().split("T")[0])
    setPubPublishDate(new Date().toISOString().split("T")[0])
  }, [pubExamId, exams, students, batches])

  // Hydrate Edit Form
  const handleOpenEdit = (res: ExamResult) => {
    setSelectedResult(res)
    const marksMap: { [sId: string]: number } = {}
    const remarksMap: { [sId: string]: string } = {}
    res.studentResults.forEach(sr => {
      marksMap[sr.studentId] = sr.marksObtained
      remarksMap[sr.studentId] = sr.remarks || ""
    })
    setEditStudentMarks(marksMap)
    setEditStudentRemarks(remarksMap)
    setIsEditOpen(true)
  }

  const isStaff = activeRole === "owner" || activeRole === "super_admin" || activeRole === "teacher"
  const isStudent = activeRole === "student"
  const isParent = activeRole === "parent"

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Mounting Results Workspace...</p>
        </div>
      </div>
    )
  }

  if (!isStaff && !isStudent && !isParent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 text-center">
          <CardHeader className="space-y-2">
            <div className="mx-auto size-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle className="text-lg font-headline font-bold text-red-950">Access Restricted</CardTitle>
            <CardDescription className="text-red-700 text-xs font-medium">
              You are not authorized to view the exam results for this branch.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // ==========================================
  // LOGIC: Publish Submit
  // ==========================================
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!pubExamId) {
      toast({ variant: "destructive", title: "Missing Exam Selection", description: "Please select an exam to publish results." })
      return
    }

    const selectedExam = exams.find(ex => ex.id === pubExamId)
    if (!selectedExam) return

    if (pubPassingMarks <= 0 || pubPassingMarks > selectedExam.totalMarks) {
      toast({ variant: "destructive", title: "Invalid Passing Marks", description: `Passing marks must be between 1 and ${selectedExam.totalMarks}.` })
      return
    }

    // Validation: Check marks values
    const finalStudentResults: StudentResult[] = []
    const targetStudents = students.filter(s => {
      if (selectedExam.targetType === "student") return s.id === selectedExam.targetStudentId
      const batchObj = batches.find(b => b.id === selectedExam.targetBatchId)
      const matchesName = batchObj && s.batch === batchObj.name
      const matchesId = s.batch === selectedExam.targetBatchId
      const normalizedStudentBatch = s.batch.toLowerCase().replace(/[\s-_]+/g, "")
      const matchesNormalized = selectedExam.targetBatchId?.toLowerCase().replace(/[\s-_]+/g, "") === normalizedStudentBatch
      return matchesId || matchesName || matchesNormalized
    })

    for (const student of targetStudents) {
      const marks = Number(pubStudentMarks[student.id] || 0)
      if (isNaN(marks) || marks < 0 || marks > selectedExam.totalMarks) {
        toast({ 
          variant: "destructive", 
          title: "Marks Out of Bounds", 
          description: `Score entered for ${student.name} (${marks} marks) must be positive and cannot exceed total exam marks (${selectedExam.totalMarks}).` 
        })
        return
      }
      finalStudentResults.push({
        studentId: student.id,
        studentName: student.name,
        marksObtained: marks,
        remarks: pubStudentRemarks[student.id]?.trim() || "Results evaluated successfully."
      })
    }

    // Prevent duplicate entries
    if (results.some(r => r.examId === pubExamId)) {
      toast({ 
        variant: "destructive", 
        title: "Duplicate Results", 
        description: "Results for this exam have already been published. Please edit the existing record instead." 
      })
      return
    }

    const newResult: ExamResult = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      examId: pubExamId,
      examTitle: selectedExam.title,
      batchId: selectedExam.targetBatchId || "batch-alpha",
      batchName: selectedExam.targetBatchId ? (batches.find(b => b.id === selectedExam.targetBatchId)?.name || "Batch Alpha") : "Batch Alpha",
      totalMarks: selectedExam.totalMarks,
      passingMarks: pubPassingMarks,
      examDate: pubExamDate || new Date().toISOString().split("T")[0],
      publishDate: pubPublishDate || new Date().toISOString().split("T")[0],
      createdBy: userEmail || "owner@coachingos.edu",
      studentResults: finalStudentResults
    }

    const updatedResults = [newResult, ...results]
    setResults(updatedResults)
    setScopedData<ExamResult[]>("exams_results", updatedResults)
    
    setIsPublishOpen(false)
    setPubExamId("")
    setPubStudentMarks({})
    setPubStudentRemarks({})
    
    toast({
      title: "Exam Results Published ✓",
      description: `Successfully compiled and synchronized results for "${selectedExam.title}".`
    })
  }

  // ==========================================
  // LOGIC: Edit Submit
  // ==========================================
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResult) return

    const updatedStudentResults: StudentResult[] = []
    
    for (const sr of selectedResult.studentResults) {
      const marks = Number(editStudentMarks[sr.studentId] ?? sr.marksObtained)
      if (isNaN(marks) || marks < 0 || marks > selectedResult.totalMarks) {
        toast({ 
          variant: "destructive", 
          title: "Marks Out of Bounds", 
          description: `Score for ${sr.studentName} must be positive and cannot exceed the total marks (${selectedResult.totalMarks}).` 
        })
        return
      }
      updatedStudentResults.push({
        studentId: sr.studentId,
        studentName: sr.studentName,
        marksObtained: marks,
        remarks: editStudentRemarks[sr.studentId]?.trim() || sr.remarks
      })
    }

    const updatedResults = results.map(r => {
      if (r.id === selectedResult.id) {
        return {
          ...r,
          studentResults: updatedStudentResults
        }
      }
      return r
    })

    setResults(updatedResults)
    setScopedData<ExamResult[]>("exams_results", updatedResults)
    setIsEditOpen(false)
    setSelectedResult(null)

    toast({
      title: "Results Updated ✓",
      description: `Successfully modified score cards for "${selectedResult.examTitle}".`
    })
  }

  // ==========================================
  // LOGIC: Delete Action
  // ==========================================
  const handleDeleteResult = (resId: string) => {
    if (!window.confirm("Are you absolutely sure you want to retract and delete this published exam results sheet?")) return

    const updatedResults = results.filter(r => r.id !== resId)
    setResults(updatedResults)
    setScopedData<ExamResult[]>("exams_results", updatedResults)

    toast({
      title: "Results Retracted",
      description: "The selected exam results sheet was deleted from the secure database."
    })
  }

  // ==========================================
  // FILTERING LEDGER DATA
  // ==========================================
  const filteredResults = results.filter(r => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = r.examTitle.toLowerCase().includes(query) || (r.batchName && r.batchName.toLowerCase().includes(query))
    
    let matchesBatch = true
    if (batchFilter !== "all") {
      matchesBatch = r.batchId === batchFilter
    }

    return matchesSearch && matchesBatch
  })

  // ==========================================
  // RENDER: OWNER / TEACHER DASHBOARD
  // ==========================================
  const renderStaffDashboard = () => {
    // Analytics calculations
    const totalPublished = results.length
    
    let totalAllAppeared = 0
    let totalAllPassed = 0
    let grandMarksSum = 0
    let grandMaxMarksSum = 0
    const highestScoresList: number[] = []

    results.forEach(r => {
      r.studentResults.forEach(sr => {
        totalAllAppeared++
        grandMarksSum += sr.marksObtained
        grandMaxMarksSum += r.totalMarks
        if (sr.marksObtained >= r.passingMarks) {
          totalAllPassed++
        }
        highestScoresList.push(sr.marksObtained / r.totalMarks * 100)
      })
    })

    const overallAverage = totalAllAppeared > 0 ? (grandMarksSum / totalAllAppeared).toFixed(1) : "0.0"
    const overallAveragePct = grandMaxMarksSum > 0 ? ((grandMarksSum / grandMaxMarksSum) * 100).toFixed(1) + "%" : "0%"
    const overallPassRate = totalAllAppeared > 0 ? ((totalAllPassed / totalAllAppeared) * 100).toFixed(0) + "%" : "0%"
    const highestScorePct = highestScoresList.length > 0 ? Math.max(...highestScoresList).toFixed(0) + "%" : "0%"

    // Recharts Data Structure: Batch Performance Comparison
    const chartData = batches.map(b => {
      const batchResults = results.filter(r => r.batchId === b.id || (r.batchName === b.name))
      let appeared = 0
      let passed = 0
      let sumPct = 0
      
      batchResults.forEach(r => {
        r.studentResults.forEach(sr => {
          appeared++
          sumPct += (sr.marksObtained / r.totalMarks) * 100
          if (sr.marksObtained >= r.passingMarks) {
            passed++
          }
        })
      })

      const averageScore = appeared > 0 ? Math.round(sumPct / appeared) : 0
      const passRateVal = appeared > 0 ? Math.round((passed / appeared) * 100) : 0

      return {
        batchName: b.name,
        "Class Average (%)": averageScore,
        "Pass Rate (%)": passRateVal
      }
    }).filter(d => d["Class Average (%)"] > 0 || d["Pass Rate (%)"] > 0)

    // Dynamic Selectable Exams list for Publishing (Exams that don't have results yet)
    const unsubmittedExams = exams.filter(ex => ex.status === "Published" && !results.some(r => r.examId === ex.id))

    return (
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6 md:p-8">
          <div className="absolute top-[-40%] left-[-20%] w-[50%] h-[100%] bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
                <Sparkles className="size-3" /> Academic Performance Hub
              </span>
              <h1 className="text-3xl font-headline font-bold tracking-tight">
                Exam Results Directory 👑
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                Publish student marks lists, manage grades feedback, track batch averages, and synchronize overall performance trends across all classes.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Dialog open={isPublishOpen} onOpenChange={(open) => { setIsPublishOpen(open); if (!open) resetPublishForm() }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white font-bold gap-1.5 uppercase tracking-wider text-xs px-4 h-9">
                    <Plus className="size-4" /> Publish Results
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-full rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <DialogTitle className="font-headline text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Award className="size-5 text-primary" /> Publish Exam Scoresheet
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Select an exam and input scores obtained by students in the selected batch.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handlePublishSubmit} className="flex flex-col max-h-[70vh]">
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-5">
                        {/* Exam Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="exam-select" className="text-xs font-bold text-slate-700">Select Published Exam</Label>
                            <Select value={pubExamId} onValueChange={setPubExamId}>
                              <SelectTrigger id="exam-select" className="rounded-xl h-10 text-xs border-slate-200 bg-white">
                                <SelectValue placeholder="Choose exam..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {unsubmittedExams.length === 0 ? (
                                  <SelectItem value="_empty" disabled>No unsubmitted exams found</SelectItem>
                                ) : (
                                  unsubmittedExams.map(ex => (
                                    <SelectItem key={ex.id} value={ex.id} className="text-xs">
                                      {ex.title} (Max: {ex.totalMarks} Marks)
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="passing-marks" className="text-xs font-bold text-slate-700">Passing Marks Threshold</Label>
                            <Input
                              id="passing-marks"
                              type="number"
                              className="rounded-xl h-10 text-xs border-slate-200"
                              value={pubPassingMarks || ""}
                              onChange={e => setPubPassingMarks(Number(e.target.value))}
                              placeholder="e.g. 32"
                            />
                          </div>
                        </div>

                        {pubExamId && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="exam-date" className="text-xs font-bold text-slate-700">Exam Taken Date</Label>
                              <Input 
                                id="exam-date" 
                                type="date" 
                                className="rounded-xl h-10 text-xs border-slate-200"
                                value={pubExamDate} 
                                onChange={e => setPubExamDate(e.target.value)} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="publish-date" className="text-xs font-bold text-slate-700">Publication Date</Label>
                              <Input 
                                id="publish-date" 
                                type="date" 
                                className="rounded-xl h-10 text-xs border-slate-200"
                                value={pubPublishDate} 
                                onChange={e => setPubPublishDate(e.target.value)} 
                              />
                            </div>
                          </div>
                        )}

                        {/* Student Marks Inputs Grid */}
                        {pubExamId && (
                          <div className="space-y-3 border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-primary">Student Performance Roster</h4>
                            
                            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden">
                              {(() => {
                                const activeExam = exams.find(e => e.id === pubExamId)
                                if (!activeExam) return null
                                
                                const targetStudents = students.filter(s => {
                                  if (activeExam.targetType === "student") return s.id === activeExam.targetStudentId
                                  const batchObj = batches.find(b => b.id === activeExam.targetBatchId)
                                  const matchesName = batchObj && s.batch === batchObj.name
                                  const matchesId = s.batch === activeExam.targetBatchId
                                  const normalizedStudentBatch = s.batch.toLowerCase().replace(/[\s-_]+/g, "")
                                  const matchesNormalized = activeExam.targetBatchId?.toLowerCase().replace(/[\s-_]+/g, "") === normalizedStudentBatch
                                  return matchesId || matchesName || matchesNormalized
                                })

                                if (targetStudents.length === 0) {
                                  return <div className="p-4 text-center text-xs text-slate-400 italic">No students registered in targeted batch.</div>
                                }

                                return targetStudents.map(s => {
                                  const score = pubStudentMarks[s.id] || 0
                                  const pct = activeExam.totalMarks > 0 ? (score / activeExam.totalMarks) * 100 : 0
                                  const isPass = score >= pubPassingMarks

                                  return (
                                    <div key={s.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                      <div className="flex-1 space-y-0.5 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold truncate">{s.batch} · {s.email}</p>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 shrink-0">
                                        {/* Score Input */}
                                        <div className="w-24 space-y-1">
                                          <Label className="text-[9px] font-bold text-slate-400">Score / {activeExam.totalMarks}</Label>
                                          <Input
                                            type="number"
                                            className="h-8 rounded-lg text-xs border-slate-200 font-bold text-center"
                                            value={pubStudentMarks[s.id] ?? ""}
                                            onChange={e => handleScoreChange(s.id, e.target.value, activeExam.totalMarks)}
                                            max={activeExam.totalMarks}
                                            min={0}
                                          />
                                        </div>

                                        {/* Status Badge */}
                                        <div className="w-14 text-center">
                                          <span className="text-[9px] font-bold text-slate-400 block mb-1">Result</span>
                                          {isPass ? (
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 font-bold">Pass</Badge>
                                          ) : (
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5 font-bold">Fail</Badge>
                                          )}
                                        </div>

                                        {/* Remarks */}
                                        <div className="w-44 space-y-1">
                                          <Label className="text-[9px] font-bold text-slate-400">Teacher Remarks</Label>
                                          <Input
                                            type="text"
                                            className="h-8 rounded-lg text-[11px] border-slate-200"
                                            placeholder="e.g. Excellent work"
                                            value={pubStudentRemarks[s.id] || ""}
                                            onChange={e => handleRemarksChange(s.id, e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    <DialogFooter className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" className="rounded-xl text-xs font-bold border-slate-200" onClick={() => setIsPublishOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white" disabled={!pubExamId}>
                        Save & Publish
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Classes Graded"
            value={totalPublished}
            trend="Active Ledgers"
            trendDirection="neutral"
            subtext="Fully synced with cloud"
            icon={BookOpen}
            progress={100}
          />
          <StatCard
            title="SaaS Class Average"
            value={overallAveragePct}
            trend={`Avg Score: ${overallAverage}`}
            trendDirection="up"
            subtext="Out of total maximum weight"
            icon={BarChart3}
            progress={parseFloat(overallAveragePct)}
          />
          <StatCard
            title="Branch Pass Rate"
            value={overallPassRate}
            trend="Satisfactory Marks"
            trendDirection="up"
            subtext="Above 40% passing threshold"
            icon={CheckCircle2}
            progress={parseFloat(overallPassRate)}
          />
          <StatCard
            title="Topper Score Record"
            value={highestScorePct}
            trend="Best Performance"
            trendDirection="up"
            subtext="Across all graded batches"
            icon={Award}
            progress={parseFloat(highestScorePct)}
          />
        </div>

        {/* Graph & Summary Grid */}
        {chartData.length > 0 && (
          <Card className="border-none shadow-sm flex flex-col justify-between">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="font-headline text-lg font-bold">Class-wise Performance Analytics</CardTitle>
                <CardDescription>Visualizing batch averages and passing percentage across academic schedules</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -10, right: 10, top: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="batchName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: "12px" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="Class Average (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="Pass Rate (%)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ledger Table */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div>
              <CardTitle className="font-headline text-base font-bold">Published Results Ledger</CardTitle>
              <CardDescription>Track historically published exam grades, rosters, averages, and remarks.</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search exam or batch..."
                  className="rounded-xl h-9 pl-9 pr-3 text-xs border-slate-200 w-full bg-white"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Batch Filter */}
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="rounded-xl h-9 text-xs border-slate-200 bg-white w-full sm:w-40">
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(b => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50/75 border-y border-slate-100">
                  <TableRow>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 pl-6 text-slate-500">Exam Details</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Target Batch</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Exam Date</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Class Average</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Passing Rate</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Evaluated Roster</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-right pr-6 text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center text-slate-400 font-medium italic">
                        <AlertCircle className="size-5 mx-auto mb-2 text-slate-300" />
                        No published exam results found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map(res => {
                      // calculations
                      const maxScore = res.totalMarks
                      const rosterCount = res.studentResults.length
                      const totalObtained = res.studentResults.reduce((sum, sr) => sum + sr.marksObtained, 0)
                      const avgScore = rosterCount > 0 ? (totalObtained / rosterCount).toFixed(1) : "0"
                      const avgPct = maxScore > 0 ? ((parseFloat(avgScore) / maxScore) * 100).toFixed(0) : "0"
                      
                      const passedCount = res.studentResults.filter(sr => sr.marksObtained >= res.passingMarks).length
                      const passRate = rosterCount > 0 ? ((passedCount / rosterCount) * 100).toFixed(0) : "0"

                      return (
                        <TableRow key={res.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                          <td className="py-3.5 pl-6 font-bold text-slate-800 text-sm">
                            <div className="flex flex-col gap-0.5">
                              <span>{res.examTitle}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">ID: {res.examId} · Max: {res.totalMarks} Marks</span>
                            </div>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700">{res.batchName || "N/A"}</td>
                          <td className="py-3.5 text-slate-500 font-medium">
                            {new Date(res.examDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </td>
                          <td className="py-3.5 font-bold text-slate-800">
                            {avgScore} / {res.totalMarks} <span className="text-[10px] font-semibold text-slate-400">({avgPct}%)</span>
                          </td>
                          <td className="py-3.5">
                            <Badge className={cn(
                              "font-bold text-[10px] py-0.5 border",
                              Number(passRate) >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              Number(passRate) >= 50 ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                              {passRate}% Pass
                            </Badge>
                          </td>
                          <td className="py-3.5 text-slate-500 font-semibold">{rosterCount} Students</td>
                          <td className="py-3.5 text-right pr-6 shrink-0">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-1"
                                onClick={() => handleOpenEdit(res)}
                              >
                                <Edit3 className="size-3" /> Edit
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-red-200/50 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
                                onClick={() => handleDeleteResult(res.id)}
                              >
                                <Trash2 className="size-3" /> Delete
                              </Button>
                            </div>
                          </td>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        {selectedResult && (
          <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setSelectedResult(null) }}>
            <DialogContent className="max-w-2xl w-full rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <DialogTitle className="font-headline text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Edit3 className="size-5 text-primary" /> Modify Published Scores: {selectedResult.examTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Update marks and feedback remarks for the active roster. Maximum weight: {selectedResult.totalMarks} Marks.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEditSubmit} className="flex flex-col max-h-[70vh]">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedResult.studentResults.map(sr => {
                        const score = editStudentMarks[sr.studentId] ?? sr.marksObtained
                        const isPass = score >= selectedResult.passingMarks

                        return (
                          <div key={sr.studentId} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex-1 space-y-0.5">
                              <p className="text-xs font-bold text-slate-800">{sr.studentName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">Student ID: {sr.studentId}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {/* Score Input */}
                              <div className="w-24 space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400">Score / {selectedResult.totalMarks}</Label>
                                <Input
                                  type="number"
                                  className="h-8 rounded-lg text-xs border-slate-200 font-bold text-center"
                                  value={editStudentMarks[sr.studentId] ?? ""}
                                  onChange={e => handleEditScoreChange(sr.studentId, e.target.value, selectedResult.totalMarks)}
                                  max={selectedResult.totalMarks}
                                  min={0}
                                />
                              </div>

                              {/* Status Badge */}
                              <div className="w-14 text-center">
                                <span className="text-[9px] font-bold text-slate-400 block mb-1">Result</span>
                                {isPass ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 font-bold">Pass</Badge>
                                ) : (
                                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5 font-bold">Fail</Badge>
                                )}
                              </div>

                              {/* Remarks */}
                              <div className="w-44 space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400">Remarks</Label>
                                <Input
                                  type="text"
                                  className="h-8 rounded-lg text-[11px] border-slate-200"
                                  value={editStudentRemarks[sr.studentId] || ""}
                                  onChange={e => handleEditRemarksChange(sr.studentId, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ScrollArea>
                
                <DialogFooter className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex items-center justify-end gap-2">
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

  // ==========================================
  // RENDER: STUDENT / PARENT VIEW
  // ==========================================
  const renderStudentDashboard = () => {
    if (!activeStudent) {
      return (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-white">
          <AlertCircle className="size-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Student Profile Loaded</p>
          <p className="text-xs text-slate-400 mt-0.5">Please ensure your account credentials are seeded in the directory.</p>
        </div>
      )
    }

    // Filter results that contain score cards for this student
    const studentHistory = results.map(res => {
      const match = res.studentResults.find(sr => sr.studentId === activeStudent.id)
      if (!match) return null

      const pct = res.totalMarks > 0 ? (match.marksObtained / res.totalMarks) * 100 : 0
      const isPass = match.marksObtained >= res.passingMarks
      
      // Calculate class stats
      const rosterCount = res.studentResults.length
      const totalObtained = res.studentResults.reduce((sum, sr) => sum + sr.marksObtained, 0)
      const classAvg = rosterCount > 0 ? (totalObtained / rosterCount).toFixed(1) : "0"
      const classTopper = rosterCount > 0 ? Math.max(...res.studentResults.map(sr => sr.marksObtained)) : 0

      return {
        id: res.id,
        examTitle: res.examTitle,
        examDate: res.examDate,
        publishDate: res.publishDate,
        totalMarks: res.totalMarks,
        passingMarks: res.passingMarks,
        marksObtained: match.marksObtained,
        percentage: pct,
        isPass,
        remarks: match.remarks || "Evaluated.",
        classAverage: classAvg,
        classTopper: classTopper
      }
    }).filter(Boolean) as {
      id: string
      examTitle: string
      examDate: string
      publishDate: string
      totalMarks: number
      passingMarks: number
      marksObtained: number
      percentage: number
      isPass: boolean
      remarks: string
      classAverage: string
      classTopper: number
    }[]

    // Stats calculations
    const examsAppeared = studentHistory.length
    const examsPassed = studentHistory.filter(h => h.isPass).length
    const totalMaxPossible = studentHistory.reduce((sum, h) => sum + h.totalMarks, 0)
    const totalStudentEarned = studentHistory.reduce((sum, h) => sum + h.marksObtained, 0)
    const overallAveragePct = totalMaxPossible > 0 ? ((totalStudentEarned / totalMaxPossible) * 100).toFixed(1) + "%" : "0.0%"
    
    // Sort chronologically for trend chart
    const chartHistory = [...studentHistory].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    const trendData = chartHistory.map(h => ({
      date: new Date(h.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      "My Score (%)": Math.round(h.percentage),
      "Class Average (%)": Math.round((parseFloat(h.classAverage) / h.totalMarks) * 100)
    }))

    return (
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
        {/* Student Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 md:p-8">
          <div className="absolute top-[-40%] left-[-20%] w-[50%] h-[100%] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                <Award className="size-3" /> Academic Scorecard
              </span>
              <h1 className="text-3xl font-headline font-bold tracking-tight">
                {isParent ? `${activeStudent.name}'s Report Card` : "My Assessment Results"} 🎓
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                {isParent 
                  ? `Monitoring learning milestones and test performance logs for child enrolled in ${activeStudent.batch}.` 
                  : `Review your grades, track feedback remarks from instructors, and inspect your cumulative learning progression chart.`
                }
              </p>
            </div>
            <div className="bg-white/80 border border-slate-200/50 backdrop-blur-xl p-4 rounded-2xl shadow-sm shrink-0 flex flex-col gap-1 text-center min-w-36">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Roster Rank</span>
              <span className="text-2xl font-black font-headline text-emerald-600 leading-none">Top 10%</span>
              <span className="text-[9px] font-bold text-slate-500 mt-1">Excellent grade standing</span>
            </div>
          </div>
        </div>

        {/* Student Scorecards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Exams Taken"
            value={examsAppeared}
            trend="Appeared"
            trendDirection="neutral"
            subtext="All assessments logged"
            icon={BookOpen}
            progress={100}
          />
          <StatCard
            title="Cumulative Accuracy"
            value={overallAveragePct}
            trend="Weighted Score"
            trendDirection="up"
            subtext="Across all subjects taken"
            icon={TrendingUp}
            progress={parseFloat(overallAveragePct)}
          />
          <StatCard
            title="Assigned Batches"
            value={activeStudent.batch}
            trend="Enrolled Batch"
            trendDirection="neutral"
            subtext="Classroom learning program"
            icon={Users}
            progress={100}
          />
          <StatCard
            title="Clearance Rate"
            value={examsAppeared > 0 ? ((examsPassed / examsAppeared) * 100).toFixed(0) + "%" : "0%"}
            trend={`${examsPassed} Passed / ${examsAppeared} Total`}
            trendDirection="up"
            subtext="Clearance of passing marks"
            icon={CheckCircle2}
            progress={examsAppeared > 0 ? (examsPassed / examsAppeared) * 100 : 0}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trend Graph */}
          {trendData.length > 0 ? (
            <Card className="lg:col-span-2 border-none shadow-sm flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="font-headline text-base font-bold">Academic Progress Trend</CardTitle>
                <CardDescription>Chronological tracking of scores compared against class average percentages</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-6">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ left: -15, right: 15, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} iconType="circle" />
                      <Line type="monotone" dataKey="My Score (%)" name={isParent ? "Child Score (%)" : "My Score (%)"} stroke="hsl(var(--primary))" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Class Average (%)" name="Class Average (%)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2 border-none shadow-sm flex items-center justify-center p-8 text-center min-h-[300px]">
              <div>
                <Activity className="size-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Assessment Trajectory</h4>
                <p className="text-xs text-slate-400 mt-0.5">Progress trend lines will appear here as more exams are graded.</p>
              </div>
            </Card>
          )}

          {/* Quick Metrics Breakdown */}
          <Card className="border-none shadow-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="font-headline text-base font-bold flex items-center gap-1.5">
                <Activity className="size-4 text-emerald-500" /> Student Profile Info
              </CardTitle>
              <CardDescription>Academic registration credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Student Name:</span>
                  <span className="font-bold text-slate-800">{activeStudent.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Registered Email:</span>
                  <span className="font-semibold text-slate-600 truncate max-w-40">{activeStudent.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Guardian Contact:</span>
                  <span className="font-bold text-slate-800">{activeStudent.guardianName} ({activeStudent.guardianPhone})</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Academic Class:</span>
                  <span className="font-bold text-slate-800">{activeStudent.studentClass || "Grade 10"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Enrolled Since:</span>
                  <span className="font-medium text-slate-500">
                    {new Date(activeStudent.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results list */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base font-bold">Academic Assessment History</CardTitle>
            <CardDescription>Comprehensive list of graded term papers, classroom tests, and remarks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50/75 border-y border-slate-100">
                  <TableRow>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 pl-6 text-slate-500">Exam Assessment</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Marks Obtained</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Percentage</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Status</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 text-slate-500">Class Avg / Topper</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider py-3.5 pl-4 text-slate-500">Instructor Remarks & Feedback</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {studentHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-slate-400 font-medium italic">
                        <AlertCircle className="size-5 mx-auto mb-2 text-slate-300" />
                        No graded results records found for this student.
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentHistory.map(h => (
                      <TableRow key={h.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                        <td className="py-3.5 pl-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-sm">{h.examTitle}</span>
                            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                              <Calendar className="size-3" /> Graded on {new Date(h.publishDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 font-bold text-slate-800 text-sm">
                          {h.marksObtained} <span className="text-xs text-slate-400 font-normal">/ {h.totalMarks} Marks</span>
                        </td>
                        <td className="py-3.5 font-bold text-slate-700">
                          {h.percentage.toFixed(0)}%
                        </td>
                        <td className="py-3.5">
                          {h.isPass ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 font-bold">Pass</Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5 font-bold">Fail</Badge>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">
                          {h.classAverage} Marks / <span className="font-semibold text-slate-800">{h.classTopper} Marks</span>
                        </td>
                        <td className="py-3.5 pl-4 text-slate-600 italic font-medium max-w-xs truncate">
                          {h.remarks}
                        </td>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==========================================
  // HELPER FUNCTIONS FOR FORM INPUTS
  // ==========================================
  const resetPublishForm = () => {
    setPubExamId("")
    setPubPassingMarks(0)
    setPubStudentMarks({})
    setPubStudentRemarks({})
    setPubExamDate("")
    setPubPublishDate("")
  }

  const handleScoreChange = (sId: string, val: string, maxMarks: number) => {
    const numeric = parseInt(val)
    const finalVal = isNaN(numeric) ? 0 : Math.min(maxMarks, Math.max(0, numeric))
    setPubStudentMarks(prev => ({
      ...prev,
      [sId]: finalVal
    }))
  }

  const handleRemarksChange = (sId: string, val: string) => {
    setPubStudentRemarks(prev => ({
      ...prev,
      [sId]: val
    }))
  }

  const handleEditScoreChange = (sId: string, val: string, maxMarks: number) => {
    const numeric = parseInt(val)
    const finalVal = isNaN(numeric) ? 0 : Math.min(maxMarks, Math.max(0, numeric))
    setEditStudentMarks(prev => ({
      ...prev,
      [sId]: finalVal
    }))
  }

  const handleEditRemarksChange = (sId: string, val: string) => {
    setEditStudentRemarks(prev => ({
      ...prev,
      [sId]: val
    }))
  }

  return (
    <div className="w-full">
      {isStaff ? renderStaffDashboard() : renderStudentDashboard()}
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

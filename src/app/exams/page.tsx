"use client"

import * as React from "react"
import { 
  FileQuestion, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Award, 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Check, 
  X, 
  AlertCircle, 
  Eye, 
  User, 
  Users, 
  Printer, 
  CheckCircle2, 
  FileText,
  HelpCircle,
  Copy,
  ChevronDown
} from "lucide-react"
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
  Question,
  QuestionOption,
  getTenantDetails,
  getUserCredentials,
  UserCredential
} from "@/lib/tenant"

// --- Searchable Student Dropdown ---
interface StudentOption {
  id: string
  name: string
  email: string
  batch: string
}

function SearchableStudentDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search and select a student...",
  disabled = false 
}: { 
  options: StudentOption[]
  value: string // student ID
  onChange: (studentId: string, studentName: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selectedOption = options.find(o => o.id === value)

  const filtered = options.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    o.batch.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (opt: StudentOption) => {
    onChange(opt.id, opt.name)
    setSearch("")
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", "")
    setSearch("")
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className={cn(
          "flex items-center justify-between h-10 px-3 rounded-xl border border-input bg-white text-xs cursor-pointer transition-colors hover:border-indigo-300",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-400"
        )}
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 50) }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="size-3.5 text-slate-400 shrink-0" />
          {selectedOption ? (
            <div className="flex flex-col text-left truncate">
              <span className="font-semibold text-slate-800 text-xs">{selectedOption.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{selectedOption.batch} · {selectedOption.email}</span>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button onClick={handleClear} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
              <X className="size-3 text-slate-400" />
            </button>
          )}
          <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, batch, email..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          <ScrollArea className="max-h-[200px]">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                <AlertCircle className="size-4 mx-auto mb-1.5 text-slate-300" />
                No students found.
              </div>
            ) : (
              <div className="p-1">
                {filtered.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group",
                      value === opt.id ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50"
                    )}
                    onClick={() => handleSelect(opt)}
                  >
                    <div className={cn(
                      "size-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                      value === opt.id ? "bg-indigo-600" : "bg-slate-300 group-hover:bg-slate-400"
                    )}>
                      {opt.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{opt.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{opt.batch} · {opt.email}</p>
                    </div>
                    {value === opt.id && (
                      <Check className="size-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default function ExamsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")
  
  // Scoped Data
  const [exams, setExams] = React.useState<Exam[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [batches, setBatches] = React.useState<Batch[]>([])
  const [activeStudent, setActiveStudent] = React.useState<Student | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [batchFilter, setBatchFilter] = React.useState("all")

  // Modal Open states
  const [isCreatorOpen, setIsCreatorOpen] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [selectedExam, setSelectedExam] = React.useState<Exam | null>(null)
  const [showAnswers, setShowAnswers] = React.useState(false)

  // Creator Form States
  const [formId, setFormId] = React.useState<string | null>(null) // null for create, string for edit
  const [formTitle, setFormTitle] = React.useState("")
  const [formDescription, setFormDescription] = React.useState("")
  const [formDuration, setFormDuration] = React.useState(90)
  const [formTargetType, setFormTargetType] = React.useState<"batch" | "student">("batch")
  const [formTargetBatchId, setFormTargetBatchId] = React.useState("")
  const [formTargetStudentId, setFormTargetStudentId] = React.useState("")
  const [formStatus, setFormStatus] = React.useState<"Draft" | "Published" | "Completed">("Draft")
  const [formQuestions, setFormQuestions] = React.useState<Question[]>([])
  const [formScheduledDate, setFormScheduledDate] = React.useState("")
  const [formScheduledTime, setFormScheduledTime] = React.useState("")

  React.useEffect(() => {
    const role = getActiveRole()
    const tenant = getActiveTenant()
    setActiveRole(role)
    setActiveTenantId(tenant)
    
    const loadedExams = getScopedData<Exam[]>("exams", mockExamsGenerator)
    setExams(loadedExams)
    
    const loadedStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    setStudents(loadedStudents)
    
    const loadedBatches = getScopedData<Batch[]>("batches", mockBatchesGenerator)
    setBatches(loadedBatches)
    if (loadedBatches.length > 0) {
      setFormTargetBatchId(loadedBatches[0].id)
    }
    
    // Resolve logged in student/parent
    const loggedInEmail = localStorage.getItem("tuitionflow_logged_in_email") || ""
    if (loggedInEmail) {
      if (role === "student") {
        const studentObj = loadedStudents.find(s => 
          s.email.toLowerCase() === loggedInEmail.toLowerCase() ||
          loggedInEmail.toLowerCase().includes(s.name.split(" ")[0].toLowerCase())
        ) || loadedStudents[0]
        setActiveStudent(studentObj || null)
      } else if (role === "parent") {
        const parentCred = getUserCredentials().find((c: UserCredential) => c.email.toLowerCase() === loggedInEmail.toLowerCase() && c.role === "parent")
        const parentName = parentCred ? parentCred.name : ""
        
        let studentObj = loadedStudents.find(s => {
          if (parentName && s.guardianName.toLowerCase().includes(parentName.toLowerCase())) return true
          if (parentName && parentName.toLowerCase().includes(s.guardianName.toLowerCase())) return true
          return false
        })
        
        if (!studentObj) {
          if (loggedInEmail.includes("apex")) {
            studentObj = loadedStudents.find(s => s.name.toLowerCase().includes("apex")) || loadedStudents[0]
          } else if (loggedInEmail.includes("horizon")) {
            studentObj = loadedStudents.find(s => s.name.toLowerCase().includes("horizon")) || loadedStudents[0]
          } else {
            studentObj = loadedStudents[0]
          }
        }
        setActiveStudent(studentObj || null)
      }
    }
    
    setMounted(true)
  }, [])

  const isStaff = activeRole === "owner" || activeRole === "super_admin" || activeRole === "teacher"
  const isStudent = activeRole === "student"
  const isParent = activeRole === "parent"

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Mounting Exams Workspace...</p>
        </div>
      </div>
    )
  }

  // Security Gate
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
              You are not authorized to view the exams workspace for this branch.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isExamForStudent = (exam: Exam, student: Student) => {
    if (exam.targetType === "student") {
      return exam.targetStudentId === student.id
    }
    if (exam.targetType === "batch") {
      // Check if exam's targetBatchId matches the student's batch string directly
      if (exam.targetBatchId === student.batch) return true
      
      // Or find the batch object by exam's targetBatchId, and check if its name matches the student's batch string
      const batchObj = batches.find(b => b.id === exam.targetBatchId)
      if (batchObj && batchObj.name === student.batch) return true
      
      // Or check if the lowercase version of the student's batch string matches the exam's targetBatchId (e.g. "Batch Alpha" -> "batch-alpha")
      const normalizedStudentBatch = student.batch.toLowerCase().replace(/\s+/g, "-")
      if (exam.targetBatchId?.toLowerCase() === normalizedStudentBatch) return true
    }
    return false
  }

  // Derived filters
  const filteredExams = exams.filter(e => {
    // Role scoping: students and parents only see their assigned published/completed exams
    if (!isStaff) {
      if (e.status === "Draft") return false
      if (!activeStudent || !isExamForStudent(e, activeStudent)) return false
    }

    const matchesTab = activeTab === "all" || e.status.toLowerCase() === activeTab.toLowerCase()
    const query = searchQuery.toLowerCase()
    const matchesSearch = e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query)
    
    let matchesBatch = true
    if (batchFilter !== "all") {
      matchesBatch = e.targetType === "batch" && e.targetBatchId === batchFilter
    }

    return matchesTab && matchesSearch && matchesBatch
  })

  // Target Student Options mapper
  const studentOptions: StudentOption[] = students.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    batch: s.batch
  }))

  // Sum of current questions marks in builder
  const totalQuestionsMarks = formQuestions.reduce((sum, q) => sum + Number(q.marks || 0), 0)

  // Add Question to Form list
  const addQuestionToForm = () => {
    const newQuestion: Question = {
      id: `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "mcq",
      questionText: "",
      options: [
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" }
      ],
      correctAnswer: "A",
      marks: 10
    }
    setFormQuestions([...formQuestions, newQuestion])
  }

  // Remove Question from Form list
  const removeQuestionFromForm = (id: string) => {
    setFormQuestions(formQuestions.filter(q => q.id !== id))
  }

  // Update specific field inside a question
  const updateQuestionField = (id: string, field: keyof Question, value: any) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === id) {
        // If type changes, adjust options / correct answers appropriately to remain type-safe
        if (field === "type") {
          const type = value as Question["type"]
          if (type === "mcq") {
            return {
              ...q,
              type,
              options: [
                { id: "A", text: "Option A" },
                { id: "B", text: "Option B" }
              ],
              correctAnswer: "A"
            }
          } else if (type === "checkbox") {
            return {
              ...q,
              type,
              options: [
                { id: "A", text: "Option A" },
                { id: "B", text: "Option B" }
              ],
              correctAnswer: ["A"]
            }
          } else {
            // Text fields
            return {
              ...q,
              type,
              options: undefined,
              correctAnswer: ""
            }
          }
        }
        return { ...q, [field]: value }
      }
      return q
    }))
  }

  // Add Option to MCQ/Checkbox question
  const addOptionToQuestion = (qId: string) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === qId && q.options) {
        const nextLetter = String.fromCharCode(65 + q.options.length) // A, B, C, D...
        const newOption: QuestionOption = {
          id: nextLetter,
          text: `Option ${nextLetter}`
        }
        return {
          ...q,
          options: [...q.options, newOption]
        }
      }
      return q
    }))
  }

  // Remove Option from MCQ/Checkbox question
  const removeOptionFromQuestion = (qId: string, optId: string) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === qId && q.options) {
        const remainingOptions = q.options.filter(o => o.id !== optId)
        // Normalize IDs back to sequential A, B, C...
        const normalized = remainingOptions.map((o, index) => ({
          id: String.fromCharCode(65 + index),
          text: o.text
        }))

        // Readjust correct answer since option IDs shifted
        let cleanCorrect: any = q.correctAnswer
        if (q.type === "mcq") {
          cleanCorrect = "A"
        } else {
          cleanCorrect = ["A"]
        }

        return {
          ...q,
          options: normalized,
          correctAnswer: cleanCorrect
        }
      }
      return q
    }))
  }

  // Update specific option text
  const updateOptionText = (qId: string, optId: string, text: string) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === qId && q.options) {
        return {
          ...q,
          options: q.options.map(o => o.id === optId ? { ...o, text } : o)
        }
      }
      return q
    }))
  }

  // Handle setting correct option in Creator form
  const handleCorrectToggle = (qId: string, optId: string, checked: boolean) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === qId) {
        if (q.type === "mcq") {
          return { ...q, correctAnswer: optId }
        } else if (q.type === "checkbox") {
          const currentList = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]
          if (checked) {
            return {
              ...q,
              correctAnswer: currentList.includes(optId) ? currentList : [...currentList, optId]
            }
          } else {
            const nextList = currentList.filter(id => id !== optId)
            return {
              ...q,
              correctAnswer: nextList.length > 0 ? nextList : ["A"] // keep at least one correct placeholder
            }
          }
        }
      }
      return q
    }))
  }

  // Form Reset
  const resetForm = () => {
    setFormId(null)
    setFormTitle("")
    setFormDescription("")
    setFormDuration(90)
    setFormTargetType("batch")
    if (batches.length > 0) {
      setFormTargetBatchId(batches[0].id)
    } else {
      setFormTargetBatchId("")
    }
    setFormTargetStudentId("")
    setFormStatus("Draft")
    setFormQuestions([])
    setFormScheduledDate("")
    setFormScheduledTime("")
  }

  // Load Exam into form for editing
  const loadExamForEdit = (exam: Exam) => {
    setFormId(exam.id)
    setFormTitle(exam.title)
    setFormDescription(exam.description)
    setFormDuration(exam.duration)
    setFormTargetType(exam.targetType)
    if (exam.targetType === "batch") {
      setFormTargetBatchId(exam.targetBatchId || "")
      setFormTargetStudentId("")
    } else {
      setFormTargetStudentId(exam.targetStudentId || "")
      setFormTargetBatchId("")
    }
    setFormStatus(exam.status)
    setFormScheduledDate(exam.scheduledDate || "")
    setFormScheduledTime(exam.scheduledTime || "")
    // Deep clone questions to avoid reference mutations
    setFormQuestions(JSON.parse(JSON.stringify(exam.questions)))
    setIsCreatorOpen(true)
  }

  // Create or Update submit action
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim() || !formDescription.trim() || formDuration <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "Please specify an exam title, a brief description, and a valid test duration.",
      })
      return
    }

    if (formTargetType === "batch" && !formTargetBatchId) {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "Please select a target Batch for the exam.",
      })
      return
    }

    if (formTargetType === "student" && !formTargetStudentId) {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "Please select a target Student for the exam.",
      })
      return
    }

    if (formQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Exam Paper",
        description: "An exam must contain at least one question. Add questions below.",
      })
      return
    }

    // Validate that questions are complete
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i]
      if (!q.questionText.trim()) {
        toast({
          variant: "destructive",
          title: "Question Content Missing",
          description: `Question #${i + 1} has no text content. Please fill in the text.`,
        })
        return
      }
      if (q.marks <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid Marks Allocation",
          description: `Question #${i + 1} must have a positive marks allocation.`,
        })
        return
      }
      if ((q.type === "mcq" || q.type === "checkbox") && (!q.options || q.options.length < 2)) {
        toast({
          variant: "destructive",
          title: "Insufficient Options",
          description: `Question #${i + 1} (multiple choice) requires at least two options.`,
        })
        return
      }
      // Check if option texts are empty
      if (q.options) {
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].text.trim()) {
            toast({
              variant: "destructive",
              title: "Option Text Missing",
              description: `Option ${q.options[j].id} in Question #${i + 1} cannot be left empty.`,
            })
            return
          }
        }
      }
    }

    let updatedExams: Exam[] = []

    if (formId) {
      // Edit mode
      updatedExams = exams.map(ex => {
        if (ex.id === formId) {
          return {
            ...ex,
            title: formTitle.trim(),
            description: formDescription.trim(),
            duration: Number(formDuration),
            totalMarks: totalQuestionsMarks, // auto sum marks
            targetType: formTargetType,
            targetBatchId: formTargetType === "batch" ? formTargetBatchId : undefined,
            targetStudentId: formTargetType === "student" ? formTargetStudentId : undefined,
            status: formStatus,
            scheduledDate: formScheduledDate || undefined,
            scheduledTime: formScheduledTime || undefined,
            questions: formQuestions
          }
        }
        return ex
      })

      toast({
        title: "Exam Details Adjusted ✓",
        description: `Successfully modified properties for "${formTitle.trim()}".`,
      })
    } else {
      // Create mode
      const newExam: Exam = {
        id: `EXM-${Math.floor(100 + Math.random() * 900)}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        duration: Number(formDuration),
        totalMarks: totalQuestionsMarks,
        targetType: formTargetType,
        targetBatchId: formTargetType === "batch" ? formTargetBatchId : undefined,
        targetStudentId: formTargetType === "student" ? formTargetStudentId : undefined,
        status: formStatus,
        createdAt: new Date().toISOString().split("T")[0],
        scheduledDate: formScheduledDate || undefined,
        scheduledTime: formScheduledTime || undefined,
        questions: formQuestions
      }

      updatedExams = [newExam, ...exams]

      toast({
        title: "Exam Created ✓",
        description: `Successfully registered "${formTitle.trim()}" in the database logs.`,
      })
    }

    setExams(updatedExams)
    setScopedData<Exam[]>("exams", updatedExams)
    resetForm()
    setIsCreatorOpen(false)
  }

  // Delete Exam
  const handleDeleteExam = (id: string, title: string) => {
    const updated = exams.filter(e => e.id !== id)
    setExams(updated)
    setScopedData<Exam[]>("exams", updated)
    toast({
      title: "Exam Removed",
      description: `Permanently deleted "${title}" and associated questions.`,
      variant: "destructive"
    })
  }

  // Toggle Status: Draft -> Published -> Completed
  const toggleStatus = (id: string, status: Exam["status"]) => {
    const updated = exams.map(e => {
      if (e.id === id) {
        return { ...e, status }
      }
      return e
    })
    setExams(updated)
    setScopedData<Exam[]>("exams", updated)
    toast({
      title: "Status Updated",
      description: `Exam status transitioned to "${status}".`,
    })
  }

  // Print/PDF Download helper using html2pdf.js
  const triggerPrint = async () => {
    if (!selectedExam) return

    toast({
      title: "Generating PDF",
      description: "Preparing the exam question paper for download...",
    })

    try {
      // Dynamically import html2pdf.js on the client side
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default

      const sourceElement = document.getElementById("exam-paper-capture")
      if (!sourceElement) {
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "Could not locate the exam paper content wrapper.",
        })
        return
      }

      // Clone the content out of the Radix Dialog portal for clean html2canvas capture
      const clone = sourceElement.cloneNode(true) as HTMLElement
      clone.id = "exam-paper-capture-clone"

      // Create a temporary hidden container to render off-screen
      const container = document.createElement("div")
      container.id = "pdf-exam-render-container"
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 750px;
        background: white;
        z-index: -1;
        padding: 40px;
        margin: 0;
        overflow: visible;
        font-family: serif;
      `
      container.appendChild(clone)
      document.body.appendChild(container)

      // Wait for browser paint
      await new Promise(resolve => setTimeout(resolve, 600))

      const opt = {
        margin: 0.5,
        filename: `${selectedExam.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_paper.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 750,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait" as const
        },
        pagebreak: { mode: ['avoid-all', 'css'] } // avoid breaking inside questions where possible
      }

      // Generate and save the PDF
      await html2pdf().set(opt).from(clone).save()

      // Clean up
      document.body.removeChild(container)

      toast({
        title: "Download Complete ✓",
        description: "The exam question paper PDF has been successfully downloaded.",
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
      const container = document.getElementById("pdf-exam-render-container")
      if (container) document.body.removeChild(container)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "An error occurred while generating the exam PDF.",
      })
    }
  }

  // Styled helper for target label
  const getTargetBadge = (exam: Exam) => {
    if (exam.targetType === "batch") {
      const match = batches.find(b => b.id === exam.targetBatchId)
      return (
        <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 flex items-center gap-1 shrink-0 w-fit">
          <Users className="size-3" /> {match ? match.name : exam.targetBatchId}
        </Badge>
      )
    } else {
      const match = students.find(s => s.id === exam.targetStudentId)
      return (
        <Badge variant="outline" className="bg-pink-50/50 text-pink-700 border-pink-100 flex items-center gap-1 shrink-0 w-fit">
          <User className="size-3" /> {match ? match.name : "Individual"}
        </Badge>
      )
    }
  }

  const getStatusBadge = (status: Exam["status"]) => {
    switch (status) {
      case "Draft":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">Draft</Badge>
      case "Published":
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">Published</Badge>
      case "Completed":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Completed</Badge>
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 uppercase tracking-widest rounded-full">
            <Award className="size-3.5" /> Exam Assessment Center
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-slate-900 leading-none">
            {isStaff ? "Exams & Assessments" : isParent ? "Child Exams & Assessments" : "My Exams & Assessments"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {isStaff 
              ? "Draft question papers, establish mark criteria, and distribute testing modules to student groups."
              : isParent 
                ? "View exam papers, scheduled times, marks criteria, and performance keys for your child."
                : "View your assigned exams, test instructions, and question papers."}
          </p>
        </div>

        {isStaff && (
          <Button
            onClick={() => { resetForm(); setIsCreatorOpen(true) }}
            className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-5 gap-1.5 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="size-4" /> Create Exam Paper
          </Button>
        )}
      </div>

      {/* Filter Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(isStaff 
          ? [
              { label: "Total Exams", value: exams.length.toString(), icon: FileText, color: "bg-slate-100 text-slate-600", isTextValue: false },
              { label: "Active Published", value: exams.filter(e => e.status === "Published").length.toString(), icon: Award, color: "bg-indigo-50 text-indigo-600", isTextValue: false },
              { label: "Draft Papers", value: exams.filter(e => e.status === "Draft").length.toString(), icon: HelpCircle, color: "bg-amber-50 text-amber-600", isTextValue: false },
              { label: "Evaluated / Closed", value: exams.filter(e => e.status === "Completed").length.toString(), icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", isTextValue: false },
            ]
          : [
              { 
                label: "Assigned Exams", 
                value: exams.filter(e => e.status !== "Draft" && activeStudent && isExamForStudent(e, activeStudent)).length.toString(), 
                icon: FileText, 
                color: "bg-slate-100 text-slate-600",
                isTextValue: false 
              },
              { 
                label: "Upcoming / Active", 
                value: exams.filter(e => e.status === "Published" && activeStudent && isExamForStudent(e, activeStudent)).length.toString(), 
                icon: Award, 
                color: "bg-indigo-50 text-indigo-600",
                isTextValue: false 
              },
              { 
                label: "Completed Exams", 
                value: exams.filter(e => e.status === "Completed" && activeStudent && isExamForStudent(e, activeStudent)).length.toString(), 
                icon: CheckCircle2, 
                color: "bg-emerald-50 text-emerald-600",
                isTextValue: false 
              },
              { 
                label: isParent ? "Child's Batch" : "My Enrolled Batch", 
                value: activeStudent ? activeStudent.batch : "None", 
                icon: Users, 
                color: "bg-purple-50 text-purple-600",
                isTextValue: true
              },
            ]
        ).map(stat => (
          <Card key={stat.label} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-none rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("size-10 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "font-extrabold font-headline text-slate-900 leading-none truncate",
                  stat.isTextValue ? "text-xs mt-1 font-sans font-semibold" : "text-2xl"
                )}>{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Workspace layout */}
      <div className="grid gap-6">
        <Card className="border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle className="font-headline text-lg font-bold">
                {isStaff ? "Exam Inventories" : isParent ? "Assigned Assessments" : "My Assessments"}
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                {isStaff ? (
                  <>Manage, edit, and print question papers for partition node: <span className="font-bold text-slate-900">{activeTenantId}</span></>
                ) : isParent ? (
                  <>Viewing question papers and assessments assigned to your child: <span className="font-bold text-indigo-600">{activeStudent?.name}</span></>
                ) : (
                  <>Viewing question papers and assessments assigned to your profile.</>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Batch Filter Dropdown */}
              {isStaff && (
                <div className="w-full sm:w-40 shrink-0">
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger className="rounded-xl text-xs bg-white h-9">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="text-xs">All Batches</SelectItem>
                      {batches.map(b => (
                        <SelectItem key={b.id} value={b.id} className="text-xs">{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Search */}
              <div className="relative w-full sm:w-60 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search exam title..."
                  className="pl-9 rounded-xl text-xs bg-white h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4 border-b bg-slate-50/50 rounded-t-2xl">
                <TabsList className="bg-slate-100 rounded-lg p-0.5 h-8">
                  <TabsTrigger value="all" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">All assessments</TabsTrigger>
                  <TabsTrigger value="published" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">{isStaff ? "Published" : "Upcoming / Active"}</TabsTrigger>
                  {isStaff && <TabsTrigger value="draft" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">Drafts</TabsTrigger>}
                  <TabsTrigger value="completed" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">Completed</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="p-0 m-0">
                {/* Desktop view Table / Mobile Cards */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-b">
                        <TableHead className="font-bold uppercase tracking-wider py-3.5 pl-6">Exam Title</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Target Audience</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Questions</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Duration</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Total Marks</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Status</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5 text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.length > 0 ? (
                        filteredExams.map((e) => (
                          <TableRow key={e.id} className="hover:bg-slate-50/40 border-b">
                            <td className="py-4 pl-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-800 text-sm">{e.title}</span>
                                <span className="text-slate-400 line-clamp-1 max-w-[280px]">{e.description}</span>
                                {e.scheduledDate && (
                                  <span className="text-[10px] font-bold text-indigo-650 flex items-center gap-1 mt-1 bg-indigo-50 border border-indigo-100/60 rounded-lg px-2 py-0.5 w-fit">
                                    <Calendar className="size-3 text-indigo-600" /> Scheduled: {e.scheduledDate} {e.scheduledTime ? `at ${e.scheduledTime}` : ""}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4">{getTargetBadge(e)}</td>
                            <td className="py-4 font-semibold text-slate-650">{e.questions.length} Questions</td>
                            <td className="py-4 font-medium text-slate-650 flex items-center gap-1.5 mt-2.5">
                              <Clock className="size-3.5 text-slate-400" /> {e.duration} Mins
                            </td>
                            <td className="py-4 font-mono font-bold text-indigo-650 text-xs">{e.totalMarks} Marks</td>
                            <td className="py-4">{getStatusBadge(e.status)}</td>
                            <td className="py-4 text-right pr-6 space-x-1">
                              {/* Preview paper */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
                                onClick={() => { setSelectedExam(e); setShowAnswers(false); setIsPreviewOpen(true) }}
                                title="View Question Paper"
                              >
                                <Eye className="size-3.5" />
                              </Button>

                              {isStaff && (
                                <>
                                  {/* Edit */}
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
                                    onClick={() => loadExamForEdit(e)}
                                    title="Edit Exam"
                                  >
                                    <Edit3 className="size-3.5" />
                                  </Button>

                                  {/* Status toggles */}
                                  {e.status === "Draft" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 px-2 rounded-lg border-indigo-100 text-indigo-600 hover:bg-indigo-50 text-[10px] font-bold uppercase tracking-wider"
                                      onClick={() => toggleStatus(e.id, "Published")}
                                    >
                                      Publish
                                    </Button>
                                  )}
                                  {e.status === "Published" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 px-2 rounded-lg border-emerald-100 text-emerald-650 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-wider"
                                      onClick={() => toggleStatus(e.id, "Completed")}
                                    >
                                      Close
                                    </Button>
                                  )}

                                  {/* Delete */}
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 rounded-lg border-red-150 text-red-500 hover:bg-red-50 hover:border-red-200"
                                    onClick={() => handleDeleteExam(e.id, e.title)}
                                    title="Delete Exam"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </>
                              )}
                            </td>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                            <div className="flex flex-col items-center gap-2.5 justify-center">
                              <AlertCircle className="size-5 text-slate-300" />
                              <span>No exams found matching your active filter.</span>
                            </div>
                          </td>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile view Cards */}
                <div className="block md:hidden p-4 space-y-4">
                  {filteredExams.length > 0 ? (
                    filteredExams.map((e) => (
                      <Card key={e.id} className="border border-slate-200 shadow-none rounded-xl p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{e.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2">{e.description}</p>
                          </div>
                          {getStatusBadge(e.status)}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                          {getTargetBadge(e)}
                          <Badge variant="secondary" className="text-[10px]">{e.questions.length} Questions</Badge>
                          <Badge variant="secondary" className="text-[10px] font-mono">{e.duration} Min</Badge>
                          <Badge variant="secondary" className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border-indigo-100">{e.totalMarks} Marks</Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-col gap-0.5 text-left">
                            {e.scheduledDate && (
                              <span className="text-[10px] text-indigo-650 font-bold flex items-center gap-1">
                                <Calendar className="size-3 text-indigo-600" /> {e.scheduledDate} {e.scheduledTime ? `@ ${e.scheduledTime}` : ""}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 font-medium">Created: {e.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg"
                              onClick={() => { setSelectedExam(e); setShowAnswers(false); setIsPreviewOpen(true) }}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            {isStaff && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg"
                                  onClick={() => loadExamForEdit(e)}
                                >
                                  <Edit3 className="size-3.5" />
                                </Button>
                                {e.status === "Draft" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-2 rounded-lg text-[10px] font-bold uppercase"
                                    onClick={() => toggleStatus(e.id, "Published")}
                                  >
                                    Publish
                                  </Button>
                                )}
                                {e.status === "Published" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-2 rounded-lg text-[10px] font-bold uppercase"
                                    onClick={() => toggleStatus(e.id, "Completed")}
                                  >
                                    Close
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                                  onClick={() => handleDeleteExam(e.id, e.title)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 italic text-xs">
                      No exams found matching your active filter.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 1. DYNAMIC EXAM CREATOR / EDITOR DIALOG                        */}
      {/* ============================================================== */}
      <Dialog open={isCreatorOpen} onOpenChange={(open) => { setIsCreatorOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-4xl rounded-2xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
          <form onSubmit={handleFormSubmit} className="h-full flex flex-col">
            
            {/* Creator Header */}
            <DialogHeader className="p-6 border-b bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileQuestion className="size-4.5" />
                </div>
                <div>
                  <DialogTitle className="font-headline font-bold text-lg">
                    {formId ? "Edit Exam Assessment" : "Create Exam Assessment"}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Configure the test paper metadata, target audience, and dynamically build questions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Creator Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Part A: Test Metadata Details */}
              <Card className="border border-slate-200 bg-white rounded-xl">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Part A: Exam Metadata</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Title (col-span-2) */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="exam-title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Title</Label>
                      <Input
                        id="exam-title"
                        placeholder="e.g. Mathematics Algebra Term-End Assessment"
                        className="rounded-xl text-xs h-10 bg-white"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-duration" className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (Mins)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="exam-duration"
                          type="number"
                          min={5}
                          className="pl-9 rounded-xl text-xs h-10 bg-white"
                          value={formDuration}
                          onChange={(e) => setFormDuration(Math.max(5, Number(e.target.value)))}
                        />
                      </div>
                    </div>

                    {/* Scheduled Date */}
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-date" className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="exam-date"
                          type="date"
                          className="pl-9 rounded-xl text-xs h-10 bg-white"
                          value={formScheduledDate}
                          onChange={(e) => setFormScheduledDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-time" className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="exam-time"
                          type="time"
                          className="pl-9 rounded-xl text-xs h-10 bg-white"
                          value={formScheduledTime}
                          onChange={(e) => setFormScheduledTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="exam-desc" className="text-xs font-bold uppercase tracking-wider text-slate-500">Brief Description & Instructions</Label>
                    <Textarea
                      id="exam-desc"
                      placeholder="e.g. This exam covers quadratic equations and coordinates. Scientific calculators are permitted..."
                      className="rounded-xl text-xs resize-none h-16"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>

                  {/* Target Audience selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-150">
                    
                    {/* Target Type Switcher */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Audience Type</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={formTargetType === "batch" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-wider h-9"
                          onClick={() => { setFormTargetType("batch"); setFormTargetStudentId("") }}
                        >
                          <Users className="size-3.5 mr-1" /> Batchwise
                        </Button>
                        <Button
                          type="button"
                          variant={formTargetType === "student" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-wider h-9"
                          onClick={() => { setFormTargetType("student"); setFormTargetBatchId("") }}
                        >
                          <User className="size-3.5 mr-1" /> Individual
                        </Button>
                      </div>
                    </div>

                    {/* Target Batch Select */}
                    {formTargetType === "batch" && (
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="target-batch" className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Target Batch</Label>
                        <Select value={formTargetBatchId} onValueChange={setFormTargetBatchId}>
                          <SelectTrigger id="target-batch" className="rounded-xl text-xs bg-white h-10">
                            <SelectValue placeholder="Select Batch" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {batches.map(b => (
                              <SelectItem key={b.id} value={b.id} className="text-xs font-medium">
                                {b.name} ({b.subject})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Target Student Select */}
                    {formTargetType === "student" && (
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Target Student</Label>
                        <SearchableStudentDropdown
                          options={studentOptions}
                          value={formTargetStudentId}
                          onChange={(id) => setFormTargetStudentId(id)}
                          placeholder="Search live student directory..."
                        />
                      </div>
                    )}

                  </div>

                </CardContent>
              </Card>

              {/* Part B: Dynamic Question Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Part B: Exam Questions</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-650 font-mono text-xs font-bold px-3 py-1 text-white">
                      Total: {totalQuestionsMarks} Marks
                    </Badge>
                    <Badge variant="outline" className="font-semibold text-xs px-3 py-1">
                      {formQuestions.length} Questions
                    </Badge>
                  </div>
                </div>

                {/* Questions list */}
                <div className="space-y-4">
                  {formQuestions.length > 0 ? (
                    formQuestions.map((q, index) => (
                      <Card key={q.id} className="border border-slate-200 bg-white rounded-xl overflow-hidden relative group">
                        
                        {/* Question Badge / Header */}
                        <div className="bg-slate-50/70 border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <span className="size-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {index + 1}
                            </span>
                            Question Paper Node
                          </span>
                          
                          <div className="flex items-center gap-3">
                            {/* Question Type Selection */}
                            <div className="w-40">
                              <Select 
                                value={q.type} 
                                onValueChange={(val) => updateQuestionField(q.id, "type", val as Question["type"])}
                              >
                                <SelectTrigger className="h-8 rounded-lg text-[11px] bg-white border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="mcq" className="text-xs font-medium">Single Choice (MCQ)</SelectItem>
                                  <SelectItem value="checkbox" className="text-xs font-medium">Multiple Choice (Checkbox)</SelectItem>
                                  <SelectItem value="short_answer" className="text-xs font-medium">Short Answer</SelectItem>
                                  <SelectItem value="long_answer" className="text-xs font-medium">Long Answer (Manual)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Marks Input */}
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] font-bold text-slate-400 uppercase">Marks:</Label>
                              <Input
                                type="number"
                                min={1}
                                className="h-8 w-14 rounded-lg text-xs font-mono font-bold text-center p-1"
                                value={q.marks}
                                onChange={(e) => updateQuestionField(q.id, "marks", Math.max(1, Number(e.target.value)))}
                              />
                            </div>

                            {/* Delete Question */}
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              onClick={() => removeQuestionFromForm(q.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Question content */}
                        <CardContent className="p-4 space-y-4">
                          
                          {/* Question Text */}
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Question Prompt</Label>
                            <Textarea
                              placeholder="e.g. Write down the value of x when..."
                              className="text-xs rounded-xl resize-none h-16 bg-slate-50/25 border-slate-200 focus:bg-white transition-all"
                              value={q.questionText}
                              onChange={(e) => updateQuestionField(q.id, "questionText", e.target.value)}
                            />
                          </div>

                          {/* Options Builder for MCQ / Checkbox */}
                          {(q.type === "mcq" || q.type === "checkbox") && q.options && (
                            <div className="space-y-3 border-t pt-3 border-slate-100">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Options Setup & Marks Key (Select correct answer)
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => addOptionToQuestion(q.id)}
                                >
                                  Add Option
                                </Button>
                              </div>

                              <div className="space-y-2.5">
                                {q.options.map((opt, oIdx) => {
                                  const isChecked = q.type === "mcq" 
                                    ? q.correctAnswer === opt.id
                                    : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id)

                                  return (
                                    <div key={opt.id} className="flex items-center gap-3">
                                      {/* Correct Indicator (Radio or Checkbox) */}
                                      <input
                                        type={q.type === "mcq" ? "radio" : "checkbox"}
                                        name={`correct-${q.id}`}
                                        checked={isChecked}
                                        onChange={(e) => handleCorrectToggle(q.id, opt.id, e.target.checked)}
                                        className={cn(
                                          "size-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500",
                                          q.type === "mcq" ? "rounded-full" : "rounded"
                                        )}
                                      />
                                      
                                      {/* Option Label Indicator */}
                                      <span className="font-mono font-bold text-xs text-slate-400 shrink-0 w-4">
                                        {opt.id}.
                                      </span>

                                      {/* Option Text Input */}
                                      <Input
                                        placeholder={`Option ${opt.id} content...`}
                                        className="h-9 rounded-xl text-xs bg-white border-slate-200"
                                        value={opt.text}
                                        onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                                      />

                                      {/* Delete Option (only if at least 2 options exist) */}
                                      {q.options!.length > 2 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-slate-50 shrink-0 rounded-lg"
                                          onClick={() => removeOptionFromQuestion(q.id, opt.id)}
                                        >
                                          <X className="size-4" />
                                        </Button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Short answer correct key */}
                          {q.type === "short_answer" && (
                            <div className="space-y-1.5 border-t pt-3 border-slate-100">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct Answer Key (Case-insensitive evaluation)</Label>
                              <Input
                                placeholder="e.g. Newton (or 32, or specific phrase)"
                                className="h-9 rounded-xl text-xs bg-white border-slate-200"
                                value={typeof q.correctAnswer === "string" ? q.correctAnswer : ""}
                                onChange={(e) => updateQuestionField(q.id, "correctAnswer", e.target.value)}
                              />
                            </div>
                          )}

                          {/* Long answer indicator */}
                          {q.type === "long_answer" && (
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2 border-t mt-3 text-[10px] text-slate-500 font-medium">
                              <AlertCircle className="size-4 text-slate-400 shrink-0 mt-0.5" />
                              <span>
                                Long Answer / Essay questions do not have automated evaluations. Graders will review student text submissions manually and allocate marks up to the maximum limit (₹{q.marks} Marks).
                              </span>
                            </div>
                          )}

                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-3">
                      <FileQuestion className="size-10 text-slate-300 mx-auto" />
                      <div className="space-y-1 max-w-xs mx-auto">
                        <p className="font-bold text-slate-700 text-sm">No Questions Drafted</p>
                        <p className="text-xs text-slate-400">
                          Begin constructing your test paper by adding question sheets using the builder button below.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={addQuestionToForm}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 font-bold text-xs h-9 rounded-xl"
                      >
                        Add Your First Question
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add Question Button */}
                {formQuestions.length > 0 && (
                  <Button
                    type="button"
                    onClick={addQuestionToForm}
                    className="w-full h-11 bg-white border-2 border-dashed border-slate-250 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/10 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all gap-1.5"
                  >
                    <Plus className="size-4" /> Add Next Question Sheet
                  </Button>
                )}
              </div>

            </div>

            {/* Creator Footer Controls */}
            <div className="p-5 border-t bg-white flex items-center justify-between shrink-0 flex-wrap gap-3">
              <div className="flex items-center gap-4">
                {/* Draft vs Published Switch */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="exam-status-switch" className="text-xs font-bold uppercase tracking-wider text-slate-500">Publish Immediately</Label>
                  <input
                    id="exam-status-switch"
                    type="checkbox"
                    checked={formStatus === "Published"}
                    onChange={(e) => setFormStatus(e.target.checked ? "Published" : "Draft")}
                    className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-black uppercase tracking-wider border-none",
                    formStatus === "Published" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {formStatus}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-xl text-xs h-9 px-5 uppercase tracking-wider font-bold border-slate-200" 
                  onClick={() => setIsCreatorOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs h-9 px-5 bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-wider font-bold"
                >
                  {formId ? "Apply Changes" : "Create Exam"}
                </Button>
              </div>
            </div>

          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* 2. READ-ONLY EXAM PREVIEW / PRINT SHEET DIALOG                  */}
      {/* ============================================================== */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl rounded-2xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
          
          {/* Preview Header */}
          <DialogHeader className="p-5 border-b bg-white flex flex-row items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="font-headline font-bold text-sm">Question Paper Preview</DialogTitle>
                <DialogDescription className="text-[10px]">Formatted print-ready layout matching professional examination formats.</DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Show Answers Toggle */}
              {(isStaff || (selectedExam && selectedExam.status === "Completed")) && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/85 px-3 py-1.5 rounded-xl text-slate-650 select-none mr-1 shrink-0">
                  <input
                    type="checkbox"
                    id="toggle-answers"
                    checked={showAnswers}
                    onChange={(e) => setShowAnswers(e.target.checked)}
                    className="size-3.5 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <Label htmlFor="toggle-answers" className="text-[10px] font-bold uppercase tracking-wider cursor-pointer font-sans leading-none">
                    Show Answers
                  </Label>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-lg border-slate-200 shrink-0"
                onClick={triggerPrint}
              >
                <Printer className="size-3.5 mr-1" /> Print / PDF
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg shrink-0"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Print Sheet Paper */}
          <div id="exam-paper-capture" className="flex-1 overflow-y-auto bg-white p-8 md:p-12 font-serif text-slate-800 space-y-8 shadow-inner print:p-0 print:shadow-none">
            {selectedExam ? (
              <>
                {/* School Letterhead Header */}
                <div className="text-center space-y-1 border-b-2 border-slate-900 pb-5">
                  <h2 className="text-xl font-bold uppercase tracking-wide font-serif text-slate-950">
                    {getTenantDetails().name}
                  </h2>
                  <p className="text-xs italic font-sans text-slate-500">{getTenantDetails().tagline}</p>
                  <h3 className="text-base font-bold underline mt-3 font-serif uppercase tracking-wide text-slate-900">
                    {selectedExam.title}
                  </h3>
                  
                  {/* Paper stats */}
                  <div className="grid grid-cols-3 text-xs font-sans text-slate-650 pt-4 font-semibold">
                    <div className="text-left">
                      TIME ALLOWED: {selectedExam.duration} MINS
                    </div>
                    <div className="text-center uppercase">
                      AUDIENCE: {selectedExam.targetType === "batch" 
                        ? (batches.find(b => b.id === selectedExam.targetBatchId)?.name || "Batch Group")
                        : (students.find(s => s.id === selectedExam.targetStudentId)?.name || "Student Portal")
                      }
                    </div>
                    <div className="text-right">
                      MAXIMUM MARKS: {selectedExam.totalMarks}
                    </div>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-4 border border-slate-300 rounded-lg bg-slate-50/20 text-xs leading-relaxed font-sans space-y-1.5">
                  <p className="font-bold text-slate-900 uppercase">General Instructions to Candidates:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-650">
                    <li>Write your name and roll number clearly in the space provided on the answer sheet.</li>
                    <li>Attempt all questions. Ensure answers are well-labeled and clearly structured.</li>
                    <li>Instructions particular to this exam: <span className="italic">{selectedExam.description}</span></li>
                  </ol>
                </div>

                {/* Questions Listing */}
                <div className="space-y-8 pt-4">
                  {selectedExam.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-3 leading-relaxed text-sm">
                      
                      {/* Question Header (Text and Marks) */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 font-serif">
                          <p className="text-slate-950 font-medium">
                            <span className="font-bold mr-1.5">Q{idx + 1}.</span>
                            {q.questionText}
                          </p>
                        </div>
                        <span className="font-sans font-bold text-xs text-slate-650 shrink-0">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      {/* Question Options for MCQ / Checkbox */}
                      {(q.type === "mcq" || q.type === "checkbox") && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-6 font-sans text-xs text-slate-700">
                          {q.options.map(opt => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <span className="size-4 rounded-full border border-slate-450 flex items-center justify-center text-[9px] font-bold font-mono shrink-0">
                                {opt.id}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text Answers Spaces for exams print outs */}
                      {q.type === "short_answer" && (
                        <div className="pl-6 pt-1 font-sans text-xs italic text-slate-400">
                          Answer: __________________________________________________________________
                        </div>
                      )}
                      
                      {q.type === "long_answer" && (
                        <div className="pl-6 space-y-1.5 pt-2">
                          <div className="h-0.5 w-full border-b border-dashed border-slate-300" />
                          <div className="h-0.5 w-full border-b border-dashed border-slate-300" />
                          <div className="h-0.5 w-full border-b border-dashed border-slate-300" />
                          <div className="h-0.5 w-full border-b border-dashed border-slate-300" />
                        </div>
                      )}

                      {/* Correct Answers Key (Rendered conditionally on-screen/print based on toggle) */}
                      {showAnswers && (
                        <div className="pl-6 text-[10px] bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 flex items-center gap-2 text-slate-650 font-sans font-semibold w-fit mt-1.5 animate-in fade-in-0 duration-200">
                          <Badge variant="outline" className="bg-indigo-50 text-[9px] font-black uppercase tracking-widest text-indigo-700 border-indigo-200">Answer Key</Badge>
                          <span>
                            {q.type === "checkbox" && Array.isArray(q.correctAnswer) ? (
                              `Correct Options: ${q.correctAnswer.join(", ")}`
                            ) : (
                              `Correct Option/Text: ${q.correctAnswer}`
                            )}
                          </span>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Paper Footer */}
                <div className="text-center text-[11px] text-slate-400 font-sans border-t border-slate-150 pt-8 font-semibold uppercase tracking-widest">
                  *** END OF ASSESSMENT PAPER ***
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400 italic">
                No exam loaded.
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  )
}

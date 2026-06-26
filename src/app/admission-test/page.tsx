"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { 
  Award, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  GraduationCap, 
  ChevronRight, 
  ShieldAlert,
  Calendar,
  FileText,
  HelpCircle,
  X
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Interfaces
interface QuestionOption {
  id: string
  text: string
}

interface Question {
  id: string
  type: "mcq" | "checkbox" | "short_answer" | "long_answer"
  questionText: string
  options?: QuestionOption[]
  correctAnswer: string | string[]
  marks: number
}

interface Exam {
  id: string
  title: string
  description: string
  duration: number // minutes
  totalMarks: number
  targetType: "batch" | "student"
  status: "Draft" | "Published" | "Completed"
  createdAt: string
  scheduledDate?: string
  scheduledTime?: string
  questions: Question[]
}

interface AdmissionResponse {
  id: string
  examId: string
  studentName: string
  studentClass: string
  studentEmail?: string
  studentPhone?: string
  answers: { [questionId: string]: string | string[] }
  score: number
  totalMarks: number
  submittedAt: string
  gradedStatus: "Graded" | "Pending Grading"
  questionDetails: {
    questionId: string
    questionText: string
    type: string
    marks: number
    studentAnswer: string | string[]
    correctAnswer: string | string[]
    isCorrect: boolean
    allocatedMarks: number
  }[]
}

export default function AdmissionTestPage() {
  const searchParams = useSearchParams()
  const examId = searchParams.get("id")
  const tenantId = searchParams.get("tenant") || "inst_001"

  const [mounted, setMounted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [exam, setExam] = React.useState<Exam | null>(null)
  const [instituteName, setInstituteName] = React.useState("Coaching Academy")
  const [instituteTagline, setInstituteTagline] = React.useState("Educator Portal")

  // Test Flow States
  const [step, setStep] = React.useState<"register" | "test" | "success">("register")
  
  // Registration Form
  const [studentName, setStudentName] = React.useState("")
  const [studentClass, setStudentClass] = React.useState("")
  const [studentEmail, setStudentEmail] = React.useState("")
  const [studentPhone, setStudentPhone] = React.useState("")

  // Active Test Answers
  const [answers, setAnswers] = React.useState<{ [qId: string]: string | string[] }>({})
  const [timeLeft, setTimeLeft] = React.useState(0) // seconds
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Results
  const [finalScore, setFinalScore] = React.useState(0)
  const [hasLongAnswers, setHasLongAnswers] = React.useState(false)

  // Load Exam properties on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return

    if (!examId) {
      setError("No admission test ID was provided in the shareable link.")
      setMounted(true)
      return
    }

    // Load all DB state from local storage or fallback to see if we can find the exam
    const examsKey = `${tenantId}_admission_tests`
    const savedTestsRaw = localStorage.getItem(examsKey)
    let foundExam: Exam | null = null

    if (savedTestsRaw) {
      try {
        const tests = JSON.parse(savedTestsRaw) as Exam[]
        foundExam = tests.find(t => t.id === examId) || null
      } catch (e) {
        console.error("Failed to parse admission tests", e)
      }
    }

    // Fallback: If not found in custom admission tests, check regular exams
    if (!foundExam) {
      const regularExamsKey = `${tenantId}_exams`
      const savedRegularRaw = localStorage.getItem(regularExamsKey)
      if (savedRegularRaw) {
        try {
          const regularExams = JSON.parse(savedRegularRaw) as Exam[]
          foundExam = regularExams.find(t => t.id === examId) || null
        } catch (e) {
          console.error("Failed to parse regular exams", e)
        }
      }
    }

    if (!foundExam) {
      setError("The requested admission test could not be found or has been archived.")
      setMounted(true)
      return
    }

    if (foundExam.status === "Draft") {
      setError("This assessment is currently in Draft mode and cannot be taken yet.")
      setMounted(true)
      return
    }

    setExam(foundExam)
    setTimeLeft(foundExam.duration * 60)

    // Load institute names for high-end customization
    const tenantsRaw = localStorage.getItem("tuitionflow_tenants")
    if (tenantsRaw) {
      try {
        const tenants = JSON.parse(tenantsRaw) as any[]
        const match = tenants.find(t => t.id === tenantId)
        if (match) {
          setInstituteName(match.name)
          setInstituteTagline(match.tagline)
        }
      } catch (e) {}
    }

    setMounted(true)
  }, [examId, tenantId])

  // Timer Countdown Effect
  React.useEffect(() => {
    if (step !== "test" || timeLeft <= 0) {
      if (step === "test" && timeLeft === 0) {
        // Auto submit on time-out
        handleAutoSubmit()
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [step, timeLeft])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading Assessment Environment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <Card className="max-w-md w-full border-red-500/20 bg-white shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="mx-auto size-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">Access Restricted</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium px-4">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-8 pt-4">
            <Button 
              onClick={() => window.close()} 
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider h-10 px-6 text-white"
            >
              Close Window
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Formatting time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle MCQ Selection
  const handleMcqSelect = (qId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optionId }))
  }

  // Handle Checkbox Selection
  const handleCheckboxToggle = (qId: string, optionId: string, checked: boolean) => {
    const current = (answers[qId] as string[]) || []
    let next: string[]
    if (checked) {
      next = [...current, optionId]
    } else {
      next = current.filter(id => id !== optionId)
    }
    setAnswers(prev => ({ ...prev, [qId]: next }))
  }

  // Handle Text/Short Answer input
  const handleTextChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  // Start Exam
  const startExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentName.trim() || !studentClass.trim()) return
    setStep("test")
  }

  // Grade and Submit Assessment
  const submitExamAnswers = async (forced = false) => {
    if (!exam || isSubmitting) return
    
    if (!forced) {
      const confirmSubmit = window.confirm("Are you sure you want to submit your assessment? You cannot modify your answers afterward.")
      if (!confirmSubmit) return
    }

    setIsSubmitting(true)

    try {
      let score = 0
      let needsGrading = false
      const details: AdmissionResponse["questionDetails"] = []

      // Evaluate each question
      exam.questions.forEach(q => {
        const studentAns = answers[q.id] || ""
        let isCorrect = false
        let allocatedMarks = 0

        if (q.type === "mcq") {
          isCorrect = typeof studentAns === "string" && studentAns === q.correctAnswer
          allocatedMarks = isCorrect ? q.marks : 0
          score += allocatedMarks
        } else if (q.type === "checkbox") {
          const studentArr = Array.isArray(studentAns) ? [...studentAns].sort() : []
          const correctArr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer].sort() : [q.correctAnswer].sort()
          isCorrect = studentArr.length === correctArr.length && studentArr.every((v, i) => v === correctArr[i])
          allocatedMarks = isCorrect ? q.marks : 0
          score += allocatedMarks
        } else if (q.type === "short_answer") {
          const cleanStudent = typeof studentAns === "string" ? studentAns.trim().toLowerCase() : ""
          const cleanCorrect = typeof q.correctAnswer === "string" ? q.correctAnswer.trim().toLowerCase() : ""
          isCorrect = cleanStudent === cleanCorrect
          allocatedMarks = isCorrect ? q.marks : 0
          score += allocatedMarks
        } else if (q.type === "long_answer") {
          needsGrading = true
          allocatedMarks = 0 // manually graded later
        }

        details.push({
          questionId: q.id,
          questionText: q.questionText,
          type: q.type,
          marks: q.marks,
          studentAnswer: studentAns,
          correctAnswer: q.correctAnswer,
          isCorrect,
          allocatedMarks
        })
      })

      const newResponse: AdmissionResponse = {
        id: `RSP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        examId: exam.id,
        studentName: studentName.trim(),
        studentClass: studentClass.trim(),
        studentEmail: studentEmail.trim() || undefined,
        studentPhone: studentPhone.trim() || undefined,
        answers,
        score,
        totalMarks: exam.totalMarks,
        submittedAt: new Date().toISOString(),
        gradedStatus: needsGrading ? "Pending Grading" : "Graded",
        questionDetails: details
      }

      // Load existing responses from localStorage
      const responsesKey = `${tenantId}_admission_responses`
      const existingRaw = localStorage.getItem(responsesKey)
      let currentResponses: AdmissionResponse[] = []

      if (existingRaw) {
        try {
          currentResponses = JSON.parse(existingRaw) as AdmissionResponse[]
        } catch (e) {}
      }

      const updatedResponses = [newResponse, ...currentResponses]
      
      // Save to localStorage
      localStorage.setItem(responsesKey, JSON.stringify(updatedResponses))

      // Sync to Database properly via POST /api/db
      await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: responsesKey, value: updatedResponses })
      })

      setFinalScore(score)
      setHasLongAnswers(needsGrading)
      setStep("success")
    } catch (e) {
      console.error("Submission failed", e)
      alert("An error occurred while submitting your test. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = () => {
    submitExamAnswers(true)
  }

  return (
    <div className="min-h-screen relative bg-slate-50 font-sans flex flex-col justify-between overflow-hidden select-none">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        
        {/* Step 1: Candidate Registration */}
        {step === "register" && exam && (
          <Card className="max-w-xl w-full border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            <CardHeader className="text-center border-b border-slate-100 p-6 md:p-8 bg-slate-50/50">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 uppercase tracking-widest rounded-full mb-3">
                <Award className="size-3.5" /> Admission Portal
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 font-headline leading-tight">
                {instituteName}
              </h2>
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{instituteTagline}</p>
              
              <div className="h-px bg-slate-200 my-4 w-1/3 mx-auto" />
              
              <h3 className="text-sm font-bold text-slate-700 font-sans">
                Assessment: <span className="text-indigo-600 font-extrabold">{exam.title}</span>
              </h3>
            </CardHeader>
            
            <form onSubmit={startExam}>
              <CardContent className="p-6 md:p-8 space-y-5">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Please fill in your details below to register and start the admission test. This exam is timed and must be completed in one sitting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="stud-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="stud-name"
                        required
                        placeholder="John Doe"
                        className="pl-9 rounded-xl text-xs h-10 bg-white"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Class */}
                  <div className="space-y-1.5">
                    <Label htmlFor="stud-class" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Class / Grade *</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="stud-class"
                        required
                        placeholder="e.g. Grade 10, Class 12"
                        className="pl-9 rounded-xl text-xs h-10 bg-white"
                        value={studentClass}
                        onChange={e => setStudentClass(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="stud-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address (Optional)</Label>
                    <Input
                      id="stud-email"
                      type="email"
                      placeholder="johndoe@example.com"
                      className="rounded-xl text-xs h-10 bg-white"
                      value={studentEmail}
                      onChange={e => setStudentEmail(e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="stud-phone" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number (Optional)</Label>
                    <Input
                      id="stud-phone"
                      placeholder="9876543210"
                      className="rounded-xl text-xs h-10 bg-white"
                      value={studentPhone}
                      onChange={e => setStudentPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Exam Details Badge strip */}
                <div className="flex justify-center gap-3 flex-wrap pt-3 border-t border-slate-100">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] px-3 py-1 font-semibold rounded-lg flex items-center gap-1">
                    <Clock className="size-3 text-slate-500" /> {exam.duration} Minutes
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] px-3 py-1 font-semibold rounded-lg flex items-center gap-1">
                    <BookOpen className="size-3 text-slate-500" /> {exam.questions.length} Questions
                  </Badge>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] px-3 py-1 font-bold rounded-lg">
                    Total: {exam.totalMarks} Marks
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="px-6 md:p-8 pt-0 flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider h-11 text-white gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:-translate-y-0.5"
                >
                  Start Admission Test <ChevronRight className="size-4" />
                </Button>
                <span className="text-[10px] text-slate-400 text-center w-full">
                  By starting, you agree that the timer will begin and cannot be paused.
                </span>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Step 2: Active Timed Test Taking */}
        {step === "test" && exam && (
          <div className="max-w-4xl w-full flex flex-col md:flex-row gap-6 items-start animate-in fade-in-0 duration-300">
            
            {/* Left side: Question Sheets (70%) */}
            <div className="flex-1 w-full space-y-5">
              
              {/* Paper Letterhead Header */}
              <Card className="border border-slate-200/80 bg-white shadow-md rounded-2xl overflow-hidden font-serif">
                <CardContent className="p-6 md:p-8 text-center space-y-1.5 border-b-2 border-slate-800">
                  <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide text-slate-900 font-serif">
                    {instituteName}
                  </h2>
                  <p className="text-[10px] italic font-sans text-slate-500">{instituteTagline}</p>
                  <h3 className="text-sm md:text-base font-bold underline mt-3 font-serif uppercase tracking-wide text-slate-800">
                    {exam.title}
                  </h3>

                  <div className="grid grid-cols-3 text-[10px] font-sans text-slate-500 pt-3 font-semibold">
                    <div className="text-left uppercase">
                      CANDIDATE: {studentName} ({studentClass})
                    </div>
                    <div className="text-center">
                      TIME ALLOWED: {exam.duration} MINS
                    </div>
                    <div className="text-right">
                      MAX MARKS: {exam.totalMarks}
                    </div>
                  </div>
                </CardContent>

                {/* Print instructions */}
                <CardContent className="p-4 bg-slate-50/50 text-[10px] font-sans leading-relaxed text-slate-500 border-b">
                  <span className="font-bold text-slate-700 uppercase">Instructions: </span>
                  Attempt all questions. Ensure answers are well-thought. The test will auto-submit when the countdown timer reaches zero.
                </CardContent>
              </Card>

              {/* Questions List */}
              <div className="space-y-5">
                {exam.questions.map((q, idx) => (
                  <Card key={q.id} className="border border-slate-200/80 bg-white shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-slate-50/45 border-b py-3.5 px-5 flex flex-row items-start justify-between gap-4">
                      <span className="font-bold text-slate-800 text-xs font-serif">
                        Question {idx + 1}
                      </span>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-mono text-[10px] font-bold px-2 py-0.5">
                        {q.marks} Marks
                      </Badge>
                    </CardHeader>
                    
                    <CardContent className="p-5 space-y-4 font-serif text-slate-850">
                      
                      {/* Prompt */}
                      <p className="text-sm font-medium leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Render MCQ */}
                      {q.type === "mcq" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {q.options.map(opt => {
                            const isSelected = answers[q.id] === opt.id
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleMcqSelect(q.id, opt.id)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 rounded-xl border font-sans text-xs text-left transition-all",
                                  isSelected 
                                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 font-semibold ring-2 ring-indigo-600/15 shadow-sm" 
                                    : "border-slate-200 bg-white hover:border-indigo-300 text-slate-700 hover:bg-slate-50/50"
                                )}
                              >
                                <span className={cn(
                                  "size-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 font-mono transition-colors",
                                  isSelected 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "border-slate-300 text-slate-400 bg-white"
                                )}>
                                  {opt.id}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Render Checkbox */}
                      {q.type === "checkbox" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {q.options.map(opt => {
                            const currentList = (answers[q.id] as string[]) || []
                            const isSelected = currentList.includes(opt.id)
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleCheckboxToggle(q.id, opt.id, !isSelected)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 rounded-xl border font-sans text-xs text-left transition-all",
                                  isSelected 
                                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 font-semibold ring-2 ring-indigo-600/15 shadow-sm" 
                                    : "border-slate-200 bg-white hover:border-indigo-300 text-slate-700 hover:bg-slate-50/50"
                                )}
                              >
                                <span className={cn(
                                  "size-5 rounded border flex items-center justify-center font-bold text-[10px] shrink-0 font-mono transition-colors",
                                  isSelected 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "border-slate-300 text-slate-400 bg-white"
                                )}>
                                  {opt.id}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Render Short Answer */}
                      {q.type === "short_answer" && (
                        <div className="pt-1 font-sans">
                          <Input
                            placeholder="Type your brief answer here..."
                            className="rounded-xl text-xs h-10 border-slate-200 bg-slate-50/10"
                            value={(answers[q.id] as string) || ""}
                            onChange={e => handleTextChange(q.id, e.target.value)}
                          />
                        </div>
                      )}

                      {/* Render Long Answer */}
                      {q.type === "long_answer" && (
                        <div className="pt-1 font-sans">
                          <Textarea
                            placeholder="Write your detailed solution here..."
                            className="rounded-xl text-xs min-h-[100px] border-slate-200 bg-slate-50/10 resize-none"
                            value={(answers[q.id] as string) || ""}
                            onChange={e => handleTextChange(q.id, e.target.value)}
                          />
                        </div>
                      )}

                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end pt-2 pb-12">
                <Button
                  onClick={() => submitExamAnswers(false)}
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-sans font-bold text-xs uppercase tracking-wider h-11 px-8 text-white shadow-lg shadow-indigo-600/10 transition-all hover:-translate-y-0.5"
                >
                  {isSubmitting ? "Submitting Assessment..." : "Submit Admission Test"}
                </Button>
              </div>

            </div>

            {/* Right side: Sticky Timer & Navigation Widget (30%) */}
            <div className="w-full md:w-80 md:sticky md:top-6 space-y-4 shrink-0">
              
              {/* Timer Card */}
              <Card className="border border-slate-200/80 bg-white shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-indigo-600 p-5 text-center text-white">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-200 flex items-center justify-center gap-1.5">
                    <Clock className="size-3.5 animate-pulse" /> Countdown Timer
                  </p>
                  <h3 className="text-3xl font-mono font-black mt-1 leading-none tracking-tight">
                    {formatTime(timeLeft)}
                  </h3>
                </CardHeader>
                
                <CardContent className="p-5 space-y-4 text-xs font-sans text-slate-600">
                  <div className="flex justify-between items-center pb-2.5 border-b">
                    <span className="font-medium">Candidate Name:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{studentName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b">
                    <span className="font-medium">Applied Class:</span>
                    <span className="font-bold text-slate-800">{studentClass}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Questions Attempted:</span>
                    <span className="font-bold text-indigo-600">
                      {Object.keys(answers).filter(k => {
                        const ans = answers[k]
                        if (Array.isArray(ans)) return ans.length > 0
                        return ans.toString().trim().length > 0
                      }).length} / {exam.questions.length}
                    </span>
                  </div>

                  {/* Warning on low time */}
                  {timeLeft < 180 && timeLeft > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-bold rounded-xl flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>Warning: Less than 3 minutes remaining! Work quickly.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Jump Question Matrix */}
              <Card className="border border-slate-200/80 bg-white shadow-md rounded-2xl">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">Assessment Progress Sheet</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {exam.questions.map((q, idx) => {
                      const isAnswered = answers[q.id] && (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : answers[q.id].toString().trim().length > 0)
                      return (
                        <div
                          key={q.id}
                          className={cn(
                            "aspect-square rounded-lg flex items-center justify-center text-xs font-bold font-mono border transition-all",
                            isAnswered 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs" 
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          )}
                          title={`Question ${idx + 1}`}
                        >
                          {idx + 1}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        )}

        {/* Step 3: Success Completion Screen */}
        {step === "success" && exam && (
          <Card className="max-w-md w-full border border-slate-200/80 bg-white shadow-2xl rounded-2xl overflow-hidden text-center p-6 md:p-8 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="mx-auto size-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
              <CheckCircle2 className="size-8" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-slate-900 font-headline">
              Assessment Completed ✓
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Thank You, {studentName}
            </p>
            
            <div className="h-px bg-slate-200 my-6 w-1/3 mx-auto" />

            <div className="space-y-4 font-sans max-w-sm mx-auto text-sm text-slate-650">
              <p className="leading-relaxed">
                Your admission test responses for <span className="font-bold text-slate-800">"{exam.title}"</span> have been recorded and saved in the institute registry.
              </p>

              {/* Show immediate score if no manual grading is needed */}
              {!hasLongAnswers ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Immediate Assessment Score</p>
                  <p className="text-2xl font-mono font-black text-emerald-800">{finalScore} / {exam.totalMarks}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Auto-graded sectors completed successfully.</p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1 text-slate-600">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grading Status</p>
                  <p className="text-base font-bold text-slate-800">Under Evaluation</p>
                  <p className="text-[10px] text-slate-400 font-medium">Includes manually graded long answers. The admissions team will review and contact you.</p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t pt-5">
              <Button
                onClick={() => window.close()}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider h-10 text-white"
              >
                Exit Assessment Window
              </Button>
            </div>
          </Card>
        )}

      </div>

      {/* Footer Branding */}
      <div className="py-5 text-center text-[10px] text-slate-400 font-sans tracking-widest uppercase border-t bg-slate-50/50 shrink-0 select-none">
        Powered by Coaching OS · Secure Assessment Environment
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, ArrowLeft, Mail, Lock, Sparkles, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { getUserCredentials, getTenants } from "@/lib/tenant"
import Link from "next/link"

export default function StudentLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [loadingStep, setLoadingStep] = React.useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please enter your student login credentials.",
      })
      return
    }

    const creds = getUserCredentials()
    const match = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.role === "student")

    if (!match || match.password !== password) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid student credentials or passcode.",
      })
      return
    }

    setLoading(true)
    const steps = [
      "Accessing academic desk module...",
      "Resolving student classroom schedules...",
      "Fetching outstanding fee logs...",
      "Loading interactive learning portal..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 750))
    }

    localStorage.setItem("tuitionflow_logged_in", "true")
    localStorage.setItem("tuitionflow_active_role", "student")
    localStorage.setItem("tuitionflow_active_tenant", match.tenantId)
    localStorage.setItem("tuitionflow_logged_in_email", match.email)

    const tenantsList = getTenants()
    const tenantName = tenantsList.find(t => t.id === match.tenantId)?.name || "TuitionFlow"

    toast({
      title: "Authenticated",
      description: `Welcome back, ${match.name}. Your student dashboard at ${tenantName} is ready.`,
    })

    window.location.href = "/"
  }

  const loginAsDemo = () => {
    setEmail("sarah.smith@example.com")
    setPassword("demopassword")
    setTimeout(() => {
      const btn = document.getElementById("submit-btn")
      btn?.click()
    }, 100)
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left side: Student visual summary */}
        <div className="lg:col-span-6 space-y-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft className="size-3.5" /> Back to gateway
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase tracking-widest rounded-full">
              <Sparkles className="size-3 animate-bounce" /> Student Desk Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-white leading-none">
              Academic Hub
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Check your class calendar logs, verify daily attendance rings, check grade metrics, and clear pending fee invoices online.
            </p>
          </div>

          {/* Attendance ring preview widget */}
          <div className="space-y-3 max-w-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Student Profile preview</span>
            <Card className="border border-slate-800 bg-slate-900/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah Smith</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Batch Alpha Morning</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Grade 10</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                  <span className="flex items-center gap-1"><BookOpen className="size-3 text-emerald-400" /> Attendance average</span>
                  <span className="text-white">96%</span>
                </div>
                <Progress value={96} className="h-1.5 bg-slate-850" />
              </div>
            </Card>
          </div>
        </div>

        {/* Right side: Form */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-emerald-500/[0.02]">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-headline font-bold text-white">Student Login</h3>
                  <p className="text-xs text-slate-400 font-medium">Log into your learning space.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs text-white font-mono uppercase tracking-wider">Mounting student portal...</p>
                    <p className="text-[10px] text-emerald-300 font-mono italic max-w-xs">{loadingStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                        <Input
                          type="email"
                          placeholder="sarah.smith@example.com"
                          className="pl-9 bg-slate-950 border-slate-800 text-xs"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 bg-slate-950 border-slate-800 text-xs"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button id="submit-btn" type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold uppercase text-xs tracking-wider h-10 rounded-xl shadow-lg shadow-emerald-500/10 text-white mt-2">
                    Open Student Portal
                  </Button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-800/80"></div>
                    <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider font-bold text-slate-500">Quick Sandbox access</span>
                    <div className="flex-grow border-t border-slate-800/80"></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full border-dashed border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 font-bold uppercase text-[10px] h-9 rounded-xl transition-all" onClick={loginAsDemo}>
                    Sign In as Demo Student
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

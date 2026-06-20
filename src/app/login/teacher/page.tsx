"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, ArrowLeft, Mail, Lock, BookOpen, Clock, CalendarCheck2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getUserCredentials, getTenants } from "@/lib/tenant"
import Link from "next/link"

export default function TeacherLogin() {
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
        title: "Missing Fields",
        description: "Please enter your email and password.",
      })
      return
    }

    const creds = getUserCredentials()
    const match = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.role === "teacher")

    if (!match || match.password !== password) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid teacher credentials or passcode.",
      })
      return
    }

    setLoading(true)
    const steps = [
      "Accessing academic roster...",
      "Resolving assigned batch lists...",
      "Loading calendar schedule records...",
      "Initializing teacher workspace..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 750))
    }

    localStorage.setItem("tuitionflow_logged_in", "true")
    localStorage.setItem("tuitionflow_active_role", "teacher")
    localStorage.setItem("tuitionflow_active_tenant", match.tenantId)
    localStorage.setItem("tuitionflow_logged_in_email", match.email)

    const tenantsList = getTenants()
    const tenantName = tenantsList.find(t => t.id === match.tenantId)?.name || "TuitionFlow"

    toast({
      title: "Workspace Synchronized",
      description: `Welcome back, ${match.name}. Your class rosters at ${tenantName} are loaded.`,
    })

    window.location.href = "/"
  }

  const loginAsDemo = () => {
    setEmail("sarah.smith@tuitionflow.edu")
    setPassword("demopassword")
    setTimeout(() => {
      const btn = document.getElementById("submit-btn")
      btn?.click()
    }, 100)
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Teacher stats & preview widgets */}
        <div className="lg:col-span-6 space-y-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft className="size-3.5" /> Back to gateway
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest rounded-full">
              <CalendarCheck2 className="size-3" /> Faculty Portal Access
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-white leading-none">
              Faculty Workspace
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Access your classroom dashboards, record daily student attendance, manage schedules, and request leave logs.
            </p>
          </div>

          {/* Classroom schedule preview snippet */}
          <div className="space-y-3 max-w-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Upcoming Agenda preview</span>
            <Card className="border border-slate-800 bg-slate-900/30 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <AvatarFallback className="font-bold text-sm bg-transparent">SS</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-bold text-white">Prof. Sarah Smith</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Senior Math Faculty</p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                <p className="text-[10px] text-slate-400 font-medium mt-1">2 Batches Assigned</p>
              </div>
            </Card>

            <Card className="border border-slate-800 bg-slate-900/20 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                <span className="flex items-center gap-1"><Clock className="size-3 text-indigo-400" /> Today's schedule</span>
                <span className="text-indigo-400">June 19, 2026</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-indigo-500" /> Batch Alpha
                </span>
                <span className="font-mono text-slate-400">09:00 AM - 10:30 AM</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-indigo-500/[0.02]">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BookOpen className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-headline font-bold text-white">Faculty Login</h3>
                  <p className="text-xs text-slate-400 font-medium">Verify your employee credentials.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs text-white font-mono uppercase tracking-wider">Mounting faculty node...</p>
                    <p className="text-[10px] text-indigo-300 font-mono italic max-w-xs">{loadingStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                        <Input
                          type="email"
                          placeholder="sarah.smith@tuitionflow.edu"
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

                  <Button id="submit-btn" type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold uppercase text-xs tracking-wider h-10 rounded-xl shadow-lg shadow-indigo-500/10 text-white mt-2">
                    Enter Portal
                  </Button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-800/80"></div>
                    <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider font-bold text-slate-500">Quick Sandbox access</span>
                    <div className="flex-grow border-t border-slate-800/80"></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full border-dashed border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 font-bold uppercase text-[10px] h-9 rounded-xl transition-all" onClick={loginAsDemo}>
                    Sign In as Demo Teacher
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

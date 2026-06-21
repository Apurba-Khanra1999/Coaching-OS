"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, ArrowLeft, Mail, Lock, BookOpen, Clock, CalendarCheck2, Users, Calendar, CheckCircle2, Award } from "lucide-react"
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
    const tenantName = tenantsList.find(t => t.id === match.tenantId)?.name || "Coaching OS"

    toast({
      title: "Workspace Synchronized",
      description: `Welcome back, ${match.name}. Your class rosters at ${tenantName} are loaded.`,
    })

    window.location.href = "/"
  }

  const loginAsDemo = () => {
    setEmail("sarah.smith@coachingos.edu")
    setPassword("demopassword")
    setTimeout(() => {
      const btn = document.getElementById("submit-btn")
      btn?.click()
    }, 100)
  }

  return (
    <div className="relative min-h-screen lg:min-h-0 lg:h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center p-4 lg:p-8 overflow-hidden selection:bg-indigo-500/10">
      {/* Background textured grid and glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-purple-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
        {/* Left column: Teacher portal benefits & features guide */}
        <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 uppercase tracking-widest rounded-full w-fit">
              <CalendarCheck2 className="size-3" /> Faculty Portal Guide
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-slate-900 leading-none">
              Faculty Workspace
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
              Coaching OS provides coaching teachers with a premium, centralized ecosystem to coordinate academic schedules, roster attendance, and manage salary statements.
            </p>
          </div>

          {/* Banner Graphic - Full available width and height */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-white p-2 w-full h-48 lg:h-[350px]">
            <img 
              src="/teacher_banner.png" 
              alt="Teacher Workspace Portal Banner" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-indigo-500/[0.01]">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
                  <BookOpen className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-headline font-bold text-slate-800">Faculty Login</h3>
                  <p className="text-xs text-slate-500 font-medium">Verify your employee credentials.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-800 font-mono uppercase tracking-wider">Mounting faculty node...</p>
                    <p className="text-[10px] text-indigo-600 font-mono italic max-w-xs">{loadingStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="sarah.smith@coachingos.edu"
                          className="pl-9 rounded-xl text-xs"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 rounded-xl text-xs"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button id="submit-btn" type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold uppercase text-xs tracking-wider h-10 rounded-xl shadow-md text-white mt-2">
                    Enter Portal
                  </Button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider font-bold text-slate-400">Quick Sandbox access</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold uppercase text-[10px] h-9 rounded-xl transition-all" onClick={loginAsDemo}>
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

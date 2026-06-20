"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ShieldAlert, 
  Building2, 
  GraduationCap, 
  Users, 
  User, 
  Sparkles,
  ArrowRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const portals = [
    {
      id: "super-admin",
      title: "Super Admin",
      desc: "System-wide licensing, billing audits, and global settings control panel.",
      icon: ShieldAlert,
      path: "/login/super-admin",
      color: "from-violet-600 to-purple-600",
      accent: "violet",
      shadow: "shadow-violet-500/10",
      border: "hover:border-violet-500/40"
    },
    {
      id: "owner",
      title: "Institute Owner",
      desc: "Full institutional dashboard. Manage payroll, approvals, and setup QR configurations.",
      icon: Building2,
      path: "/login/owner",
      color: "from-amber-500 to-orange-500",
      accent: "amber",
      shadow: "shadow-amber-500/10",
      border: "hover:border-amber-500/40"
    },
    {
      id: "teacher",
      title: "Teacher Portal",
      desc: "Classroom agendas, schedule logs, salary tracking, and leave request hub.",
      icon: User,
      path: "/login/teacher",
      color: "from-indigo-500 to-blue-600",
      accent: "indigo",
      shadow: "shadow-indigo-500/10",
      border: "hover:border-indigo-500/40"
    },
    {
      id: "student",
      title: "Student Desk",
      desc: "Track enrolled batches, daily lessons schedule, and pay outstanding fee vouchers.",
      icon: GraduationCap,
      path: "/login/student",
      color: "from-emerald-500 to-teal-500",
      accent: "emerald",
      shadow: "shadow-emerald-500/10",
      border: "hover:border-emerald-500/40"
    },
    {
      id: "parent",
      title: "Parent Account",
      desc: "Monitor your child's progress, grade logs, attendance checkouts, and fee payments.",
      icon: Users,
      path: "/login/parent",
      color: "from-pink-500 to-rose-500",
      accent: "pink",
      shadow: "shadow-pink-500/10",
      border: "hover:border-pink-500/40"
    }
  ]

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-12 overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Background visual art */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid overlay for cyberpunk digital touch */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
            <Sparkles className="size-3.5" /> Coaching OS Gateway
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-white">
            TuitionFlow Management
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium">
            Select your customized dashboard interface to log into the academy node.
          </p>
        </div>

        {/* Central cards selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {portals.map((portal, idx) => {
            const Icon = portal.icon
            return (
              <Link key={portal.id} href={portal.path} className="group block h-full">
                <Card className={`h-full border border-slate-800 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 transform group-hover:-translate-y-2 hover:bg-slate-900/60 ${portal.shadow} ${portal.border} flex flex-col justify-between overflow-hidden relative`}>
                  {/* Subtle inner card decoration glow */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${portal.color} opacity-20 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-8">
                    <div className="space-y-4">
                      <div className={`size-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center text-white shadow-lg relative shrink-0`}>
                        <Icon className="size-6 relative z-10" />
                        <div className={`absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-headline font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300">
                          {portal.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {portal.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors gap-1 pt-4 border-t border-slate-800/60 mt-auto">
                      Access node <ArrowRight className="size-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-800/40">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Quick Sandbox Demo Login</span>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => {
              localStorage.setItem("tuitionflow_logged_in", "true")
              localStorage.setItem("tuitionflow_active_role", "super_admin")
              localStorage.setItem("tuitionflow_active_tenant", "inst_001")
              localStorage.setItem("tuitionflow_logged_in_email", "admin@tuitionflow.com")
              window.location.href = "/"
            }} className="px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 font-bold uppercase text-[10px] transition-all">
              Super Admin
            </button>
            <button onClick={() => {
              localStorage.setItem("tuitionflow_logged_in", "true")
              localStorage.setItem("tuitionflow_active_role", "owner")
              localStorage.setItem("tuitionflow_active_tenant", "inst_001")
              localStorage.setItem("tuitionflow_logged_in_email", "owner@tuitionflow.edu")
              window.location.href = "/"
            }} className="px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-bold uppercase text-[10px] transition-all">
              Owner
            </button>
            <button onClick={() => {
              localStorage.setItem("tuitionflow_logged_in", "true")
              localStorage.setItem("tuitionflow_active_role", "teacher")
              localStorage.setItem("tuitionflow_active_tenant", "inst_001")
              localStorage.setItem("tuitionflow_logged_in_email", "sarah.smith@tuitionflow.edu")
              window.location.href = "/"
            }} className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 font-bold uppercase text-[10px] transition-all">
              Teacher
            </button>
            <button onClick={() => {
              localStorage.setItem("tuitionflow_logged_in", "true")
              localStorage.setItem("tuitionflow_active_role", "student")
              localStorage.setItem("tuitionflow_active_tenant", "inst_001")
              localStorage.setItem("tuitionflow_logged_in_email", "sarah.smith@example.com")
              window.location.href = "/"
            }} className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 font-bold uppercase text-[10px] transition-all">
              Student
            </button>
            <button onClick={() => {
              localStorage.setItem("tuitionflow_logged_in", "true")
              localStorage.setItem("tuitionflow_active_role", "parent")
              localStorage.setItem("tuitionflow_active_tenant", "inst_001")
              localStorage.setItem("tuitionflow_logged_in_email", "parent@example.com")
              window.location.href = "/"
            }} className="px-3 py-1.5 rounded-lg border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 text-pink-300 font-bold uppercase text-[10px] transition-all">
              Parent
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 font-medium pt-4">
          Powered by Coaching OS Multi-Tenant Architecture. &copy; 2026 TuitionFlow Systems.
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft, Mail, Lock, Sparkles, CreditCard, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUserCredentials, getTenants } from "@/lib/tenant"
import Link from "next/link"

export default function ParentLogin() {
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
        description: "Please fill in all email and passcode fields.",
      })
      return
    }

    const creds = getUserCredentials()
    const match = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.role === "parent")

    if (!match || match.password !== password) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid parent credentials or passcode.",
      })
      return
    }

    setLoading(true)
    const steps = [
      "Securing connection path...",
      "Linking guardian relations code...",
      "Importing child academic report card...",
      "Authorizing financial ledger permissions..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 750))
    }

    localStorage.setItem("tuitionflow_logged_in", "true")
    localStorage.setItem("tuitionflow_active_role", "parent")
    localStorage.setItem("tuitionflow_active_tenant", match.tenantId)
    localStorage.setItem("tuitionflow_logged_in_email", match.email)

    const tenantsList = getTenants()
    const tenantName = tenantsList.find(t => t.id === match.tenantId)?.name || "TuitionFlow"

    toast({
      title: "Authorized Access",
      description: `Welcome back, ${match.name}. Parental access for ${tenantName} authenticated.`,
    })

    window.location.href = "/"
  }

  const loginAsDemo = () => {
    setEmail("parent@example.com")
    setPassword("demopassword")
    setTimeout(() => {
      const btn = document.getElementById("submit-btn")
      btn?.click()
    }, 100)
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Background neon light glows */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-pink-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left side: Guardian tracking information */}
        <div className="lg:col-span-6 space-y-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft className="size-3.5" /> Back to gateway
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-400 uppercase tracking-widest rounded-full">
              <Sparkles className="size-3" /> Guardian Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-white leading-none">
              Family Dashboard
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Monitor your child's academic attendance rates, review pending tuition vouchers, and process digital payments online.
            </p>
          </div>

          {/* Child preview status widget */}
          <div className="space-y-3 max-w-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Child Progress preview</span>
            <Card className="border border-slate-800 bg-slate-900/30 p-4 rounded-xl space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah Smith</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Grade 10 - Batch Alpha</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">TuitionFlow Academy</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 flex items-center gap-1"><CalendarCheck className="size-3 text-pink-400" /> Attendance</span>
                  <span className="text-white text-xs">96% Average</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 flex items-center gap-1"><CreditCard className="size-3 text-pink-400" /> Pending invoices</span>
                  <span className="text-pink-400 text-xs">₹5,000 Due</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right side: Form */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-pink-500/[0.02]">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Users className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-headline font-bold text-white">Guardian Login</h3>
                  <p className="text-xs text-slate-400 font-medium">Verify your parental passcode credentials.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs text-white font-mono uppercase tracking-wider">Mounting guardian nodes...</p>
                    <p className="text-[10px] text-pink-300 font-mono italic max-w-xs">{loadingStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parental Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                        <Input
                          type="email"
                          placeholder="parent@example.com"
                          className="pl-9 bg-slate-950 border-slate-800 text-xs"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passcode Key</label>
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

                  <Button id="submit-btn" type="submit" className="w-full bg-pink-600 hover:bg-pink-500 font-bold uppercase text-xs tracking-wider h-10 rounded-xl shadow-lg shadow-pink-500/10 text-white mt-2">
                    Open Parent Desk
                  </Button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-800/80"></div>
                    <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider font-bold text-slate-500">Quick Sandbox access</span>
                    <div className="flex-grow border-t border-slate-800/80"></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full border-dashed border-pink-500/30 hover:border-pink-500/50 bg-pink-500/5 hover:bg-pink-500/10 text-pink-300 font-bold uppercase text-[10px] h-9 rounded-xl transition-all" onClick={loginAsDemo}>
                    Sign In as Demo Parent
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

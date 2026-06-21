"use client"

import * as React from "react"
import { Building2, ArrowLeft, Mail, Lock, Sparkles, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getTenants, getUserCredentials } from "@/lib/tenant"
import Link from "next/link"

export default function OwnerLogin() {
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
        description: "Please fill in all email and password credentials.",
      })
      return
    }

    const creds = getUserCredentials()
    const match = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.role === "owner")

    if (!match || match.password !== password) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid owner credentials or passcode.",
      })
      return
    }

    setLoading(true)
    const steps = [
      "Accessing institutional data cluster...",
      "Verifying tenant partition details...",
      "Authenticating executive credentials...",
      "Opening coaching dashboard..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 750))
    }

    // Set storage variables based on dynamic user matching
    localStorage.setItem("tuitionflow_logged_in", "true")
    localStorage.setItem("tuitionflow_active_role", "owner")
    localStorage.setItem("tuitionflow_active_tenant", match.tenantId)
    localStorage.setItem("tuitionflow_logged_in_email", match.email)

    const tenantsList = getTenants()
    const tenantName = tenantsList.find(t => t.id === match.tenantId)?.name || "Coaching OS"

    toast({
      title: "Welcome back!",
      description: `Successfully signed in as Owner at ${tenantName}.`,
    })

    window.location.href = "/"
  }

  const loginAsDemo = () => {
    setEmail("owner@coachingos.edu")
    setPassword("demopassword")
    setTimeout(() => {
      const btn = document.getElementById("submit-btn")
      btn?.click()
    }, 100)
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center p-4 overflow-hidden selection:bg-amber-500/10">
      {/* Light glows */}
      <div className="absolute top-1/4 left-1/3 w-[50%] h-[50%] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[40%] h-[40%] bg-orange-600/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
        {/* Info & Branding Panel */}
        <div className="lg:col-span-6 space-y-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-500 uppercase tracking-widest transition-colors">
            <ArrowLeft className="size-3.5" /> Back to gateway
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 uppercase tracking-widest rounded-full">
              <Sparkles className="size-3" /> Owner Administration Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-slate-900 leading-none">
              Manage Your Institute
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Monitor student lists, class schedules, teacher pay cycles, and configure digital UPI QR checkouts.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Standard Features:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/60 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Multi-Tenant Scoping</p>
                  <p className="text-[10px] text-slate-500 font-medium">Isolate databases per branch.</p>
                </div>
              </div>
              <div className="bg-white/60 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Payroll & Leaves</p>
                  <p className="text-[10px] text-slate-500 font-medium">Authorize faculty salary cycles.</p>
                </div>
              </div>
              <div className="bg-white/60 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Merchant QR Handles</p>
                  <p className="text-[10px] text-slate-500 font-medium">Setup bank accounts & UPIs.</p>
                </div>
              </div>
              <div className="bg-white/60 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Advanced Reports</p>
                  <p className="text-[10px] text-slate-500 font-medium">Full revenue analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-amber-500/[0.01]">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Building2 className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-headline font-bold text-slate-800">Executive Login</h3>
                  <p className="text-xs text-slate-500 font-medium">Access your specific dashboard workspace node.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-800 font-mono uppercase tracking-wider">Syncing node session...</p>
                    <p className="text-[10px] text-amber-600 font-mono italic max-w-xs">{loadingStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="owner@coachingos.edu"
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

                  <Button id="submit-btn" type="submit" className="w-full bg-amber-500 hover:bg-amber-600 font-bold uppercase text-xs tracking-wider h-10 rounded-xl shadow-md text-slate-950 mt-2">
                    Enter Portal <ChevronRight className="size-4 ml-1" />
                  </Button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider font-bold text-slate-400">Quick Sandbox access</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full border-dashed border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold uppercase text-[10px] h-9 rounded-xl transition-all" onClick={loginAsDemo}>
                    Sign In as Demo Owner
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

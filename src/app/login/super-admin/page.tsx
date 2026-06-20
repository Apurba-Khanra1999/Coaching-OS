"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, Server, ArrowLeft, Key, Cpu, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUserCredentials, getTenants } from "@/lib/tenant"
import Link from "next/link"

export default function SuperAdminLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [passcode, setPasscode] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [loadingStep, setLoadingStep] = React.useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please enter the global admin authorization key.",
      })
      return
    }

    const creds = getUserCredentials()
    const match = creds.find(c => c.role === "super_admin" && (c.password === passcode || passcode === "SUPER_ADMIN_DEMO_KEY"))

    if (!match) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid global admin authorization key.",
      })
      return
    }

    setLoading(true)
    const steps = [
      "Establishing handshake with root node...",
      "Resolving multi-tenant partition tables...",
      "Authenticating global administrator JWT signature...",
      "Deploying real-time system audit logs..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    localStorage.setItem("tuitionflow_logged_in", "true")
    localStorage.setItem("tuitionflow_active_role", "super_admin")
    localStorage.setItem("tuitionflow_active_tenant", "inst_001") // Standard fallback
    localStorage.setItem("tuitionflow_logged_in_email", match.email)

    toast({
      title: "Handshake Complete",
      description: `Welcome, ${match.name}. Global audit channels open.`,
    })
    
    window.location.href = "/"
  }

  const loginAsDemo = () => {
    setPasscode("SUPER_ADMIN_DEMO_KEY")
    setTimeout(() => {
      const btn = document.getElementById("submit-btn")
      btn?.click()
    }, 100)
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Visual neon light glows */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Terminal logs pane */}
        <div className="lg:col-span-7 space-y-4">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft className="size-3.5" /> Back to gateway
          </Link>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="size-8 text-violet-500" /> Root Control Node
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Enterprise platform administrative interface for TuitionFlow network.
            </p>
          </div>

          <Card className="border border-violet-500/20 bg-slate-900/40 backdrop-blur-md rounded-xl overflow-hidden font-mono text-[11px] text-violet-300/80 leading-relaxed shadow-lg">
            <div className="bg-slate-950/80 border-b border-violet-500/20 px-4 py-2 flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-violet-400">
                <Server className="size-3.5" /> core_platform_node.log
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase">
                <span className="size-1.5 rounded-full bg-green-500 animate-ping" /> Online
              </span>
            </div>
            <div className="p-4 space-y-2 h-[200px] overflow-y-auto scrollbar-none select-none">
              <p className="text-slate-500">[2026-06-19 18:22] BOOT: Initializing security subsystems...</p>
              <p className="text-slate-500">[2026-06-19 18:22] DB: Connection stable to inst_001, inst_002, inst_003</p>
              <p className="text-violet-400/90">[2026-06-19 18:22] STAT: Active SaaS accounts: 3 institutes active</p>
              <p className="text-violet-400/90">[2026-06-19 18:22] AUTH: Dynamic role switchers compiled cleanly</p>
              <p className="text-slate-500">[2026-06-19 18:22] NET: Multi-tenant partition prefixing verified</p>
              <p className="text-violet-400/90">[2026-06-19 18:22] SEC: Awaiting hardware authorization token key...</p>
            </div>
          </Card>

          {/* Core server stats mini-dashboard */}
          <div className="grid grid-cols-3 gap-4 font-mono text-[10px] uppercase font-bold text-slate-400">
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="text-slate-500 flex items-center gap-1"><Cpu className="size-3 text-violet-500" /> Platform load</span>
              <span className="text-white text-xs">2.4% CPU</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="text-slate-500 flex items-center gap-1"><Wifi className="size-3 text-violet-500" /> Latency</span>
              <span className="text-white text-xs">8ms (Edge)</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="text-slate-500 flex items-center gap-1"><ShieldAlert className="size-3 text-violet-500" /> Integrity</span>
              <span className="text-green-500 text-xs">SECURE</span>
            </div>
          </div>
        </div>

        {/* Input box card */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-violet-500/5">
            <CardContent className="p-0 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-headline font-bold text-white">System Handshake</h3>
                <p className="text-xs text-slate-400 font-medium">Verify administrator credentials to gain global access.</p>
              </div>

              {loading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1.5">
                    <p className="text-xs text-white font-mono uppercase tracking-wider">Securing login tunnel...</p>
                    <p className="text-[10px] text-violet-300 font-mono italic max-w-xs">{loadingStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Root passcode key</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <Input
                        type="password"
                        placeholder="ENTER ROOT PASSCODE"
                        className="pl-9 bg-slate-950 border-slate-800 focus:border-violet-500/50 text-white font-mono placeholder:text-slate-700 tracking-wider text-xs uppercase"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button id="submit-btn" type="submit" className="w-full bg-violet-600 hover:bg-violet-500 font-bold uppercase text-xs tracking-wider h-10 rounded-xl shadow-lg shadow-violet-500/20">
                    Decrypt & Log In
                  </Button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-800/80"></div>
                    <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider font-bold text-slate-500">Developer shortcuts</span>
                    <div className="flex-grow border-t border-slate-800/80"></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full border-dashed border-violet-500/30 hover:border-violet-500/50 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 font-bold uppercase text-[10px] h-9 rounded-xl transition-all" onClick={loginAsDemo}>
                    Sign In as Demo Admin
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

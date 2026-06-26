"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { LayoutHeader } from "@/components/layout-header"
import { Toaster } from "@/components/ui/toaster"
import { Sparkles } from "lucide-react"

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = React.useState(true)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [dbSynced, setDbSynced] = React.useState(false)
  const isLoginPage = pathname?.startsWith("/login")

  React.useEffect(() => {
    if (typeof window === "undefined") return

    async function initializeApp() {
      try {
        if (!dbSynced) {
          const res = await fetch("/api/db/all")
          const json = await res.json()
          if (json.success && json.data) {
            for (const [key, value] of Object.entries(json.data)) {
              localStorage.setItem(key, JSON.stringify(value))
            }
          }
          setDbSynced(true)
        }
      } catch (err) {
        console.error("Failed to load initial state from database", err)
      } finally {
        const loggedIn = localStorage.getItem("tuitionflow_logged_in") === "true"
        setIsLoggedIn(loggedIn)
        const isPublicPath = isLoginPage || pathname === "/" || pathname?.startsWith("/admission-test")
        if (!loggedIn && !isPublicPath) {
          router.push("/login")
        } else if (loggedIn && isLoginPage) {
          router.push("/")
        } else {
          setCheckingAuth(false)
        }
      }
    }

    initializeApp()
  }, [pathname, isLoginPage, router, dbSynced])

  if (checkingAuth && !isLoginPage) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 overflow-hidden font-body select-none">
        {/* Ambient background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f044_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f044_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Glassmorphic pulsing loader container */}
          <div className="relative size-24 flex items-center justify-center bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl shadow-indigo-500/5 animate-pulse duration-1000">
            {/* Spinning gradient ring */}
            <div className="absolute inset-2 border-[3px] border-slate-100 rounded-xl" />
            <div className="absolute inset-2 border-[3px] border-transparent border-t-indigo-600 border-r-indigo-600 rounded-xl animate-spin duration-700" />
            
            {/* Inner glowing logo image */}
            <div className="size-11 bg-white border border-slate-200/50 rounded-xl flex items-center justify-center shadow-md p-1">
              <img src="/logo.png" alt="Coaching OS Logo" className="size-full object-contain animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Coaching OS
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-semibold justify-center">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>ESTABLISHING DB_NODE_CONNECTION...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const showLandingLayout = pathname === "/" && !isLoggedIn
  const isAdmissionTestPage = pathname?.startsWith("/admission-test")

  if (isLoginPage || showLandingLayout || isAdmissionTestPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full print:hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <LayoutHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

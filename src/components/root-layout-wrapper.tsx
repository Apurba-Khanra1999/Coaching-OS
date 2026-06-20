"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { LayoutHeader } from "@/components/layout-header"
import { Toaster } from "@/components/ui/toaster"

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = React.useState(true)
  const isLoginPage = pathname?.startsWith("/login")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("tuitionflow_logged_in")
      if (!loggedIn && !isLoginPage) {
        router.push("/login")
      } else if (loggedIn && isLoginPage) {
        router.push("/")
      } else {
        setCheckingAuth(false)
      }
    }
  }, [pathname, isLoginPage, router])

  if (checkingAuth && !isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">Verifying credentials...</span>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
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

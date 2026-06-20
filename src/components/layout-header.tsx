"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getActiveTenant, getActiveRole, TENANTS, ROLES } from "@/lib/tenant"

export function LayoutHeader() {
  const [activeRole, setActiveRole] = React.useState("owner")
  const [activeTenant, setActiveTenant] = React.useState("inst_001")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setActiveRole(getActiveRole())
    setActiveTenant(getActiveTenant())
    setMounted(true)
  }, [])

  const tenantName = TENANTS.find(t => t.id === activeTenant)?.name || "TuitionFlow Academy"
  const roleName = ROLES.find(r => r.id === activeRole)?.name || "Institute Owner"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm font-semibold text-foreground truncate">
            {!mounted 
              ? "Management Dashboard" 
              : activeRole === "super_admin" 
                ? "Platform Control Center" 
                : `${tenantName}`}
          </span>
          {mounted && (
            <>
              <Separator orientation="vertical" className="mx-1 h-3 opacity-50" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {roleName}
              </span>
            </>
          )}
        </div>
      </div>
      {mounted && (
        <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
          <span className="font-semibold text-foreground">Status:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Syncing
          </span>
        </div>
      )}
    </header>
  )
}

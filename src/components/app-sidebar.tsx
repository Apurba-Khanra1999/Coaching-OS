"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Layers,
  Calendar,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  MessageSquare,
  Settings,
  BookOpen,
  Bell,
  Briefcase,
  Receipt,
  UserCog,
  QrCode,
  Package,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  getActiveTenant,
  setActiveTenant,
  getActiveRole,
  setActiveRole,
  ROLES,
  getTenantDetails,
  getTenants,
  getUserCredentials,
  UserCredential
} from "@/lib/tenant"

export function AppSidebar() {
  const pathname = usePathname()
  const [activeRole, setActiveRoleState] = React.useState<string>("owner")
  const [activeTenant, setActiveTenantState] = React.useState<string>("inst_001")
  const [userName, setUserName] = React.useState<string>("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const role = getActiveRole()
    const tenant = getActiveTenant()
    setActiveRoleState(role)
    setActiveTenantState(tenant)
    
    const email = localStorage.getItem("tuitionflow_logged_in_email") || ""
    if (email) {
      const creds = getUserCredentials()
      const match = creds.find((c: UserCredential) => c.email.toLowerCase() === email.toLowerCase() && c.role === role)
      if (match) {
        setUserName(match.name)
      } else {
        setUserName(
          role === "super_admin" ? "Platform Administrator" :
          role === "owner" ? "John Doe" :
          role === "teacher" ? "Prof. Sarah Smith" :
          role === "student" ? "Sarah Smith" : "Parent Account"
        )
      }
    } else {
      setUserName(
        role === "super_admin" ? "Platform Administrator" :
        role === "owner" ? "John Doe" :
        role === "teacher" ? "Prof. Sarah Smith" :
        role === "student" ? "Sarah Smith" : "Parent Account"
      )
    }
    setMounted(true)
  }, [])

  const tenantsList = getTenants()
  const currentTenant = tenantsList.find(t => t.id === activeTenant) || tenantsList[0]

  const renderNavItems = (items: { name: string; icon: React.ComponentType<any>; href: string }[]) => (
    items.map((item) => (
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href}
          tooltip={item.name}
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href={item.href}>
            <item.icon className="size-4 shrink-0 transition-transform duration-200" />
            <span className="font-medium">{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))
  )

  // Define nav links dynamically based on role
  let groups: { label: string; items: { name: string; icon: React.ComponentType<any>; href: string }[] }[] = []

  if (activeRole === "super_admin") {
    groups = [
      {
        label: "Platform Administration",
        items: [
          { name: "Platform Hub", icon: LayoutDashboard, href: "/" },
          { name: "Institutes", icon: BookOpen, href: "/super-admin/institutes" },
          { name: "Platform Billing", icon: CreditCard, href: "/super-admin/billing" },
          { name: "System Logs", icon: UserCog, href: "/super-admin/logs" },
        ]
      }
    ]
  } else if (activeRole === "owner") {
    groups = [
      {
        label: "Management",
        items: [
          { name: "Dashboard", icon: LayoutDashboard, href: "/" },
          { name: "Students", icon: Users, href: "/students" },
          { name: "Teachers", icon: GraduationCap, href: "/teachers" },
          { name: "Batches", icon: Layers, href: "/batches" },
          { name: "Attendance", icon: CalendarCheck, href: "/attendance" },
          { name: "Schedule", icon: Calendar, href: "/schedule" },
        ]
      },
      {
        label: "Finance",
        items: [
          { name: "Fees", icon: CreditCard, href: "/fees" },
          { name: "Online Payments", icon: QrCode, href: "/online-payments" },
          { name: "HR & Payroll", icon: Briefcase, href: "/hr" },
          { name: "Expenses", icon: Receipt, href: "/expenses" },
        ]
      },
      {
        label: "Other",
        items: [
          { name: "Credentials Manager", icon: UserCog, href: "/credentials" },
          { name: "Asset Management", icon: Package, href: "/assets" },
          { name: "Communications", icon: MessageSquare, href: "/communications" },
          { name: "Notifications", icon: Bell, href: "/notifications" },
          { name: "Settings", icon: Settings, href: "/settings" },
        ]
      }
    ]
  } else if (activeRole === "teacher") {
    groups = [
      {
        label: "Academic (Teacher)",
        items: [
          { name: "Teacher Hub", icon: LayoutDashboard, href: "/" },
          { name: "Assigned Batches", icon: Layers, href: "/batches" },
          { name: "Mark Attendance", icon: CalendarCheck, href: "/attendance" },
          { name: "My Schedule", icon: Calendar, href: "/schedule" },
          { name: "My Payroll & Payslips", icon: Briefcase, href: "/hr" },
        ]
      },
      {
        label: "General",
        items: [
          { name: "Notifications", icon: Bell, href: "/notifications" },
          { name: "Settings", icon: Settings, href: "/settings" },
        ]
      }
    ]
  } else if (activeRole === "student") {
    groups = [
      {
        label: "Student Portal",
        items: [
          { name: "Student Hub", icon: LayoutDashboard, href: "/" },
          { name: "My Batches", icon: Layers, href: "/batches" },
          { name: "My Classes", icon: Calendar, href: "/schedule" },
          { name: "My Fees Ledger", icon: CreditCard, href: "/fees" },
        ]
      },
      {
        label: "General",
        items: [
          { name: "Notifications", icon: Bell, href: "/notifications" },
        ]
      }
    ]
  } else if (activeRole === "parent") {
    groups = [
      {
        label: "Parent Portal",
        items: [
          { name: "Parent Hub", icon: LayoutDashboard, href: "/" },
          { name: "Child Schedule", icon: Calendar, href: "/schedule" },
          { name: "Child Fees & Payments", icon: CreditCard, href: "/fees" },
        ]
      },
      {
        label: "General",
        items: [
          { name: "Notifications", icon: Bell, href: "/notifications" },
          { name: "Settings", icon: Settings, href: "/settings" },
        ]
      }
    ]
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shadow-xl">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 flex flex-col items-start gap-3">
        <div className="flex items-center gap-3 w-full justify-start">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white border border-slate-200/50 p-1 shrink-0 overflow-hidden shadow-xs">
            <img src="/logo.png" alt="Coaching OS Logo" className="size-full object-contain" />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden w-full">
            <span className="font-headline font-bold text-base leading-none tracking-tight">Coaching OS</span>
            <span className="text-[10px] text-sidebar-foreground/60 leading-none">Multi-Tenant Management</span>
          </div>
        </div>

        {/* Tenant Switcher Static Display */}
        {mounted && activeRole !== "super_admin" && (
          <div className="w-full group-data-[collapsible=icon]:hidden px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-semibold text-center truncate">
            🏢 {currentTenant.name}
          </div>
        )}

        {mounted && activeRole === "super_admin" && (
          <div className="w-full group-data-[collapsible=icon]:hidden bg-red-500/10 text-red-500 rounded-xl px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border border-red-500/20">
            Global Admin Access
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, idx) => (
          <React.Fragment key={group.label}>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 font-semibold px-4 py-2 uppercase tracking-wider text-[10px] group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu>
                {renderNavItems(group.items)}
              </SidebarMenu>
            </SidebarGroup>
            {idx < groups.length - 1 && (
              <SidebarSeparator className="mx-4 opacity-10 group-data-[collapsible=icon]:mx-2" />
            )}
          </React.Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:hidden flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase shrink-0">
            {userName ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : (activeRole === "super_admin" ? "SA" : activeRole === "owner" ? "OW" : activeRole === "teacher" ? "TE" : activeRole === "student" ? "ST" : "PA")}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">
              {userName}
            </span>
            <span className="text-[10px] text-sidebar-foreground/60 uppercase font-medium leading-none mt-0.5">
              {ROLES.find(r => r.id === activeRole)?.name}
            </span>
          </div>
        </div>


        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 mt-1 h-8 rounded-lg"
          onClick={() => {
            localStorage.removeItem("tuitionflow_logged_in")
            localStorage.removeItem("tuitionflow_logged_in_email")
            window.location.href = "/login"
          }}
        >
          <LogOut className="size-3.5 mr-2" /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"
import { 
  UserCog, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Key, 
  Mail, 
  User, 
  AlertCircle,
  Users,
  GraduationCap,
  BookOpen,
  ChevronDown,
  Check,
  X
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  getActiveTenant, 
  getActiveRole, 
  getUserCredentials, 
  saveUserCredentials, 
  UserCredential,
  getScopedData,
  mockStudentsGenerator,
  mockTeachersGenerator,
  Student,
  Teacher
} from "@/lib/tenant"

// Searchable name dropdown component
interface NameOption {
  id: string
  name: string
  email: string
  meta: string // batch, subject, or linked student
}

function SearchableNameDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search and select a name...",
  disabled = false 
}: { 
  options: NameOption[]
  value: string
  onChange: (name: string, email: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = options.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    o.meta.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (opt: NameOption) => {
    onChange(opt.name, opt.email)
    setSearch("")
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", "")
    setSearch("")
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <div
        className={cn(
          "flex items-center justify-between h-9 px-3 rounded-xl border border-input bg-white text-xs cursor-pointer transition-colors hover:border-indigo-300",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-400"
        )}
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 50) }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="size-3.5 text-slate-400 shrink-0" />
          {value ? (
            <span className="font-semibold text-slate-800 truncate">{value}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button onClick={handleClear} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
              <X className="size-3 text-slate-400" />
            </button>
          )}
          <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, email, or details..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options */}
          <ScrollArea className="max-h-[200px]">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                <AlertCircle className="size-4 mx-auto mb-1.5 text-slate-300" />
                No users found matching your search.
              </div>
            ) : (
              <div className="p-1">
                {filtered.map(opt => (
                  <button
                    key={opt.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group",
                      value === opt.name ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50"
                    )}
                    onClick={() => handleSelect(opt)}
                  >
                    <div className={cn(
                      "size-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                      value === opt.name ? "bg-indigo-600" : "bg-slate-300 group-hover:bg-slate-400"
                    )}>
                      {opt.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{opt.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{opt.email} · {opt.meta}</p>
                    </div>
                    {value === opt.name && (
                      <Check className="size-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer info */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
              {filtered.length} of {options.length} users
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

type UserType = "student" | "teacher" | "parent"

export default function CredentialsManagerPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")
  const [credentials, setCredentials] = React.useState<UserCredential[]>([])
  
  // Scoped data for name lookups
  const [students, setStudents] = React.useState<Student[]>([])
  const [teachers, setTeachers] = React.useState<Teacher[]>([])

  // Search and view state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [showPasswords, setShowPasswords] = React.useState<Record<string, boolean>>({})

  // Form states for Add
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [addUserType, setAddUserType] = React.useState<UserType>("student")
  const [addName, setAddName] = React.useState("")
  const [addEmail, setAddEmail] = React.useState("")
  const [addPassword, setAddPassword] = React.useState("demopassword")

  // Form states for Edit
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedCred, setSelectedCred] = React.useState<UserCredential | null>(null)
  const [editUserType, setEditUserType] = React.useState<UserType>("student")
  const [editName, setEditName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPassword, setEditPassword] = React.useState("")

  React.useEffect(() => {
    setActiveRole(getActiveRole())
    setActiveTenantId(getActiveTenant())
    setCredentials(getUserCredentials())
    
    // Load students & teachers from scoped data for name lookups
    const loadedStudents = getScopedData<Student[]>("students", mockStudentsGenerator)
    setStudents(loadedStudents)
    const loadedTeachers = getScopedData<Teacher[]>("teachers", mockTeachersGenerator)
    setTeachers(loadedTeachers)
    
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Mounting Credentials Panel...</p>
        </div>
      </div>
    )
  }

  // Security Gate
  if (activeRole !== "owner" && activeRole !== "super_admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 text-center">
          <CardHeader className="space-y-2">
            <div className="mx-auto size-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle className="text-lg font-headline font-bold text-red-950">Access Denied</CardTitle>
            <CardDescription className="text-red-700 text-xs font-medium">
              Only Institute Owners are authorized to view and modify login credentials for their sub-tenant workspace.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Build name options based on user type
  const getNameOptions = (userType: UserType): NameOption[] => {
    switch (userType) {
      case "student":
        return students.map(s => ({
          id: s.id,
          name: s.name,
          email: s.email,
          meta: `${s.batch} · ${s.status}`
        }))
      case "teacher":
        return teachers.map(t => ({
          id: t.id,
          name: t.name,
          email: t.email,
          meta: `${t.subject} · ${t.status}`
        }))
      case "parent":
        // Parents are derived from students' guardianName field
        // Deduplicate by guardianName
        const parentMap = new Map<string, NameOption>()
        students.forEach(s => {
          if (s.guardianName && !parentMap.has(s.guardianName)) {
            parentMap.set(s.guardianName, {
              id: `parent-${s.id}`,
              name: s.guardianName,
              email: `${s.guardianName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "")}@parent.coachingos.edu`,
              meta: `Guardian of ${s.name}`
            })
          }
        })
        return Array.from(parentMap.values())
      default:
        return []
    }
  }

  // Map user type to credential role
  const userTypeToRole = (userType: UserType): string => {
    return userType // They are the same: "student", "teacher", "parent"
  }

  // Map credential role to user type
  const roleToUserType = (role: string): UserType => {
    if (role === "student" || role === "teacher" || role === "parent") return role
    return "student" // fallback
  }

  // Scoped credentials mapping
  const filteredCreds = credentials.filter(c => {
    const matchesTenant = c.tenantId === activeTenantId
    const isManageable = c.role !== "super_admin"
    const matchesTab = activeTab === "all" || c.role === activeTab
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTenant && isManageable && matchesTab && matchesSearch
  })

  const togglePasswordVisibility = (email: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }))
  }

  // --- ADD handlers ---
  const resetAddForm = () => {
    setAddUserType("student")
    setAddName("")
    setAddEmail("")
    setAddPassword("demopassword")
  }

  const handleAddNameSelect = (name: string, email: string) => {
    setAddName(name)
    if (email) setAddEmail(email)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName || !addEmail || !addPassword) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all the login credential details.",
      })
      return
    }

    // Unique email validation
    if (credentials.some(c => c.email.toLowerCase() === addEmail.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Conflict Detected",
        description: "This email address is already assigned to a login account.",
      })
      return
    }

    const newCred: UserCredential = {
      name: addName,
      email: addEmail.trim(),
      password: addPassword,
      role: userTypeToRole(addUserType),
      tenantId: activeTenantId
    }

    const updatedList = [...credentials, newCred]
    setCredentials(updatedList)
    saveUserCredentials(updatedList)

    toast({
      title: "Credential Created ✓",
      description: `Successfully added ${addUserType} login for ${addName}.`,
    })

    resetAddForm()
    setIsAddOpen(false)
  }

  // --- EDIT handlers ---
  const openEditModal = (cred: UserCredential) => {
    setSelectedCred(cred)
    setEditUserType(roleToUserType(cred.role))
    setEditName(cred.name)
    setEditEmail(cred.email)
    setEditPassword(cred.password || "")
    setIsEditOpen(true)
  }

  const handleEditNameSelect = (name: string, email: string) => {
    setEditName(name)
    if (email) setEditEmail(email)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCred) return

    if (!editName || !editEmail || !editPassword) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all details.",
      })
      return
    }

    // Email conflict check
    if (editEmail.toLowerCase() !== selectedCred.email.toLowerCase() && 
        credentials.some(c => c.email.toLowerCase() === editEmail.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Conflict Detected",
        description: "This email address is already assigned to another login account.",
      })
      return
    }

    const updatedList = credentials.map(c => {
      if (c.email.toLowerCase() === selectedCred.email.toLowerCase()) {
        return {
          ...c,
          name: editName,
          email: editEmail.trim(),
          password: editPassword,
          role: selectedCred.role === "owner" ? "owner" : userTypeToRole(editUserType)
        }
      }
      return c
    })

    setCredentials(updatedList)
    saveUserCredentials(updatedList)

    toast({
      title: "Credential Updated ✓",
      description: `Successfully updated login details for ${editName}.`,
    })

    setIsEditOpen(false)
    setSelectedCred(null)
  }

  const handleDelete = (email: string, name: string) => {
    const activeUserEmail = localStorage.getItem("tuitionflow_logged_in_email") || ""
    if (email.toLowerCase() === activeUserEmail.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Action Forbidden",
        description: "You cannot delete your own executive owner login credentials.",
      })
      return
    }

    const updatedList = credentials.filter(c => c.email.toLowerCase() !== email.toLowerCase())
    setCredentials(updatedList)
    saveUserCredentials(updatedList)

    toast({
      title: "Credential Deleted",
      description: `Successfully removed login credentials for ${name}.`,
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Owner</Badge>
      case "teacher":
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Teacher</Badge>
      case "student":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Student</Badge>
      case "parent":
        return <Badge className="bg-pink-50 text-pink-700 border-pink-200">Parent</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case "student": return <GraduationCap className="size-3.5" />
      case "teacher": return <BookOpen className="size-3.5" />
      case "parent": return <Users className="size-3.5" />
    }
  }

  const getUserTypeConfig = (type: UserType) => {
    switch (type) {
      case "student": return { label: "Student", color: "bg-emerald-600", activeBg: "bg-emerald-50 border-emerald-300 text-emerald-700 ring-emerald-600/10", icon: GraduationCap }
      case "teacher": return { label: "Teacher", color: "bg-indigo-600", activeBg: "bg-indigo-50 border-indigo-300 text-indigo-700 ring-indigo-600/10", icon: BookOpen }
      case "parent": return { label: "Parent", color: "bg-pink-600", activeBg: "bg-pink-50 border-pink-300 text-pink-700 ring-pink-600/10", icon: Users }
    }
  }

  // Stats
  const scopedCreds = credentials.filter(c => c.tenantId === activeTenantId && c.role !== "super_admin")
  const stats = {
    total: scopedCreds.length,
    teachers: scopedCreds.filter(c => c.role === "teacher").length,
    students: scopedCreds.filter(c => c.role === "student").length,
    parents: scopedCreds.filter(c => c.role === "parent").length,
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 uppercase tracking-widest rounded-full">
            <UserCog className="size-3.5" /> Workspace Identity Node
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-slate-900 leading-none">
            Credentials Manager
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage, configure, and assign secure login passcodes for teachers, students, and parents.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetAddForm() }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-5 gap-1.5 transition-all hover:-translate-y-0.5 shrink-0">
              <Plus className="size-4" /> Add User Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle className="font-headline font-bold text-lg">Create Login Credential</DialogTitle>
                <DialogDescription className="text-xs">
                  Provision a new authenticated login record. Select user type, pick a name, and configure access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">

                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">User Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "teacher", "parent"] as UserType[]).map(type => {
                      const config = getUserTypeConfig(type)
                      const isActive = addUserType === type
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { setAddUserType(type); setAddName(""); setAddEmail("") }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all duration-200",
                            isActive 
                              ? `${config.activeBg} ring-2 shadow-sm` 
                              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50"
                          )}
                        >
                          <config.icon className="size-5" />
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Name - Searchable Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select {addUserType === "parent" ? "Parent" : addUserType === "teacher" ? "Teacher" : "Student"} Name
                  </Label>
                  <SearchableNameDropdown
                    options={getNameOptions(addUserType)}
                    value={addName}
                    onChange={handleAddNameSelect}
                    placeholder={`Search ${addUserType}s...`}
                  />
                  {addName && (
                    <p className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                      <Check className="size-3" /> Selected: {addName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="add-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="add-email"
                      type="email"
                      placeholder="e.g. sarah.smith@coachingos.edu"
                      className="pl-9 rounded-xl text-xs"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                    />
                  </div>
                  {addEmail && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      Auto-filled from profile. You can modify if needed.
                    </p>
                  )}
                </div>

                {/* Passcode */}
                <div className="space-y-1.5">
                  <Label htmlFor="add-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Passcode</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="add-password"
                      placeholder="Login passcode"
                      className="pl-9 rounded-xl text-xs"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Summary Info Box */}
                {addName && addEmail && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Account Summary</p>
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <p><span className="font-bold">Type:</span> {addUserType.charAt(0).toUpperCase() + addUserType.slice(1)}</p>
                      <p><span className="font-bold">Name:</span> {addName}</p>
                      <p><span className="font-bold">Email:</span> {addEmail}</p>
                      <p><span className="font-bold">Role:</span> {userTypeToRole(addUserType)}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl text-xs h-9 uppercase tracking-wider" onClick={() => { setIsAddOpen(false); resetAddForm() }}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-wider">
                  Save Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Accounts", value: stats.total, icon: UserCog, color: "bg-slate-100 text-slate-600" },
          { label: "Teachers", value: stats.teachers, icon: BookOpen, color: "bg-indigo-50 text-indigo-600" },
          { label: "Students", value: stats.students, icon: GraduationCap, color: "bg-emerald-50 text-emerald-600" },
          { label: "Parents", value: stats.parents, icon: Users, color: "bg-pink-50 text-pink-600" },
        ].map(stat => (
          <Card key={stat.label} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-none rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("size-10 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="size-4.5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-headline text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main workspace section */}
      <div className="grid gap-6">
        <Card className="border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-lg font-bold">Authorized Account Registry</CardTitle>
              <CardDescription className="text-xs font-medium">
                Showing logins mapped to partition branch node: <span className="font-bold text-slate-900">{activeTenantId}</span>
              </CardDescription>
            </div>
            
            {/* Search filter */}
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search name or email..."
                className="pl-9 rounded-xl text-xs bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4 border-b bg-slate-50/50 rounded-t-2xl">
                <TabsList className="bg-slate-100 rounded-lg p-0.5 h-8">
                  <TabsTrigger value="all" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">All accounts</TabsTrigger>
                  <TabsTrigger value="teacher" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">Teachers</TabsTrigger>
                  <TabsTrigger value="student" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">Students</TabsTrigger>
                  <TabsTrigger value="parent" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">Parents</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="p-0 m-0">
                <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-b">
                        <TableHead className="font-bold uppercase tracking-wider py-3.5 pl-6">User Name</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Email Handle</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">Role Type</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5">System Passcode</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider py-3.5 text-right pr-6">Management</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCreds.length > 0 ? (
                        filteredCreds.map((c) => (
                          <TableRow key={c.email} className="hover:bg-slate-50/40 border-b">
                            <td className="py-4 pl-6">
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  "size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold",
                                  c.role === "teacher" ? "bg-indigo-500" : c.role === "student" ? "bg-emerald-500" : c.role === "parent" ? "bg-pink-500" : "bg-amber-500"
                                )}>
                                  {c.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800">{c.name}</span>
                              </div>
                            </td>
                            <td className="font-mono text-slate-550 font-medium">{c.email}</td>
                            <td className="py-4">{getRoleBadge(c.role)}</td>
                            <td className="py-4 font-mono font-bold text-slate-700">
                              <div className="flex items-center gap-2">
                                <span>
                                  {showPasswords[c.email] ? c.password : "••••••••"}
                                </span>
                                <button 
                                  onClick={() => togglePasswordVisibility(c.email)} 
                                  className="text-slate-400 hover:text-slate-650 p-0.5 rounded transition-colors"
                                  title="Toggle Password Visibility"
                                >
                                  {showPasswords[c.email] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-4 text-right pr-6 space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7 p-0 rounded-lg border-slate-200 text-slate-650 hover:bg-slate-50"
                                onClick={() => openEditModal(c)}
                                title="Edit User"
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7 p-0 rounded-lg border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                                onClick={() => handleDelete(c.email, c.name)}
                                title="Delete User"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </td>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                            <div className="flex flex-col items-center gap-2 justify-center">
                              <AlertCircle className="size-5 text-slate-300" />
                              <span>No matching user accounts registered in this registry filter.</span>
                            </div>
                          </td>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          {selectedCred && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className="font-headline font-bold text-lg">Modify Login Account</DialogTitle>
                <DialogDescription className="text-xs">
                  Change active details for the login credential of {selectedCred.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">

                {/* User Type Selection - disabled for owner */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">User Type</Label>
                  {selectedCred.role === "owner" ? (
                    <div className="h-12 px-4 rounded-xl border-2 border-amber-200 bg-amber-50 text-xs font-bold flex items-center gap-2 text-amber-700 select-none">
                      <UserCog className="size-4" />
                      Owner (Immutable)
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {(["student", "teacher", "parent"] as UserType[]).map(type => {
                        const config = getUserTypeConfig(type)
                        const isActive = editUserType === type
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => { setEditUserType(type); setEditName(""); setEditEmail("") }}
                            className={cn(
                              "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all duration-200",
                              isActive 
                                ? `${config.activeBg} ring-2 shadow-sm` 
                                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                          >
                            <config.icon className="size-5" />
                            {config.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Name - Searchable Dropdown or plain input for owner */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</Label>
                  {selectedCred.role === "owner" ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        placeholder="Owner Name"
                        className="pl-9 rounded-xl text-xs"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                  ) : (
                    <SearchableNameDropdown
                      options={getNameOptions(editUserType)}
                      value={editName}
                      onChange={handleEditNameSelect}
                      placeholder={`Search ${editUserType}s...`}
                    />
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="e.g. sarah.smith@coachingos.edu"
                      className="pl-9 rounded-xl text-xs"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Passcode */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Passcode</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="edit-password"
                      placeholder="Passcode"
                      className="pl-9 rounded-xl text-xs"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl text-xs h-9 uppercase tracking-wider" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-wider">
                  Update Account
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

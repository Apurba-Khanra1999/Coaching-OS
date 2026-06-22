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
  AlertCircle 
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
import { getActiveTenant, getActiveRole, getUserCredentials, saveUserCredentials, UserCredential } from "@/lib/tenant"

export default function CredentialsManagerPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")
  const [credentials, setCredentials] = React.useState<UserCredential[]>([])
  
  // Search and view state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [showPasswords, setShowPasswords] = React.useState<Record<string, boolean>>({})

  // Form states for Add / Edit
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  
  const [addName, setAddName] = React.useState("")
  const [addEmail, setAddEmail] = React.useState("")
  const [addPassword, setAddPassword] = React.useState("demopassword")
  const [addRole, setAddRole] = React.useState("teacher")

  const [selectedCred, setSelectedCred] = React.useState<UserCredential | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPassword, setEditPassword] = React.useState("")
  const [editRole, setEditRole] = React.useState("")

  React.useEffect(() => {
    setActiveRole(getActiveRole())
    setActiveTenantId(getActiveTenant())
    setCredentials(getUserCredentials())
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

  // Scoped credentials mapping
  const filteredCreds = credentials.filter(c => {
    // Isolated tenant scoping: only show credentials matching the current active tenant
    const matchesTenant = c.tenantId === activeTenantId
    // Filter out super_admin role entirely from management view
    const isManageable = c.role !== "super_admin"
    
    // Tab filter
    const matchesTab = activeTab === "all" || c.role === activeTab

    // Search filter
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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName || !addEmail || !addPassword || !addRole) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all the login credential details.",
      })
      return
    }

    // Unique email validation across all credentials in the system
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
      role: addRole,
      tenantId: activeTenantId
    }

    const updatedList = [...credentials, newCred]
    setCredentials(updatedList)
    saveUserCredentials(updatedList)

    toast({
      title: "Credential Created",
      description: `Successfully added ${addRole} login for ${addName}.`,
    })

    // Reset form
    setAddName("")
    setAddEmail("")
    setAddPassword("demopassword")
    setAddRole("teacher")
    setIsAddOpen(false)
  }

  const openEditModal = (cred: UserCredential) => {
    setSelectedCred(cred)
    setEditName(cred.name)
    setEditEmail(cred.email)
    setEditPassword(cred.password || "")
    setEditRole(cred.role)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCred) return

    if (!editName || !editEmail || !editPassword || !editRole) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all details.",
      })
      return
    }

    // Email conflict checks (excluding current email)
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
          role: editRole
        }
      }
      return c
    })

    setCredentials(updatedList)
    saveUserCredentials(updatedList)

    toast({
      title: "Credential Updated",
      description: `Successfully updated login details for ${editName}.`,
    })

    setIsEditOpen(false)
    setSelectedCred(null)
  }

  const handleDelete = (email: string, name: string) => {
    // Avoid self deletion if owner's own email matches
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

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
                  Provision a new authenticated login record. This will immediately enable portal access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="add-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="add-name"
                      placeholder="e.g. Sarah Smith"
                      className="pl-9 rounded-xl text-xs"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                    />
                  </div>
                </div>

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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-role" className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Selection</Label>
                    <Select value={addRole} onValueChange={setAddRole}>
                      <SelectTrigger id="add-role" className="rounded-xl text-xs bg-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="teacher" className="text-xs">Teacher</SelectItem>
                        <SelectItem value="student" className="text-xs">Student</SelectItem>
                        <SelectItem value="parent" className="text-xs">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Passcode</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="add-password"
                        placeholder="Passcode"
                        className="pl-9 rounded-xl text-xs"
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl text-xs h-9 uppercase tracking-wider" onClick={() => setIsAddOpen(false)}>
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
                            <td className="font-semibold text-slate-800 py-4 pl-6">{c.name}</td>
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
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="edit-name"
                      placeholder="e.g. Sarah Smith"
                      className="pl-9 rounded-xl text-xs"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-role" className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Selection</Label>
                    {/* Owner credentials role cannot be modified via this screen */}
                    {selectedCred.role === "owner" ? (
                      <div className="h-9 px-3 rounded-xl border border-input text-xs font-semibold bg-slate-50 flex items-center select-none text-slate-500">
                        Owner (Immutable)
                      </div>
                    ) : (
                      <Select value={editRole} onValueChange={setEditRole}>
                        <SelectTrigger id="edit-role" className="rounded-xl text-xs bg-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="teacher" className="text-xs">Teacher</SelectItem>
                          <SelectItem value="student" className="text-xs">Student</SelectItem>
                          <SelectItem value="parent" className="text-xs">Parent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

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

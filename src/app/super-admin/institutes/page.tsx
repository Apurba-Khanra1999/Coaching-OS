"use client"

import * as React from "react"
import {
  Building2, Plus, Search, Trash2, ShieldCheck, Mail, User, Lock, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getTenants, saveTenants, getUserCredentials, saveUserCredentials, Tenant, UserCredential } from "@/lib/tenant"

export default function InstitutesManagementPage() {
  const { toast } = useToast()
  const [institutes, setInstitutes] = React.useState<Tenant[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null)
  const [mounted, setMounted] = React.useState(false)

  // Form states for Add Institute
  const [newId, setNewId] = React.useState("")
  const [newName, setNewName] = React.useState("")
  const [newTagline, setNewTagline] = React.useState("")
  const [newLogoText, setNewLogoText] = React.useState("")
  const [ownerName, setOwnerName] = React.useState("")
  const [ownerEmail, setOwnerEmail] = React.useState("")
  const [ownerPassword, setOwnerPassword] = React.useState("")

  // Form states for Config/Edit
  const [editName, setEditName] = React.useState("")
  const [editTagline, setEditTagline] = React.useState("")
  const [editLogoText, setEditLogoText] = React.useState("")
  const [editOwnerName, setEditOwnerName] = React.useState("")
  const [editOwnerEmail, setEditOwnerEmail] = React.useState("")
  const [editOwnerPassword, setEditOwnerPassword] = React.useState("")

  React.useEffect(() => {
    setInstitutes(getTenants())
    setMounted(true)
  }, [])

  const handleAdd = () => {
    if (!newId || !newName || !ownerName || !ownerEmail || !ownerPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "All fields including Owner name, email, and password are required."
      })
      return
    }

    if (institutes.some(t => t.id.toLowerCase() === newId.trim().toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Conflict",
        description: "This Tenant ID is already registered."
      })
      return
    }

    const creds = getUserCredentials()
    if (creds.some(c => c.email.toLowerCase() === ownerEmail.trim().toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Email Conflict",
        description: "This email address is already in use."
      })
      return
    }

    const newTenant: Tenant = {
      id: newId.trim(),
      name: newName.trim(),
      tagline: newTagline.trim() || "Coaching Center",
      logoText: newLogoText.trim() || newName.trim().split(" ")[0]
    }

    const updatedTenants = [...institutes, newTenant]
    saveTenants(updatedTenants)
    setInstitutes(updatedTenants)

    const newCred: UserCredential = {
      email: ownerEmail.trim(),
      role: "owner",
      tenantId: newId.trim(),
      name: ownerName.trim(),
      password: ownerPassword
    }
    saveUserCredentials([...creds, newCred])

    toast({
      title: "Institute Registered ✓",
      description: `${newName} and owner credentials created successfully.`
    })

    setIsAddOpen(false)
    setNewId("")
    setNewName("")
    setNewTagline("")
    setNewLogoText("")
    setOwnerName("")
    setOwnerEmail("")
    setOwnerPassword("")
  }

  const openConfig = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setEditName(tenant.name)
    setEditTagline(tenant.tagline)
    setEditLogoText(tenant.logoText)

    const creds = getUserCredentials()
    const match = creds.find(c => c.tenantId === tenant.id && c.role === "owner")
    if (match) {
      setEditOwnerName(match.name)
      setEditOwnerEmail(match.email)
      setEditOwnerPassword(match.password || "")
    } else {
      setEditOwnerName("")
      setEditOwnerEmail("")
      setEditOwnerPassword("")
    }
    setIsConfigOpen(true)
  }

  const handleSaveConfig = () => {
    if (!selectedTenant) return

    if (!editName || !editOwnerName || !editOwnerEmail || !editOwnerPassword) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Institute Name, Owner Name, Owner Email and Password are required."
      })
      return
    }

    const creds = getUserCredentials()
    const currentOwner = creds.find(c => c.tenantId === selectedTenant.id && c.role === "owner")
    const hasConflict = creds.some(c => 
      c.email.toLowerCase() === editOwnerEmail.trim().toLowerCase() &&
      !(currentOwner && currentOwner.email.toLowerCase() === editOwnerEmail.trim().toLowerCase())
    )

    if (hasConflict) {
      toast({
        variant: "destructive",
        title: "Email Conflict",
        description: "This email address is already registered to another user."
      })
      return
    }

    const updatedTenants = institutes.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          name: editName.trim(),
          tagline: editTagline.trim() || "Coaching Center",
          logoText: editLogoText.trim() || editName.trim().split(" ")[0]
        }
      }
      return t
    })
    saveTenants(updatedTenants)
    setInstitutes(updatedTenants)

    let updatedCreds: UserCredential[]
    if (currentOwner) {
      updatedCreds = creds.map(c => {
        if (c.tenantId === selectedTenant.id && c.role === "owner") {
          return {
            ...c,
            name: editOwnerName.trim(),
            email: editOwnerEmail.trim(),
            password: editOwnerPassword
          }
        }
        return c
      })
    } else {
      updatedCreds = [
        ...creds,
        {
          email: editOwnerEmail.trim(),
          role: "owner",
          tenantId: selectedTenant.id,
          name: editOwnerName.trim(),
          password: editOwnerPassword
        }
      ]
    }
    saveUserCredentials(updatedCreds)

    toast({
      title: "Workspace Saved ✓",
      description: "Institute configuration and owner credentials updated."
    })
    setIsConfigOpen(false)
  }

  const handleDelete = (id: string) => {
    const updatedTenants = institutes.filter(t => t.id !== id)
    saveTenants(updatedTenants)
    setInstitutes(updatedTenants)

    const creds = getUserCredentials()
    const updatedCreds = creds.filter(c => c.tenantId !== id)
    saveUserCredentials(updatedCreds)

    toast({
      variant: "destructive",
      title: "Tenant De-registered",
      description: `Tenant ${id} and all its workspace configurations were deleted.`
    })
  }

  if (!mounted) return null

  const filtered = institutes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Super Admin Institutes Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
              🏢 platform sub-tenant workspace nodes
            </span>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">
              Registered Institutes
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Register new academies, spawn isolated tenant schemas, configure administrator credentials, or terminate licensing setups.
            </p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white shrink-0 self-start md:self-center">
                <Plus className="size-4" /> Add Institute
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="font-headline text-lg font-bold">Register New Institute</DialogTitle>
                <DialogDescription>Create a clean, isolated database and portal instance for a new tenant.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 px-6 overflow-y-auto flex-1 max-h-[55vh] pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Tenant ID</label>
                    <Input
                      placeholder="e.g. inst_004"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Short Logo Brand</label>
                    <Input
                      placeholder="e.g. Newton"
                      value={newLogoText}
                      onChange={(e) => setNewLogoText(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Institute Name</label>
                  <Input
                    placeholder="e.g. Newton Academy of Physics"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Slogan / Tagline</label>
                  <Input
                    placeholder="e.g. Elite Science Coaching"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-2 text-[9px] uppercase tracking-wider font-bold text-red-500">Executive Owner Account</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Owner Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Prof. Isaac Newton"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="rounded-xl h-9 pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Owner Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="e.g. newton@academy.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="rounded-xl h-9 pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Owner Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="rounded-xl h-9 pl-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 pt-2 border-t border-border/60 bg-muted/10">
                <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAdd} className="rounded-xl bg-red-600 hover:bg-red-500 text-white">Create Tenant</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Config Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-headline text-lg font-bold">Configure Institute Details</DialogTitle>
            <DialogDescription>Modify workspace registration and owner access credentials.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 px-6 overflow-y-auto flex-1 max-h-[55vh] pr-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Institute Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Slogan / Tagline</label>
              <Input
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Short Logo Brand</label>
              <Input
                value={editLogoText}
                onChange={(e) => setEditLogoText(e.target.value)}
                className="rounded-xl h-9 text-xs"
              />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-2 text-[9px] uppercase tracking-wider font-bold text-red-500">Owner Access Credentials</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Owner Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="rounded-xl h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Owner Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  value={editOwnerEmail}
                  onChange={(e) => setEditOwnerEmail(e.target.value)}
                  className="rounded-xl h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Owner Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={editOwnerPassword}
                  onChange={(e) => setEditOwnerPassword(e.target.value)}
                  className="rounded-xl h-9 pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-border/60 bg-muted/10">
            <Button variant="outline" onClick={() => setIsConfigOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveConfig} className="rounded-xl bg-red-600 hover:bg-red-500 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter and Search */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl text-xs"
            />
          </div>
          <Badge variant="secondary" className="text-[10px] font-bold text-red-600 bg-red-50 border-red-100">
            {filtered.length} Registered
          </Badge>
        </CardContent>
      </Card>

      {/* Institutes Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">Tenant ID</th>
                  <th className="p-4 font-bold">Institute Profile</th>
                  <th className="p-4 font-bold">Executive Owner</th>
                  <th className="p-4 font-bold">Billing Status</th>
                  <th className="p-4 font-bold">Pricing Tier</th>
                  <th className="p-4 font-bold text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map(inst => {
                  const matchOwner = getUserCredentials().find(c => c.tenantId === inst.id && c.role === "owner")
                  return (
                    <tr key={inst.id} className="hover:bg-muted/30 transition-all">
                      <td className="p-4 font-bold text-red-600">{inst.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold shrink-0">
                            {inst.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{inst.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{inst.tagline}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {matchOwner ? (
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-1">
                              <ShieldCheck className="size-3.5 text-red-500" /> {matchOwner.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{matchOwner.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No owner credentials</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active Paid</Badge>
                      </td>
                      <td className="p-4 font-bold text-foreground">₹15,000 / month</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openConfig(inst)}
                            className="h-7 text-[10px] rounded-lg border-border hover:bg-muted flex items-center gap-1"
                          >
                            <Settings className="size-3" /> Config
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(inst.id)}
                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No registered coaching institutes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

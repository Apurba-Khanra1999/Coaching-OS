"use client"

import * as React from "react"
import { 
  Building2, 
  User, 
  Shield, 
  Bell, 
  Save,
  Upload,
  BookOpen,
  Lock,
  GraduationCap,
  Users,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CalendarCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { 
  getActiveRole, 
  getActiveTenant, 
  getScopedData, 
  setScopedData, 
  getTenants, 
  saveTenants, 
  getUserCredentials, 
  saveUserCredentials, 
  Teacher, 
  Student, 
  UserCredential,
  mockTeachersGenerator,
  mockStudentsGenerator 
} from "@/lib/tenant"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeRole, setActiveRole] = React.useState<string>("owner")
  const [mounted, setMounted] = React.useState(false)

  // 1. Owner Settings Form State
  const [ownerInstName, setOwnerInstName] = React.useState("")
  const [ownerInstTagline, setOwnerInstTagline] = React.useState("")
  const [ownerInstLogoText, setOwnerInstLogoText] = React.useState("")

  // 2. Teacher Settings Form State
  const [teacherName, setTeacherName] = React.useState("")
  const [teacherEmail, setTeacherEmail] = React.useState("")
  const [teacherPhone, setTeacherPhone] = React.useState("")
  const [teacherQualification, setTeacherQualification] = React.useState("")
  const [teacherSubject, setTeacherSubject] = React.useState("")
  const [teacherPassword, setTeacherPassword] = React.useState("")

  // 3. Parent Settings Form State
  const [parentName, setParentName] = React.useState("")
  const [parentEmail, setParentEmail] = React.useState("")
  const [parentPassword, setParentPassword] = React.useState("")
  const [parentPhone, setParentPhone] = React.useState("")

  // Child Info (Sarah Smith)
  const [childNameField, setChildNameField] = React.useState("")
  const [childEmail, setChildEmail] = React.useState("")
  const [childPhone, setChildPhone] = React.useState("")
  const [childGender, setChildGender] = React.useState("Female")
  const [childDob, setChildDob] = React.useState("")
  const [childSchoolName, setChildSchoolName] = React.useState("")
  const [childClass, setChildClass] = React.useState("")
  const [childAddress, setChildAddress] = React.useState("")

  React.useEffect(() => {
    const role = getActiveRole()
    setActiveRole(role)
    setMounted(true)

    const email = localStorage.getItem("tuitionflow_logged_in_email") || ""

    if (role === "owner") {
      const tenantList = getTenants()
      const activeTenantId = getActiveTenant()
      const tenant = tenantList.find(t => t.id === activeTenantId) || tenantList[0]
      if (tenant) {
        setOwnerInstName(tenant.name)
        setOwnerInstTagline(tenant.tagline)
        setOwnerInstLogoText(tenant.logoText)
      }
    } else if (role === "teacher") {
      const teachersList = getScopedData<Teacher[]>("teachers", mockTeachersGenerator)
      let teacher = teachersList.find(t => t.email.toLowerCase() === email.toLowerCase())
      const creds = getUserCredentials()
      const cred = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.role === "teacher")

      if (!teacher && cred) {
        // Dynamically map first teacher record to this credential to prefill data cleanly
        teacher = {
          ...teachersList[0],
          name: cred.name,
          email: cred.email
        }
        const updatedList = [teacher, ...teachersList.slice(1)]
        setScopedData("teachers", updatedList)
      }

      if (teacher) {
        setTeacherName(teacher.name)
        setTeacherEmail(teacher.email)
        setTeacherPhone(teacher.phone || "")
        setTeacherQualification(teacher.qualification || "")
        setTeacherSubject(teacher.subject || "")
      }
      if (cred) {
        setTeacherPassword(cred.password || "")
      }
    } else if (role === "parent") {
      const creds = getUserCredentials()
      const cred = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.role === "parent")
      if (cred) {
        setParentName(cred.name)
        setParentEmail(cred.email)
        setParentPassword(cred.password || "")
      }

      // Load child details (student ID "1")
      const studentsList = getScopedData<Student[]>("students", mockStudentsGenerator)
      let child = studentsList.find(s => s.id === "1")
      
      if (child && cred) {
        // Automatically sync guardian details with parent credential
        if (child.guardianName !== cred.name) {
          child = {
            ...child,
            guardianName: cred.name
          }
          const updatedStudents = studentsList.map(s => s.id === "1" ? child! : s)
          setScopedData("students", updatedStudents)
        }
      }

      if (child) {
        setChildNameField(child.name)
        setChildEmail(child.email)
        setChildPhone(child.phone)
        setChildGender(child.gender)
        setChildDob(child.dob)
        setChildSchoolName(child.schoolName)
        setChildClass(child.studentClass)
        setChildAddress(child.address)
        setParentPhone(child.guardianPhone || "")
      }
    }
  }, [])

  const handleSaveOwner = () => {
    if (!ownerInstName) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Institute Name is required."
      })
      return
    }

    const activeTenantId = getActiveTenant()
    const tenantsList = getTenants()
    const updatedTenants = tenantsList.map(t => {
      if (t.id === activeTenantId) {
        return {
          ...t,
          name: ownerInstName,
          tagline: ownerInstTagline,
          logoText: ownerInstLogoText || ownerInstName.split(" ")[0]
        }
      }
      return t
    })
    saveTenants(updatedTenants)

    toast({
      title: "Organization Saved ✓",
      description: "Institute settings updated successfully."
    })
  }

  const handleSaveTeacher = () => {
    if (!teacherName || !teacherEmail) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Full Name and Email address are required."
      })
      return
    }

    const currentEmail = localStorage.getItem("tuitionflow_logged_in_email") || ""
    const creds = getUserCredentials()
    const emailConflict = creds.some(c => c.email.toLowerCase() === teacherEmail.toLowerCase() && c.email.toLowerCase() !== currentEmail.toLowerCase())
    if (emailConflict) {
      toast({
        variant: "destructive",
        title: "Email Conflict",
        description: "This email address is already registered to another user."
      })
      return
    }

    // Update teacher record in list
    const teachersList = getScopedData<Teacher[]>("teachers", mockTeachersGenerator)
    const updatedTeachers = teachersList.map(t => {
      if (t.email.toLowerCase() === currentEmail.toLowerCase()) {
        return {
          ...t,
          name: teacherName,
          email: teacherEmail,
          phone: teacherPhone,
          qualification: teacherQualification,
          subject: teacherSubject
        }
      }
      return t
    })
    setScopedData("teachers", updatedTeachers)

    // Update login credentials
    const updatedCreds = creds.map(c => {
      if (c.email.toLowerCase() === currentEmail.toLowerCase() && c.role === "teacher") {
        return {
          ...c,
          name: teacherName,
          email: teacherEmail,
          password: teacherPassword || c.password
        }
      }
      return c
    })
    saveUserCredentials(updatedCreds)

    localStorage.setItem("tuitionflow_logged_in_email", teacherEmail)

    toast({
      title: "Profile Updated ✓",
      description: "Your teacher record and credentials have been updated successfully."
    })
  }

  const handleSaveParent = () => {
    if (!parentName || !parentEmail) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Parent Name and Email are required."
      })
      return
    }

    if (!childNameField) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Child Full Name is required."
      })
      return
    }

    const currentEmail = localStorage.getItem("tuitionflow_logged_in_email") || ""
    const creds = getUserCredentials()
    const emailConflict = creds.some(c => c.email.toLowerCase() === parentEmail.toLowerCase() && c.email.toLowerCase() !== currentEmail.toLowerCase())
    if (emailConflict) {
      toast({
        variant: "destructive",
        title: "Email Conflict",
        description: "This email address is already in use."
      })
      return
    }

    // Update student child record
    const studentsList = getScopedData<Student[]>("students", mockStudentsGenerator)
    const updatedStudents = studentsList.map(s => {
      if (s.id === "1") {
        return {
          ...s,
          name: childNameField,
          email: childEmail,
          phone: childPhone,
          gender: childGender as "Male" | "Female" | "Other",
          dob: childDob,
          schoolName: childSchoolName,
          studentClass: childClass,
          address: childAddress,
          guardianName: parentName,
          guardianPhone: parentPhone
        }
      }
      return s
    })
    setScopedData("students", updatedStudents)

    // Update parent credentials
    const updatedCreds = creds.map(c => {
      if (c.email.toLowerCase() === currentEmail.toLowerCase() && c.role === "parent") {
        return {
          ...c,
          name: parentName,
          email: parentEmail,
          password: parentPassword || c.password
        }
      }
      return c
    })
    saveUserCredentials(updatedCreds)

    localStorage.setItem("tuitionflow_logged_in_email", parentEmail)

    toast({
      title: "Settings Saved ✓",
      description: "Parent credentials and child academic profile updated successfully."
    })
  }

  if (!mounted) return null

  // -------------------------------------------------------------
  // RENDERING LAYOUT DEPENDING ON LOGGED ROLE
  // -------------------------------------------------------------

  if (activeRole === "teacher") {
    return (
      <div className="space-y-8 animate-fade-in pb-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Teacher Profile</h1>
            <p className="text-muted-foreground">Manage your qualification listings and authentication credentials.</p>
          </div>
          <Button onClick={handleSaveTeacher} className="bg-primary hover:bg-primary/90 min-w-[120px] rounded-xl shadow-md">
            <Save className="mr-2 size-4" /> Save Profile
          </Button>
        </header>

        <Tabs defaultValue="profile" className="grid lg:grid-cols-5 gap-8">
          <TabsList className="flex flex-col h-fit lg:col-span-1 bg-transparent p-0 gap-1 space-y-1">
            <TabsTrigger value="profile" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
              <User className="mr-3 size-4" /> My Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
              <Lock className="mr-3 size-4" /> Password & Key
            </TabsTrigger>
          </TabsList>

          <div className="lg:col-span-4">
            <TabsContent value="profile" className="m-0 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Faculty Information</CardTitle>
                  <CardDescription>Public academic details visible to owners and students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-border/50">
                    <Avatar className="size-20 bg-indigo-500/10 border-2 border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                      <AvatarFallback className="text-lg font-bold">
                        {teacherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">{teacherName}</h4>
                      <p className="text-xs text-muted-foreground">Instructor subject: {teacherSubject}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input type="email" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={teacherPhone} onChange={(e) => setTeacherPhone(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Subject Spec</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Qualification</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 size-4 text-slate-400" />
                        <Textarea value={teacherQualification} onChange={(e) => setTeacherQualification(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Security Settings</CardTitle>
                  <CardDescription>Configure authentication keys and password resets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-w-md">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portal Login Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input type="password" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} className="pl-9 rounded-xl text-xs" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  if (activeRole === "parent") {
    return (
      <div className="space-y-8 animate-fade-in pb-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Guardian & Child Desk</h1>
            <p className="text-muted-foreground">Configure parent access and student profile information.</p>
          </div>
          <Button onClick={handleSaveParent} className="bg-primary hover:bg-primary/90 min-w-[120px] rounded-xl shadow-md">
            <Save className="mr-2 size-4" /> Save Settings
          </Button>
        </header>

        <Tabs defaultValue="guardian" className="grid lg:grid-cols-5 gap-8">
          <TabsList className="flex flex-col h-fit lg:col-span-1 bg-transparent p-0 gap-1 space-y-1">
            <TabsTrigger value="guardian" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
              <User className="mr-3 size-4" /> Guardian Profile
            </TabsTrigger>
            <TabsTrigger value="child" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
              <Users className="mr-3 size-4" /> Child Profile Card
            </TabsTrigger>
          </TabsList>

          <div className="lg:col-span-4">
            <TabsContent value="guardian" className="m-0 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Guardian Credentials</CardTitle>
                  <CardDescription>Authentication details for the Parental portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Guardian Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={parentName} onChange={(e) => setParentName(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parental Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parental Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Login Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input type="password" value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="child" className="m-0 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Enrolled Child Details</CardTitle>
                  <CardDescription>Academic registration details for your linked child.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Child Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={childNameField} onChange={(e) => setChildNameField(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Child Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input type="email" value={childEmail} onChange={(e) => setChildEmail(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Child Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={childPhone} onChange={(e) => setChildPhone(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class / Grade</label>
                      <div className="relative">
                        <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={childClass} onChange={(e) => setChildClass(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={childSchoolName} onChange={(e) => setChildSchoolName(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                        <select 
                          value={childGender} 
                          onChange={(e) => setChildGender(e.target.value)} 
                          className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">DOB</label>
                        <Input type="date" value={childDob} onChange={(e) => setChildDob(e.target.value)} className="rounded-xl h-9 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residential Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 size-4 text-slate-400" />
                        <Textarea value={childAddress} onChange={(e) => setChildAddress(e.target.value)} className="pl-9 rounded-xl text-xs" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  // -------------------------------------------------------------
  // DEFAULT OWNER RENDER (ORIGINAL RETAINED & SYNCED)
  // -------------------------------------------------------------

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure institute profile, academic sessions, and global preferences.</p>
        </div>
        <Button onClick={handleSaveOwner} className="bg-primary hover:bg-primary/90 min-w-[120px] rounded-xl shadow-md">
          <Save className="mr-2 size-4" /> Save All
        </Button>
      </header>

      <Tabs defaultValue="institute" className="grid lg:grid-cols-5 gap-8">
        <TabsList className="flex flex-col h-fit lg:col-span-1 bg-transparent p-0 gap-1 space-y-1">
          <TabsTrigger value="institute" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
            <Building2 className="mr-3 size-4" /> Institute
          </TabsTrigger>
          <TabsTrigger value="academic" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
            <BookOpen className="mr-3 size-4" /> Academic
          </TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
            <Bell className="mr-3 size-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl">
            <Shield className="mr-3 size-4" /> Security
          </TabsTrigger>
        </TabsList>

        <div className="lg:col-span-4">
          <TabsContent value="institute" className="m-0 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline">Organization Profile</CardTitle>
                <CardDescription>Main public information for receipts and communications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
                  <Avatar className="size-24 border-2 border-primary/20">
                    <AvatarImage src="https://picsum.photos/seed/tuitionflow/100/100" />
                    <AvatarFallback>TF</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Upload className="mr-2 size-4" /> Change Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">Recommended size: 512x512px. JPG, PNG or SVG.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institute Name</label>
                    <Input value={ownerInstName} onChange={(e) => setOwnerInstName(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slogan / Tagline</label>
                    <Input value={ownerInstTagline} onChange={(e) => setOwnerInstTagline(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Logo Brand</label>
                    <Input value={ownerInstLogoText} onChange={(e) => setOwnerInstLogoText(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline">System Preferences</CardTitle>
                <CardDescription>Regional and localization settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">Currency Symbol</p>
                    <p className="text-xs text-muted-foreground">Used for all financial ledgers.</p>
                  </div>
                  <Input className="w-20 text-center font-bold rounded-xl" defaultValue="₹" />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border/50">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">Multi-Batch Assignment</p>
                    <p className="text-xs text-muted-foreground">Allow students to enroll in multiple batches.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="m-0 space-y-6">
             <Card className="border-none shadow-sm">
               <CardHeader>
                 <CardTitle className="font-headline">Academic Sessions</CardTitle>
                 <CardDescription>Manage active terms and holiday calendars.</CardDescription>
               </CardHeader>
               <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl m-4">
                 <p className="text-muted-foreground text-sm">Session Management UI Coming Soon</p>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="notifications" className="m-0">
             <Card className="border-none shadow-sm">
               <CardHeader>
                 <CardTitle className="font-headline">Alert Settings</CardTitle>
                 <CardDescription>Configure automatic system notifications.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-Attendance SMS for Absentees</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low Attendance Warning (Below 75%)</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Automatic Receipt Email</span>
                    <Switch defaultChecked />
                  </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="security" className="m-0">
             <Card className="border-none shadow-sm">
               <CardHeader>
                 <CardTitle className="font-headline">Security Preferences</CardTitle>
                 <CardDescription>Control two-factor settings and data backups.</CardDescription>
               </CardHeader>
               <CardContent className="h-[150px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl m-4">
                 <p className="text-muted-foreground text-sm">Security Policy Settings Coming Soon</p>
               </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

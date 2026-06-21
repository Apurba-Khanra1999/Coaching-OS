// Tenant and User Roles configuration and data utility for Multi-Tenant Coaching OS

export interface Tenant {
  id: string
  name: string
  tagline: string
  logoText: string
}

export interface Role {
  id: string
  name: string
  description: string
}

export const TENANTS: Tenant[] = [
  { id: "inst_001", name: "Coaching OS Academy", tagline: "Educator Portal", logoText: "Coaching OS" },
  { id: "inst_002", name: "Apex Science Institute", tagline: "Science & Tech Portal", logoText: "Apex Academy" },
  { id: "inst_003", name: "Horizon Prep Academy", tagline: "College Prep Portal", logoText: "Horizon Prep" },
]

export const ROLES: Role[] = [
  { id: "super_admin", name: "Super Admin", description: "Platform-wide Administrator" },
  { id: "owner", name: "Institute Owner", description: "Full Institute Manager" },
  { id: "teacher", name: "Teacher", description: "Assigned Classes & Attendance" },
  { id: "student", name: "Student", description: "Personal schedule & fees tracker" },
  { id: "parent", name: "Parent", description: "Linked child progress & payments" },
]

export interface UserCredential {
  email: string
  role: string
  tenantId: string
  name: string
  password?: string
}

export const INITIAL_USER_CREDENTIALS: UserCredential[] = [
  { email: "admin@coachingos.com", role: "super_admin", tenantId: "inst_001", name: "Platform Admin", password: "demopassword" },
  
  // Owner logins
  { email: "owner@coachingos.edu", role: "owner", tenantId: "inst_001", name: "John Doe (Coaching OS)", password: "demopassword" },
  { email: "owner@apexscience.edu", role: "owner", tenantId: "inst_002", name: "Dr. Arthur Apex", password: "demopassword" },
  { email: "owner@horizonprep.edu", role: "owner", tenantId: "inst_003", name: "Principal Horizon", password: "demopassword" },
  
  // Teacher logins
  { email: "sarah.smith@coachingos.edu", role: "teacher", tenantId: "inst_001", name: "Prof. Sarah Smith", password: "demopassword" },
  { email: "priya.sharma@apexscience.edu", role: "teacher", tenantId: "inst_002", name: "Dr. Priya Sharma", password: "demopassword" },
  { email: "anita.desai@horizonprep.edu", role: "teacher", tenantId: "inst_003", name: "Anita Desai", password: "demopassword" },
  
  // Student logins
  { email: "sarah.smith@example.com", role: "student", tenantId: "inst_001", name: "Sarah Smith", password: "demopassword" },
  { email: "sarah.apex@apex.edu", role: "student", tenantId: "inst_002", name: "Sarah Apex", password: "demopassword" },
  { email: "sarah.horizon@horizon.edu", role: "student", tenantId: "inst_003", name: "Sarah Horizon", password: "demopassword" },
  
  // Parent logins
  { email: "parent@example.com", role: "parent", tenantId: "inst_001", name: "Parent Account", password: "demopassword" },
  { email: "parent@apex.edu", role: "parent", tenantId: "inst_002", name: "Parent Account (Apex)", password: "demopassword" },
  { email: "parent@horizon.edu", role: "parent", tenantId: "inst_003", name: "Parent Account (Horizon)", password: "demopassword" }
]

function syncToDatabase(key: string, value: any): void {
  if (typeof window === "undefined") return
  fetch("/api/db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, value }),
  }).catch((err) => {
    console.error(`Failed to sync key ${key} to database:`, err)
  })
}

export function getTenants(): Tenant[] {
  if (typeof window === "undefined") return TENANTS
  const saved = localStorage.getItem("tuitionflow_tenants")
  if (saved) {
    try {
      return JSON.parse(saved) as Tenant[]
    } catch (e) {
      console.error("Failed to parse tenants", e)
    }
  }
  localStorage.setItem("tuitionflow_tenants", JSON.stringify(TENANTS))
  syncToDatabase("tuitionflow_tenants", TENANTS)
  return TENANTS
}

export function saveTenants(tenantsList: Tenant[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tuitionflow_tenants", JSON.stringify(tenantsList))
  syncToDatabase("tuitionflow_tenants", tenantsList)
}

export function getUserCredentials(): UserCredential[] {
  if (typeof window === "undefined") return INITIAL_USER_CREDENTIALS
  const saved = localStorage.getItem("tuitionflow_user_credentials")
  if (saved) {
    try {
      return JSON.parse(saved) as UserCredential[]
    } catch (e) {
      console.error("Failed to parse credentials", e)
    }
  }
  localStorage.setItem("tuitionflow_user_credentials", JSON.stringify(INITIAL_USER_CREDENTIALS))
  syncToDatabase("tuitionflow_user_credentials", INITIAL_USER_CREDENTIALS)
  return INITIAL_USER_CREDENTIALS
}

export function saveUserCredentials(credentialsList: UserCredential[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tuitionflow_user_credentials", JSON.stringify(credentialsList))
  syncToDatabase("tuitionflow_user_credentials", credentialsList)
}

// Safely get active tenant from localStorage (handles SSR)
export function getActiveTenant(): string {
  if (typeof window === "undefined") return "inst_001"
  const saved = localStorage.getItem("tuitionflow_active_tenant")
  const tenantsList = getTenants()
  if (saved && tenantsList.some(t => t.id === saved)) return saved
  return tenantsList[0]?.id || "inst_001"
}

// Safely set active tenant and reload page
export function setActiveTenant(tenantId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tuitionflow_active_tenant", tenantId)
  window.location.reload()
}

// Safely get active role from localStorage
export function getActiveRole(): string {
  if (typeof window === "undefined") return "owner"
  const saved = localStorage.getItem("tuitionflow_active_role")
  if (saved && ROLES.some(r => r.id === saved)) return saved
  return "owner"
}

// Safely set active role and reload page
export function setActiveRole(roleId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tuitionflow_active_role", roleId)
  window.location.reload()
}

// Helper to check current role
export const isRole = {
  superAdmin: () => getActiveRole() === "super_admin",
  owner: () => getActiveRole() === "owner",
  teacher: () => getActiveRole() === "teacher",
  student: () => getActiveRole() === "student",
  parent: () => getActiveRole() === "parent",
}

// Get the current tenant object
export function getTenantDetails(): Tenant {
  const activeId = getActiveTenant()
  const tenantsList = getTenants()
  return tenantsList.find(t => t.id === activeId) || tenantsList[0]
}

// Build scoped key
export function getTenantStorageKey(baseKey: string): string {
  const activeTenantId = getActiveTenant()
  return `${activeTenantId}_${baseKey}`
}

// Load scoped data from localStorage, fall back to tenant-specific mock data
export function getScopedData<T>(baseKey: string, fallbackGenerator: (tenantId: string) => T): T {
  if (typeof window === "undefined") return fallbackGenerator("inst_001")
  const scopedKey = getTenantStorageKey(baseKey)
  const saved = localStorage.getItem(scopedKey)
  if (saved) {
    try {
      return JSON.parse(saved) as T
    } catch (e) {
      console.error(`Failed to parse scoped data for key ${scopedKey}`, e)
    }
  }
  
  // If not in localStorage, generate fallback mock data for this tenant and save it
  const fallback = fallbackGenerator(getActiveTenant())
  localStorage.setItem(scopedKey, JSON.stringify(fallback))
  syncToDatabase(scopedKey, fallback)
  return fallback
}

// Save scoped data to localStorage
export function setScopedData<T>(baseKey: string, data: T): void {
  if (typeof window === "undefined") return
  const scopedKey = getTenantStorageKey(baseKey)
  localStorage.setItem(scopedKey, JSON.stringify(data))
  syncToDatabase(scopedKey, data)
}

// ==========================================
// Tenant-specific high-fidelity mock data generators
// ==========================================

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  batch: string
  status: "Active" | "Inactive" | "On Leave"
  gender: "Male" | "Female" | "Other"
  dob: string
  guardianName: string
  guardianPhone: string
  address: string
  schoolName: string
  studentClass: string
  joinedDate: string
  avatarUrl?: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  qualification: string
  payType: "monthly" | "batchwise" | "daily"
  payAmount: string
  status: "Active" | "On Leave" | "Inactive"
  assignedBatches: string[]
  joinDate: string
  rating: number
  avatarUrl?: string
}

export interface Batch {
  id: string
  name: string
  subjects: string[]
  subject: string
  teacher: string
  time: string
  timing: string
  days: string[]
  students: number
  studentsCount: number
  capacity: number
  color: string
  startDate?: string
  status: string
  fees: number
}

export interface FeeTransaction {
  id: string
  studentName: string
  studentId: string
  amount: string
  month: string
  batch: string
  status: "Paid" | "Overdue" | "Partial"
  paymentDate?: string
  paymentMethod?: string
  remarks?: string
  invoiceNum?: string
}

export interface QRCodeConfig {
  id: string
  label: string
  upiId: string
  bankName: string
  status: "Active" | "Inactive"
  qrImageUrl?: string
}

export interface OnlineTransaction {
  id: string
  studentName: string
  batch: string
  amount: string
  month: string
  upiIdUsed: string
  status: "Success" | "Pending" | "Failed"
  timestamp: string
}

export interface Expense {
  id: string
  title: string
  category: string
  amount: number
  date: string
  paidTo: string
  paymentMode: string
  status: "Paid" | "Pending" | "Recurring"
  notes: string
}

export interface PayrollRecord {
  id: string
  teacherName: string
  teacherId: string
  payType: "monthly" | "batchwise" | "daily"
  baseAmount: number
  bonuses: number
  deductions: number
  netAmount: number
  month: string
  status: "Paid" | "Pending" | "Processing"
  paidDate?: string
}

export interface LeaveRecord {
  id: string
  teacherName: string
  teacherId: string
  leaveType: "Casual" | "Sick" | "Personal" | "Emergency"
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: "Approved" | "Pending" | "Rejected"
  appliedDate: string
}

export const mockStudentsGenerator = (tenantId: string): Student[] => {
  const base = [
    { 
      id: "1", name: "Sarah Smith", email: "sarah@example.com", phone: "9876543210", 
      batch: "Batch Alpha", status: "Active" as const, joinedDate: "2024-01-10", gender: "Female" as const, dob: "2008-05-15",
      guardianName: "Robert Smith", guardianPhone: "9123456780", address: "45 Green Valley, New York",
      schoolName: "Lincoln High School", studentClass: "Grade 10"
    },
    { 
      id: "2", name: "Alex Brown", email: "alex@example.com", phone: "9876543211", 
      batch: "Batch Beta", status: "Active" as const, joinedDate: "2024-02-15", gender: "Male" as const, dob: "2007-08-20",
      guardianName: "Thomas Brown", guardianPhone: "9123456781", address: "12 Pine Street, Chicago",
      schoolName: "St. Marys Academy", studentClass: "Grade 11"
    },
    { 
      id: "3", name: "Emma Watson", email: "emma@example.com", phone: "9876543212", 
      batch: "Batch Alpha", status: "Active" as const, joinedDate: "2024-01-12", gender: "Female" as const, dob: "2008-04-12",
      guardianName: "Richard Watson", guardianPhone: "9123456782", address: "89 Broadway, Boston",
      schoolName: "Lincoln High School", studentClass: "Grade 10"
    },
    { 
      id: "4", name: "James Wilson", email: "james@example.com", phone: "9876543213", 
      batch: "Batch Gamma", status: "Active" as const, joinedDate: "2024-03-01", gender: "Male" as const, dob: "2006-11-05",
      guardianName: "David Wilson", guardianPhone: "9123456783", address: "102 Oak Avenue, Seattle",
      schoolName: "Westside High School", studentClass: "Grade 12"
    },
    { 
      id: "5", name: "Olivia Davis", email: "olivia@example.com", phone: "9876543214", 
      batch: "Batch Beta", status: "On Leave" as const, joinedDate: "2024-02-18", gender: "Female" as const, dob: "2007-09-30",
      guardianName: "Michael Davis", guardianPhone: "9123456784", address: "56 Elm Street, San Francisco",
      schoolName: "St. Marys Academy", studentClass: "Grade 11"
    }
  ]

  if (tenantId === "inst_002") {
    return base.map(s => ({
      ...s,
      status: s.status as "Active" | "On Leave" | "Inactive",
      gender: s.gender as "Male" | "Female" | "Other",
      name: s.name.replace("Smith", "Apex").replace("Brown", "Apex").replace("Watson", "Apex").replace("Wilson", "Apex").replace("Davis", "Apex"),
      email: s.email.replace("@example.com", "@apex.edu"),
      batch: s.batch.replace("Batch ", "Apex ")
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(s => ({
      ...s,
      status: s.status as "Active" | "On Leave" | "Inactive",
      gender: s.gender as "Male" | "Female" | "Other",
      name: s.name.replace("Smith", "Horizon").replace("Brown", "Horizon").replace("Watson", "Horizon").replace("Wilson", "Horizon").replace("Davis", "Horizon"),
      email: s.email.replace("@example.com", "@horizon.edu"),
      batch: s.batch.replace("Batch ", "Horizon ")
    }))
  }

  return base.map(s => ({
    ...s,
    status: s.status as "Active" | "On Leave" | "Inactive",
    gender: s.gender as "Male" | "Female" | "Other"
  }))
}

export const mockTeachersGenerator = (tenantId: string): Teacher[] => {
  const base = [
    { id: "T-001", name: "Dr. Priya Sharma", email: "priya@coachingos.edu", phone: "+91 98765 00001", subject: "Mathematics", qualification: "Ph.D Mathematics", payType: "monthly" as const, payAmount: "45000", status: "Active" as const, assignedBatches: ["batch-alpha"], joinDate: "2024-01-15", rating: 4.8 },
    { id: "T-002", name: "Rajesh Kumar", email: "rajesh@coachingos.edu", phone: "+91 98765 00002", subject: "Physics", qualification: "M.Sc Physics", payType: "batchwise" as const, payAmount: "12000", status: "Active" as const, assignedBatches: ["batch-beta"], joinDate: "2024-03-01", rating: 4.5 },
    { id: "T-003", name: "Anita Desai", email: "anita@coachingos.edu", phone: "+91 98765 00003", subject: "Chemistry", qualification: "M.Sc Chemistry", payType: "monthly" as const, payAmount: "40000", status: "On Leave" as const, assignedBatches: ["batch-gamma"], joinDate: "2023-08-20", rating: 4.7 },
    { id: "T-004", name: "Suresh Patel", email: "suresh@coachingos.edu", phone: "+91 98765 00004", subject: "Biology", qualification: "M.Sc Biology", payType: "daily" as const, payAmount: "2500", status: "Active" as const, assignedBatches: ["batch-delta", "batch-beta"], joinDate: "2024-06-10", rating: 4.2 },
    { id: "T-005", name: "Meena Gupta", email: "meena@coachingos.edu", phone: "+91 98765 00005", subject: "English", qualification: "M.A English", payType: "monthly" as const, payAmount: "35000", status: "Active" as const, assignedBatches: ["batch-alpha", "batch-gamma"], joinDate: "2023-11-05", rating: 4.9 },
  ]

  if (tenantId === "inst_002") {
    return base.map(t => ({
      ...t,
      payType: t.payType as "monthly" | "batchwise" | "daily",
      status: t.status as "Active" | "On Leave" | "Inactive",
      name: t.name.replace("Sharma", "Apex").replace("Kumar", "Apex").replace("Desai", "Apex").replace("Patel", "Apex").replace("Gupta", "Apex"),
      email: t.email.replace("coachingos.edu", "apexscience.edu")
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(t => ({
      ...t,
      payType: t.payType as "monthly" | "batchwise" | "daily",
      status: t.status as "Active" | "On Leave" | "Inactive",
      name: t.name.replace("Sharma", "Horizon").replace("Kumar", "Horizon").replace("Desai", "Horizon").replace("Patel", "Horizon").replace("Gupta", "Horizon"),
      email: t.email.replace("coachingos.edu", "horizonprep.edu")
    }))
  }

  return base.map(t => ({
    ...t,
    payType: t.payType as "monthly" | "batchwise" | "daily",
    status: t.status as "Active" | "On Leave" | "Inactive"
  }))
}

export const mockBatchesGenerator = (tenantId: string): Batch[] => {
  const base: Batch[] = [
    { 
      id: "batch-alpha", 
      name: "Batch Alpha", 
      subjects: ["Mathematics"], 
      subject: "Mathematics", 
      teacher: "Dr. Priya Sharma", 
      time: "09:00 AM - 10:30 AM", 
      timing: "09:00 AM - 10:30 AM", 
      days: ["Mon", "Wed", "Fri"], 
      students: 45, 
      studentsCount: 45, 
      capacity: 50, 
      color: "hsl(var(--primary))", 
      startDate: "2026-06-15", 
      status: "Active", 
      fees: 5000 
    },
    { 
      id: "batch-beta", 
      name: "Batch Beta", 
      subjects: ["Physics"], 
      subject: "Physics", 
      teacher: "Dr. Alex Brown", 
      time: "04:00 PM - 05:30 PM", 
      timing: "04:00 PM - 05:30 PM", 
      days: ["Tue", "Thu", "Sat"], 
      students: 38, 
      studentsCount: 38, 
      capacity: 40, 
      color: "hsl(var(--accent))", 
      startDate: "2026-06-16", 
      status: "Active", 
      fees: 5200 
    },
    { 
      id: "batch-gamma", 
      name: "Batch Gamma", 
      subjects: ["Chemistry"], 
      subject: "Chemistry", 
      teacher: "Anita Desai", 
      time: "06:00 PM - 07:30 PM", 
      timing: "06:00 PM - 07:30 PM", 
      days: ["Mon", "Wed", "Fri"], 
      students: 30, 
      studentsCount: 30, 
      capacity: 35, 
      color: "hsl(var(--primary))", 
      startDate: "2026-06-15", 
      status: "Active", 
      fees: 4800 
    },
    { 
      id: "batch-delta", 
      name: "Batch Delta", 
      subjects: ["Biology"], 
      subject: "Biology", 
      teacher: "Suresh Patel", 
      time: "11:00 AM - 12:30 PM", 
      timing: "11:00 AM - 12:30 PM", 
      days: ["Tue", "Thu"], 
      students: 25, 
      studentsCount: 25, 
      capacity: 30, 
      color: "hsl(var(--accent))", 
      startDate: "2026-06-16", 
      status: "Active", 
      fees: 4500 
    }
  ]

  if (tenantId === "inst_002") {
    return base.map(b => ({
      ...b,
      name: b.name.replace("Batch ", "Apex "),
      teacher: b.teacher.replace("Sharma", "Apex").replace("Brown", "Apex").replace("Desai", "Apex").replace("Patel", "Apex")
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(b => ({
      ...b,
      name: b.name.replace("Batch ", "Horizon "),
      teacher: b.teacher.replace("Sharma", "Horizon").replace("Brown", "Horizon").replace("Desai", "Horizon").replace("Patel", "Horizon")
    }))
  }

  return base
}

export const mockFeesLedgerGenerator = (tenantId: string): FeeTransaction[] => {
  const base = [
    { id: "TXN-001", studentName: "Sarah Smith", studentId: "1", amount: "5000", month: "June 2026", status: "Paid" as const, paymentMethod: "UPI", remarks: "June Fees - Batch Alpha", invoiceNum: "INV-2026-001", batch: "Batch Alpha", paymentDate: "2026-06-05" },
    { id: "TXN-002", studentName: "Alex Brown", studentId: "2", amount: "5200", month: "June 2026", status: "Paid" as const, paymentMethod: "Card", remarks: "June Fees - Batch Beta", invoiceNum: "INV-2026-002", batch: "Batch Beta", paymentDate: "2026-06-08" },
    { id: "TXN-003", studentName: "Emma Watson", studentId: "3", amount: "5000", month: "June 2026", status: "Partial" as const, paymentMethod: "-", remarks: "June Fees - Batch Alpha", invoiceNum: "INV-2026-003", batch: "Batch Alpha", paymentDate: "2026-06-12" },
    { id: "TXN-004", studentName: "James Wilson", studentId: "4", amount: "4800", month: "June 2026", status: "Paid" as const, paymentMethod: "Cash", remarks: "June Fees - Batch Gamma", invoiceNum: "INV-2026-004", batch: "Batch Gamma", paymentDate: "2026-06-15" },
    { id: "TXN-005", studentName: "Olivia Davis", studentId: "5", amount: "5200", month: "June 2026", status: "Overdue" as const, paymentMethod: "-", remarks: "June Fees - Batch Beta", invoiceNum: "INV-2026-005", batch: "Batch Beta", paymentDate: "" },
  ]

  if (tenantId === "inst_002") {
    return base.map(tx => ({
      ...tx,
      status: tx.status as "Paid" | "Overdue" | "Partial",
      studentName: tx.studentName.replace("Smith", "Apex").replace("Brown", "Apex").replace("Watson", "Apex").replace("Wilson", "Apex").replace("Davis", "Apex"),
      remarks: tx.remarks.replace("Batch ", "Apex "),
      batch: tx.batch.replace("Batch ", "Apex ")
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(tx => ({
      ...tx,
      status: tx.status as "Paid" | "Overdue" | "Partial",
      studentName: tx.studentName.replace("Smith", "Horizon").replace("Brown", "Horizon").replace("Watson", "Horizon").replace("Wilson", "Horizon").replace("Davis", "Horizon"),
      remarks: tx.remarks.replace("Batch ", "Horizon "),
      batch: tx.batch.replace("Batch ", "Horizon ")
    }))
  }

  return base.map(tx => ({
    ...tx,
    status: tx.status as "Paid" | "Overdue" | "Partial"
  }))
}

export const mockQrsGenerator = (tenantId: string): QRCodeConfig[] => {
  const suffix = tenantId === "inst_001" ? "fees@okaxis" : tenantId === "inst_002" ? "fees@okicici" : "fees@okhdfc"
  const bankName = tenantId === "inst_001" ? "Axis Bank" : tenantId === "inst_002" ? "ICICI Bank" : "HDFC Bank"
  return [
    { id: "QR-001", label: "Primary Admission QR", upiId: `coachingos.${suffix}`, bankName, status: "Active" as const },
    { id: "QR-002", label: "Secondary Bank QR", upiId: `coachingos2.${suffix}`, bankName, status: "Active" as const }
  ]
}

export const mockOnlineTransactionsGenerator = (tenantId: string): OnlineTransaction[] => {
  const suffix = tenantId === "inst_001" ? "fees@okaxis" : tenantId === "inst_002" ? "fees@okicici" : "fees@okhdfc"
  const base = [
    { id: "TXN-ON-5001", studentName: "Sarah Smith", batch: "Batch Alpha", amount: "500", month: "June 2026", upiIdUsed: `coachingos.${suffix}`, status: "Success" as const, timestamp: "2026-06-18 10:15" },
    { id: "TXN-ON-5002", studentName: "Alex Brown", batch: "Batch Beta", amount: "500", month: "June 2026", upiIdUsed: `coachingos.${suffix}`, status: "Pending" as const, timestamp: "2026-06-18 11:30" },
    { id: "TXN-ON-5003", studentName: "Emma Watson", batch: "Batch Alpha", amount: "500", month: "June 2026", upiIdUsed: `coachingos2.${suffix}`, status: "Success" as const, timestamp: "2026-06-17 14:02" },
  ]

  if (tenantId === "inst_002") {
    return base.map(tx => ({
      ...tx,
      status: tx.status as "Success" | "Pending" | "Failed",
      studentName: tx.studentName.replace("Smith", "Apex").replace("Brown", "Apex").replace("Watson", "Apex"),
      batch: tx.batch.replace("Batch ", "Apex ")
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(tx => ({
      ...tx,
      status: tx.status as "Success" | "Pending" | "Failed",
      studentName: tx.studentName.replace("Smith", "Horizon").replace("Brown", "Horizon").replace("Watson", "Horizon"),
      batch: tx.batch.replace("Batch ", "Horizon ")
    }))
  }

  return base.map(tx => ({
    ...tx,
    status: tx.status as "Success" | "Pending" | "Failed"
  }))
}

export const mockExpensesGenerator = (tenantId: string): Expense[] => {
  const base = [
    { id: "EXP-001", title: "Monthly Office Rent", category: "Rent", amount: 25000, date: "2026-06-01", paidTo: "Landmark Properties", paymentMode: "Bank Transfer", status: "Paid" as const, notes: "June rent for coaching center" },
    { id: "EXP-002", title: "Electricity Bill", category: "Utilities", amount: 8500, date: "2026-06-05", paidTo: "State Electricity Board", paymentMode: "Online", status: "Paid" as const, notes: "May-June billing cycle" },
    { id: "EXP-003", title: "Practice Worksheets Printing", category: "Study Material", amount: 4200, date: "2026-06-10", paidTo: "QuickPrint Services", paymentMode: "Cash", status: "Paid" as const, notes: "500 copies for Batch Alpha & Beta" },
  ]

  return base.map(e => ({
    ...e,
    status: e.status as "Paid" | "Pending" | "Recurring",
    amount: tenantId === "inst_002" ? e.amount + 5000 : tenantId === "inst_003" ? e.amount + 12000 : e.amount
  }))
}

export const mockPayrollGenerator = (tenantId: string): PayrollRecord[] => {
  const base = [
    { id: "PAY-001", teacherName: "Dr. Priya Sharma", teacherId: "T-001", payType: "monthly" as const, baseAmount: 45000, bonuses: 5000, deductions: 2000, netAmount: 48000, month: "June 2026", status: "Paid" as const, paidDate: "2026-06-01" },
    { id: "PAY-002", teacherName: "Rajesh Kumar", teacherId: "T-002", payType: "batchwise" as const, baseAmount: 12000, bonuses: 0, deductions: 0, netAmount: 12000, month: "June 2026", status: "Pending" as const },
    { id: "PAY-003", teacherName: "Anita Desai", teacherId: "T-003", payType: "monthly" as const, baseAmount: 40000, bonuses: 3000, deductions: 1500, netAmount: 41500, month: "June 2026", status: "Processing" as const },
  ]

  if (tenantId === "inst_002") {
    return base.map(p => ({
      ...p,
      payType: p.payType as "monthly" | "batchwise" | "daily",
      status: p.status as "Paid" | "Pending" | "Processing",
      teacherName: p.teacherName.replace("Sharma", "Apex").replace("Kumar", "Apex").replace("Desai", "Apex"),
      baseAmount: p.baseAmount + 5000,
      netAmount: p.netAmount + 5000
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(p => ({
      ...p,
      payType: p.payType as "monthly" | "batchwise" | "daily",
      status: p.status as "Paid" | "Pending" | "Processing",
      teacherName: p.teacherName.replace("Sharma", "Horizon").replace("Kumar", "Horizon").replace("Desai", "Horizon"),
      baseAmount: p.baseAmount + 10000,
      netAmount: p.netAmount + 10000
    }))
  }

  return base.map(p => ({
    ...p,
    payType: p.payType as "monthly" | "batchwise" | "daily",
    status: p.status as "Paid" | "Pending" | "Processing"
  }))
}

export const mockLeavesGenerator = (tenantId: string): LeaveRecord[] => {
  const base = [
    { id: "LV-001", teacherName: "Anita Desai", teacherId: "T-003", leaveType: "Sick" as const, fromDate: "2026-06-15", toDate: "2026-06-20", days: 5, reason: "Medical procedure and recovery", status: "Approved" as const, appliedDate: "2026-06-12" },
    { id: "LV-002", teacherName: "Dr. Priya Sharma", teacherId: "T-001", leaveType: "Casual" as const, fromDate: "2026-06-25", toDate: "2026-06-26", days: 2, reason: "Family function", status: "Pending" as const, appliedDate: "2026-06-17" },
  ]

  if (tenantId === "inst_002") {
    return base.map(l => ({
      ...l,
      leaveType: l.leaveType as "Casual" | "Sick" | "Personal" | "Emergency",
      status: l.status as "Approved" | "Pending" | "Rejected",
      teacherName: l.teacherName.replace("Sharma", "Apex").replace("Desai", "Apex")
    }))
  }

  if (tenantId === "inst_003") {
    return base.map(l => ({
      ...l,
      leaveType: l.leaveType as "Casual" | "Sick" | "Personal" | "Emergency",
      status: l.status as "Approved" | "Pending" | "Rejected",
      teacherName: l.teacherName.replace("Sharma", "Horizon").replace("Desai", "Horizon")
    }))
  }

  return base.map(l => ({
    ...l,
    leaveType: l.leaveType as "Casual" | "Sick" | "Personal" | "Emergency",
    status: l.status as "Approved" | "Pending" | "Rejected"
  }))
}

export const mockAttendanceGenerator = (tenantId: string) => {
  return {
    "2026-06-10": { "1": "Present", "2": "Present", "3": "Absent", "4": "Present", "5": "Present" },
    "2026-06-11": { "1": "Present", "2": "Absent", "3": "Present", "4": "Present", "5": "Present" },
    "2026-06-12": { "1": "Present", "2": "Present", "3": "Present", "4": "Absent", "5": "Present" },
    "2026-06-13": { "1": "Present", "2": "Present", "3": "Present", "4": "Present", "5": "Absent" },
    "2026-06-14": { "1": "Present", "2": "Present", "3": "Absent", "4": "Present", "5": "Present" },
  }
}

// scripts/db-init.js
const { neon } = require('@neondatabase/serverless');

const connectionString = "postgresql://neondb_owner:npg_Uegy7tGfFnB5@ep-hidden-dew-ah581q96-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  console.log("Connecting to Neon database...");
  const sql = neon(connectionString);

  console.log("Creating table 'app_state'...");
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      key VARCHAR(255) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 1. Initial global arrays
  const TENANTS = [
    { id: "inst_001", name: "Coaching OS Academy", tagline: "Educator Portal", logoText: "Coaching OS" },
    { id: "inst_002", name: "Apex Science Institute", tagline: "Science & Tech Portal", logoText: "Apex Academy" },
    { id: "inst_003", name: "Horizon Prep Academy", tagline: "College Prep Portal", logoText: "Horizon Prep" },
  ];

  const INITIAL_USER_CREDENTIALS = [
    { email: "admin@coachingos.com", role: "super_admin", tenantId: "inst_001", name: "Platform Admin", password: "demopassword" },
    { email: "owner@coachingos.edu", role: "owner", tenantId: "inst_001", name: "John Doe (Coaching OS)", password: "demopassword" },
    { email: "owner@apexscience.edu", role: "owner", tenantId: "inst_002", name: "Dr. Arthur Apex", password: "demopassword" },
    { email: "owner@horizonprep.edu", role: "owner", tenantId: "inst_003", name: "Principal Horizon", password: "demopassword" },
    { email: "sarah.smith@coachingos.edu", role: "teacher", tenantId: "inst_001", name: "Prof. Sarah Smith", password: "demopassword" },
    { email: "priya.sharma@apexscience.edu", role: "teacher", tenantId: "inst_002", name: "Dr. Priya Sharma", password: "demopassword" },
    { email: "anita.desai@horizonprep.edu", role: "teacher", tenantId: "inst_003", name: "Anita Desai", password: "demopassword" },
    { email: "sarah.smith@example.com", role: "student", tenantId: "inst_001", name: "Sarah Smith", password: "demopassword" },
    { email: "sarah.apex@apex.edu", role: "student", tenantId: "inst_002", name: "Sarah Apex", password: "demopassword" },
    { email: "sarah.horizon@horizon.edu", role: "student", tenantId: "inst_003", name: "Sarah Horizon", password: "demopassword" },
    { email: "parent@example.com", role: "parent", tenantId: "inst_001", name: "Parent Account", password: "demopassword" },
    { email: "parent@apex.edu", role: "parent", tenantId: "inst_002", name: "Parent Account (Apex)", password: "demopassword" },
    { email: "parent@horizon.edu", role: "parent", tenantId: "inst_003", name: "Parent Account (Horizon)", password: "demopassword" }
  ];

  // 2. High-fidelity generators
  const mockStudentsGenerator = (tenantId) => {
    const base = [
      { id: "1", name: "Sarah Smith", email: "sarah@example.com", phone: "9876543210", batch: "Batch Alpha", status: "Active", joinedDate: "2024-01-10", gender: "Female", dob: "2008-05-15", guardianName: "Robert Smith", guardianPhone: "9123456780", address: "45 Green Valley, New York", schoolName: "Lincoln High School", studentClass: "Grade 10" },
      { id: "2", name: "Alex Brown", email: "alex@example.com", phone: "9876543211", batch: "Batch Beta", status: "Active", joinedDate: "2024-02-15", gender: "Male", dob: "2007-08-20", guardianName: "Thomas Brown", guardianPhone: "9123456781", address: "12 Pine Street, Chicago", schoolName: "St. Marys Academy", studentClass: "Grade 11" },
      { id: "3", name: "Emma Watson", email: "emma@example.com", phone: "9876543212", batch: "Batch Alpha", status: "Active", joinedDate: "2024-01-12", gender: "Female", dob: "2008-04-12", guardianName: "Richard Watson", guardianPhone: "9123456782", address: "89 Broadway, Boston", schoolName: "Lincoln High School", studentClass: "Grade 10" },
      { id: "4", name: "James Wilson", email: "james@example.com", phone: "9876543213", batch: "Batch Gamma", status: "Active", joinedDate: "2024-03-01", gender: "Male", dob: "2006-11-05", guardianName: "David Wilson", guardianPhone: "9123456783", address: "102 Oak Avenue, Seattle", schoolName: "Westside High School", studentClass: "Grade 12" },
      { id: "5", name: "Olivia Davis", email: "olivia@example.com", phone: "9876543214", batch: "Batch Beta", status: "On Leave", joinedDate: "2024-02-18", gender: "Female", dob: "2007-09-30", guardianName: "Michael Davis", guardianPhone: "9123456784", address: "56 Elm Street, San Francisco", schoolName: "St. Marys Academy", studentClass: "Grade 11" }
    ];

    if (tenantId === "inst_002") {
      return base.map(s => ({
        ...s,
        name: s.name.replace(/Smith|Brown|Watson|Wilson|Davis/g, "Apex"),
        email: s.email.replace("@example.com", "@apex.edu"),
        batch: s.batch.replace("Batch ", "Apex ")
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(s => ({
        ...s,
        name: s.name.replace(/Smith|Brown|Watson|Wilson|Davis/g, "Horizon"),
        email: s.email.replace("@example.com", "@horizon.edu"),
        batch: s.batch.replace("Batch ", "Horizon ")
      }));
    }
    return base;
  };

  const mockTeachersGenerator = (tenantId) => {
    const base = [
      { id: "T-001", name: "Dr. Priya Sharma", email: "priya@coachingos.edu", phone: "+91 98765 00001", subject: "Mathematics", qualification: "Ph.D Mathematics", payType: "monthly", payAmount: "45000", status: "Active", assignedBatches: ["batch-alpha"], joinDate: "2024-01-15", rating: 4.8 },
      { id: "T-002", name: "Rajesh Kumar", email: "rajesh@coachingos.edu", phone: "+91 98765 00002", subject: "Physics", qualification: "M.Sc Physics", payType: "batchwise", payAmount: "12000", status: "Active", assignedBatches: ["batch-beta"], joinDate: "2024-03-01", rating: 4.5 },
      { id: "T-003", name: "Anita Desai", email: "anita@coachingos.edu", phone: "+91 98765 00003", subject: "Chemistry", qualification: "M.Sc Chemistry", payType: "monthly", payAmount: "40000", status: "On Leave", assignedBatches: ["batch-gamma"], joinDate: "2023-08-20", rating: 4.7 },
      { id: "T-004", name: "Suresh Patel", email: "suresh@coachingos.edu", phone: "+91 98765 00004", subject: "Biology", qualification: "M.Sc Biology", payType: "daily", payAmount: "2500", status: "Active", assignedBatches: ["batch-delta", "batch-beta"], joinDate: "2024-06-10", rating: 4.2 },
      { id: "T-005", name: "Meena Gupta", email: "meena@coachingos.edu", phone: "+91 98765 00005", subject: "English", qualification: "M.A English", payType: "monthly", payAmount: "35000", status: "Active", assignedBatches: ["batch-alpha", "batch-gamma"], joinDate: "2023-11-05", rating: 4.9 },
    ];

    if (tenantId === "inst_002") {
      return base.map(t => ({
        ...t,
        name: t.name.replace(/Sharma|Kumar|Desai|Patel|Gupta/g, "Apex"),
        email: t.email.replace("coachingos.edu", "apexscience.edu")
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(t => ({
        ...t,
        name: t.name.replace(/Sharma|Kumar|Desai|Patel|Gupta/g, "Horizon"),
        email: t.email.replace("coachingos.edu", "horizonprep.edu")
      }));
    }
    return base;
  };

  const mockBatchesGenerator = (tenantId) => {
    const base = [
      { id: "batch-alpha", name: "Batch Alpha", subjects: ["Mathematics"], subject: "Mathematics", teacher: "Dr. Priya Sharma", time: "09:00 AM - 10:30 AM", timing: "09:00 AM - 10:30 AM", days: ["Mon", "Wed", "Fri"], students: 45, studentsCount: 45, capacity: 50, color: "hsl(var(--primary))", startDate: "2026-06-15", status: "Active", fees: 5000 },
      { id: "batch-beta", name: "Batch Beta", subjects: ["Physics"], subject: "Physics", teacher: "Dr. Alex Brown", time: "04:00 PM - 05:30 PM", timing: "04:00 PM - 05:30 PM", days: ["Tue", "Thu", "Sat"], students: 38, studentsCount: 38, capacity: 40, color: "hsl(var(--accent))", startDate: "2026-06-16", status: "Active", fees: 5200 },
      { id: "batch-gamma", name: "Batch Gamma", subjects: ["Chemistry"], subject: "Chemistry", teacher: "Anita Desai", time: "06:00 PM - 07:30 PM", timing: "06:00 PM - 07:30 PM", days: ["Mon", "Wed", "Fri"], students: 30, studentsCount: 30, capacity: 35, color: "hsl(var(--primary))", startDate: "2026-06-15", status: "Active", fees: 4800 },
      { id: "batch-delta", name: "Batch Delta", subjects: ["Biology"], subject: "Biology", teacher: "Suresh Patel", time: "11:00 AM - 12:30 PM", timing: "11:00 AM - 12:30 PM", days: ["Tue", "Thu"], students: 25, studentsCount: 25, capacity: 30, color: "hsl(var(--accent))", startDate: "2026-06-16", status: "Active", fees: 4500 }
    ];

    if (tenantId === "inst_002") {
      return base.map(b => ({
        ...b,
        name: b.name.replace("Batch ", "Apex "),
        teacher: b.teacher.replace(/Sharma|Brown|Desai|Patel/g, "Apex")
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(b => ({
        ...b,
        name: b.name.replace("Batch ", "Horizon "),
        teacher: b.teacher.replace(/Sharma|Brown|Desai|Patel/g, "Horizon")
      }));
    }
    return base;
  };

  const mockFeesLedgerGenerator = (tenantId) => {
    const base = [
      { id: "TXN-001", studentName: "Sarah Smith", studentId: "1", amount: "5000", month: "June 2026", status: "Paid", paymentMethod: "UPI", remarks: "June Fees - Batch Alpha", invoiceNum: "INV-2026-001", batch: "Batch Alpha", paymentDate: "2026-06-05" },
      { id: "TXN-002", studentName: "Alex Brown", studentId: "2", amount: "5200", month: "June 2026", status: "Paid", paymentMethod: "Card", remarks: "June Fees - Batch Beta", invoiceNum: "INV-2026-002", batch: "Batch Beta", paymentDate: "2026-06-08" },
      { id: "TXN-003", studentName: "Emma Watson", studentId: "3", amount: "5000", month: "June 2026", status: "Partial", paymentMethod: "-", remarks: "June Fees - Batch Alpha", invoiceNum: "INV-2026-003", batch: "Batch Alpha", paymentDate: "2026-06-12" },
      { id: "TXN-004", studentName: "James Wilson", studentId: "4", amount: "4800", month: "June 2026", status: "Paid", paymentMethod: "Cash", remarks: "June Fees - Batch Gamma", invoiceNum: "INV-2026-004", batch: "Batch Gamma", paymentDate: "2026-06-15" },
      { id: "TXN-005", studentName: "Olivia Davis", studentId: "5", amount: "5200", month: "June 2026", status: "Overdue", paymentMethod: "-", remarks: "June Fees - Batch Beta", invoiceNum: "INV-2026-005", batch: "Batch Beta", paymentDate: "" },
    ];

    if (tenantId === "inst_002") {
      return base.map(tx => ({
        ...tx,
        studentName: tx.studentName.replace(/Smith|Brown|Watson|Wilson|Davis/g, "Apex"),
        remarks: tx.remarks.replace("Batch ", "Apex "),
        batch: tx.batch.replace("Batch ", "Apex ")
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(tx => ({
        ...tx,
        studentName: tx.studentName.replace(/Smith|Brown|Watson|Wilson|Davis/g, "Horizon"),
        remarks: tx.remarks.replace("Batch ", "Horizon "),
        batch: tx.batch.replace("Batch ", "Horizon ")
      }));
    }
    return base;
  };

  const mockQrsGenerator = (tenantId) => {
    const suffix = tenantId === "inst_001" ? "fees@okaxis" : tenantId === "inst_002" ? "fees@okicici" : "fees@okhdfc";
    const bankName = tenantId === "inst_001" ? "Axis Bank" : tenantId === "inst_002" ? "ICICI Bank" : "HDFC Bank";
    return [
      { id: "QR-001", label: "Primary Admission QR", upiId: `coachingos.${suffix}`, bankName, status: "Active" },
      { id: "QR-002", label: "Secondary Bank QR", upiId: `coachingos2.${suffix}`, bankName, status: "Active" }
    ];
  };

  const mockOnlineTransactionsGenerator = (tenantId) => {
    const suffix = tenantId === "inst_001" ? "fees@okaxis" : tenantId === "inst_002" ? "fees@okicici" : "fees@okhdfc";
    const base = [
      { id: "TXN-ON-5001", studentName: "Sarah Smith", batch: "Batch Alpha", amount: "500", month: "June 2026", upiIdUsed: `coachingos.${suffix}`, status: "Success", timestamp: "2026-06-18 10:15" },
      { id: "TXN-ON-5002", studentName: "Alex Brown", batch: "Batch Beta", amount: "500", month: "June 2026", upiIdUsed: `coachingos.${suffix}`, status: "Pending", timestamp: "2026-06-18 11:30" },
      { id: "TXN-ON-5003", studentName: "Emma Watson", batch: "Batch Alpha", amount: "500", month: "June 2026", upiIdUsed: `coachingos2.${suffix}`, status: "Success", timestamp: "2026-06-17 14:02" },
    ];

    if (tenantId === "inst_002") {
      return base.map(tx => ({
        ...tx,
        status: tx.status,
        studentName: tx.studentName.replace(/Smith|Brown|Watson/g, "Apex"),
        batch: tx.batch.replace("Batch ", "Apex ")
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(tx => ({
        ...tx,
        status: tx.status,
        studentName: tx.studentName.replace(/Smith|Brown|Watson/g, "Horizon"),
        batch: tx.batch.replace("Batch ", "Horizon ")
      }));
    }
    return base;
  };

  const mockExpensesGenerator = (tenantId) => {
    const base = [
      { id: "EXP-001", title: "Monthly Office Rent", category: "Rent", amount: 25000, date: "2026-06-01", paidTo: "Landmark Properties", paymentMode: "Bank Transfer", status: "Paid", notes: "June rent for coaching center" },
      { id: "EXP-002", title: "Electricity Bill", category: "Utilities", amount: 8500, date: "2026-06-05", paidTo: "State Electricity Board", paymentMode: "Online", status: "Paid", notes: "May-June billing cycle" },
      { id: "EXP-003", title: "Practice Worksheets Printing", category: "Study Material", amount: 4200, date: "2026-06-10", paidTo: "QuickPrint Services", paymentMode: "Cash", status: "Paid", notes: "500 copies for Batch Alpha & Beta" },
    ];
    return base.map(e => ({
      ...e,
      amount: tenantId === "inst_002" ? e.amount + 5000 : tenantId === "inst_003" ? e.amount + 12000 : e.amount
    }));
  };

  const mockPayrollGenerator = (tenantId) => {
    const base = [
      { id: "PAY-001", teacherName: "Dr. Priya Sharma", teacherId: "T-001", payType: "monthly", baseAmount: 45000, bonuses: 5000, deductions: 2000, netAmount: 48000, month: "June 2026", status: "Paid", paidDate: "2026-06-01" },
      { id: "PAY-002", teacherName: "Rajesh Kumar", teacherId: "T-002", payType: "batchwise", baseAmount: 12000, bonuses: 0, deductions: 0, netAmount: 12000, month: "June 2026", status: "Pending" },
      { id: "PAY-003", teacherName: "Anita Desai", teacherId: "T-003", payType: "monthly", baseAmount: 40000, bonuses: 3000, deductions: 1500, netAmount: 41500, month: "June 2026", status: "Processing" },
    ];

    if (tenantId === "inst_002") {
      return base.map(p => ({
        ...p,
        teacherName: p.teacherName.replace(/Sharma|Kumar|Desai/g, "Apex"),
        baseAmount: p.baseAmount + 5000,
        netAmount: p.netAmount + 5000
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(p => ({
        ...p,
        teacherName: p.teacherName.replace(/Sharma|Kumar|Desai/g, "Horizon"),
        baseAmount: p.baseAmount + 10000,
        netAmount: p.netAmount + 10000
      }));
    }
    return base;
  };

  const mockLeavesGenerator = (tenantId) => {
    const base = [
      { id: "LV-001", teacherName: "Anita Desai", teacherId: "T-003", leaveType: "Sick", fromDate: "2026-06-15", toDate: "2026-06-20", days: 5, reason: "Medical procedure and recovery", status: "Approved", appliedDate: "2026-06-12" },
      { id: "LV-002", teacherName: "Dr. Priya Sharma", teacherId: "T-001", leaveType: "Casual", fromDate: "2026-06-25", toDate: "2026-06-26", days: 2, reason: "Family function", status: "Pending", appliedDate: "2026-06-17" },
    ];

    if (tenantId === "inst_002") {
      return base.map(l => ({
        ...l,
        teacherName: l.teacherName.replace(/Sharma|Desai/g, "Apex")
      }));
    }
    if (tenantId === "inst_003") {
      return base.map(l => ({
        ...l,
        teacherName: l.teacherName.replace(/Sharma|Desai/g, "Horizon")
      }));
    }
    return base;
  };

  const mockAttendanceGenerator = (tenantId) => {
    return {
      "2026-06-10": { "1": "Present", "2": "Present", "3": "Absent", "4": "Present", "5": "Present" },
      "2026-06-11": { "1": "Present", "2": "Absent", "3": "Present", "4": "Present", "5": "Present" },
      "2026-06-12": { "1": "Present", "2": "Present", "3": "Present", "4": "Absent", "5": "Present" },
      "2026-06-13": { "1": "Present", "2": "Present", "3": "Present", "4": "Present", "5": "Absent" },
      "2026-06-14": { "1": "Present", "2": "Present", "3": "Absent", "4": "Present", "5": "Present" },
    };
  };

  // 3. Collect all states
  const statesToSeed = {
    "tuitionflow_tenants": TENANTS,
    "tuitionflow_user_credentials": INITIAL_USER_CREDENTIALS
  };

  const tenants = ["inst_001", "inst_002", "inst_003"];
  for (const tId of tenants) {
    statesToSeed[`${tId}_students`] = mockStudentsGenerator(tId);
    statesToSeed[`${tId}_teachers`] = mockTeachersGenerator(tId);
    statesToSeed[`${tId}_batches`] = mockBatchesGenerator(tId);
    statesToSeed[`${tId}_fees_ledger`] = mockFeesLedgerGenerator(tId);
    statesToSeed[`${tId}_qrs`] = mockQrsGenerator(tId);
    statesToSeed[`${tId}_online_transactions`] = mockOnlineTransactionsGenerator(tId);
    statesToSeed[`${tId}_expenses`] = mockExpensesGenerator(tId);
    statesToSeed[`${tId}_payroll`] = mockPayrollGenerator(tId);
    statesToSeed[`${tId}_leaves`] = mockLeavesGenerator(tId);
    statesToSeed[`${tId}_attendance`] = mockAttendanceGenerator(tId);
  }

  // 4. Seed the database
  console.log("Seeding states into 'app_state' table...");
  for (const [key, value] of Object.entries(statesToSeed)) {
    const valueJson = JSON.stringify(value);
    console.log(`Seeding key: ${key}`);
    await sql`
      INSERT INTO app_state (key, value)
      VALUES (${key}, ${valueJson}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = ${valueJson}::jsonb;
    `;
  }

  console.log("Database initialized and seeded successfully!");
}

main().catch(err => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});

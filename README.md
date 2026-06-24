# Coaching OS

Coaching OS is a multi-tenant SaaS educational management platform designed for tuition centers, coaching institutes, competitive exam preparation academies, and private tutors. It provides a unified portal to coordinate student lifecycle management, attendance logs, fee collections, teacher payrolls, parent communications, asset tracking, and operations analytics.

---

## 🏢 Multi-Tenant & Role-Based Access Control (RBAC)

The application implements strict data isolation using tenant scoping and provides role-specific dashboards and menu items.

### User Roles & Navigation Scopes

| Role | Scope & Permissions |
| :--- | :--- |
| **Super Admin** | Platform-wide access. Manages active tenants, subscription levels, global billing tiers, and system database sync audit logs. |
| **Institute Owner** | Executive control over a single tenant workspace. Manages students, teachers, batches, credentials, assets, fee structures, expenses, HR payroll, and institute-wide settings. |
| **Teacher** | Scoped workspace access. Marks attendance for assigned batches, views class schedules, manages timetable items, and tracks salary payouts. |
| **Student** | Personal portal access. Views active class schedules, tracks batch syllabi, monitors attendance history, and pays outstanding fee invoices. |
| **Parent** | Linked student portal access. Monitors child attendance scores, checks class schedules, and completes online fee invoice payments. |

---

## 🚀 Key Modules & Features

### 1. Bento-Grid Analytics Dashboards
* **Role-Specific Views**: Dashboards adapt to the logged-in role (Owner, Teacher, Student, Parent) to present relevant KPIs.
* **Financial Metric Cards**: Tracks total income, monthly recurring revenue, pending fees, and estimated fee leakage.
* **Operational Widgets**: Renders active student enrollments, batch counts, classroom schedules, and quick actions.

### 2. Student Directory CRM & Profiles
* **Lifecycle Management**: Tracks student enrollments, batches, profiles, and statuses (Active, On Leave, Suspended).
* **Detailed Profile Pages**: Displays academic progress, attendance percentage charts, active fee invoices, and guardian contact details.
* **Roster Export**: Supports exporting student records to CSV format for external analysis.

### 3. Teacher Directory
* **Instructor Profiles**: Stores teacher credentials, subject specializations, contact information, and active status.
* **Salary Allocation**: Logs monthly base salary configurations and hourly rate metrics.

### 4. Batch & Timetable Manager
* **Classroom Allocation**: Manages classroom programs, subjects, capacities, colors, and schedules.
* **Drawer-Based Student Management**: Direct management of students within a batch via the "Manage" button on every batch card. Admins can add new students from the tenant directory, remove existing students, track real-time capacity levels, and view current batch rosters.

### 5. Automated Attendance Engine
* **Batch-Wise Sheets**: Interface to mark batch attendance for specific dates.
* **Bulk Adjustments**: Supports bulk toggles to mark students as present, late, or absent.
* **Parent Broadcasting**: Option to send automated attendance alert notifications directly to parents.

### 6. Fee Ledger & Invoicing
* **Flexible Billing Structures**: Supports monthly, batchwise, and custom billing structures.
* **Invoicing Engine**: Generates professional PDF invoices containing tax breakdowns, discounts, and payment terms.
* **Receipts & Payment History**: Tracks payment dates, methods, and transaction references for completed receipts.

### 7. UPI QR Payments Integration
* **Dynamic UPI QR Generator**: Generates a UPI QR code dynamically based on the invoice amount and institute VPA settings.
* **Merchant Configurations**: Allows owners to set custom UPI IDs (VPA) and merchant names to receive direct bank settlements.
* **Online Receipt Verification**: Displays transaction reference fields for parents to submit payments, which owners can manually approve.

### 8. Asset & Resource Manager
* **Granular Inventory Registry**: Tracks physical resources such as whiteboards, laptops, pens, markers, and classroom accessories.
* **Distributed Quantities**: Manages item counts across four distinct states within a single asset record:
  * `Available`: Units sitting in inventory/store.
  * `In Use`: Units currently allocated to classrooms or staff.
  * `In Repair`: Units undergoing maintenance or servicing.
  * `Deprecated`: Decommissioned or damaged units.
* **Allocation Distribution Bar**: Displays segmented, color-coded visual progress bars indicating real-time quantity splits.
* **Activity Logs & Audit Trail**: Persists history records capturing operations (Create, Update, Allocate, Maintenance, Decommission, Delete) with timestamps, operator info, and detailed description strings.
* **CSV Exports & Purge**: Enables downloading the entire inventory audit trail as a CSV file, with options to clear log histories.
* **Mobile Responsiveness**: Renders a compact card grid layout on mobile screens and an administrative table on desktop viewports.

### 9. Broadcast Communication Center
* **Template Editor**: Selects pre-defined message templates (Attendance Alert, Fee Reminder, Holiday Notice, Welcome Message) or composes custom messages.
* **Placeholder Resolution**: Automatically resolves dynamic placeholders like `[Student Name]`, `[Batch Name]`, `[Month]`, and `[Date]` at runtime.
* **Multi-Channel Dispatch**:
  * **App Notifications**: Creates real-time notifications saved in the tenant scope.
  * **Email Alerts**: Logs message dispatches.
  * **WhatsApp Redirects**: Cleans phone numbers, auto-prepends the country code (`91` for Indian numbers if exactly 10 digits are provided), and triggers an external API redirect link containing prefilled resolved text messages.
* **WhatsApp Group Hub**: Persists batch-wise WhatsApp group invite links. Allows owners to quickly modify links, track member counts, and open external group invites.

### 10. Secure Credential Manager
* **Tenant Identity Control**: Secure dashboard for Owners and Super Admins to provision, modify, and delete local portal login accounts.
* **Searchable Name Dropdown**: Custom lookup component that searches live tenant datasets (Students, Teachers, and Parents derived from student guardian fields) and automatically populates corresponding emails during creation.
* **Role Filters**: Tabs to organize credentials by All, Teachers, Students, and Parents.
* **Self-Deletion Protection**: Blocks logged-in administrative owners from deleting their own credentials to prevent lockouts.
* **Passcode Visibility Toggle**: Implements interactive eye/eye-off switches to inspect passwords securely.
* **Conflict Prevention**: Validates email unique constraints across the system to prevent overlapping logins.

### 11. HR & Teacher Payroll
* **Payroll Workspace**: Logs monthly base salaries, tracks extra hourly bonuses, and records leave requests.
* **Payslip Generator**: Generates professional PDF payslips for teachers, reflecting base pay, deductions, bonuses, and payment status.

### 12. Expenses & Bills Tracker
* **Operating Expense Logs**: Registers bills, rent payments, salary disbursements, and stationery purchases.
* **Financial Analytics**: Recharts charts demonstrating expenses broken down by categories and monthly comparisons.

### 13. Centralized System Settings
* **Tenant Branding**: Configure institute name, tagline, custom logo text, and operational settings.
* **System Rules**: Customize payment configurations, current academic sessions, and default credentials.

### 14. Super-Admin Console
* **Tenant Provisioning**: Add, edit, or suspend institute sub-tenant accounts.
* **Subscription Billing**: Manages global subscription plans and tier limits.
* **System Logs**: Audits background database synchronization calls.

---

## 🔄 Local-First Database Sync Engine

Coaching OS employs a Local-First Synchronization pattern to deliver a fast, offline-capable user interface:

```mermaid
graph TD
    A[Browser Load] --> B[RootLayoutWrapper]
    B -->|GET /api/db/all| C[Neon PostgreSQL Database]
    C -->|Fetch app_state rows| B
    B -->|Seed local keys| D[Browser LocalStorage]
    
    E[User Mutation] -->|Update state| D
    E -->|POST /api/db| F[Sync Queue - Background Fetch]
    F -->|UPSERT app_state| C
```

1. **Bootstrap Seeding**: During initial application mount, the [root-layout-wrapper.tsx](file:///c:/wamp64/www/coaching-os/src/components/root-layout-wrapper.tsx) component fires a `GET` request to `/api/db/all`. This loads all state records from the Neon PostgreSQL database and caches them into the browser's `localStorage` namespace.
2. **Synchronous Reads**: Pages retrieve data synchronously using scoped helper functions (e.g., `getScopedData`) located inside [tenant.ts](file:///c:/wamp64/www/coaching-os/src/lib/tenant.ts).
3. **Non-Blocking Writes**: Mutative edits call `setScopedData`. This updates the local storage cache immediately and asynchronously pushes a background `POST` request to `/api/db` to update the Neon database. The UI remains active and responsive without waiting for server responses.

---

## 📂 Project Directory Structure

```bash
coaching-os/
├── docs/                      # Architectural design specifications & JSON schemas
├── public/                    # Static assets, favicon, and system logos
├── scripts/                   # DB migrations and seeding scripts
│   └── db-init.js             # Initializes Neon PostgreSQL app_state schema
└── src/
    ├── app/                   # App Router pages, layouts, and API routes
    │   ├── api/
    │   │   ├── db/            # Receives background database mutations
    │   │   └── db/all/        # Initial data sync bootstrap fetcher
    │   ├── assets/            # Resource & Asset Management page
    │   ├── attendance/        # Automated attendance tracker sheet
    │   ├── batches/           # Batch and timetable setup sheets
    │   ├── communications/    # Broadcast center with WhatsApp & notification dispatch
    │   ├── credentials/       # Workspace credentials manager
    │   ├── expenses/          # Operational expenses logging tracker
    │   ├── fees/              # Student billing ledgers & invoice creator
    │   ├── hr/                # Instructor payroll workspace & leave logger
    │   ├── login/             # Dynamic login portal routes for all roles
    │   ├── notifications/     # Scoped system audit alerts and messages
    │   ├── online-payments/   # UPI QR payment profiles and gateway verifications
    │   ├── schedule/          # Timetable calendar modules
    │   ├── settings/          # Tenant setup & branding controls
    │   ├── students/          # Student directory & academic profiles
    │   ├── super-admin/       # Platform-wide management console
    │   ├── teachers/          # Instructor directory & profiles
    │   ├── layout.tsx         # Root layout definition & viewport settings
    │   └── page.tsx           # Entry page router (landing page or dashboards)
    ├── components/            # Shared React components
    │   ├── ui/                # UI primitives
    │   ├── app-sidebar.tsx    # Multi-tenant custom navigation sidebar
    │   ├── layout-header.tsx  # Dynamic dashboard app navbar
    │   ├── root-layout-wrapper.tsx # Auth verification & database sync bootstrapper
    │   └── saas-landing-page.tsx  # B2B product marketing landing page
    └── lib/                   # Internal utilities and data persistence layers
        ├── db.ts              # Serverless Neon DB database connection pool
        ├── tenant.ts          # Core Multi-Tenant logic, storage keys, and mock data
        └── utils.ts           # CSS class merging tailwind helpers
```

---

## 🔑 Pre-Configured Demo Credentials

Use these credentials to test role scopes across pre-seeded tenant spaces. All accounts share the password: `demopassword`.

| Tenant Space | Role | Email Account | Name |
| :--- | :--- | :--- | :--- |
| **Global Platform** | Super Admin | `admin@coachingos.com` | Platform Admin |
| **Coaching OS Academy** | Institute Owner | `owner@coachingos.edu` | John Doe |
| | Teacher | `sarah.smith@coachingos.edu` | Prof. Sarah Smith |
| | Student | `sarah.smith@example.com` | Sarah Smith |
| | Parent | `parent@example.com` | Parent Account |
| **Apex Science Institute**| Institute Owner | `owner@apexscience.edu` | Dr. Arthur Apex |
| | Teacher | `priya.sharma@apexscience.edu` | Dr. Priya Sharma |
| | Student | `sarah.apex@apex.edu` | Sarah Apex |
| | Parent | `parent@apex.edu` | Parent Account (Apex) |
| **Horizon Prep Academy** | Institute Owner | `owner@horizonprep.edu` | Principal Horizon |
| | Teacher | `anita.desai@horizonprep.edu` | Anita Desai |
| | Student | `sarah.horizon@horizon.edu` | Sarah Horizon |
| | Parent | `parent@horizon.edu` | Parent Account (Horizon) |

---

## ⚙️ Local Setup Instructions

### 1. Requirements
* **Node.js** (v18.0.0 or higher)
* An active **Neon PostgreSQL database** instance (or a local PostgreSQL server).

### 2. Configure Environment Variables
Create a `.env` file in the project root directory and define your connection string:
```env
DATABASE_URL="postgresql://neondb_owner:<your_password>@<your_host>/neondb?sslmode=require"
```

### 3. Install Project Dependencies
Run this command in the project root:
```bash
npm install
```

### 4. Bootstrap the Database
Create the database schema tables and seed the baseline demo tenants and credentials:
```bash
node scripts/db-init.js
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified in the console output) in your web browser to run the application.

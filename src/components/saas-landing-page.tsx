"use client"

import * as React from "react"
import {
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  Users,
  Calendar,
  DollarSign,
  Clock,
  BookOpen,
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronDown,
  Play,
  Layers,
  MessageSquare,
  HelpCircle,
  FileText,
  PhoneCall,
  Menu,
  Award
} from "lucide-react"

export default function SaasLandingPage() {
  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  // Exit intent states
  const [showExitModal, setShowExitModal] = React.useState(false)

  // ROI Calculator states
  const [studentCount, setStudentCount] = React.useState(150)
  const [adminHours, setAdminHours] = React.useState(15)

  // FAQ states
  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  // Floating sticky CTA state
  const [showStickyCta, setShowStickyCta] = React.useState(false)

  // Success conversion notifications (Live social proof)
  const [liveNotify, setLiveNotify] = React.useState<string | null>(null)

  // Exit intent detection
  React.useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 30) {
        const shown = sessionStorage.getItem("exit_intent_shown")
        if (!shown) {
          setShowExitModal(true)
          sessionStorage.setItem("exit_intent_shown", "true")
        }
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [])

  // Scroll detection (Sticky header & bottom CTA)
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      if (window.scrollY > 700) {
        setShowStickyCta(true)
      } else {
        setShowStickyCta(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Live popups simulator (Social Proof)
  React.useEffect(() => {
    const notifications = [
      "Apex Coaching signed up 2 minutes ago",
      "Prof. Verma booked a product demo",
      "Horizon Academy imported 120 students",
      "Pioneer English Center cleared ₹45k in pending fees"
    ]

    const interval = setInterval(() => {
      const randomMsg = notifications[Math.floor(Math.random() * notifications.length)]
      setLiveNotify(randomMsg)

      const hideTimeout = setTimeout(() => {
        setLiveNotify(null)
      }, 4000)

      return () => clearTimeout(hideTimeout)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  // ROI Calculations
  const hoursSavedPerMonth = adminHours * 4
  const revenueRecovered = Math.round(studentCount * 120) // assumed leak recovery: ₹120 per student/month
  const roiMultiplier = Math.round((revenueRecovered + (hoursSavedPerMonth * 150)) / 999) // using growth plan as cost
  const daysSaved = (hoursSavedPerMonth / 8).toFixed(1)
  const recommendedPlanName = studentCount <= 50 ? "Starter" : studentCount <= 200 ? "Growth" : "Professional"
  const recommendedPlanPrice = studentCount <= 50 ? 499 : studentCount <= 200 ? 999 : 2499
  const netSavings = Math.max(0, revenueRecovered + (hoursSavedPerMonth * 150) - recommendedPlanPrice)
  const efficiencyRating = roiMultiplier >= 15 ? "Hyper-Growth Boost" : roiMultiplier >= 8 ? "High ROI Boost" : "Optimized Admin"

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const handleFreeTrial = () => {
    window.location.href = "/login"
  }

  const handleBookDemo = () => {
    const pricingSection = document.getElementById("pricing")
    pricingSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body antialiased selection:bg-indigo-500/10 relative overflow-x-hidden">
      {/* JSON-LD Schemas for AI SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://coachingos.com/#organization",
                "name": "Coaching OS",
                "url": "https://coachingos.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://coachingos.com/logo.png",
                  "caption": "Coaching OS Logo"
                },
                "description": "Multi-tenant SaaS workspace platform designed to manage students, attendance, fee collections, and payroll for tuition academies."
              },
              {
                "@type": "WebSite",
                "@id": "https://coachingos.com/#website",
                "url": "https://coachingos.com",
                "name": "Coaching OS",
                "description": "Run Your Entire Tuition Center From One Platform",
                "publisher": {
                  "@id": "https://coachingos.com/#organization"
                }
              },
              {
                "@type": "FAQPage",
                "@id": "https://coachingos.com/#faq",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How long does it take to migrate from Excel files?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Less than 15 minutes! You can upload student list rosters or batch databases via CSV, or let our setup specialist handle the import via live screen share."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I import existing roster logs from Excel sheets?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, absolutely! We provide a robust Excel import widget. You can map your custom columns (parent name, phone logs, email) inside seconds."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is our student and billing data secure?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. Coaching OS operates on isolated tenant partition tables behind strict privilege admin keys. We run automated backups daily."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is training provided for teachers and administrative staff?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, we provide dynamic dashboard setup guides, video onboarding tutorials, and a dedicated text helpdesk for active licenses."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* 1. Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white text-xs font-semibold py-2.5 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-sm">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">NEW</span>
        <span>🎉 Start Free Trial Today — No Credit Card Required</span>
        <button onClick={handleFreeTrial} className="underline hover:text-indigo-200 transition-colors ml-1">Claim 14-Days Free &rarr;</button>
      </div>

      {/* 2. Header & Navigation */}
      <header className={`w-full transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-sm' : 'bg-transparent py-5'} sticky top-9 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/full-header-logo.png" alt="Coaching OS Logo" className="h-14 w-auto object-contain" />
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-indigo-600 transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          {/* Desktop CTA actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-indigo-600 transition-colors">
              Login
            </a>
            <button onClick={handleFreeTrial} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/10 transition-all hover:-translate-y-0.5">
              Start Free Trial
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button className="md:hidden text-slate-700 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="size-6" />
          </button>
        </div>

        {/* Mobile Navigation overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 space-y-4 shadow-lg animate-fade-in">
            <div className="flex flex-col gap-3.5 text-sm font-semibold text-slate-600">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Features</a>
              <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Benefits</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Testimonials</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">FAQ</a>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <a href="/login" className="text-center font-bold text-sm text-slate-700 py-2">Login</a>
              <button onClick={handleFreeTrial} className="w-full bg-indigo-600 text-white font-bold text-center py-2.5 rounded-xl shadow-md">
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Background Visual elements */}
        <div className="absolute top-1/6 left-[-10%] w-[45%] h-[45%] bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/6 right-[-10%] w-[45%] h-[45%] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-widest w-fit">
                <Sparkles className="size-3 text-indigo-650" /> Next-Gen Tuition Center Hub
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                Stop Managing Your Tuition Center on <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">Excel & Registers</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                Coordinate attendance logs, simplify invoicing bills, automate parent communication, and trace syllabus goals from one centralized coaching workspace portal.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button onClick={handleFreeTrial} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-xs tracking-wider px-7 py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                  Start 14-Days Free Trial
                </button>
                <button onClick={handleBookDemo} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold uppercase text-xs tracking-wider px-7 py-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                  View Demo Plans
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> 5-minute setup</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> Cancel anytime</span>
              </div>
            </div>

            {/* Right Mockup column */}
            <div className="lg:col-span-6 relative">
              {/* Glassmorphic dashboard mockup card */}
              <div className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-2xl shadow-indigo-500/5 relative overflow-hidden animate-float">
                <div className="border-b border-slate-200/60 pb-3 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-red-400" />
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="size-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">live_platform_preview.exe</span>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</span>
                      <Users className="size-4.5 text-indigo-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">1,248</p>
                    <p className="text-[9px] text-green-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="size-3" /> +15% this batch
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fees Collection</span>
                      <DollarSign className="size-4.5 text-emerald-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">92.4%</p>
                    <p className="text-[9px] text-green-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="size-3" /> ₹1.2L recovered
                    </p>
                  </div>
                </div>

                {/* Analytics Mock Chart */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Ratio (Monthly)</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Target: 95%</span>
                  </div>
                  <div className="flex items-end justify-between h-[100px] pt-4 px-1 gap-2">
                    <div className="w-full bg-slate-100 rounded-t-md h-3/4 flex items-end justify-center"><div className="w-full bg-indigo-500 rounded-t-md h-4/5" /></div>
                    <div className="w-full bg-slate-100 rounded-t-md h-2/3 flex items-end justify-center"><div className="w-full bg-indigo-500 rounded-t-md h-3/5" /></div>
                    <div className="w-full bg-slate-100 rounded-t-md h-[90%] flex items-end justify-center"><div className="w-full bg-indigo-500 rounded-t-md h-[95%]" /></div>
                    <div className="w-full bg-slate-100 rounded-t-md h-4/5 flex items-end justify-center"><div className="w-full bg-indigo-600 rounded-t-md h-[92%]" /></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider px-0.5 pt-1">
                    <span>Batch A</span>
                    <span>Batch B</span>
                    <span>Batch C</span>
                    <span>Batch D</span>
                  </div>
                </div>

                {/* Floating parent alert notification card */}
                <div className="absolute bottom-6 -right-4 bg-white/95 backdrop-blur border border-emerald-200/80 p-3 rounded-xl shadow-xl max-w-[200px] flex items-start gap-2.5 animate-bounce hover:animate-none">
                  <div className="size-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <Check className="size-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-800">Fees Sync Complete</p>
                    <p className="text-[8px] text-slate-500 font-medium">Automatic billing receipt sent to Priya's parent.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Problem Section */}
      <section className="py-20 bg-slate-100 border-y border-slate-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16 animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Pain Points</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Still Running Your Institute Like This?
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Manual paperwork, missing invoices, and parent call logs steal hours from teaching. It's time to upgrade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProblemCard
              num="01"
              title="Attendance Registers"
              desc="Manually calling names, marking grids, and searching registers. You can't track cumulative attendance rate over the months without manual spreadsheets."
            />
            <ProblemCard
              num="02"
              title="Excel Roster Sheets"
              desc="Fragmented tables, broken formulas, and syncing version blocks. One wrong edit corrupts your billing invoices log history permanently."
            />
            <ProblemCard
              num="03"
              title="Manual Fee Calls"
              desc="Awkward phone calling and manual billing reminders. 15%+ of center revenues leak out due to forgotten due dates and tracking lag."
            />
            <ProblemCard
              num="04"
              title="WhatsApp Chaos"
              desc="Flooded broadcast channels, missed messages, and parent communication overlap. Finding check-in logs becomes a headache."
            />
            <ProblemCard
              num="05"
              title="Manual Payroll Math"
              desc="Juggling monthly fixed salaries, daily wages, and batch-wise pay variables. Administrative staff spend days calculating complex teacher pay statements manually."
            />
            <ProblemCard
              num="06"
              title="Payment Reconcile Nightmares"
              desc="Matching random WhatsApp screenshots with bank accounts. Tracking who paid what UPI transaction and when is a daily compliance headache."
            />
            <ProblemCard
              num="07"
              title="Unmonitored Lesson Plans"
              desc="Zero visibility into syllabus progress. Administrators can't verify if batches are on track or if teachers have completed scheduled test modules."
            />
            <ProblemCard
              num="08"
              title="Split Branch Disconnections"
              desc="Running multiple centers with separate isolated databases. Consolidating global revenue, student reports, and staff payroll is a week-long audit."
            />
          </div>

          <div className="text-center mt-12 space-y-1.5 animate-fade-in">
            <p className="text-sm text-slate-500 font-semibold italic">
              "You started teaching students, not managing administrative paperwork."
            </p>
          </div>
        </div>
      </section>

      {/* 5. Solution Section */}
      <section id="features" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">One Workspace</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              One Platform To Run Your Entire Tuition Center
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Coaching OS replaces disconnected spreadsheets with a single, highly integrated ecosystem designed for B2B tuition institutes.
            </p>
          </div>

          {/* Large solution showcase mockup */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-3.5 mb-16 animate-fade-in">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Product Visual Mockup representation */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-800">Student Directory Desk</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Active rosters across Math & Physics batches</p>
                  </div>
                  <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-lg transition-all">
                    + Add Student
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="border-b text-slate-400 uppercase tracking-wider font-bold">
                        <th className="pb-2">Student Name</th>
                        <th className="pb-2">Batch</th>
                        <th className="pb-2">Attendance Avg</th>
                        <th className="pb-2">Pending Fees</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 font-bold">Sarah Smith</td>
                        <td className="py-2.5">Batch Alpha</td>
                        <td className="py-2.5 font-mono text-green-600 font-bold">96.4%</td>
                        <td className="py-2.5 text-slate-500">₹0 (Cleared)</td>
                        <td className="py-2.5 text-right"><span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-full">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Alex Brown</td>
                        <td className="py-2.5">Batch Beta</td>
                        <td className="py-2.5 font-mono text-amber-600 font-bold">89.2%</td>
                        <td className="py-2.5 font-bold text-rose-600">₹2,500 (Due)</td>
                        <td className="py-2.5 text-right"><span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 font-bold rounded-full">PENDING</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Priya Verma</td>
                        <td className="py-2.5">Batch Alpha</td>
                        <td className="py-2.5 font-mono text-green-600 font-bold">98.0%</td>
                        <td className="py-2.5 text-slate-500">₹0 (Cleared)</td>
                        <td className="py-2.5 text-right"><span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-full">ACTIVE</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side text links */}
              <div className="lg:col-span-4 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-750 uppercase tracking-widest rounded-full">
                  Fully Centralized Directory
                </div>
                <h3 className="text-xl font-headline font-bold text-slate-800 leading-snug">
                  Manage roster entries and billing ledgers dynamically.
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Every time you update a student batch timeline, invoices get compiled and synced in real-time. No manual data transfer needed.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check className="size-4 text-indigo-500" /> Student billing automations
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check className="size-4 text-indigo-500" /> Live QR code checkout handles
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check className="size-4 text-indigo-500" /> One-click parents broadcast logs
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Features Sections (Alternating Layouts) */}
      <section className="py-12 bg-slate-100 border-t border-slate-200/60 space-y-24">

        {/* Feature 1: Student Management */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Feature 01</span>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Student Directory Management</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Maintain comprehensive profiles for every student. Store parent details, class enrollment records, outstanding fee logs, and cumulative attendance history in one searchable node.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Fast-import roster directories via Excel</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Auto-isolate data partitions per branch</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Set custom filters (active, left, suspended)</li>
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b pb-3 border-slate-100">
                  <div className="size-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">S</div>
                  <div>
                    <h4 className="text-xs font-bold">Sarah Smith · Student Card</h4>
                    <p className="text-[10px] text-slate-400 font-medium">ID: TF-10492</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100"><p className="text-slate-400 font-semibold uppercase">Parent</p><p className="font-bold text-slate-700">James Smith</p></div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100"><p className="text-slate-400 font-semibold uppercase">Contact</p><p className="font-bold text-slate-700">james@example.com</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Attendance Tracking */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Feature 02</span>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Real-Time Attendance Registers</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Mark attendance inside 3 clicks on your phone. Send automatic check-in text alerts to parents so they stay informed of student checkouts.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Real-time parent WhatsApp check-in alerts</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Filter logs by batch slot and dates</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Export monthly Excel registry records</li>
              </ul>
            </div>
            <div className="lg:col-span-6 lg:order-1">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>Mark Attendance (Math Roster)</span>
                  <span className="text-slate-400">June 20, 2026</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold">Sarah Smith</span>
                    <div className="flex gap-2">
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-md">PRESENT</span>
                      <span className="bg-white border text-slate-400 text-[9px] font-bold px-2.5 py-1 rounded-md">ABSENT</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold">Alex Brown</span>
                    <div className="flex gap-2">
                      <span className="bg-white border text-slate-400 text-[9px] font-bold px-2.5 py-1 rounded-md">PRESENT</span>
                      <span className="bg-red-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-md">ABSENT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Fee Management */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Feature 03</span>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Simplified Digital Invoicing</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Auto-generate monthly tuition fee invoices for every batch. Share direct UPI payment codes with parents and automate fee receipts generation instantly upon checkout validation.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Automated billing reminder calendars</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Print professional PDF invoices on standard desktop</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Custom discount handles and fee adjustments</li>
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Pending Invoice Overview</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Due: 5 Days</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Student</span><span className="font-bold">Alex Brown</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total Fees</span><span className="font-bold">₹2,500</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Syllabus Class</span><span className="font-semibold">Mathematics Advanced</span></div>
                </div>
                <button className="w-full bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl shadow-md hover:bg-emerald-500 transition-colors uppercase tracking-wider mt-1">
                  Send Invoice SMS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Parent Communication */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Feature 04</span>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Parent Communication Channels</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Bridge teachers and parents seamlessly. Send test results tables, attendance alerts, batch rescheduling alerts, and leave approvals via automatic mailer templates.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Templates for custom announcements and warnings</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Log and trace email notifications histories</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Guard parent data integrity scope settings</li>
              </ul>
            </div>
            <div className="lg:col-span-6 lg:order-1">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MessageSquare className="size-4 text-indigo-500" /> Draft Parent Alert Broadcast
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Template Type</label>
                  <div className="w-full bg-slate-50 p-2.5 border rounded-lg text-xs font-semibold">Test Marks Score sheet release</div>
                  <textarea className="w-full border rounded-lg text-xs p-2 bg-slate-50 h-16 font-medium text-slate-500" disabled defaultValue="Hi parent, Math class test papers are evaluated. Your child scored A+ grade." />
                </div>
                <button className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl shadow-md w-fit">
                  Broadcast Alert
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 5: Reports & Analytics */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Feature 05</span>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Reports & Income Analytics</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Track revenue, payment records, batch attendance averages, and syllabus progression in dynamic graph formats. Export full transaction directories for accounting and licensing audits.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Generate monthly collections reports</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Track tuition fee trends across branches</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Download billing ledgers for accounting</li>
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Tuition Collection</span>
                <p className="text-2xl font-bold text-slate-800 leading-none">₹5,42,800</p>
                <div className="h-28 w-full bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-end justify-between gap-1 pt-6">
                  <div className="w-full bg-emerald-500/80 rounded-t h-2/5" />
                  <div className="w-full bg-emerald-500/80 rounded-t h-3/5" />
                  <div className="w-full bg-emerald-500/80 rounded-t h-4/5" />
                  <div className="w-full bg-emerald-600 rounded-t h-[95%]" />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>March</span><span>April</span><span>May</span><span>June</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 6: Batch Management */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Feature 06</span>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Smart Batch Scheduling</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Allocate slots, classes, and subjects without schedule overlaps. Keep calendar profiles synchronized between teachers and students dynamically.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Allocate slots and classes to faculty</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Spot and warn of schedule overlaps instantly</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-indigo-500" /> Share calendar links (iCal compatible)</li>
              </ul>
            </div>
            <div className="lg:col-span-6 lg:order-1">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4">
                <span className="text-xs font-bold text-slate-800 block">Class Calendar (Math Batch A)</span>
                <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-bold uppercase text-slate-400">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-700">
                  <span className="p-1">1</span><span className="p-1 bg-indigo-500 text-white rounded-md">2</span><span className="p-1">3</span><span className="p-1">4</span><span className="p-1">5</span><span className="p-1">6</span><span className="p-1 text-slate-300">7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 7. Benefits Section */}
      <section id="benefits" className="py-20 lg:py-28 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Core Value</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Why Coaching Centers Love Coaching OS
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              We focus on B2B tuition metrics that matter: saving admin time, improving parent retention, and stopping billing leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={Clock}
              stat="12+ Hours / Week"
              title="Save Admin Time"
              desc="No more manual registers or manual PDF receipt generation. Let automations coordinate registers and billing logs."
            />
            <BenefitCard
              icon={TrendingUp}
              stat="27% Faster collections"
              title="Collect Fees Faster"
              desc="Automatic SMS links and WhatsApp reminders ensure parents pay outstanding invoices without reminders delay."
            />
            <BenefitCard
              icon={Users}
              stat="94% Trust rate"
              title="Improve Parent Trust"
              desc="Parents stay involved with real-time test progress logging, syllabus logs, and automated check-in notifications."
            />
            <BenefitCard
              icon={Award}
              stat="35% Admission Growth"
              title="Grow Your Institute"
              desc="Run multiple coaching branches seamlessly and scale database entries with built-in multi-tenant security structures."
            />
            <BenefitCard
              icon={AlertCircle}
              stat="0% Ledger Errors"
              title="Reduce Manual Errors"
              desc="Eliminate version control gaps in student ledgers, uncollected fee vouchers, and payment entry duplicates."
            />
            <BenefitCard
              icon={Layers}
              stat="100% Cloud Synced"
              title="Access Anywhere"
              desc="Log in from your phone, laptop, or desktop tablet. Keep data secure and isolated behind strict admin privilege keys."
            />
            <BenefitCard
              icon={DollarSign}
              stat="98% Faster Payroll"
              title="Streamlined Payroll"
              desc="Calculate staff wages, adjust variable class pay, handle leaves, and approve payouts automatically."
            />
            <BenefitCard
              icon={ShieldCheck}
              stat="0% Commission Fees"
              title="Direct UPI Settlement"
              desc="Funds route straight to your bank account via UPI QR code. No intermediary delays or service cut percentages."
            />
            <BenefitCard
              icon={BookOpen}
              stat="100% Course Visibility"
              title="Track Course Progress"
              desc="Parents and administrators can trace lesson plans, unit completion timelines, and curriculum coverage in real-time."
            />
          </div>
        </div>
      </section>

      {/* 8. How It Works */}
      <section className="py-20 bg-slate-100 border-y border-slate-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Easy Setup</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Get Up & Running In 3 Easy Steps
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              We help you migrate from paper files and Excel registers to our platform in under 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <StepCard
              step="01"
              title="Create Your Institute Profile"
              desc="Type your institute name, configure logo details, specify syllabus classes, and create branches databases scope."
            />
            <StepCard
              step="02"
              title="Import Students & Batches"
              desc="Upload your existing roster file using our simple Excel importer widget. Map custom fields and slot timings instantly."
            />
            <StepCard
              step="03"
              title="Coordinate & Manage"
              desc="Auto-generate fee invoices, take daily attendance, and track real-time revenue analytics dashboards."
            />
          </div>
        </div>
      </section>

      {/* 9. Comparison Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Comparison</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Traditional Methods vs Coaching OS
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              See how our digital platform compares to managing your coaching center with manual registers and Excel.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Operational Area</th>
                    <th className="p-4 text-slate-400">Excel & Registers</th>
                    <th className="p-4 text-indigo-700 bg-indigo-50/40">Coaching OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Attendance Registry</td>
                    <td className="p-4 text-slate-500">Manual grid sheets. Wastes 15 mins/class. Easy to manipulate.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">3-click digital mark, instant parent WhatsApp notification.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Tuition Invoicing</td>
                    <td className="p-4 text-slate-500">Manual tracking logs. Delayed reminders. Leads to fee leaks.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Automated invoices, UPI checkout keys, auto billing receipts.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Operational Reports</td>
                    <td className="p-4 text-slate-500">Calculated manually on spreadsheet files. Error prone.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Live graphical analytics showing revenue, averages, and targets.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Parent Communication</td>
                    <td className="p-4 text-slate-500">WhatsApp text floods. Calls overlap. Chaos during syllabus.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">System-triggered SMS alerts, marks reports, template mails.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Data Scoping Integrity</td>
                    <td className="p-4 text-slate-500">Prone to file loss, corruption, and unauthorized edits.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Secure cloud database isolated behind strict privilege profiles.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Teacher Payroll & Leaves</td>
                    <td className="p-4 text-slate-500">Juggling files, paper receipts. Calculating variable wages by hand.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Automated payroll cycles, digital payouts logs, online leave approval desk.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">UPI & QR Code Payments</td>
                    <td className="p-4 text-slate-500">Constant screen verification. Checking bank apps for notifications.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Dynamic generated QR, auto verification webhook logs, direct settlements.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Multi-Branch Operations</td>
                    <td className="p-4 text-slate-500">Multiple files to merge, data sync mismatch, no unified dashboard views.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Multi-tenant tenant database isolation, global super-admin oversight dashboard.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Syllabus Progress Tracker</td>
                    <td className="p-4 text-slate-500">Oral follow-ups, notebook checks, no dashboard progress tracking.</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/20">Visual syllabus progression bar, real-time batch checks, teacher schedules logs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Social Proof Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 to-slate-950 text-white relative overflow-hidden">
        {/* Background mesh decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-3 py-1 rounded-full">Platform Traction</span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold">Trusted By Growing Coaching Centers</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-300">500+</p>
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Active Institutes</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-300">25,000+</p>
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Enrolled Students</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-300">5 Million</p>
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Attendance Logs</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-300">₹5 Crore+</p>
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Fees Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Approved By Academy Owners
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Read how tuition owners and coaching tutors have transformed their operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              initials="VS"
              name="Dr. Vikas Sharma"
              role="Director, Vikas Science Academy"
              review="Coaching OS completely automated our fee followups. We recovered ₹1.2L in delayed invoices during our first 30 days. High-fidelity analytics!"
              rating={5}
            />
            <TestimonialCard
              initials="PS"
              name="Priya Sen"
              role="Owner, Sen English Classes"
              review="Manual registers used to take hours of manual checking. Now teachers take attendance dynamically on their phone and parents get checked-in notifications."
              rating={5}
            />
            <TestimonialCard
              initials="MK"
              name="Manoj Kumar"
              role="Founder, Manoj Math Classes"
              review="Importing our student roster file was extremely fast. No more lost spreadsheets, version control blocks, or parent communication overlaps. Recommended!"
              rating={5}
            />
            <TestimonialCard
              initials="RG"
              name="Ritu Gupta"
              role="Manager, Horizon Prep Center"
              review="The multi-tenant database scoping ensures each branch manages its own payroll logs and slot allocations independently. Safe, secure, and reliable SaaS."
              rating={5}
            />
            <TestimonialCard
              initials="AK"
              name="Amit Kulkarni"
              role="Principal, Apex Coaching Hub"
              review="Custom invoice designs look highly professional. Parents love paying online using direct UPI handles. Admin workload reduced by half!"
              rating={5}
            />
            <TestimonialCard
              initials="SD"
              name="Prof. Sarah D'Souza"
              role="Director, D'Souza English Academy"
              review="We love the calendar grid schedule tracker. Slot conflict checking is automated and syllabus schedules stay perfectly synced. A game changer."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* 12. Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28 relative bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Pricing Plans</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Simple, Transparent Pricing Tiers
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Start with our 14-days trial. Upgrade or cancel your subscription plans anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* Starter Plan */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Starter</h4>
                  <p className="text-2xl font-bold text-slate-800">₹499<span className="text-xs font-semibold text-slate-500"> / month</span></p>
                  <p className="text-[10px] text-slate-500">Ideal for individual tutors & startup academies.</p>
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-2 text-[11px] font-medium text-slate-650">
                  <p className="flex items-center gap-2 font-bold text-slate-900"><Check className="size-3.5 text-emerald-500 shrink-0" /> Up to 50 Students</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Student Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Teacher Accounts</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Parent Communication</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Attendance Tracking</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Batch Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Fee Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Online Payments</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Priority Support</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Advanced Analytics</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Automated Fee Reminders</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Digital Receipts</p>
                </div>
              </div>
              <button onClick={handleFreeTrial} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl shadow transition-colors uppercase tracking-wider">
                Start Starter Trial
              </button>
            </div>

            {/* Growth Plan (Most Popular) */}
            <div className="border-2 border-indigo-600 rounded-2xl p-6 bg-white flex flex-col justify-between space-y-6 relative shadow-xl shadow-indigo-500/5">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[9px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600">Growth</h4>
                  <p className="text-3xl font-extrabold text-slate-900">₹999<span className="text-xs font-semibold text-slate-500"> / month</span></p>
                  <p className="text-[10px] text-slate-500">Perfect for scaling coaching and tuition centers.</p>
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-2 text-[11px] font-medium text-slate-650">
                  <p className="flex items-center gap-2 font-bold text-slate-900"><Check className="size-3.5 text-indigo-500 shrink-0" /> Up to 200 Students</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Student Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Teacher Accounts</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Parent Communication</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Attendance Tracking</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Batch Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Fee Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Online Payments</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Priority Support</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Advanced Analytics</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Automated Fee Reminders</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-indigo-500 shrink-0" /> Digital Receipts</p>
                </div>
              </div>
              <button onClick={handleFreeTrial} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors uppercase tracking-wider">
                Start Growth Trial
              </button>
            </div>

            {/* Professional Plan */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Professional</h4>
                  <p className="text-2xl font-bold text-slate-800">₹2,499<span className="text-xs font-semibold text-slate-500"> / month</span></p>
                  <p className="text-[10px] text-slate-500">Designed for multi-branch corporate centers.</p>
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-2 text-[11px] font-medium text-slate-650">
                  <p className="flex items-center gap-2 font-bold text-slate-900"><Check className="size-3.5 text-emerald-500 shrink-0" /> Unlimited Students</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Student Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Teacher Accounts</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Parent Communication</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Attendance Tracking</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Batch Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Fee Management</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Online Payments</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Priority Support</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Advanced Analytics</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Automated Fee Reminders</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-slate-400 shrink-0" /> Digital Receipts</p>
                </div>
              </div>
              <button onClick={handleFreeTrial} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl shadow transition-colors uppercase tracking-wider">
                Start Professional Trial
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 13. ROI Calculator Section */}
      <section className="py-20 bg-slate-100 border-y border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Calculator</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Calculate Your Monthly ROI Savings
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Drag the sliders below to see how much administrative time and leaked fees you can recover with Coaching OS.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto">
            {/* Input sliders card */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Enrolled Student Count</span>
                  <span className="text-indigo-600 font-mono">{studentCount} Students</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Weekly Administrative Hours</span>
                  <span className="text-indigo-600 font-mono">{adminHours} Hours / week</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  value={adminHours}
                  onChange={(e) => setAdminHours(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Calculations results card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[60px]" />

              <div className="space-y-4 relative z-10">
                <div className="space-y-1.5 border-b border-white/10 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold font-mono">Coaching OS Savings Model</span>
                    <h4 className="text-sm font-bold font-headline">Recovered Operational Balance</h4>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-full font-mono shrink-0">
                    {efficiencyRating}
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Administrative Time Reclaimed:</span>
                    <span className="font-bold text-indigo-300 font-mono">{hoursSavedPerMonth} Hrs/mo (~{daysSaved} work days)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Recovered Fee Leakages:</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{revenueRecovered.toLocaleString()} / mo</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                    <span className="text-slate-400 font-semibold">Recommended Match:</span>
                    <span className="font-bold text-indigo-300 font-headline">{recommendedPlanName} Plan (₹{recommendedPlanPrice}/mo)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-500/10">
                    <span className="text-indigo-200 font-bold">Net Reclaimed Value:</span>
                    <span className="font-extrabold text-amber-400 font-mono text-sm">₹{netSavings.toLocaleString()} / mo</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-center relative z-10 mt-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Monthly ROI</p>
                  <p className="text-2xl font-headline font-bold text-amber-300 font-mono">{roiMultiplier}x Savings</p>
                </div>
                <button onClick={handleFreeTrial} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-colors hover:scale-105 active:scale-95 duration-200">
                  Claim Savings
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. FAQ Section */}
      <section id="faq" className="py-20 lg:py-28 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">FAQ Desk</span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Find answers to commonly asked questions about our B2B tuition system platform.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FaqItem
              idx={1}
              openFaq={openFaq}
              toggleFaq={toggleFaq}
              q="How long does it take to setup our institute?"
              a="Setting up takes under 15 minutes. Once you registers your license credentials, you can map your subject classes and import rosters instantly."
            />
            <FaqItem
              idx={2}
              openFaq={openFaq}
              toggleFaq={toggleFaq}
              q="Can I import existing roster logs from Excel sheets?"
              a="Yes, absolutely! We provide a robust Excel import widget. You can map your custom columns (parent name, phone logs, email) inside seconds."
            />
            <FaqItem
              idx={3}
              openFaq={openFaq}
              toggleFaq={toggleFaq}
              q="Is our student and billing data secure?"
              a="Yes. Coaching OS operates on isolated tenant partition tables behind strict privilege admin keys. We run automated backups daily."
            />
            <FaqItem
              idx={4}
              openFaq={openFaq}
              toggleFaq={toggleFaq}
              q="Is training provided for teachers and administrative staff?"
              a="Yes, we provide dynamic dashboard setup guides, video onboarding tutorials, and a dedicated text helpdesk for active licenses."
            />
            <FaqItem
              idx={5}
              openFaq={openFaq}
              toggleFaq={toggleFaq}
              q="Do parents get access to track children performance?"
              a="Yes. You can configure direct login handles or share test progress sheets, check-in notifications, and UPI invoices directly."
            />
            <FaqItem
              idx={6}
              openFaq={openFaq}
              toggleFaq={toggleFaq}
              q="Is there a mobile app available?"
              a="Our platform dashboard workspace is fully responsive and mobile-optimized, so you and your teachers can mark attendance and billing from any browser."
            />
          </div>
        </div>
      </section>

      {/* 15. Final CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-950 to-slate-950 text-white text-center relative overflow-hidden border-t border-indigo-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 animate-fade-in">
          <h2 className="text-3xl sm:text-5xl font-headline font-bold leading-tight">
            Ready To Run Your Tuition Center Smarter?
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto leading-relaxed">
            Join hundreds of coaching center owners saving administrative time and recovering pending invoices faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 pt-2">
            <button onClick={handleFreeTrial} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-xs tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
              Start 14-Days Trial Free
            </button>
            <button onClick={handleBookDemo} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold uppercase text-xs tracking-wider px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5">
              Schedule Online Demo
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">No Credit Card Required · Setup in 5 Minutes</p>
        </div>
      </section>

      {/* 16. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-800 pb-12">

            {/* Logo column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <img src="/full-logo-footer-white.png" alt="Coaching OS Logo" className="h-28 w-auto object-contain" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs">
                SaaS enterprise management software for B2B tuition centers, academies, and private coaching institutes.
              </p>
            </div>

            {/* Links column 1 */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Product</h5>
              <div className="flex flex-col gap-2 text-xs font-semibold">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing Options</a>
              </div>
            </div>

            {/* Links column 2 */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Resources</h5>
              <div className="flex flex-col gap-2 text-xs font-semibold">
                <a href="#faq" className="hover:text-white transition-colors">Help & FAQ</a>
                <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
                <a href="/login" className="hover:text-white transition-colors">Sandbox Demo</a>
              </div>
            </div>

            {/* Links column 3 */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Legal</h5>
              <div className="flex flex-col gap-2 text-xs font-semibold">
                <span className="hover:text-white cursor-pointer">Terms of Service</span>
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer">Security Audits</span>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
            <p>&copy; 2026 Coaching OS Systems. All rights reserved. Operating under SaaS architecture.</p>
            <p>Designed for B2B Academy Owners.</p>
          </div>
        </div>
      </footer>

      {/* Advanced Conversion Elements */}

      {/* A. Live notifications popup */}
      {liveNotify && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900/95 backdrop-blur text-white border border-slate-800 p-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm animate-fade-in font-mono text-[10px]">
          <span className="size-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
          <span>{liveNotify}</span>
        </div>
      )}

      {/* B. Floating WhatsApp Conversion Badge */}
      <a
        href="https://wa.me/919999999999?text=Interested%20in%20Coaching%20OS%20Software"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white size-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-emerald-500 transition-colors shadow-emerald-500/20"
        title="Chat on WhatsApp"
      >
        <PhoneCall className="size-5 animate-pulse" />
      </a>

      {/* C. Sticky Bottom CTA Bar (on scroll past hero) */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 py-3.5 px-6 z-40 hidden md:flex items-center justify-between shadow-2xl animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">Coaching OS SaaS Platform</span>
            <span className="text-[10px] text-slate-400 font-medium">| Optimize attendance and invoicing.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleFreeTrial} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-[10px] tracking-wider py-2.5 px-5 rounded-xl shadow-md transition-colors">
              Start Free Trial
            </button>
            <button onClick={handleBookDemo} className="text-xs font-bold uppercase text-slate-600 hover:text-indigo-600">
              Book Demo
            </button>
          </div>
        </div>
      )}

      {/* D. Exit Intent Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setShowExitModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="size-5" />
            </button>
            <div className="space-y-2 text-center pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Special Offer</span>
              <h4 className="text-xl font-headline font-bold text-slate-900">Wait! Get a Personalized Onboarding Tour</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Leave your registers behind! Book a live 10-minute setup call with our success specialist and we will import your first 100 students for free.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-1">
              <button onClick={() => { setShowExitModal(false); handleFreeTrial(); }} className="w-full bg-indigo-600 text-white font-bold uppercase text-xs tracking-wider py-3 rounded-xl shadow-md">
                Claim Onboarding & Trial
              </button>
              <button onClick={() => setShowExitModal(false)} className="w-full bg-slate-100 text-slate-650 font-bold uppercase text-xs tracking-wider py-3 rounded-xl hover:bg-slate-200 transition-colors">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================================================
// Helper Subcomponents
// ============================================================================

function ProblemCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-indigo-200 transition-colors">
      <span className="text-3xl font-mono font-extrabold text-slate-150 absolute top-2 right-4 select-none group-hover:text-indigo-100 transition-colors">{num}</span>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}

interface BenefitCardProps {
  icon: React.ComponentType<any>
  stat: string
  title: string
  desc: string
}

function BenefitCard({ icon: Icon, stat, title, desc }: BenefitCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 hover:bg-white hover:border-indigo-300 transition-all group duration-300">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
          <Icon className="size-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">{stat}</span>
          <h4 className="text-sm font-bold text-slate-800 mt-1">{title}</h4>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 relative overflow-hidden">
      <div className="size-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
        {step}
      </div>
      <h4 className="text-base font-bold text-slate-850">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}

interface TestimonialCardProps {
  initials: string
  name: string
  role: string
  review: string
  rating: number
}

function TestimonialCard({ initials, name, role, review, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-200 transition-colors duration-300">
      <div className="space-y-3">
        {/* Stars rating */}
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: rating }).map((_, i) => (
            <span key={i} className="text-xs">★</span>
          ))}
        </div>
        <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
          "{review}"
        </p>
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <div className="size-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0 select-none">
          {initials}
        </div>
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-slate-800">{name}</h5>
          <p className="text-[9px] text-slate-400 font-semibold uppercase">{role}</p>
        </div>
      </div>
    </div>
  )
}

interface FaqItemProps {
  idx: number
  openFaq: number | null
  toggleFaq: (idx: number) => void
  q: string
  a: string
}

function FaqItem({ idx, openFaq, toggleFaq, q, a }: FaqItemProps) {
  const isOpen = openFaq === idx
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-colors">
      <button
        onClick={() => toggleFaq(idx)}
        className="w-full p-4 flex items-center justify-between gap-4 text-left font-semibold text-slate-800 text-xs sm:text-sm hover:text-indigo-600 transition-colors focus:outline-none"
      >
        <span>{q}</span>
        <ChevronDown className={`size-4 text-slate-400 shrink-0 transform transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-200/50 pt-3 animate-fade-in bg-white/40">
          {a}
        </div>
      )}
    </div>
  )
}

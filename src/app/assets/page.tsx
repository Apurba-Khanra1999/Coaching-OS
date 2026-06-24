"use client"

import * as React from "react"
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Wrench, 
  MapPin, 
  Layers, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Activity,
  Archive,
  ArrowUpDown,
  History,
  Download,
  Clock,
  User
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  getActiveTenant, 
  getActiveRole, 
  getScopedData, 
  setScopedData, 
  mockAssetsGenerator, 
  mockAssetLogsGenerator,
  Asset, 
  AssetLog 
} from "@/lib/tenant"

const CATEGORIES = ["Electronics", "Furniture", "Stationery", "Accessories", "Others"] as const
const STATUSES = ["Available", "In Use", "In Repair", "Deprecated"] as const

// Safe normalization to support older single-quantity assets in localStorage
const normalizeAsset = (a: Asset): Required<Asset> => {
  const quantityAvailable = a.quantityAvailable !== undefined ? a.quantityAvailable : (a.status === "Available" ? a.quantity : 0);
  const quantityInUse = a.quantityInUse !== undefined ? a.quantityInUse : (a.status === "In Use" ? a.quantity : 0);
  const quantityInRepair = a.quantityInRepair !== undefined ? a.quantityInRepair : (a.status === "In Repair" ? a.quantity : 0);
  const quantityDeprecated = a.quantityDeprecated !== undefined ? a.quantityDeprecated : (a.status === "Deprecated" ? a.quantity : 0);
  
  // Total sum of granular parts
  const total = quantityAvailable + quantityInUse + quantityInRepair + quantityDeprecated;
  const finalTotal = total > 0 ? total : a.quantity;
  const finalAvailable = total > 0 ? quantityAvailable : (a.status === "Available" ? a.quantity : 0);
  const finalInUse = total > 0 ? quantityInUse : (a.status === "In Use" ? a.quantity : 0);
  const finalInRepair = total > 0 ? quantityInRepair : (a.status === "In Repair" ? a.quantity : 0);
  const finalDeprecated = total > 0 ? quantityDeprecated : (a.status === "Deprecated" ? a.quantity : 0);
  
  // Primary status is the status with the largest share, or fallback
  let primaryStatus = a.status;
  const maxShare = Math.max(finalAvailable, finalInUse, finalInRepair, finalDeprecated);
  if (maxShare === finalAvailable) primaryStatus = "Available";
  else if (maxShare === finalInUse) primaryStatus = "In Use";
  else if (maxShare === finalInRepair) primaryStatus = "In Repair";
  else if (maxShare === finalDeprecated) primaryStatus = "Deprecated";

  return {
    ...a,
    quantityAvailable: finalAvailable,
    quantityInUse: finalInUse,
    quantityInRepair: finalInRepair,
    quantityDeprecated: finalDeprecated,
    quantity: finalTotal,
    status: primaryStatus,
    notes: a.notes || ""
  };
}

export default function AssetManagementPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [activeRole, setActiveRole] = React.useState("")
  const [activeTenantId, setActiveTenantId] = React.useState("")
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [logs, setLogs] = React.useState<AssetLog[]>([])

  // Search, category tabs, and status filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Log Search and Filter states
  const [logSearchQuery, setLogSearchQuery] = React.useState("")
  const [logActionFilter, setLogActionFilter] = React.useState("all")

  // Modal open states
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false)

  // Add Asset Form States (Granular allocations)
  const [addName, setAddName] = React.useState("")
  const [addCategory, setAddCategory] = React.useState<Asset["category"]>("Electronics")
  const [addQtyAvailable, setAddQtyAvailable] = React.useState(1)
  const [addQtyInUse, setAddQtyInUse] = React.useState(0)
  const [addQtyInRepair, setAddQtyInRepair] = React.useState(0)
  const [addQtyDeprecated, setAddQtyDeprecated] = React.useState(0)
  const [addPurchaseDate, setAddPurchaseDate] = React.useState(new Date().toISOString().split("T")[0])
  const [addValue, setAddValue] = React.useState(0)
  const [addLocation, setAddLocation] = React.useState("")
  const [addNotes, setAddNotes] = React.useState("")

  // Edit Asset Form States (Granular allocations)
  const [selectedAsset, setSelectedAsset] = React.useState<Required<Asset> | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editCategory, setEditCategory] = React.useState<Asset["category"]>("Electronics")
  const [editQtyAvailable, setEditQtyAvailable] = React.useState(0)
  const [editQtyInUse, setEditQtyInUse] = React.useState(0)
  const [editQtyInRepair, setEditQtyInRepair] = React.useState(0)
  const [editQtyDeprecated, setEditQtyDeprecated] = React.useState(0)
  const [editPurchaseDate, setEditPurchaseDate] = React.useState("")
  const [editValue, setEditValue] = React.useState(0)
  const [editLocation, setEditLocation] = React.useState("")
  const [editNotes, setEditNotes] = React.useState("")

  React.useEffect(() => {
    setActiveRole(getActiveRole())
    setActiveTenantId(getActiveTenant())
    setAssets(getScopedData<Asset[]>("assets", mockAssetsGenerator))
    setLogs(getScopedData<AssetLog[]>("asset_logs", mockAssetLogsGenerator))
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Mounting Assets Log...</p>
        </div>
      </div>
    )
  }

  // Security gate
  if (activeRole !== "owner" && activeRole !== "super_admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-50/5 text-center">
          <CardHeader className="space-y-2">
            <div className="mx-auto size-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle className="text-lg font-headline font-bold text-red-950">Access Restricted</CardTitle>
            <CardDescription className="text-red-700 text-xs font-medium">
              Only Institute Administrators are permitted to view or manage resources and physical assets directory.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Map local asset state through safe migration normalizer
  const normalizedAssets = assets.map(normalizeAsset)

  // Derived Analytics stats using granular distributed quantities
  const totalUnits = normalizedAssets.reduce((sum, a) => sum + a.quantity, 0)
  const totalValuation = normalizedAssets.reduce((sum, a) => sum + (a.value * a.quantity), 0)
  const unitsInUse = normalizedAssets.reduce((sum, a) => sum + a.quantityInUse, 0)
  const unitsInRepair = normalizedAssets.reduce((sum, a) => sum + a.quantityInRepair, 0)

  // Filtered Assets based on tabs and status allocation filters
  const filteredAssets = normalizedAssets.filter(asset => {
    // Category tab filter
    const matchesCategory = activeCategory === "all" || asset.category === activeCategory

    // Status filter: checks if there are units allocated to that specific state
    let matchesStatus = true
    if (statusFilter !== "all") {
      if (statusFilter === "Available") matchesStatus = asset.quantityAvailable > 0
      else if (statusFilter === "In Use") matchesStatus = asset.quantityInUse > 0
      else if (statusFilter === "In Repair") matchesStatus = asset.quantityInRepair > 0
      else if (statusFilter === "Deprecated") matchesStatus = asset.quantityDeprecated > 0
    }

    // Query filter (Name, ID, Location)
    const query = searchQuery.toLowerCase()
    const matchesQuery = 
      asset.name.toLowerCase().includes(query) || 
      asset.id.toLowerCase().includes(query) || 
      asset.location.toLowerCase().includes(query)

    return matchesCategory && matchesStatus && matchesQuery
  })

  // Filtered logs
  const filteredLogs = logs.filter(log => {
    const matchesAction = logActionFilter === "all" || log.action === logActionFilter
    const query = logSearchQuery.toLowerCase()
    const matchesQuery = 
      log.assetName.toLowerCase().includes(query) || 
      log.description.toLowerCase().includes(query) || 
      log.assetId.toLowerCase().includes(query)
    
    return matchesAction && matchesQuery
  })

  // Append action to logs history
  const logAction = (
    assetId: string, 
    assetName: string, 
    action: AssetLog["action"], 
    description: string
  ) => {
    const newLog: AssetLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      assetId,
      assetName,
      action,
      description,
      timestamp: new Date().toISOString(),
      operator: activeRole === "owner" ? "Owner" : "Super Admin"
    }
    const updatedLogs = [newLog, ...logs]
    setLogs(updatedLogs)
    setScopedData<AssetLog[]>("asset_logs", updatedLogs)
  }

  // Live total sums in forms
  const addTotalQty = addQtyAvailable + addQtyInUse + addQtyInRepair + addQtyDeprecated
  const editTotalQty = editQtyAvailable + editQtyInUse + editQtyInRepair + editQtyDeprecated

  // Add Asset action
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName || addTotalQty <= 0 || addValue < 0 || !addLocation) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please specify name, at least one quantity unit, unit valuation, and storage location.",
      })
      return
    }

    const newId = `AST-${Math.floor(100 + Math.random() * 900)}`
    const newAsset: Asset = {
      id: newId,
      name: addName.trim(),
      category: addCategory,
      quantity: addTotalQty,
      status: addQtyAvailable > 0 ? "Available" : (addQtyInUse > 0 ? "In Use" : (addQtyInRepair > 0 ? "In Repair" : "Deprecated")),
      purchaseDate: addPurchaseDate,
      value: Number(addValue),
      location: addLocation.trim(),
      notes: addNotes.trim(),
      quantityAvailable: addQtyAvailable,
      quantityInUse: addQtyInUse,
      quantityInRepair: addQtyInRepair,
      quantityDeprecated: addQtyDeprecated
    }

    const updated = [...assets, newAsset]
    setAssets(updated)
    setScopedData<Asset[]>("assets", updated)

    // Log action
    const logDesc = `Registered new asset "${addName.trim()}" (Total: ${addTotalQty} units) at "${addLocation.trim()}". Breakdown - Available: ${addQtyAvailable}, In Use: ${addQtyInUse}, In Repair: ${addQtyInRepair}, Deprecated: ${addQtyDeprecated}.`
    logAction(newId, addName.trim(), "Create", logDesc)

    toast({
      title: "Asset Registered",
      description: `Successfully added ${addName} to inventory.`,
    })

    // Reset Form
    setAddName("")
    setAddCategory("Electronics")
    setAddQtyAvailable(1)
    setAddQtyInUse(0)
    setAddQtyInRepair(0)
    setAddQtyDeprecated(0)
    setAddPurchaseDate(new Date().toISOString().split("T")[0])
    setAddValue(0)
    setAddLocation("")
    setAddNotes("")
    setIsAddOpen(false)
  }

  // Open Edit modal
  const openEditModal = (asset: Required<Asset>) => {
    setSelectedAsset(asset)
    setEditName(asset.name)
    setEditCategory(asset.category)
    setEditQtyAvailable(asset.quantityAvailable)
    setEditQtyInUse(asset.quantityInUse)
    setEditQtyInRepair(asset.quantityInRepair)
    setEditQtyDeprecated(asset.quantityDeprecated)
    setEditPurchaseDate(asset.purchaseDate)
    setEditValue(asset.value)
    setEditLocation(asset.location)
    setEditNotes(asset.notes || "")
    setIsEditOpen(true)
  }

  // Edit Asset action
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsset) return

    if (!editName || editTotalQty <= 0 || editValue < 0 || !editLocation) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please specify name, at least one quantity unit, unit cost, and location.",
      })
      return
    }

    const oldA = selectedAsset.quantityAvailable || 0
    const oldU = selectedAsset.quantityInUse || 0
    const oldR = selectedAsset.quantityInRepair || 0
    const oldD = selectedAsset.quantityDeprecated || 0

    const updated = assets.map(a => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          name: editName.trim(),
          category: editCategory,
          quantity: editTotalQty,
          quantityAvailable: editQtyAvailable,
          quantityInUse: editQtyInUse,
          quantityInRepair: editQtyInRepair,
          quantityDeprecated: editQtyDeprecated,
          purchaseDate: editPurchaseDate,
          value: Number(editValue),
          location: editLocation.trim(),
          notes: editNotes.trim()
        }
      }
      return a
    })

    setAssets(updated)
    setScopedData<Asset[]>("assets", updated)

    // Log the update with descriptive breakdown details
    let logDescription = `Updated details for ${editName}.`
    let logType: AssetLog["action"] = "Update"

    const changes: string[] = []
    if (editQtyAvailable !== oldA) changes.push(`Available: ${oldA} ➔ ${editQtyAvailable}`)
    if (editQtyInUse !== oldU) {
      changes.push(`In Use: ${oldU} ➔ ${editQtyInUse}`)
      logType = "Allocate"
    }
    if (editQtyInRepair !== oldR) {
      changes.push(`In Repair: ${oldR} ➔ ${editQtyInRepair}`)
      logType = "Maintenance"
    }
    if (editQtyDeprecated !== oldD) {
      changes.push(`Deprecated: ${oldD} ➔ ${editQtyDeprecated}`)
      logType = "Decommission"
    }

    if (changes.length > 0) {
      logDescription = `Adjusted inventory allocation for "${editName}": ${changes.join(", ")}.`
    } else if (editLocation.trim() !== selectedAsset.location) {
      logDescription = `Relocated "${editName}" storage location from "${selectedAsset.location}" to "${editLocation.trim()}".`
    } else if (Number(editValue) !== selectedAsset.value) {
      logDescription = `Updated unit valuation of "${editName}" to ₹${Number(editValue).toLocaleString()}.`
    }

    logAction(selectedAsset.id, editName.trim(), logType, logDescription)

    toast({
      title: "Asset Updated",
      description: `Successfully adjusted inventory for ${editName}.`,
    })

    setIsEditOpen(false)
    setSelectedAsset(null)
  }

  // Delete action
  const handleDelete = (id: string, name: string) => {
    const assetToDelete = assets.find(a => a.id === id)
    const totalQty = assetToDelete ? assetToDelete.quantity : 0

    const updated = assets.filter(a => a.id !== id)
    setAssets(updated)
    setScopedData<Asset[]>("assets", updated)

    // Log action
    const logDesc = `Permanently removed asset "${name}" (purged all ${totalQty} units from active registry).`
    logAction(id, name, "Delete", logDesc)

    toast({
      title: "Asset Removed",
      description: `Permanently removed ${name} from inventory files.`,
      variant: "destructive"
    })
  }

  // Clear Logs
  const handleClearLogs = () => {
    setLogs([])
    setScopedData<AssetLog[]>("asset_logs", [])
    toast({
      title: "Logs Purged",
      description: "Entire activity history cleared successfully.",
      variant: "destructive",
    })
  }

  // Export logs to CSV
  const handleExportLogsCSV = () => {
    if (logs.length === 0) {
      toast({
        title: "No Logs Available",
        description: "There are no activity logs to export.",
        variant: "destructive",
      })
      return
    }

    const headers = ["Log ID", "Asset ID", "Asset Name", "Action", "Description", "Timestamp", "Operator"]
    const rows = logs.map(log => [
      log.id,
      log.assetId,
      log.assetName,
      log.action,
      `"${log.description.replace(/"/g, '""')}"`,
      new Date(log.timestamp).toLocaleString(),
      log.operator
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${activeTenantId}_asset_audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Logs Exported",
      description: "Asset audit trail CSV downloaded successfully.",
    })
  }

  // Styled log details
  const getLogActionDetails = (action: AssetLog["action"]) => {
    switch (action) {
      case "Create":
        return {
          icon: <Plus className="size-3.5" />,
          bgColor: "bg-green-50",
          textColor: "text-green-600",
          badgeColor: "bg-green-50/50 text-green-700 border-green-200"
        }
      case "Allocate":
        return {
          icon: <Activity className="size-3.5" />,
          bgColor: "bg-indigo-50",
          textColor: "text-indigo-600",
          badgeColor: "bg-indigo-50/50 text-indigo-700 border-indigo-200"
        }
      case "Maintenance":
        return {
          icon: <Wrench className="size-3.5" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-600",
          badgeColor: "bg-amber-50/50 text-amber-700 border-amber-200"
        }
      case "Decommission":
        return {
          icon: <ShieldAlert className="size-3.5" />,
          bgColor: "bg-red-50",
          textColor: "text-red-600",
          badgeColor: "bg-red-50/50 text-red-700 border-red-200"
        }
      case "Delete":
        return {
          icon: <Trash2 className="size-3.5" />,
          bgColor: "bg-slate-100",
          textColor: "text-slate-600",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-300"
        }
      default: // Update
        return {
          icon: <Edit3 className="size-3.5" />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
          badgeColor: "bg-blue-50/50 text-blue-700 border-blue-200"
        }
    }
  }

  const getCategoryBadge = (category: Asset["category"]) => {
    switch (category) {
      case "Electronics":
        return <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200">Electronics</Badge>
      case "Furniture":
        return <Badge variant="outline" className="bg-orange-50/50 text-orange-700 border-orange-200">Furniture</Badge>
      case "Stationery":
        return <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200">Stationery</Badge>
      case "Accessories":
        return <Badge variant="outline" className="bg-purple-50/50 text-purple-700 border-purple-200">Accessories</Badge>
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Others</Badge>
    }
  }

  // Renders the segmented color bar reflecting allocations
  const renderDistributionBar = (asset: Required<Asset>) => {
    const total = asset.quantity
    if (total === 0) return <div className="h-2 w-full rounded-full bg-slate-100" />

    const pctAvailable = (asset.quantityAvailable / total) * 100
    const pctInUse = (asset.quantityInUse / total) * 100
    const pctInRepair = (asset.quantityInRepair / total) * 100
    const pctDeprecated = (asset.quantityDeprecated / total) * 100

    return (
      <div className="space-y-1.5 min-w-[150px] max-w-[220px]">
        {/* Segmented Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 flex overflow-hidden border border-slate-200/40">
          {asset.quantityAvailable > 0 && (
            <div 
              className="bg-green-500 transition-all duration-300 hover:opacity-90" 
              style={{ width: `${pctAvailable}%` }}
              title={`Available (In Store): ${asset.quantityAvailable} units`}
            />
          )}
          {asset.quantityInUse > 0 && (
            <div 
              className="bg-indigo-600 transition-all duration-300 hover:opacity-90" 
              style={{ width: `${pctInUse}%` }}
              title={`In Active Use: ${asset.quantityInUse} units`}
            />
          )}
          {asset.quantityInRepair > 0 && (
            <div 
              className="bg-amber-500 transition-all duration-300 hover:opacity-90" 
              style={{ width: `${pctInRepair}%` }}
              title={`Under Repair: ${asset.quantityInRepair} units`}
            />
          )}
          {asset.quantityDeprecated > 0 && (
            <div 
              className="bg-red-500 transition-all duration-300 hover:opacity-90" 
              style={{ width: `${pctDeprecated}%` }}
              title={`Deprecated / Damaged: ${asset.quantityDeprecated} units`}
            />
          )}
        </div>
        {/* Legend / Compact stats */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-semibold text-slate-500">
          {asset.quantityAvailable > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span>{asset.quantityAvailable} Avail</span>
            </span>
          )}
          {asset.quantityInUse > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="size-1.5 rounded-full bg-indigo-600" />
              <span>{asset.quantityInUse} Use</span>
            </span>
          )}
          {asset.quantityInRepair > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>{asset.quantityInRepair} Repair</span>
            </span>
          )}
          {asset.quantityDeprecated > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="size-1.5 rounded-full bg-red-500" />
              <span>{asset.quantityDeprecated} Depr</span>
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 uppercase tracking-widest rounded-full">
            <Package className="size-3.5" /> Physical Capital Registry
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-slate-900 leading-none">
            Asset Management
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitor, audit, and distribute classroom assets, electronic devices, and stationery resources.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-5 gap-1.5 transition-all hover:-translate-y-0.5 shrink-0 w-full md:w-auto">
              <Plus className="size-4" /> Add Asset Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle className="font-headline font-bold text-lg">Add Asset Info</DialogTitle>
                <DialogDescription className="text-xs">
                  Provision new physical equipment, markers, pens, or classroom furniture to active inventories.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="add-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Asset Name</Label>
                  <Input
                    id="add-name"
                    placeholder="e.g. Dry Erase Markers (Box of 50)"
                    className="rounded-xl text-xs"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-category" className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
                    <Select value={addCategory} onValueChange={(val) => setAddCategory(val as Asset["category"])}>
                      <SelectTrigger id="add-category" className="rounded-xl text-xs bg-white">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-value" className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Valuation (₹)</Label>
                    <Input
                      id="add-value"
                      type="number"
                      min={0}
                      className="rounded-xl text-xs"
                      value={addValue}
                      onChange={(e) => setAddValue(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>

                {/* Granular Allocation Inputs */}
                <div className="border border-indigo-100 bg-indigo-50/25 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Quantity Allocation Breakdown</span>
                    <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-mono font-bold text-[10px]">
                      Total: {addTotalQty} Units
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="add-qty-avail" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Available (In Store)</Label>
                      <Input
                        id="add-qty-avail"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={addQtyAvailable}
                        onChange={(e) => setAddQtyAvailable(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="add-qty-use" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">In Active Use</Label>
                      <Input
                        id="add-qty-use"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={addQtyInUse}
                        onChange={(e) => setAddQtyInUse(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="add-qty-repair" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Under Repair</Label>
                      <Input
                        id="add-qty-repair"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={addQtyInRepair}
                        onChange={(e) => setAddQtyInRepair(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="add-qty-depr" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deprecated / Damaged</Label>
                      <Input
                        id="add-qty-depr"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={addQtyDeprecated}
                        onChange={(e) => setAddQtyDeprecated(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-location" className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage / Room Location</Label>
                    <Input
                      id="add-location"
                      placeholder="e.g. Room 101, Locker 2"
                      className="rounded-xl text-xs"
                      value={addLocation}
                      onChange={(e) => setAddLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-date" className="text-xs font-bold uppercase tracking-wider text-slate-500">Purchase Date</Label>
                    <Input
                      id="add-date"
                      type="date"
                      className="rounded-xl text-xs"
                      value={addPurchaseDate}
                      onChange={(e) => setAddPurchaseDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">Remarks / Notes</Label>
                  <Textarea
                    id="add-notes"
                    placeholder="Provide condition details or accessories specifics..."
                    className="rounded-xl text-xs resize-none h-16"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl text-xs h-9 uppercase tracking-wider" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-wider">
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Summary Panel */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Units Logged</span>
              <p className="text-2xl font-bold font-headline text-slate-800">{totalUnits}</p>
            </div>
            <div className="size-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-650">
              <Archive className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</span>
              <p className="text-2xl font-bold font-headline text-emerald-600">₹{totalValuation.toLocaleString()}</p>
            </div>
            <div className="size-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active In Use</span>
              <p className="text-2xl font-bold font-headline text-indigo-600">{unitsInUse}</p>
            </div>
            <div className="size-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Maintenance</span>
              <p className="text-2xl font-bold font-headline text-amber-600">{unitsInRepair}</p>
            </div>
            <div className="size-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-650">
              <Wrench className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Asset Registry Directory */}
      <Card className="border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-lg font-bold">Assets directory</CardTitle>
            <CardDescription className="text-xs font-medium">
              View, audit, and allocate resources assigned to active workspace ID: <span className="font-bold text-slate-900">{activeTenantId}</span>
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            {/* Search filter */}
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search name, location, ID..."
                className="pl-9 rounded-xl text-xs bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Status Filter (now based on presence of units in those states) */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] rounded-xl text-xs bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s} className="text-xs">Has {s} Units</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <div className="px-6 pt-4 border-b bg-slate-50/50 rounded-t-2xl overflow-x-auto scrollbar-none">
              <TabsList className="bg-slate-100 rounded-lg p-0.5 h-8 w-max flex">
                <TabsTrigger value="all" className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">All Categories</TabsTrigger>
                {CATEGORIES.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-[10px] uppercase tracking-wider font-bold rounded-md px-4 py-1 h-7">{cat}</TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeCategory} className="p-0 m-0">
              
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b">
                      <TableHead className="font-bold uppercase tracking-wider py-3.5 pl-6">Asset ID</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Name</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Category</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Total Qty</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Allocation Distribution</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Location</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Purchase Date</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5">Unit Value</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider py-3.5 text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map(asset => (
                        <TableRow key={asset.id} className="hover:bg-slate-50/40 border-b">
                          <td className="font-semibold text-slate-500 py-4 pl-6 font-mono">{asset.id}</td>
                          <td className="font-bold text-slate-800 py-4">
                            <div>
                              <p className="text-slate-850 font-bold">{asset.name}</p>
                              {asset.notes && <p className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-xs truncate">{asset.notes}</p>}
                            </div>
                          </td>
                          <td className="py-4">{getCategoryBadge(asset.category)}</td>
                          <td className="py-4 font-bold text-slate-700">{asset.quantity} units</td>
                          <td className="py-4">{renderDistributionBar(asset)}</td>
                          <td className="py-4">
                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                              <MapPin className="size-3 text-indigo-650" /> {asset.location}
                            </span>
                          </td>
                          <td className="py-4 font-medium text-slate-550">{asset.purchaseDate}</td>
                          <td className="py-4 font-mono font-bold text-slate-800">₹{asset.value.toLocaleString()}</td>
                          <td className="py-4 text-right pr-6 space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 w-7 p-0 rounded-lg border-slate-200 text-slate-655 hover:bg-slate-50"
                              onClick={() => openEditModal(asset)}
                              title="Edit Asset Allocations"
                            >
                              <Edit3 className="size-3.5" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 w-7 p-0 rounded-lg border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                              onClick={() => handleDelete(asset.id, asset.name)}
                              title="Delete Asset"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                          <div className="flex flex-col items-center gap-2 justify-center">
                            <AlertCircle className="size-5 text-slate-300" />
                            <span>No matching assets found in directory.</span>
                          </div>
                        </td>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE STACKED CARD VIEW */}
              <div className="block md:hidden p-4 space-y-4">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(asset => (
                    <div key={asset.id} className="p-4 rounded-xl border bg-white space-y-3.5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-650" />
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest">{asset.id}</span>
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{asset.name}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          {getCategoryBadge(asset.category)}
                        </div>
                      </div>

                      {/* Segmented Distribution Bar */}
                      <div className="bg-slate-50/50 border rounded-xl p-2.5 space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Allocation Profile</span>
                        {renderDistributionBar(asset)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] font-medium border-t border-slate-100 pt-3">
                        <div className="space-y-0.5">
                          <span className="text-slate-400">Total Quantity</span>
                          <p className="text-slate-850 font-bold">{asset.quantity} units</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-400">Storage Location</span>
                          <p className="text-slate-700 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="size-3 text-indigo-650 shrink-0" /> {asset.location}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-400">Unit Cost</span>
                          <p className="text-slate-800 font-bold font-mono">₹{asset.value.toLocaleString()}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-400">Total Value</span>
                          <p className="text-emerald-600 font-bold font-mono">₹{(asset.value * asset.quantity).toLocaleString()}</p>
                        </div>
                      </div>

                      {asset.notes && (
                        <div className="bg-slate-50 border p-2 rounded-lg text-[10px] text-slate-500 font-medium">
                          <strong>Notes:</strong> {asset.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg text-xs border-slate-200 text-slate-700 gap-1"
                          onClick={() => openEditModal(asset)}
                        >
                          <Edit3 className="size-3.5" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg text-xs border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-1"
                          onClick={() => handleDelete(asset.id, asset.name)}
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 font-medium border border-dashed rounded-xl">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <AlertCircle className="size-5 text-slate-300" />
                      <span>No matching assets found in inventory.</span>
                    </div>
                  </div>
                )}
              </div>

            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Activity Logs & Audit Trail Section */}
      <Card className="border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
              <History className="size-5 text-indigo-600 animate-pulse" /> Activity Log & Audit Trail
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Track real-time campus asset creation, department allocations, maintenance movements, and decommissioning.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
            {/* CSV Export Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl text-xs h-9 font-bold text-slate-700 gap-1.5 bg-white shadow-sm border-slate-200"
              onClick={handleExportLogsCSV}
            >
              <Download className="size-3.5 text-indigo-650" /> Export CSV
            </Button>

            {/* Clear Logs Button (only for owner/super_admin) */}
            {(activeRole === "owner" || activeRole === "super_admin") && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl text-xs h-9 font-bold text-red-600 hover:text-red-700 hover:bg-red-55 border-red-100 gap-1.5"
                onClick={() => setIsClearConfirmOpen(true)}
              >
                <Trash2 className="size-3.5" /> Clear Trail
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row items-center gap-3">
            {/* Search filter */}
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search logs by asset name or description..."
                className="pl-9 rounded-xl text-xs bg-white"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
              />
            </div>
            {/* Action Type Filter */}
            <Select value={logActionFilter} onValueChange={setLogActionFilter}>
              <SelectTrigger className="w-full sm:w-[170px] rounded-xl text-xs bg-white">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Action Types</SelectItem>
                <SelectItem value="Create" className="text-xs">Create / Add</SelectItem>
                <SelectItem value="Allocate" className="text-xs">Allocations</SelectItem>
                <SelectItem value="Maintenance" className="text-xs">Maintenance (Repair)</SelectItem>
                <SelectItem value="Decommission" className="text-xs">Decommissioned</SelectItem>
                <SelectItem value="Update" className="text-xs">General Updates</SelectItem>
                <SelectItem value="Delete" className="text-xs">Deletions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline list */}
          <div className="max-h-[380px] overflow-y-auto p-6 scrollbar-thin">
            {filteredLogs.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 ml-3.5 pl-6 space-y-6">
                {filteredLogs.map((log) => {
                  const actionDetails = getLogActionDetails(log.action)
                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot/icon */}
                      <span className={`absolute -left-[37px] top-1 size-7 rounded-full flex items-center justify-center border-2 border-white ring-4 ring-slate-50 shadow-sm ${actionDetails.bgColor} ${actionDetails.textColor}`}>
                        {actionDetails.icon}
                      </span>
                      
                      <div className="space-y-1.5 bg-white/40 group-hover:bg-white/90 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-sm transition-all">
                        {/* Title line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{log.assetName}</span>
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${actionDetails.badgeColor}`}>
                              {log.action}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="size-3" /> {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {/* Description */}
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {log.description}
                        </p>
                        {/* Footer details */}
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1.5 border-t border-dashed border-slate-100 mt-1">
                          <span className="font-mono">Asset ID: {log.assetId}</span>
                          <span className="flex items-center gap-1 uppercase tracking-widest text-slate-500">
                            <User className="size-2.5 text-slate-400" /> {log.operator}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium border border-dashed rounded-xl">
                <div className="flex flex-col items-center gap-2 justify-center">
                  <AlertCircle className="size-5 text-slate-300" />
                  <span>No log records match your filter criteria.</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedAsset && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className="font-headline font-bold text-lg">Edit Asset Record</DialogTitle>
                <DialogDescription className="text-xs">
                  Modify details and status allocations for the asset tracking record: {selectedAsset.id}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Asset Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g. Dry Erase Markers"
                    className="rounded-xl text-xs"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-category" className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
                    <Select value={editCategory} onValueChange={(val) => setEditCategory(val as Asset["category"])}>
                      <SelectTrigger id="edit-category" className="rounded-xl text-xs bg-white">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-value" className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Valuation (₹)</Label>
                    <Input
                      id="edit-value"
                      type="number"
                      min={0}
                      className="rounded-xl text-xs"
                      value={editValue}
                      onChange={(e) => setEditValue(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>

                {/* Granular Allocation Inputs */}
                <div className="border border-indigo-100 bg-indigo-50/25 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Quantity Allocation Breakdown</span>
                    <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-mono font-bold text-[10px]">
                      Total: {editTotalQty} Units
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="edit-qty-avail" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Available (In Store)</Label>
                      <Input
                        id="edit-qty-avail"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={editQtyAvailable}
                        onChange={(e) => setEditQtyAvailable(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-qty-use" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">In Active Use</Label>
                      <Input
                        id="edit-qty-use"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={editQtyInUse}
                        onChange={(e) => setEditQtyInUse(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-qty-repair" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Under Repair</Label>
                      <Input
                        id="edit-qty-repair"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={editQtyInRepair}
                        onChange={(e) => setEditQtyInRepair(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-qty-depr" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deprecated / Damaged</Label>
                      <Input
                        id="edit-qty-depr"
                        type="number"
                        min={0}
                        className="rounded-xl text-xs h-8 bg-white"
                        value={editQtyDeprecated}
                        onChange={(e) => setEditQtyDeprecated(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-location" className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage / Room Location</Label>
                    <Input
                      id="edit-location"
                      placeholder="e.g. Room 101, Locker 2"
                      className="rounded-xl text-xs"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-date" className="text-xs font-bold uppercase tracking-wider text-slate-500">Purchase Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      className="rounded-xl text-xs"
                      value={editPurchaseDate}
                      onChange={(e) => setEditPurchaseDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">Remarks / Notes</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Provide condition details or accessories specifics..."
                    className="rounded-xl text-xs resize-none h-16"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl text-xs h-9 uppercase tracking-wider" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-wider">
                  Update Record
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear Logs History Safety Confirmation Dialog */}
      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline font-bold text-base text-red-950 flex items-center gap-2">
              <AlertCircle className="size-5 text-red-600" /> Purge Audit Trail?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              This action permanently clears all historical logs and audit entries for this tenant. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="rounded-xl text-xs bg-red-600 hover:bg-red-500 font-bold" onClick={() => {
              handleClearLogs()
              setIsClearConfirmOpen(false)
            }}>
              Yes, Purge History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

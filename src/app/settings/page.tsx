"use client"

import * as React from "react"
import { 
  Settings, 
  Building2, 
  User, 
  Shield, 
  Globe, 
  Bell, 
  Save,
  Upload,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure institute profile, academic sessions, and global preferences.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 min-w-[120px]">
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
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 size-4" /> Change Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">Recommended size: 512x512px. JPG, PNG or SVG.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Institute Name</label>
                    <Input defaultValue="TuitionFlow Academy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Support</label>
                    <Input defaultValue="contact@tuitionflow.edu" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Street Address</label>
                    <Textarea defaultValue="123 Education Square, Science Park, West End" />
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
                    <p className="font-medium">Currency Symbol</p>
                    <p className="text-xs text-muted-foreground">Used for all financial ledgers.</p>
                  </div>
                  <Input className="w-20 text-center font-bold" defaultValue="₹" />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border/50">
                  <div className="space-y-0.5">
                    <p className="font-medium">Multi-Batch Assignment</p>
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
                    <span>Auto-Attendance SMS for Absentees</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Attendance Warning (Below 75%)</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Automatic Receipt Email</span>
                    <Switch defaultChecked />
                  </div>
               </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

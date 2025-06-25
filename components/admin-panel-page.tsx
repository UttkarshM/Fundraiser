"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Settings,
  Heart,
  FileText,
  UserCheck,
} from "lucide-react"

const sidebarItems = [
  { title: "All Campaigns", icon: BarChart3, href: "/admin" },
  { title: "Users", icon: Users, href: "/admin/users" },
  { title: "Approvals", icon: UserCheck, href: "/admin/approvals" },
  { title: "Reports", icon: FileText, href: "/admin/reports" },
]

const campaigns = [
  {
    id: 1,
    name: "Emergency Relief Fund",
    status: "Active",
    raised: 15000,
    goal: 25000,
    creator: "Sarah Johnson",
    endDate: "2024-02-15",
  },
  {
    id: 2,
    name: "Education Scholarship",
    status: "Pending",
    raised: 0,
    goal: 15000,
    creator: "Michael Chen",
    endDate: "2024-03-01",
  },
  {
    id: 3,
    name: "Health Initiative",
    status: "Ended",
    raised: 12000,
    goal: 20000,
    creator: "Emily Rodriguez",
    endDate: "2024-01-30",
  },
]

const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Employee",
    status: "Active",
    campaignCount: 2,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    role: "Manager",
    status: "Active",
    campaignCount: 1,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    role: "Employee",
    status: "Inactive",
    campaignCount: 3,
  },
]

const chartData = [
  { month: "Jan", raised: 4000 },
  { month: "Feb", raised: 3000 },
  { month: "Mar", raised: 5000 },
  { month: "Apr", raised: 4500 },
  { month: "May", raised: 6000 },
  { month: "Jun", raised: 5500 },
]

const campaignPerformance = [
  { name: "Emergency Relief", raised: 15000, goal: 25000 },
  { name: "Education Fund", raised: 8500, goal: 15000 },
  { name: "Health Initiative", raised: 12000, goal: 20000 },
]

function AdminSidebar() {
  return (
    <Sidebar className="border-r-0 bg-white/50 backdrop-blur">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-lg font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Admin Panel
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-xl">
                    <a href={item.href} className="flex items-center space-x-3 px-4 py-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function AdminPanelPage() {
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCampaigns = campaigns.filter(
    (campaign) => statusFilter === "all" || campaign.status.toLowerCase() === statusFilter,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SidebarProvider>
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600">Manage campaigns, users, and platform settings</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="campaigns" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white shadow-lg p-1">
                  <TabsTrigger value="campaigns" className="rounded-xl">
                    Campaigns
                  </TabsTrigger>
                  <TabsTrigger value="users" className="rounded-xl">
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="approvals" className="rounded-xl">
                    Approvals
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="rounded-xl">
                    Reports
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="space-y-6">
                  <Card className="rounded-3xl shadow-lg border-0 bg-white">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">All Campaigns</CardTitle>
                          <CardDescription className="text-gray-600">
                            Manage and monitor all fundraising campaigns
                          </CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-48 rounded-xl">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Raised</TableHead>
                            <TableHead>Goal</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCampaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell className="font-medium">{campaign.name}</TableCell>
                              <TableCell>{campaign.creator}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    campaign.status === "Active"
                                      ? "default"
                                      : campaign.status === "Pending"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className={
                                    campaign.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : campaign.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {campaign.status}
                                </Badge>
                              </TableCell>
                              <TableCell>${campaign.raised.toLocaleString()}</TableCell>
                              <TableCell>${campaign.goal.toLocaleString()}</TableCell>
                              <TableCell>{campaign.endDate}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {campaign.status === "Pending" && (
                                    <>
                                      <Button size="sm" className="bg-green-600 text-white">
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive">
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-gray-700 border-gray-300"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-gray-700 border-gray-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-gray-700 border-gray-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                  <Card className="rounded-3xl shadow-lg border-0 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900">User Management</CardTitle>
                      <CardDescription className="text-gray-600">Manage user accounts and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Campaign Count</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.status === "Active" ? "default" : "secondary"}
                                  className={
                                    user.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.campaignCount}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-gray-700 border-gray-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-gray-700 border-gray-300"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="approvals" className="space-y-6">
                  <Card className="rounded-3xl shadow-lg border-0 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900">Pending Approvals</CardTitle>
                      <CardDescription className="text-gray-600">
                        Review and approve new campaign submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {campaigns
                          .filter((c) => c.status === "Pending")
                          .map((campaign) => (
                            <div key={campaign.id} className="p-6 bg-gray-50 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                                  <p className="text-gray-600">Created by {campaign.creator}</p>
                                  <p className="text-sm text-gray-500">Goal: ${campaign.goal.toLocaleString()}</p>
                                </div>
                                <div className="flex space-x-3">
                                  <Button className="bg-green-600 text-white">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button variant="destructive">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button variant="outline" className="bg-white text-gray-700 border-gray-300">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Review
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="rounded-3xl shadow-lg border-0 bg-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900">Total Raised Over Time</CardTitle>
                        <CardDescription className="text-gray-600">Monthly fundraising performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="raised" stroke="#3b82f6" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-lg border-0 bg-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900">Campaign Performance</CardTitle>
                        <CardDescription className="text-gray-600">Raised vs Goal comparison</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={campaignPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="raised" fill="#3b82f6" />
                            <Bar dataKey="goal" fill="#e5e7eb" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

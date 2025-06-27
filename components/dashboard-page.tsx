"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { getUserSession } from "@/lib/actions/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  Plus,
  Users,
  Target,
  TrendingUp,
  Edit,
  Eye,
  Settings,
  Heart,
  PlusCircle,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { title } from "process"

const sidebarItems = [
  {title: "Dashboard", icon: BarChart3, href: "/dashboard"},
  { title: "Campaigns", icon: BarChart3, href: "/causes" },
  { title: "Create Campaign", icon: PlusCircle, href: "/create-campaign" },
  { title: "Donations", icon: DollarSign, href: "/donations" },
  { title: "Sentiment", icon: TrendingUp, href: "/sentiment" },
  { title: "Settings", icon: Settings, href: "/settings" },
]

const campaigns = [
  {
    id: 1,
    name: "Emergency Relief Fund",
    status: "Active",
    raised: 15000,
    goal: 25000,
    endDate: "2024-02-15",
    progress: 60,
  },
  {
    id: 2,
    name: "Education Scholarship",
    status: "Active",
    raised: 8500,
    goal: 15000,
    endDate: "2024-03-01",
    progress: 57,
  },
  {
    id: 3,
    name: "Health Initiative",
    status: "Ended",
    raised: 12000,
    goal: 20000,
    endDate: "2024-01-30",
    progress: 60,
  },
]

function AppSidebar() {

  useEffect(() => {
    console.log("AppSidebar mounted");

    const fetchSession = async () => {
      const { data } = await getUserSession();
      console.log("User session data:", data?.user?.email);
    };

    fetchSession();
  }, []);

  return (
    <Sidebar className="border-r-0 bg-white/50 backdrop-blur">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 mb-6 text-lg font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            FundRaise
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 mt-4">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-xl">
                    <Link href={item.href} className="flex items-center space-x-3 px-4 py-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
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

export function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-6">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Manage your fundraising campaigns</p>
                  </div>
                </div>
                <Link href="/create-campaign">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3">
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="rounded-3xl shadow-lg border-0 bg-white">
                  <CardHeader className="pb-6 pt-8 px-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-700">Total Raised</CardTitle>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-bold text-gray-900 mb-3">$35,500</div>
                    <p className="text-sm text-gray-600">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-lg border-0 bg-white">
                  <CardHeader className="pb-6 pt-8 px-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-700">Active Campaigns</CardTitle>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-bold text-gray-900 mb-3">3</div>
                    <p className="text-sm text-gray-600">2 ending this month</p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-lg border-0 bg-white">
                  <CardHeader className="pb-6 pt-8 px-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-700">Total Donors</CardTitle>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-bold text-gray-900 mb-3">142</div>
                    <p className="text-sm text-gray-600">Across all campaigns</p>
                  </CardContent>
                </Card>
              </div>

              {/* Campaigns Table */}
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader className="pt-8 px-8 pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">My Campaigns</CardTitle>
                  <CardDescription className="text-gray-600">
                    Track the performance of your fundraising campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Raised</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id} className="h-16">
                          <TableCell className="font-medium py-4">{campaign.name}</TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={campaign.status === "Active" ? "default" : "secondary"}
                              className={
                                campaign.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">${campaign.raised.toLocaleString()}</TableCell>
                          <TableCell className="py-4">${campaign.goal.toLocaleString()}</TableCell>
                          <TableCell className="py-4">{campaign.endDate}</TableCell>
                          <TableCell className="py-4">
                            <div className="flex space-x-3">
                              <Button size="sm" variant="outline" className="bg-white text-gray-700 border-gray-300">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Link href={`/campaign/${campaign.id}`}>
                                <Button size="sm" variant="outline" className="bg-white text-gray-700 border-gray-300">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

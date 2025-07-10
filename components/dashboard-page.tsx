"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect,useState } from "react"
import { getUserCampaigns } from "@/lib/actions/campaigns"

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
  Target,
  TrendingUp,
  Edit,
  Eye,
  Settings,
  Heart,
  PlusCircle,
} from "lucide-react"
import Link from "next/link"
import { CampaignDisplayTable } from "@/lib/actions/types"

const sidebarItems = [
  {title: "Dashboard", icon: BarChart3, href: "/dashboard"},
  { title: "Campaigns", icon: BarChart3, href: "/causes" },
  { title: "Create Campaign", icon: PlusCircle, href: "/create-campaign" },
  { title: "Sentiment", icon: TrendingUp, href: "/sentiment" },
  { title: "Settings", icon: Settings, href: "/settings" },
]



function AppSidebar() {

  return (
    <Sidebar className="border-r-0 bg-white/50 backdrop-blur">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 mb-6 text-lg font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-[#78bcc4] rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            FundRaiser
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
  
  const [donations, setDonations] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<CampaignDisplayTable[]>([]);
  const [active_status,setactive_status] = useState<number>(0);
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const {data} = await getUserCampaigns();
        setCampaigns(data);
        
        // Calculate total raised from user's campaigns
        let totalRaised = 0;
        let activeCount = 0;
        
        data.forEach((campaign: CampaignDisplayTable) => {
          // Add the current_amount (money raised) from each campaign
          totalRaised += campaign.current_amount;
          
          if(campaign.status == "active"){
            activeCount += 1;
          }
        });
        
        setDonations(totalRaised);
        setactive_status(activeCount);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();

    // fetchSession();
  }, []);
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
                <div className="flex items-center space-x-4">
                  <Link href="/settings">
                    <Button variant="outline" className="bg-white text-gray-700 border-gray-300 rounded-xl px-4 py-3">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/create-campaign">
                    <Button className="bg-[#f7444e] hover:bg-[#002c3f] text-white rounded-xl px-6 py-3">
                      <Plus className="w-4 h-4 mr-2" />
                      New Campaign
                    </Button>
                  </Link>
                </div>
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
                    <div className="text-3xl font-bold text-gray-900 mb-3">${donations}</div>
                    <p className="text-sm text-gray-600">across {campaigns.length} campaigns</p>
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
                    <div className="text-3xl font-bold text-gray-900 mb-3">{active_status}</div>
                    <p className="text-sm text-gray-600">Out of {campaigns.length}</p>
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
                          <TableCell className="font-medium py-4">{campaign.title}</TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={campaign.status === "active" ? "default" : "secondary"}
                              className={
                                campaign.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">${campaign.current_amount.toLocaleString()}</TableCell>
                          <TableCell className="py-4">${campaign.goal.toLocaleString()}</TableCell>
                          <TableCell className="py-4">
                            {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("en-US", {
                              day: "numeric", month: "short", year: "numeric",}) : "N/A"}
                            </TableCell>
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
                                <Button
                                size="sm"
                                variant="outline"
                                className=" text-white bg-[#f7444e] hover:bg-[#002c3f] hover:text-white hover:border-[#002c3f]"
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v2H9V4a1 1 0 011-1zm-7 4h18" />
                                </svg>
                                </Button>
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

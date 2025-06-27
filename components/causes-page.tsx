"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Search, Filter, Heart, Users, Calendar, MapPin, Target } from "lucide-react"
import Link from "next/link"
import { getCampaigns } from "@/lib/actions/campaigns"


function calculateDaysLeft(createdAt: string): number {
  const createdDate = new Date(createdAt)
  const today = new Date()
  const diffTime = today.getTime() - createdDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const campaignDuration = 30
  return Math.max(campaignDuration - diffDays, 0)
}

export function CausesPage() {
  const [causes, setCauses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("progress")

  useEffect(() => {
    getCampaigns()
      .then((data) => {
        if (data && Array.isArray(data)) {
          const transformed = data.map((item: any) => {
            const raised = 0 // placeholder for now
            const goal = Number(item.goal) || 10000
            const progress = Math.min(Math.round((raised / goal) * 100), 100)

            return {
              id: item.id,
              title: item.title || "Untitled Campaign",
              description: item.description || "No description provided.",
              category: "Community",
              location: "Global",
              image: item.image || "/placeholder.svg",
              raised,
              goal,
              progress,
              donors: 0,
              daysLeft: calculateDaysLeft(item.created_at),
              urgency: "Medium",
              tags: [],
            }
          })

          setCauses(transformed)
          console.log("Transformed campaigns:", transformed)
        } else {
          console.error("No campaigns found")
        }
      })
      .catch((error) => {
        console.error("Error fetching campaigns:", error)
      })
  }, [])

  const filteredAndSortedCauses = useMemo(() => {
    const filtered = causes.filter((cause) => {
      const matchesSearch =
        cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cause.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cause.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

return matchesSearch
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.progress - a.progress
        case "raised":
          return b.raised - a.raised
        case "donors":
          return b.donors - a.donors
        case "daysLeft":
          return a.daysLeft - b.daysLeft
        case "urgency":
          const urgencyOrder = { High: 3, Medium: 2, Low: 1 }
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, sortBy, causes])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Causes</h1>
          <p className="text-xl text-gray-600">
            Discover meaningful fundraising campaigns and make a difference in causes you care about
          </p>
        </div>

        <Card className="rounded-3xl shadow-lg border-0 bg-white mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
            <CardDescription>Find the perfect cause to support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search causes, keywords, or tags..."
                className="pl-12 rounded-xl border-gray-200 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-xl border-gray-200 h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="raised">Amount Raised</SelectItem>
                    <SelectItem value="donors">Number of Donors</SelectItem>
                    <SelectItem value="daysLeft">Days Remaining</SelectItem>
                    <SelectItem value="urgency">Urgency Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedCauses.length} of {causes.length} causes
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedCauses.map((cause) => (
            <Card
              key={cause.id}
              className="overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                <img
                  src={cause.image}
                  alt={cause.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={getUrgencyColor(cause.urgency)}>
                    {cause.urgency} Priority
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    {cause.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {cause.title}
                </CardTitle>
                <CardDescription className="text-gray-600 line-clamp-2">
                  {cause.description}
                </CardDescription>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {cause.location}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>${cause.raised.toLocaleString()} raised</span>
                      <span>${cause.goal.toLocaleString()} goal</span>
                    </div>
                    <Progress value={cause.progress} className="h-3 rounded-full" />
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {cause.donors} donors
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {cause.daysLeft} days left
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {cause.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/campaign/${cause.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
                        <Heart className="w-4 h-4 mr-2" />
                        Donate
                      </Button>
                    </Link>
                    <Link href={`/campaign/${cause.id}`}>
                      <Button
                        variant="outline"
                        className="bg-white text-gray-700 border-gray-300 rounded-xl px-4"
                      >
                        <Target className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedCauses.length === 0 && (
          <Card className="rounded-3xl shadow-lg border-0 bg-white text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No causes found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more causes.
              </p>
              <Button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

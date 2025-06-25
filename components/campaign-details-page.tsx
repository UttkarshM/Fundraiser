"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { Share2, Copy, Mail, Heart, Calendar, Users } from "lucide-react"

const campaign = {
  id: 1,
  title: "Emergency Relief Fund",
  description:
    "Supporting colleagues affected by natural disasters. This fund will provide immediate financial assistance to team members who have been impacted by recent natural disasters, helping them with emergency expenses, temporary housing, and basic necessities during their recovery period.",
  image: "/placeholder.svg?height=400&width=800",
  raised: 15000,
  goal: 25000,
  progress: 60,
  endDate: "February 15, 2024",
  donors: 89,
  daysLeft: 12,
}

const donors = [
  {
    name: "Sarah Johnson",
    amount: 250,
    message: "Happy to help our team members in need. Stay strong!",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SJ",
  },
  {
    name: "Michael Chen",
    amount: 500,
    message: "Wishing everyone affected a speedy recovery.",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MC",
  },
  {
    name: "Emily Rodriguez",
    amount: 100,
    message: "Every little bit helps. Sending love and support.",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "ER",
  },
  {
    name: "David Kim",
    amount: 300,
    message: "Together we can make a difference!",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "DK",
  },
]

export function CampaignDetailsPage({ campaignId }: { campaignId: string }) {
  const [donationAmount, setDonationAmount] = useState("")
  const [donationMessage, setDonationMessage] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Campaign Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
          <div className="bg-white rounded-3xl shadow-lg p-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2 px-4">
              <span>${campaign.raised.toLocaleString()} raised</span>
              <span>${campaign.goal.toLocaleString()} goal</span>
            </div>
            <Progress value={campaign.progress} className="h-4 rounded-full" />
            <div className="flex justify-between items-center mt-4 px-4 pb-2">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {campaign.donors} donors
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {campaign.daysLeft} days left
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{campaign.progress}%</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Image */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <img
                  src={campaign.image || "/placeholder.svg"}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Description */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">{campaign.description}</p>
              </CardContent>
            </Card>

            {/* Donors List */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">Recent Donors</CardTitle>
                <CardDescription>Thank you to everyone who has contributed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {donors.map((donor, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={donor.avatar || "/placeholder.svg"} alt={donor.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {donor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{donor.name}</h4>
                          <span className="font-bold text-green-600">${donor.amount}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{donor.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Form */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Make a Donation
                </CardTitle>
                <CardDescription>Support this important cause</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-8 rounded-xl border-gray-200 h-12"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 rounded-xl"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <Textarea
                    placeholder="Leave a message of support..."
                    className="rounded-xl border-gray-200 resize-none"
                    rows={3}
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium">
                  Donate Now
                </Button>
              </CardContent>
            </Card>

            {/* Share Campaign */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Campaign
                </CardTitle>
                <CardDescription>Help spread the word</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full bg-white text-gray-700 border-gray-300 rounded-xl h-12 justify-start"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white text-gray-700 border-gray-300 rounded-xl h-12 justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Share via Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

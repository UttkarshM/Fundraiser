"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { Heart, Calendar} from "lucide-react"
import { createDonation, getCampaignById } from "@/lib/actions"
import { CampaignDisplayTable } from "@/lib/actions/types"
import { AuthResult } from "@/lib/actions"
import { CreateDonationData } from "@/lib/actions"
import { getDonationsByCampaign } from "@/lib/actions"
export function CampaignDetailsPage({ campaignId }: { campaignId: string }) {
  const [campaign, setCampaign] = useState<CampaignDisplayTable>();
  const [donations, setDonations] = useState<any[]>([]);
  const [donationAmount, setDonationAmount] = useState("")
  const [donationMessage, setDonationMessage] = useState("")
 
  useEffect(() => {
    fetchCampaignData();
  },[])
  
  const fetchCampaignData = async () => {
    const {data} = await getCampaignById(campaignId);
    setCampaign(data);

    const response = await getDonationsByCampaign(campaignId, true); // Include anonymous donations
    
    if (response.success && response.data) {
      setDonations(response.data);
    }
  }

  const handleDonation = async () => {
    if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    
    const donationData: CreateDonationData = {
      campaign_id: campaignId,
      amount: Number(donationAmount),
      message: donationMessage,
      is_anonymous: false, 
      payment_method: "credit_card",
      payment_status: "completed", // initially we set it to completed
    };

    const authResult :AuthResult = await createDonation(donationData);
    if (!authResult.success) {
      console.error("Error creating donation:", authResult.error);
      alert(`Error: ${authResult.error}`);
      return;
    }
    alert(`Thank you for your donation of $${donationData.amount}!`);
    
    // Reset form fields
    setDonationAmount("");
    setDonationMessage("");

    // Refresh campaign and donations data
    await fetchCampaignData();
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Campaign Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{campaign?.title}</h1>
          <div className="bg-white rounded-3xl shadow-lg p-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2 px-4">
              <span>${campaign?.current_amount.toLocaleString()} raised</span>
              <span>${campaign?.goal.toLocaleString()} goal</span>
            </div>
            <Progress value={campaign ? (campaign.current_amount / campaign.goal) * 100 : 0} className="h-4 rounded-full" />
            <div className="flex justify-between items-center mt-4 px-4 pb-2">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {/* <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {campaign.donors} donors
                </div> */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {campaign?.days_left} days left
                </div>
              </div>
              {/* <div className="text-2xl font-bold text-gray-900">{campaign.progress}%</div> */}
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
                  src={campaign?.image_url || "/placeholder.png"}
                  alt={campaign?.title}
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
                <p className="text-gray-700 leading-relaxed text-lg">{campaign?.description}</p>
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
                  {donations.length > 0 ? (
                    donations.map((donation) => (
                      <div key={donation.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={donation.user_profiles?.avatar_url || "/placeholder.png"} 
                            alt={donation.user_profiles?.full_name || "Anonymous"} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                            {donation.user_profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {donation.is_anonymous ? 'Anonymous' : donation.user_profiles?.full_name || 'Anonymous'}
                            </h4>
                            <span className="font-bold text-green-600">${donation.amount}</span>
                          </div>
                          {donation.message && (
                            <p className="text-gray-600 text-sm">{donation.message}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No donations yet. Be the first to support this campaign!</p>
                    </div>
                  )}
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

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium" onClick={handleDonation}>
                  Donate Now
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

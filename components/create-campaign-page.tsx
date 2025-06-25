"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { CalendarIcon, Upload, Eye } from "lucide-react"
import { format } from "date-fns"

export function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    description: "",
    image: null as File | null,
  })
  const [endDate, setEndDate] = useState<Date>()
  const [imagePreview, setImagePreview] = useState<string>("")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const previewData = {
    title: formData.title || "Your Campaign Title",
    goal: Number.parseInt(formData.goal) || 10000,
    raised: Math.floor((Number.parseInt(formData.goal) || 10000) * 0.3),
    description: formData.description || "Your campaign description will appear here...",
    image: imagePreview || "/placeholder.svg?height=200&width=300",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New Campaign</h1>
          <p className="text-xl text-gray-600">Start a fundraiser to make a difference in your company</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">Campaign Details</CardTitle>
                <CardDescription>Fill in the information about your fundraising campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 font-medium">
                    Campaign Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling campaign title"
                    className="rounded-xl border-gray-200 h-12"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-gray-700 font-medium">
                    Fundraising Goal
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <Input
                      id="goal"
                      type="number"
                      placeholder="0.00"
                      className="pl-8 rounded-xl border-gray-200 h-12"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal rounded-xl border-gray-200 h-12 bg-white text-gray-700"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign, its purpose, and how the funds will be used..."
                    className="rounded-xl border-gray-200 resize-none min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Banner Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload banner image</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium">
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0 bg-white sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </CardTitle>
                <CardDescription>See how your campaign will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden">
                    <img
                      src={previewData.image || "/placeholder.svg"}
                      alt="Campaign preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{previewData.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{previewData.description}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>${previewData.raised.toLocaleString()} raised</span>
                      <span>${previewData.goal.toLocaleString()} goal</span>
                    </div>
                    <Progress value={(previewData.raised / previewData.goal) * 100} className="h-3 rounded-full" />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
                    disabled
                  >
                    Donate Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

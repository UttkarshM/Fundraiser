"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Upload, CalendarIcon, Eye, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"

import {
  createCampaign,
  CreateCampaignData,
  uploadCampaignImage,
} from "@/lib/actions/campaigns"

export function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    description: "",
    image: null as File | null,
    category: "",
  })
  const [endDate, setEndDate] = useState<Date>()
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

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

  const handleCreateCampaign = async () => {
    setError("")
    setSuccess(false)
    
    // Validation
    if (!formData.title || !formData.goal || !formData.description) {
      setError("Please fill in all required fields.")
      return
    }

    const goalAmount = parseFloat(formData.goal)
    if (isNaN(goalAmount) || goalAmount <= 0) {
      setError("Please enter a valid goal amount greater than 0.")
      return
    }

    setIsLoading(true)

    try {
      let imageUrl = ""
      
      // Upload image if provided
      if (formData.image) {
        const uploadResult = await uploadCampaignImage(formData.image)
        if (!uploadResult.success) {
          setError(uploadResult.error || "Failed to upload image")
          setIsLoading(false)
          return
        }
        imageUrl = uploadResult.data?.publicUrl || ""
      }

      // Create campaign data
      const campaignData: CreateCampaignData = {
        title: formData.title,
        goal: goalAmount,
        description: formData.description,
        image_url: imageUrl,
        category: formData.category || undefined,
        end_date: endDate ? endDate.toISOString() : undefined,
      }

      const result = await createCampaign(campaignData)

      if (result.success) {
        setSuccess(true)
        // Reset form
        setFormData({
          title: "",
          goal: "",
          description: "",
          image: null,
          category: "",
        })
        setImagePreview("")
        setEndDate(undefined)
      } else {
        setError(result.error || "Failed to create campaign")
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const previewData = {
    title: formData.title || "Your Campaign Title",
    goal: Number.parseInt(formData.goal) || 10000,
    raised: Math.floor((Number.parseInt(formData.goal) || 10000) * 0.3),
    description: formData.description || "Your campaign description will appear here...",
    image: imagePreview || "/placeholder.png?height=200&width=300",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New Campaign</h1>
          <p className="text-xl text-gray-600">
            Start a fundraiser to make a difference in your company
          </p>
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
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 font-medium">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling campaign title"
                    className="rounded-xl border-gray-200 h-12"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-gray-700 font-medium">Fundraising Goal *</Label>
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

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-xl border border-gray-200 h-12 px-3 bg-white text-gray-700"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    <option value="health">Health & Medical</option>
                    <option value="education">Education</option>
                    <option value="community">Community</option>
                    <option value="environment">Environment</option>
                    <option value="sports">Sports & Recreation</option>
                    <option value="arts">Arts & Culture</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* End Date */}
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign, its purpose, and how the funds will be used..."
                    className="rounded-xl border-gray-200 resize-none min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Image Upload */}
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
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-green-700">Campaign created successfully!</p>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium disabled:opacity-50"
                  onClick={handleCreateCampaign}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Campaign..." : "Create Campaign"}
                </Button>
              </CardContent>
            </Card>
          </div>

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
                      src={previewData.image}
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
                      <span>${0} raised</span>
                      <span>${previewData.goal.toLocaleString()} goal</span>
                    </div>
                    <Progress
                      value={0}
                      className="h-3 rounded-full"
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl" disabled>
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

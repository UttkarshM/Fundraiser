import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { ArrowRight, Users, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

const featuredCampaigns = [
  {
    id: 1,
    title: "Emergency Relief Fund",
    description: "Supporting colleagues affected by natural disasters",
    image: "/placeholder.png?height=200&width=300",
    raised: 15000,
    goal: 25000,
    progress: 60,
  },
  {
    id: 2,
    title: "Education Scholarship Program",
    description: "Helping employees' children pursue higher education",
    image: "/placeholder.png?height=200&width=300",
    raised: 8500,
    goal: 15000,
    progress: 57,
  },
  {
    id: 3,
    title: "Health & Wellness Initiative",
    description: "Mental health support for our team members",
    image: "/placeholder.png?height=200&width=300",
    raised: 12000,
    goal: 20000,
    progress: 60,
  },
]

const impactMetrics = [
  {
    title: "Total Raised",
    value: "$125,000",
    icon: Target,
    description: "Across all campaigns",
  },
  {
    title: "Total Donors",
    value: "1,250",
    icon: Users,
    description: "Active contributors",
  },
  {
    title: "Active Campaigns",
    value: "24",
    icon: TrendingUp,
    description: "Currently running",
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Make a Difference
            <span className="bg-[#f7444e] bg-clip-text text-transparent block">
              Together
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start or support fundraisers within your company and create meaningful impact for causes that matter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-campaign">
              <Button
                size="lg"
                className="bg-[#f7444e] text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Fundraising
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/causes">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-gray-700 border-gray-300 px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Campaigns</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <img
                    src={campaign.image || "/placeholder.png"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">{campaign.title}</CardTitle>
                  <CardDescription className="text-gray-600">{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>${campaign.raised.toLocaleString()} raised</span>
                        <span>${campaign.goal.toLocaleString()} goal</span>
                      </div>
                      <Progress value={campaign.progress} className="h-3 rounded-full" />
                    </div>
                    <Link href={`/campaign/${campaign.id}`}>
                      <Button className="w-full bg-[#f7444e] text-white rounded-xl">
                        Donate Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {impactMetrics.map((metric, index) => (
              <Card key={index} className="text-center rounded-3xl shadow-lg border-0 bg-white p-8">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</h3>
                  <p className="text-lg font-semibold text-gray-700 mb-1">{metric.title}</p>
                  <p className="text-gray-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

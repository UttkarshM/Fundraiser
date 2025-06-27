"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Brain, Smile, Meh, Frown, Search, TrendingUp, TrendingDown, Minus, ExternalLink, Globe } from "lucide-react"

interface Article {
  Title: string
  Summary: string
  Sentiment: "Positive" | "Neutral" | "Negative"
  url?: string
}

interface SentimentDistribution {
  Positive: number
  Neutral: number
  Negative: number
}

interface CoverageDifference {
  Similarities: string
  Differences: string
}

interface TopicOverlap {
  "Common Topics": string
  [key: string]: string // For unique topics in each article
}

interface CompanySentimentResult {
  Company: string
  Articles: Article[]
  "Comparative Sentiment Score": {
    "Sentiment Distribution": SentimentDistribution
  }
  "Coverage Differences": CoverageDifference[]
  "Topic Overlap": TopicOverlap
  "Final Sentiment Analysis": string
  "Audio File"?: string
  timestamp: string
}

// Mock data for demonstration
const mockCompanyData: CompanySentimentResult = {
  company: "Nvidia",
  sentimentDistribution: {
    positive: 12,
    neutral: 5,
    negative: 3
  },
  articles: [
    {
      title: "NVIDIA Reports Record Q4 Revenue Driven by Data Center Growth",
      summary: "NVIDIA Corporation reported record fourth-quarter revenue of $60.9 billion, up 22% from the previous quarter and up 409% from a year ago, driven primarily by strong demand for AI computing.",
      sentiment: "Positive"
    },
    {
      title: "NVIDIA's AI Chip Dominance Continues with New Product Launches",
      summary: "The company maintains its leadership position in the AI chip market with innovative product launches and strategic partnerships across multiple industries.",
      sentiment: "Positive"
    },
    {
      title: "Regulatory Concerns Around AI Chip Exports",
      summary: "Recent discussions about potential export restrictions on advanced AI chips have raised questions about future international sales and market expansion.",
      sentiment: "Negative"
    },
    {
      title: "NVIDIA Stock Price Analysis and Market Performance",
      summary: "Technical analysis of NVIDIA's stock performance shows mixed signals with strong fundamentals but volatile market conditions affecting short-term movements.",
      sentiment: "Neutral"
    }
  ],
  commonTopics: ["AI technology", "Data centers", "Revenue growth", "Market leadership"],
  uniqueTopics: ["Export regulations", "Chip manufacturing", "Gaming segment"],
  finalAnalysis: "NVIDIA shows overwhelmingly positive sentiment driven by strong financial performance and AI market leadership. While regulatory concerns exist, the overall outlook remains bullish with strong fundamentals supporting continued growth in the AI and data center markets.",
  timestamp: new Date().toLocaleString()
}

export function SentimentAnalysisPage() {
  const [companyName, setCompanyName] = useState("")
  const [currentResult, setCurrentResult] = useState<CompanySentimentResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeCompanySentiment = async () => {
    if (!companyName.trim()) return

    setIsAnalyzing(true)
    setError(null)

    try {
      // Call the Python Flask API at localhost:5000
      console.log(`Making API call to: http://localhost:5000/fetch/${encodeURIComponent(companyName)}`)
      const response = await fetch(`http://localhost:5000/fetch/${encodeURIComponent(companyName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('API response:', data)
      if (data.error) {
        throw new Error(data.error)
      }

      // Parse the response from the Python API
      let analysisResult
      try {
        // Handle different response formats from the backend
        if (data.Response) {
          // Old format: response is in "Response" field (might be string or object)
          if (typeof data.Response === 'string') {
            // Try to parse as JSON first
            try {
              analysisResult = JSON.parse(data.Response)
            } catch {
              // If JSON parsing fails, try to parse Python dict format
              const pythonDictStr = data.Response.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false')
              analysisResult = JSON.parse(pythonDictStr)
            }
          } else {
            analysisResult = data.Response
          }
        } else {
          // New format: response is the data object itself
          analysisResult = data
        }
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError)
        console.error('Raw response:', data)
        throw new Error('Invalid response format from API')
      }

      // Map the API response to our frontend interface
      const result: CompanySentimentResult = {
        Company: analysisResult.Company || companyName,
        Articles: analysisResult.Articles || [],
        "Comparative Sentiment Score": {
          "Sentiment Distribution": analysisResult["Comparative Sentiment Score"]?.["Sentiment Distribution"] || {
            Positive: 0,
            Neutral: 0,
            Negative: 0
          }
        },
        "Coverage Differences": analysisResult["Coverage Differences"] || [],
        "Topic Overlap": analysisResult["Topic Overlap"] || { "Common Topics": "" },
        "Final Sentiment Analysis": analysisResult["Final Sentiment Analysis"] || "Analysis completed successfully.",
        "Audio File": analysisResult["Audio File"],
        timestamp: new Date().toLocaleString()
      }
      
      setCurrentResult(result)
    } catch (err) {
      console.error('Error calling sentiment analysis API:', err)
      setError(err instanceof Error ? err.message : "Failed to analyze company sentiment. Please make sure the backend server is running on http://localhost:5000")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <Smile className="w-5 h-5 text-green-600" />
      case "Negative":
        return <Frown className="w-5 h-5 text-red-600" />
      default:
        return <Meh className="w-5 h-5 text-yellow-600" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-100 text-green-800"
      case "Negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="w-10 h-10 mr-4 text-purple-600" />
            Company Sentiment Analysis Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Analyze public sentiment and news coverage for any company to understand market perception
          </p>
        </div>

        {/* Company Input Section */}
        <div className="mb-8">
          <Card className="rounded-3xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center">
                <Search className="w-6 h-6 mr-2" />
                Company Analysis
              </CardTitle>
              <CardDescription>Enter a company name to analyze public sentiment from recent news coverage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="e.g., Nvidia, Apple, Tesla..."
                  className="rounded-xl border-gray-200 h-12"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyzeCompanySentiment()}
                />
                <Button
                  onClick={analyzeCompanySentiment}
                  disabled={!companyName.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-8 h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Sentiment"
                  )}
                </Button>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {currentResult && (
          <div className="space-y-8">
            {/* Sentiment Distribution */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Sentiment Analysis for {currentResult.Company}
                </CardTitle>
                <CardDescription>Overall sentiment distribution from recent news articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-2xl">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {currentResult["Comparative Sentiment Score"]["Sentiment Distribution"].Positive}
                    </div>
                    <div className="text-sm text-green-800 font-medium">Positive</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-2xl">
                    <div className="flex items-center justify-center mb-2">
                      <Minus className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {currentResult["Comparative Sentiment Score"]["Sentiment Distribution"].Neutral}
                    </div>
                    <div className="text-sm text-yellow-800 font-medium">Neutral</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-2xl">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {currentResult["Comparative Sentiment Score"]["Sentiment Distribution"].Negative}
                    </div>
                    <div className="text-sm text-red-800 font-medium">Negative</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Articles Analysis */}
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Articles Analysis
                  </CardTitle>
                  <CardDescription>Recent news articles and their sentiment analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 overflow-y-auto">
                    {currentResult.Articles.map((article, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
                            {article.Title}
                          </h4>
                          <Badge className={getSentimentColor(article.Sentiment)}>
                            {article.Sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                          {article.Summary}
                        </p>
                        {article.url && (
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Read full article
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Topic Analysis & Final Analysis */}
              <div className="space-y-6">
                <Card className="rounded-3xl shadow-lg border-0 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Topic Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Common Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentResult["Topic Overlap"]["Common Topics"].split(', ').map((topic, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {topic.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Unique Topics by Article</h4>
                      <div className="space-y-3">
                        {Object.entries(currentResult["Topic Overlap"]).filter(([key]) => key.startsWith("Unique Topics")).map(([key, value], index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-xl">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">{key}</h5>
                            <div className="flex flex-wrap gap-1">
                              {value.split(', ').map((topic, topicIndex) => (
                                <Badge key={topicIndex} variant="outline" className="bg-white text-xs">
                                  {topic.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coverage Differences */}
                <Card className="rounded-3xl shadow-lg border-0 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Coverage Analysis</CardTitle>
                    <CardDescription>Similarities and differences in news coverage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentResult["Coverage Differences"].map((coverage, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl">
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Similarities
                            </h4>
                            <p className="text-sm text-gray-700">{coverage.Similarities}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
                              <TrendingDown className="w-4 h-4 mr-1" />
                              Differences
                            </h4>
                            <p className="text-sm text-gray-700">{coverage.Differences}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-lg border-0 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Overall Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-blue-50 rounded-2xl">
                      <p className="text-blue-900 leading-relaxed">
                        {currentResult["Final Sentiment Analysis"]}
                      </p>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Analysis completed: {currentResult.timestamp}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

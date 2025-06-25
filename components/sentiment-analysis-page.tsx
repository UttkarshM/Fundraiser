"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Brain, Smile, Meh, Frown, Clock } from "lucide-react"

interface SentimentResult {
  id: number
  text: string
  sentiment: "Positive" | "Neutral" | "Negative"
  confidence: number
  timestamp: string
}

const pastAnalyses: SentimentResult[] = [
  {
    id: 1,
    text: "Thank you so much for organizing this fundraiser. It means the world to our family during this difficult time.",
    sentiment: "Positive",
    confidence: 0.95,
    timestamp: "2024-01-15 14:30",
  },
  {
    id: 2,
    text: "I'm not sure if this campaign is really necessary. There might be better ways to help.",
    sentiment: "Negative",
    confidence: 0.72,
    timestamp: "2024-01-15 12:15",
  },
  {
    id: 3,
    text: "This is a good initiative. I hope we can reach the goal.",
    sentiment: "Positive",
    confidence: 0.88,
    timestamp: "2024-01-15 10:45",
  },
  {
    id: 4,
    text: "The campaign details are clear and well-organized.",
    sentiment: "Neutral",
    confidence: 0.65,
    timestamp: "2024-01-14 16:20",
  },
]

export function SentimentAnalysisPage() {
  const [inputText, setInputText] = useState("")
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyses, setAnalyses] = useState<SentimentResult[]>(pastAnalyses)

  const analyzeSentiment = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)

    // Simulate API call
    setTimeout(() => {
      // Simple sentiment analysis simulation
      const positiveWords = ["thank", "great", "amazing", "wonderful", "excellent", "love", "happy", "good", "support"]
      const negativeWords = ["bad", "terrible", "awful", "hate", "disappointed", "wrong", "not sure", "problem"]

      const words = inputText.toLowerCase().split(" ")
      const positiveCount = words.filter((word) => positiveWords.some((pos) => word.includes(pos))).length
      const negativeCount = words.filter((word) => negativeWords.some((neg) => word.includes(neg))).length

      let sentiment: "Positive" | "Neutral" | "Negative"
      let confidence: number

      if (positiveCount > negativeCount) {
        sentiment = "Positive"
        confidence = Math.min(0.7 + positiveCount * 0.1, 0.95)
      } else if (negativeCount > positiveCount) {
        sentiment = "Negative"
        confidence = Math.min(0.7 + negativeCount * 0.1, 0.95)
      } else {
        sentiment = "Neutral"
        confidence = 0.6 + Math.random() * 0.2
      }

      const result: SentimentResult = {
        id: Date.now(),
        text: inputText,
        sentiment,
        confidence,
        timestamp: new Date().toLocaleString(),
      }

      setCurrentResult(result)
      setAnalyses([result, ...analyses])
      setIsAnalyzing(false)
    }, 2000)
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

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "😄"
      case "Negative":
        return "😞"
      default:
        return "😐"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="w-10 h-10 mr-4 text-purple-600" />
            Donor Sentiment Insights
          </h1>
          <p className="text-xl text-gray-600">
            Analyze donor feedback and messages to understand sentiment and engagement
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">Analyze Sentiment</CardTitle>
                <CardDescription>Enter donor feedback or message to analyze sentiment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter donor feedback, message, or comment here..."
                  className="rounded-xl border-gray-200 resize-none min-h-[120px]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button
                  onClick={analyzeSentiment}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Sentiment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Result */}
            {currentResult && (
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    Analysis Result
                    <span className="ml-2 text-2xl">{getSentimentEmoji(currentResult.sentiment)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      {getSentimentIcon(currentResult.sentiment)}
                      <div>
                        <Badge className={getSentimentColor(currentResult.sentiment)}>{currentResult.sentiment}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          Confidence: {Math.round(currentResult.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <p className="text-sm font-medium text-blue-900 mb-2">Summary:</p>
                    <p className="text-blue-800">
                      The message indicates a <strong>{currentResult.sentiment.toLowerCase()}</strong> donor sentiment
                      {currentResult.sentiment === "Positive" && " with appreciation and support."}
                      {currentResult.sentiment === "Negative" && " with concerns or dissatisfaction."}
                      {currentResult.sentiment === "Neutral" && " with balanced or informational content."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Analyses */}
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Analysis History
                </CardTitle>
                <CardDescription>Previous sentiment analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(analysis.sentiment)}
                          <Badge className={getSentimentColor(analysis.sentiment)}>{analysis.sentiment}</Badge>
                          <span className="text-xs text-gray-500">{Math.round(analysis.confidence * 100)}%</span>
                        </div>
                        <span className="text-xs text-gray-500">{analysis.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{analysis.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="rounded-3xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Sentiment Overview</CardTitle>
                <CardDescription>Overall sentiment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Positive", "Neutral", "Negative"].map((sentiment) => {
                    const count = analyses.filter((a) => a.sentiment === sentiment).length
                    const percentage = analyses.length > 0 ? Math.round((count / analyses.length) * 100) : 0

                    return (
                      <div key={sentiment} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getSentimentIcon(sentiment)}
                          <span className="font-medium text-gray-900">{sentiment}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                sentiment === "Positive"
                                  ? "bg-green-500"
                                  : sentiment === "Negative"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-12">{percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

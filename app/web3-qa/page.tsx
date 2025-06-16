"use client"

import { useState } from "react"
import { MessageSquare, Send, Cpu, Database, ArrowLeft, Lightbulb, TrendingUp, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export default function Web3QA() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content:
        "Hello! I'm your 0scope AI assistant. I can help you analyze wallets, tokens, DeFi protocols, and answer any Web3 questions using our decentralized compute network. What would you like to know?",
      timestamp: "Just now",
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)

  const suggestedQuestions = [
    {
      icon: TrendingUp,
      question: "What are the top performing DeFi protocols this week?",
      category: "DeFi Analysis",
    },
    {
      icon: Users,
      question: "Show me wallets with the highest 0G token holdings",
      category: "Wallet Analysis",
    },
    {
      icon: Shield,
      question: "How does 0G Labs ensure data availability and security?",
      category: "0G Infrastructure",
    },
    {
      icon: MessageSquare,
      question: "Explain the benefits of cross-chain analytics",
      category: "Education",
    },
  ]

  const handleSendQuestion = async () => {
    if (!question.trim()) return

    // Add user message
    const userMessage = {
      type: "user",
      content: question,
      timestamp: "Just now",
    }
    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = {
        type: "ai",
        content: generateAIResponse(question),
        timestamp: "Just now",
        ogComponents: ["0G Compute", "0G Storage"],
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsProcessing(false)
    }, 2000)
  }

  const generateAIResponse = (query: string) => {
    if (query.toLowerCase().includes("0g") || query.toLowerCase().includes("zero g")) {
      return (
        <div>
          0G Labs provides a comprehensive decentralized infrastructure stack:
          <br />
          <br />• <strong>0G Storage</strong>: Decentralized data storage with 1000x cost reduction compared to
          traditional cloud solutions
          <br />• <strong>0G Compute</strong>: Verifiable AI/ML computation network for transparent processing
          <br />• <strong>0G Chain</strong>: Modular EVM L1 blockchain with high throughput and low fees
          <br />• <strong>0G DA</strong>: Data availability layer ensuring 99.9% uptime and network resilience
          <br />
          <br />
          The key advantages include censorship resistance, massive cost savings, verifiable computation results, and
          seamless cross-chain interoperability. This makes 0G Labs ideal for building scalable, trustworthy Web3
          applications.
        </div>
      )
    }

    if (query.toLowerCase().includes("defi") || query.toLowerCase().includes("protocol")) {
      return (
        <div>
          Here are the top-performing DeFi protocols this week:
          <br />
          <br />
          1. <strong>Uniswap V3</strong> - $2.1B TVL (+5.2% this week)
          <br />
          &nbsp;&nbsp;&nbsp;- Leading DEX with concentrated liquidity
          <br />
          &nbsp;&nbsp;&nbsp;- Strong volume across multiple chains
          <br />
          <br />
          2. <strong>Aave</strong> - $1.8B TVL (+3.1% this week)
          <br />
          &nbsp;&nbsp;&nbsp;- Dominant lending protocol
          <br />
          &nbsp;&nbsp;&nbsp;- Expanding to new networks
          <br />
          <br />
          3. <strong>Compound</strong> - $1.2B TVL (+2.8% this week)
          <br />
          &nbsp;&nbsp;&nbsp;- Established money market protocol
          <br />
          &nbsp;&nbsp;&nbsp;- Consistent yield generation
          <br />
          <br />
          4. <strong>0G DeFi Hub</strong> - $450M TVL (+15.7% this week) 🚀
          <br />
          &nbsp;&nbsp;&nbsp;- Fastest growing protocol
          <br />
          &nbsp;&nbsp;&nbsp;- Native 0G Chain integration
          <br />
          <br />
          0G native protocols are showing the strongest growth due to lower fees and faster transactions on 0G Chain.
        </div>
      )
    }

    if (query.toLowerCase().includes("wallet") || query.toLowerCase().includes("address")) {
      return (
        <div>
          For wallet analysis, I can help you understand:
          <br />
          <br />• <strong>Portfolio composition</strong> - Token holdings across all supported chains
          <br />• <strong>Risk assessment</strong> - AI-powered risk scoring based on transaction patterns
          <br />• <strong>DeFi positions</strong> - Active yield farming and staking positions
          <br />• <strong>Transaction history</strong> - Recent activity and movement patterns
          <br />• <strong>Cross-chain tracking</strong> - Assets across Ethereum, 0G Chain, Polygon, and more
          <br />
          <br />
          Simply enter any wallet address in the Wallet Analysis section to get a comprehensive breakdown of holdings,
          risk factors, and optimization suggestions.
        </div>
      )
    }

    if (query.toLowerCase().includes("token") || query.toLowerCase().includes("price")) {
      return (
        <div>
          Token analysis covers comprehensive metrics including:
          <br />
          <br />• <strong>Price and market data</strong> - Real-time pricing, volume, and market cap
          <br />• <strong>Holder distribution</strong> - Top holders and concentration analysis
          <br />• <strong>Trading patterns</strong> - Buy/sell pressure and volume trends
          <br />• <strong>Cross-chain presence</strong> - Token distribution across different networks
          <br />• <strong>Technical indicators</strong> - RSI, moving averages, and momentum signals
          <br />
          <br />
          For 0G token specifically, we're seeing strong fundamentals with growing ecosystem adoption and healthy holder
          distribution patterns.
        </div>
      )
    }

    if (query.toLowerCase().includes("cross-chain") || query.toLowerCase().includes("multichain")) {
      return (
        <div>
          Cross-chain analytics provide several key benefits:
          <br />
          <br />• <strong>Unified view</strong> - See all your assets across different blockchains in one place
          <br />• <strong>Better insights</strong> - Understand true portfolio diversification and risk
          <br />• <strong>Arbitrage opportunities</strong> - Spot price differences across chains
          <br />• <strong>Gas optimization</strong> - Find the most cost-effective chains for transactions
          <br />• <strong>Ecosystem tracking</strong> - Monitor how protocols perform across different networks
          <br />
          <br />
          0G Chain serves as an efficient hub for cross-chain operations with lower fees and faster settlement times.
        </div>
      )
    }

    // Default response for other queries
    return (
      <div>
        I can help you with various Web3 topics including:
        <br />
        <br />• <strong>DeFi protocols</strong> - Analysis of yields, risks, and opportunities
        <br />• <strong>Wallet insights</strong> - Portfolio analysis and risk assessment
        <br />• <strong>Token research</strong> - Price analysis, holder data, and market trends
        <br />• <strong>0G ecosystem</strong> - Infrastructure benefits and integration opportunities
        <br />• <strong>Cross-chain strategies</strong> - Multi-blockchain portfolio optimization
        <br />
        <br />
        What specific aspect would you like to explore further?
      </div>
    )
  }

  const handleSuggestedQuestion = (suggestedQ: string) => {
    setQuestion(suggestedQ)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Web3 Q&A</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Web3 AMA Assistant</h1>
          <p className="text-muted-foreground">
            AI-powered insights using 0G Compute with knowledge stored on 0G Storage
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Suggested Questions Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Suggested Questions</span>
                </CardTitle>
                <CardDescription>Popular queries to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {suggestedQuestions.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation"
                      onClick={() => handleSuggestedQuestion(item.question)}
                    >
                      <div className="flex items-start space-x-2">
                        <item.icon className="w-4 h-4 mt-0.5 sm:mt-1 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium leading-tight">{item.question}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 0G Infrastructure Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">0G Infrastructure Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">0G Compute</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">0G Storage</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>AI Assistant Chat</span>
                </CardTitle>
                <CardDescription>Powered by 0G Compute AI models with verifiable results</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4 pb-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-lg break-words ${
                            message.type === "user" ? "bg-blue-500 text-white" : "bg-muted"
                          }`}
                        >
                          <div className="text-sm sm:text-base">
                            {typeof message.content === "string" ? message.content : message.content}
                          </div>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span
                              className={`text-xs ${
                                message.type === "user" ? "text-blue-100" : "text-muted-foreground"
                              }`}
                            >
                              {message.timestamp}
                            </span>
                            {message.ogComponents && (
                              <div className="flex flex-wrap gap-1">
                                {message.ogComponents.map((component, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {component}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 sm:p-4 rounded-lg max-w-[85%] sm:max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <span className="text-sm text-muted-foreground ml-2">Processing on 0G Compute...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="flex-shrink-0 space-y-2 p-2 sm:p-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask anything about Web3, DeFi, wallets, or 0G Labs..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendQuestion()}
                      className="flex-1 text-sm sm:text-base min-h-[44px]"
                    />
                    <Button
                      onClick={handleSendQuestion}
                      disabled={isProcessing || !question.trim()}
                      className="flex-shrink-0 min-h-[44px] min-w-[44px] px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Powered by 0G Labs decentralized AI infrastructure
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

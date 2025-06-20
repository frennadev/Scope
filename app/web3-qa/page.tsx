"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Send, Cpu, Database, ArrowLeft, Lightbulb, TrendingUp, Users, Shield, Brain, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

// Enhanced AI Chat Message interface
interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  confidence?: number;
  sources?: string[];
  relatedTopics?: string[];
}

export default function Web3QA() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your sc0pe AI assistant powered by 0G Compute. I can help you analyze wallets, tokens, DeFi protocols, and answer any Web3 questions using our decentralized AI network. What would you like to know?",
      timestamp: Date.now(),
      confidence: 100,
      sources: ["0G Compute AI", "0G Storage"],
      relatedTopics: ["Web3 Analysis", "DeFi", "Portfolio Management"]
    }
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
    const userMessage: AIChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      content: question,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    const currentQuestion = question
    setQuestion("")
    setIsProcessing(true)

    // Simulate AI processing with 0G Compute
    setTimeout(() => {
      const response = generateAIResponse(currentQuestion)
      const aiResponse: AIChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources,
        relatedTopics: response.relatedTopics
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsProcessing(false)
    }, 2000)
  }

  const generateAIResponse = (query: string) => {
    const q = query.toLowerCase()
    
    if (q.includes("0g") || q.includes("zero g")) {
      return {
        content: `🚀 **0G Labs Infrastructure Analysis:**

**Core Components:**
• **0G Storage**: Decentralized data storage with 1000x cost reduction
• **0G Compute**: Verifiable AI/ML computation network for transparent processing  
• **0G Chain**: Modular EVM L1 blockchain with high throughput and low fees
• **0G DA**: Data availability layer ensuring 99.9% uptime and network resilience

**Key Advantages:**
✅ Censorship resistance and decentralization
✅ Massive cost savings (90% lower than traditional solutions)
✅ Verifiable computation results with cryptographic proofs
✅ Seamless cross-chain interoperability

**Use Cases:**
• DeFi protocols with lower operational costs
• AI/ML applications requiring verifiable computation
• Data-intensive applications needing scalable storage
• Cross-chain bridges and infrastructure

0G Labs is positioned as the foundational infrastructure for the next generation of Web3 applications.`,
        confidence: 95,
        sources: ["0G Documentation", "Infrastructure Analysis"],
        relatedTopics: ["Blockchain Infrastructure", "Data Availability", "Verifiable Compute"]
      }
    }

    if (q.includes("defi") || q.includes("protocol")) {
      return {
        content: `📊 **Top DeFi Protocols Analysis (This Week):**

**1. Uniswap V3** - $2.1B TVL (+5.2% ↗️)
   • Leading DEX with concentrated liquidity
   • Strong volume across Ethereum, Polygon, Arbitrum
   • New 0G Chain integration planned

**2. Aave** - $1.8B TVL (+3.1% ↗️)
   • Dominant lending protocol
   • Expanding to new networks including 0G Chain
   • Flash loan innovation leader

**3. 0G DeFi Hub** - $450M TVL (+15.7% 🚀)
   • Fastest growing protocol this week
   • Native 0G Chain integration
   • Ultra-low gas fees attracting users

**4. Compound** - $1.2B TVL (+2.8% ↗️)
   • Established money market protocol
   • Consistent yield generation
   • Strong governance token performance

**Trend Analysis:**
🔥 0G native protocols showing strongest growth due to:
• 90% lower transaction costs
• Faster settlement times
• Better user experience
• Growing ecosystem adoption

**AI Recommendation:** Consider diversifying into 0G Chain protocols for cost-effective DeFi exposure.`,
        confidence: 88,
        sources: ["DeFi Pulse", "0G Analytics", "Market Data"],
        relatedTopics: ["DeFi Protocols", "TVL Analysis", "Yield Farming"]
      }
    }

    if (q.includes("wallet") || q.includes("address") || q.includes("portfolio")) {
      return {
        content: `🔍 **AI-Powered Wallet Analysis:**

**What I Can Analyze:**
• **Portfolio Composition** - Token holdings across all supported chains
• **Risk Assessment** - AI-powered risk scoring based on transaction patterns
• **Diversification Score** - Cross-chain and asset allocation analysis
• **DeFi Positions** - Active yield farming and staking positions
• **Transaction Patterns** - Behavioral analysis and trading frequency
• **Performance Metrics** - ROI, volatility, and risk-adjusted returns

**Multi-Chain Support:**
✅ Ethereum (ETH) - Main DeFi ecosystem
✅ 0G Chain - Low-cost transactions and emerging DeFi
✅ Base - Coinbase L2 with growing adoption
✅ Polygon - Scalable DeFi solutions
✅ BSC - High-volume trading and yield farming

**AI Insights Include:**
• Risk profile classification (Conservative/Moderate/Aggressive/Whale)
• Optimization recommendations
• Cross-chain arbitrage opportunities
• Portfolio rebalancing suggestions
• Security risk assessment

**How to Use:** Simply enter any wallet address in the Wallet Analysis section to get comprehensive AI-powered insights stored securely on 0G Storage.`,
        confidence: 92,
        sources: ["Wallet Analytics", "0G Compute AI", "Multi-Chain Data"],
        relatedTopics: ["Portfolio Management", "Risk Assessment", "Multi-Chain Analysis"]
      }
    }

    if (q.includes("token") || q.includes("price") || q.includes("analysis")) {
      return {
        content: `📈 **AI Token Analysis Framework:**

**Comprehensive Metrics:**
• **Price & Market Data** - Real-time pricing, volume, market cap, liquidity
• **Holder Analysis** - Distribution patterns, whale movements, concentration risk
• **Trading Patterns** - Buy/sell pressure, volume trends, momentum indicators
• **Cross-Chain Presence** - Token distribution across different networks
• **Technical Indicators** - RSI, moving averages, support/resistance levels
• **Fundamental Analysis** - Project metrics, tokenomics, utility assessment

**AI-Powered Insights:**
🤖 **Risk Scoring** (0-100): Liquidity, volatility, smart contract risks
🤖 **Sentiment Analysis** (-100 to +100): Market sentiment and social signals  
🤖 **Price Predictions** (1h/24h/7d): ML-based forecasting with confidence intervals
🤖 **Recommendation Engine**: Buy/Hold/Sell signals with reasoning

**0G Token Spotlight:**
• Strong fundamentals with growing ecosystem adoption
• Healthy holder distribution (not whale-dominated)
• Increasing utility across 0G infrastructure services
• Low volatility compared to similar infrastructure tokens

**Usage:** Enter any token contract address in Token Analysis for detailed AI insights.`,
        confidence: 90,
        sources: ["Token Analytics", "Market Data APIs", "0G Compute AI"],
        relatedTopics: ["Token Analysis", "Price Prediction", "Market Research"]
      }
    }

    if (q.includes("cross-chain") || q.includes("multichain") || q.includes("bridge")) {
      return {
        content: `🌉 **Cross-Chain Analytics & Strategy:**

**Key Benefits:**
• **Unified Portfolio View** - See all assets across blockchains in one dashboard
• **True Diversification** - Understand real portfolio risk and concentration
• **Arbitrage Opportunities** - Spot price differences across chains
• **Gas Optimization** - Find most cost-effective chains for transactions
• **Ecosystem Comparison** - Monitor protocol performance across networks

**Supported Chains:**
🔗 **Ethereum** - Main DeFi hub, highest liquidity
🔗 **0G Chain** - Ultra-low fees, emerging DeFi ecosystem  
🔗 **Base** - Coinbase L2, growing adoption
🔗 **Polygon** - Mature L2 with established protocols
🔗 **BSC** - High-volume trading and yield farming

**AI Optimization:**
• **Chain Selection AI** - Recommends optimal chain for each transaction type
• **Bridge Risk Assessment** - Analyzes security and liquidity of cross-chain bridges
• **Cost Analysis** - Calculates total cost including gas and bridge fees
• **Timing Optimization** - Suggests best times for cross-chain operations

**0G Chain Advantages:**
✅ 90% lower gas fees than Ethereum
✅ Faster finality (2-3 seconds vs 12+ seconds)
✅ Native interoperability features
✅ Growing DeFi ecosystem with yield opportunities

**Strategy:** Use 0G Chain as your low-cost operational hub while maintaining exposure to major chains for liquidity and established protocols.`,
        confidence: 87,
        sources: ["Bridge Analytics", "Gas Tracker", "0G Infrastructure"],
        relatedTopics: ["Cross-Chain Strategy", "Bridge Security", "Gas Optimization"]
      }
    }

    // Default comprehensive response
    return {
      content: `🤖 **sc0pe AI Assistant - Powered by 0G Compute**

**What I Can Help You With:**

🔍 **Analysis Tools:**
• **Wallet Analysis** - Portfolio composition, risk assessment, optimization
• **Token Research** - Price analysis, fundamentals, risk scoring
• **DeFi Protocol Analysis** - TVL, yields, risks, opportunities
• **Market Insights** - Trends, sentiment, predictions

📚 **Education & Guidance:**
• **DeFi Strategies** - Yield farming, staking, liquidity provision
• **Risk Management** - Portfolio diversification, security practices
• **Cross-Chain Operations** - Bridge usage, gas optimization
• **0G Ecosystem** - Infrastructure benefits, integration opportunities

🚀 **Advanced Features:**
• **AI-Powered Predictions** - Price forecasts with confidence intervals
• **Portfolio Optimization** - Asset allocation recommendations
• **Risk Scoring** - Comprehensive risk assessment across all holdings
• **Real-Time Alerts** - Market movements, portfolio changes

**Powered by 0G Infrastructure:**
✅ **0G Compute** - Verifiable AI processing with cryptographic proofs
✅ **0G Storage** - Decentralized data storage for analysis history
✅ **0G Chain** - Low-cost transactions and emerging DeFi ecosystem

**Quick Start:**
• Ask about specific tokens, wallets, or DeFi protocols
• Request market analysis or trend insights  
• Get help with portfolio optimization
• Learn about Web3 concepts and strategies

What specific aspect of Web3 would you like to explore today?`,
      confidence: 85,
      sources: ["0G Compute AI", "Multi-Chain Analytics", "DeFi Data"],
      relatedTopics: ["Web3 Education", "Portfolio Management", "DeFi Analysis", "AI Insights"]
    }
  }

  const handleSuggestedQuestion = (suggestedQ: string) => {
    setQuestion(suggestedQ)
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <span>AI-Powered Web3 Q&A</span>
          </h1>
          <p className="text-muted-foreground">
            Get intelligent answers about DeFi, tokens, wallets, and blockchain technology using 0G Compute AI
          </p>
          <div className="flex items-center space-x-4 mt-3">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Cpu className="w-3 h-3" />
              <span>0G Compute AI</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>0G Storage</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Real-time Analysis</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>AI Assistant Chat</span>
                </CardTitle>
                <CardDescription>Ask anything about Web3, DeFi, tokens, or blockchain technology</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>{formatTimestamp(message.timestamp)}</span>
                            {message.role === "assistant" && message.confidence && (
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  {message.confidence}% confidence
                                </Badge>
                                {message.sources && message.sources.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    {message.sources.map((source, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-sm">AI is processing your question...</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Powered by 0G Compute network
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about Web3, DeFi, tokens, or wallets..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isProcessing && handleSendQuestion()}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button onClick={handleSendQuestion} disabled={isProcessing || !question.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggested Questions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Suggested Questions</span>
                </CardTitle>
                <CardDescription>Popular topics to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedQuestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(item.question)}
                      className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                      disabled={isProcessing}
                    >
                      <div className="flex items-start space-x-2">
                        <item.icon className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{item.question}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle>AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Advanced reasoning with 0G Compute</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Persistent chat history in 0G Storage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Real-time market data integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Verifiable AI responses</span>
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

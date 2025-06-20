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
// LLM service is now accessed via API route for better security

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
  const [llmStatus, setLlmStatus] = useState<'checking' | 'enabled' | 'fallback'>('checking')

  // Check LLM configuration status on component mount
  useEffect(() => {
    const checkLLMStatus = async () => {
      try {
        // Test if OpenAI API key is configured
        const hasApiKey = !!(process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY)
        const status = hasApiKey ? 'enabled' : 'fallback'
        setLlmStatus(status)
        
        // Update welcome message based on LLM status
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: status === 'enabled' 
            ? "Hello! I'm your sc0pe AI assistant powered by OpenAI GPT-4o-mini and 0G Compute. I can provide intelligent analysis of wallets, tokens, DeFi protocols, and answer complex Web3 questions with context-aware responses. What would you like to explore?"
            : "Hello! I'm your sc0pe AI assistant powered by 0G Compute. I provide expert Web3 analysis with curated knowledge. I can help with DeFi analysis, token research, wallet analytics, and 0G ecosystem insights. What would you like to know?",
          timestamp: Date.now(),
          confidence: status === 'enabled' ? 100 : 90,
          sources: status === 'enabled' ? ["OpenAI GPT-4o-mini", "0G Compute AI", "0G Storage"] : ["0G Compute AI", "Expert Knowledge Base"],
          relatedTopics: ["Web3 Analysis", "DeFi", "Portfolio Management"]
        }])
      } catch (error) {
        setLlmStatus('fallback')
      }
    }
    checkLLMStatus()
  }, [])

  const suggestedQuestions = [
    {
      icon: TrendingUp,
      question: "What are the current market trends in DeFi and how can I optimize my yield farming strategy?",
      category: "DeFi Strategy",
    },
    {
      icon: Users,
      question: "Analyze the risk profile of my wallet and suggest portfolio diversification improvements",
      category: "Portfolio Analysis",
    },
    {
      icon: Shield,
      question: "How does 0G Labs' infrastructure compare to other Web3 solutions in terms of cost and security?",
      category: "0G Infrastructure",
    },
    {
      icon: MessageSquare,
      question: "Explain impermanent loss and how to minimize it in liquidity provision strategies",
      category: "DeFi Education",
    },
    {
      icon: Brain,
      question: "What are the emerging opportunities in the 0G ecosystem for early adopters?",
      category: "Investment Research",
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

    try {
      // Generate AI response using API route
      const sessionId = "web3-qa-session" // Use consistent session ID for conversation history
      
      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentQuestion,
          sessionId: sessionId,
          context: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            source: 'web3-qa-page'
          }
        })
      })

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`)
      }

      const result = await apiResponse.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed')
      }

      const response = result.data
      
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
    } catch (error) {
      console.error('Error generating AI response:', error)
      // Fallback response on error
      const errorResponse: AIChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: "I apologize, but I encountered an error processing your question. Please try again or rephrase your query.",
        timestamp: Date.now(),
        confidence: 50,
        sources: ["Error Handler"],
        relatedTopics: ["Technical Support"]
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsProcessing(false)
    }
  }

  // Enhanced AI chat service now handles all responses via API

  const handleSuggestedQuestion = (suggestedQ: string) => {
    setQuestion(suggestedQ)
    // Auto-send the suggested question
    setTimeout(() => {
      if (!isProcessing) {
        handleSendQuestion()
      }
    }, 100)
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
            {llmStatus === 'checking' && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
                <span>Checking LLM...</span>
              </Badge>
            )}
            {llmStatus === 'enabled' && (
              <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
                <Brain className="w-3 h-3" />
                <span>OpenAI GPT-4 Enabled</span>
              </Badge>
            )}
            {llmStatus === 'fallback' && (
              <Badge variant="secondary" className="flex items-center space-x-1 bg-yellow-600">
                <Brain className="w-3 h-3" />
                <span>Standard Mode</span>
              </Badge>
            )}
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
                          className={`max-w-[85%] rounded-lg p-3 break-words chat-message ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm break-words overflow-wrap-anywhere">{message.content}</div>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70 flex-wrap gap-2">
                            <span>{formatTimestamp(message.timestamp)}</span>
                            {message.role === "assistant" && message.confidence && (
                              <div className="flex items-center space-x-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {message.confidence}% confidence
                                </Badge>
                                {message.sources && message.sources.length > 0 && (
                                  <div className="flex items-center space-x-1 flex-wrap">
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
                        <div className="bg-muted rounded-lg p-3 max-w-[85%] break-words">
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

            {/* LLM Configuration Help (shown when in fallback mode) */}
            {llmStatus === 'fallback' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-800">
                    <Brain className="w-5 h-5" />
                    <span>Upgrade to Advanced AI</span>
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Enable OpenAI GPT-4 for enhanced intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p className="text-yellow-800">
                      Currently using curated AI responses. To enable advanced AI capabilities:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                      <li>Get an OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">platform.openai.com</a></li>
                      <li>Copy <code className="bg-yellow-100 px-1 rounded">env.example</code> to <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
                      <li>Add your API key to <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY</code></li>
                      <li>Restart the development server</li>
                    </ol>
                    <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800">
                      <strong>Benefits:</strong> Context-aware responses, conversation memory, advanced Web3 analysis, real-time data integration
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle>AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {llmStatus === 'enabled' ? 'OpenAI GPT-4 reasoning' : 'Curated AI responses'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Conversation history in 0G Storage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">
                      {llmStatus === 'enabled' ? 'Real-time market data integration' : 'Expert market insights'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Verifiable AI responses via 0G Compute</span>
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

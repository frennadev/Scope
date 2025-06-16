"use client"

import { useState } from "react"
import { TrendingUp, Users, Activity, ArrowLeft, ExternalLink, Database, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export default function TokenAnalysis() {
  const [tokenQuery, setTokenQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 3000)
  }

  const mockTokenData = {
    symbol: "0G",
    name: "0G Labs Token",
    price: "$2.50",
    marketCap: "$125M",
    volume24h: "$12.5M",
    change24h: "+12.8%",
    totalSupply: "50M",
    circulatingSupply: "35M",
    chains: ["0G Chain", "Ethereum", "BSC"],
    holders: "15,420",
    topHolders: [
      { address: "0x1234...5678", percentage: "15.2%", balance: "5.32M 0G" },
      { address: "0x9876...4321", percentage: "8.7%", balance: "3.05M 0G" },
      { address: "0xabcd...efgh", percentage: "6.1%", balance: "2.14M 0G" },
    ],
    recentTransactions: [
      { type: "Buy", amount: "50,000 0G", value: "$125,000", time: "5m ago", chain: "0G Chain" },
      { type: "Sell", amount: "25,000 0G", value: "$62,500", time: "12m ago", chain: "Ethereum" },
      { type: "Transfer", amount: "100,000 0G", value: "$250,000", time: "1h ago", chain: "0G Chain" },
    ],
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
          <span className="font-medium">Token Analysis</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Token Analysis</h1>
          <p className="text-muted-foreground">Comprehensive token analytics powered by 0G Labs infrastructure</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Analyze Token</span>
            </CardTitle>
            <CardDescription>Enter a token symbol or contract address for detailed analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter token symbol (e.g., 0G, ETH) or contract address"
                  value={tokenQuery}
                  onChange={(e) => setTokenQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && tokenQuery.trim() && handleAnalyze()}
                  className="text-sm sm:text-base lg:text-lg min-h-[44px]"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !tokenQuery}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Token"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="mt-6">
                <h3 className="font-medium mb-4">0G Labs Analysis Pipeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fetching cross-chain token data</p>
                      <Badge variant="outline" className="text-xs">
                        0G Storage
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Running market analysis AI</p>
                      <Badge variant="outline" className="text-xs">
                        0G Compute
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Analyzing holder distribution</p>
                      <Badge variant="outline" className="text-xs">
                        0G Compute
                      </Badge>
                    </div>
                  </div>
                </div>
                <Progress value={100} className="mt-4" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="space-y-6">
            {/* Token Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">0G</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{mockTokenData.name}</h2>
                      <p className="text-muted-foreground">{mockTokenData.symbol}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>0G Native</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-xl sm:text-2xl font-bold">{mockTokenData.price}</p>
                    <p className="text-sm text-green-500">{mockTokenData.change24h}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-lg sm:text-xl font-bold">{mockTokenData.marketCap}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-lg sm:text-xl font-bold">{mockTokenData.volume24h}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Holders</p>
                    <p className="text-lg sm:text-xl font-bold">{mockTokenData.holders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="holders" className="text-xs sm:text-sm py-2">
                  Holders
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs sm:text-sm py-2">
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Token Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Supply</span>
                        <span className="font-medium">{mockTokenData.totalSupply}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Circulating Supply</span>
                        <span className="font-medium">{mockTokenData.circulatingSupply}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Supply Ratio</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={70} className="w-20" />
                          <span className="text-sm">70%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Chain Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockTokenData.chains.map((chain, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span>{chain}</span>
                              {chain === "0G Chain" && (
                                <Badge variant="default" className="text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {chain === "0G Chain" ? "60%" : chain === "Ethereum" ? "30%" : "10%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="holders">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Top Holders Analysis</span>
                    </CardTitle>
                    <CardDescription>Holder distribution analysis powered by 0G Compute</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockTokenData.topHolders.map((holder, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <span className="text-sm font-bold">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-mono text-sm">{holder.address}</p>
                              <p className="text-xs text-muted-foreground">{holder.balance}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{holder.percentage}</p>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Recent Transactions</span>
                    </CardTitle>
                    <CardDescription>Latest token movements across all chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockTokenData.recentTransactions.map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.type === "Buy"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                  : tx.type === "Sell"
                                    ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                              }`}
                            >
                              <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{tx.type}</p>
                              <p className="text-sm text-muted-foreground">{tx.amount}</p>
                              <Badge variant="outline" className="text-xs">
                                {tx.chain}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.value}</p>
                            <p className="text-sm text-muted-foreground">{tx.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5" />
                      <span>AI Market Analysis</span>
                    </CardTitle>
                    <CardDescription>Generated by 0G Compute AI models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Bullish Sentiment</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Strong fundamentals with 0G Labs ecosystem growth. Increasing adoption of 0G infrastructure
                          driving token demand.
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Holder Analysis</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Healthy distribution with no single whale dominance. Growing number of long-term holders
                          indicates confidence.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">Technical Indicators</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          RSI indicates oversold conditions with potential for upward movement. Volume patterns suggest
                          accumulation phase.
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">Risk Assessment</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          Medium risk profile. Monitor 0G ecosystem developments and broader market conditions for
                          optimal entry/exit points.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

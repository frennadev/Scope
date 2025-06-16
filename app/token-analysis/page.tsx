"use client"

import { useState, useEffect } from "react"
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
import { initializeMoralis, getTokenInfo, getTokenTransactions } from "@/lib/moralis"

export default function TokenAnalysis() {
  const [tokenQuery, setTokenQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [tokenData, setTokenData] = useState<any[]>([])
  const [tokenTransactions, setTokenTransactions] = useState<any[]>([])
  const [moralisInitialized, setMoralisInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMoralis()
        setMoralisInitialized(true)
      } catch (err) {
        console.error("Failed to initialize Moralis:", err)
        setError("Failed to initialize API. Please try again later.")
      }
    }
    init()
  }, [])

  const handleAnalyze = async () => {
    if (!moralisInitialized) {
      setError("API not initialized. Please wait and try again.")
      return
    }
    setIsAnalyzing(true)
    setError(null)
    try {
      const chains = ["0x1", "0x2105", "0x38"] // Ethereum, Base, BSC
      const tokenInfoData = await getTokenInfo(tokenQuery, chains)
      setTokenData(tokenInfoData)
      if (tokenQuery.startsWith('0x') && tokenQuery.length === 42) {
        const transactionsData = await getTokenTransactions(tokenQuery, chains, 5)
        setTokenTransactions(transactionsData)
      } else {
        setTokenTransactions([])
      }
      setAnalysisComplete(true)
    } catch (err) {
      console.error("Error fetching token data:", err)
      setError("Failed to fetch token data. Please check the input and try again.")
    } finally {
      setIsAnalyzing(false)
    }
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
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
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
                disabled={isAnalyzing || !tokenQuery || !moralisInitialized}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isAnalyzing ? "Analyzing..." : !moralisInitialized ? "Initializing API..." : "Analyze Token"}
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
        {analysisComplete && !error && (
          <div className="space-y-6">
            {/* Token Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">TK</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Token Data</h2>
                      <p className="text-muted-foreground">Across Chains</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>0G Native</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenData.map((token, index) => (
                    <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Chain: {token.chain}</span>
                        {token.error && (
                          <Badge variant="destructive">Error</Badge>
                        )}
                      </div>
                      {token.error ? (
                        <p className="text-sm text-red-500">{token.error}</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Current Price</p>
                            <p className="text-xl sm:text-2xl font-bold">${token.data.usdPrice?.toFixed(2) || 'N/A'}</p>
                            <p className="text-sm text-green-500">{token.data.usdPrice24hrPercentChange ? `${token.data.usdPrice24hrPercentChange.toFixed(1)}%` : 'N/A'}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Market Cap</p>
                            <p className="text-lg sm:text-xl font-bold">N/A</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">24h Volume</p>
                            <p className="text-lg sm:text-xl font-bold">N/A</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Holders</p>
                            <p className="text-lg sm:text-xl font-bold">N/A</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
                <TabsTrigger value="ai-insights" className="text-xs sm:text-sm py-2">
                  AI Insights
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Overview</CardTitle>
                    <CardDescription>Basic token information across chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tokenData.map((token, index) => (
                        token.error ? null : (
                          <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                            <span className="font-medium">Chain: {token.chain}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Token Name</p>
                                <p className="font-medium">{token.data.tokenName || 'N/A'}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Symbol</p>
                                <p className="font-medium">{token.data.tokenSymbol || 'N/A'}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Contract Address</p>
                                <p className="font-mono text-sm truncate">{token.data.tokenAddress || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="holders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Holder Distribution</span>
                      </div>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        <Cpu className="w-3 h-3" />
                        <span>0G Compute</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>Top token holders and distribution analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Holder data is currently unavailable through the API. Future updates will include detailed holder distribution.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Transactions</span>
                      </div>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        <Database className="w-3 h-3" />
                        <span>0G Storage</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>Latest token transfers across analyzed chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tokenTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {tokenTransactions.map((chainTx, index) => (
                          <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Chain: {chainTx.chain}</span>
                              {chainTx.error && (
                                <Badge variant="destructive">Error</Badge>
                              )}
                            </div>
                            {chainTx.error ? (
                              <p className="text-sm text-red-500">{chainTx.error}</p>
                            ) : (
                              <div className="space-y-2">
                                {chainTx.data && chainTx.data.length > 0 ? (
                                  chainTx.data.slice(0, 5).map((tx: any, txIndex: number) => (
                                    <div key={txIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                                      <div className="flex justify-between items-center">
                                        <span>Type: Transfer</span>
                                        <span>{new Date(tx.block_timestamp).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center mt-1">
                                        <span>From: {tx.from_address?.slice(0, 6)}...{tx.from_address?.slice(-4)}</span>
                                        <span>To: {tx.to_address?.slice(0, 6)}...{tx.to_address?.slice(-4)}</span>
                                      </div>
                                      <div className="mt-1">
                                        <span>Amount: {(parseFloat(tx.value) / Math.pow(10, tx.token_decimals || 18)).toFixed(2)} {tx.token_symbol || 'TOKEN'}</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No transactions found</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Transaction data is only available when searching by contract address.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai-insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>AI-Powered Insights</span>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        <Cpu className="w-3 h-3" />
                        <span>0G Compute</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>Advanced token analysis using 0G Compute AI models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md bg-muted/50">
                        <h3 className="font-medium mb-2 flex items-center space-x-2">
                          <span>Market Sentiment</span>
                          <Badge variant="outline" className="text-xs">AI Generated</Badge>
                        </h3>
                        <p className="text-muted-foreground">AI analysis of market sentiment is not yet available through the API integration.</p>
                      </div>
                      <div className="p-4 border rounded-md bg-muted/50">
                        <h3 className="font-medium mb-2 flex items-center space-x-2">
                          <span>Price Prediction (7 days)</span>
                          <Badge variant="outline" className="text-xs">AI Generated</Badge>
                        </h3>
                        <p className="text-muted-foreground">Price prediction models are not currently integrated with the API data.</p>
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

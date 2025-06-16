"use client"

import { useState } from "react"
import { Wallet, TrendingUp, Shield, Database, Cpu, ArrowLeft, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export default function WalletAnalysis() {
  const [walletAddress, setWalletAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 3000)
  }

  const mockWalletData = {
    address: "0x742d35Cc6634C0532925a3b8D0C9964E4e2f",
    totalValue: "$2,345,678",
    riskScore: 75,
    chains: ["Ethereum", "0G Chain", "Polygon", "Arbitrum"],
    lastActivity: "2 hours ago",
    tokens: [
      { symbol: "ETH", balance: "125.5", value: "$293,475", change: "+5.2%" },
      { symbol: "0G", balance: "50,000", value: "$125,000", change: "+12.8%" },
      { symbol: "USDC", balance: "100,000", value: "$100,000", change: "0%" },
      { symbol: "MATIC", balance: "25,000", value: "$22,250", change: "+8.9%" },
    ],
    defiPositions: [
      { protocol: "Uniswap V3", position: "ETH/USDC LP", value: "$45,000", apy: "12.5%" },
      { protocol: "0G Staking", position: "0G Validator", value: "$125,000", apy: "8.2%" },
      { protocol: "Aave", position: "USDC Lending", value: "$50,000", apy: "4.1%" },
    ],
    recentTransactions: [
      { type: "Swap", from: "ETH", to: "0G", amount: "5 ETH", time: "2h ago", chain: "0G Chain" },
      { type: "Stake", token: "0G", amount: "10,000 0G", time: "1d ago", chain: "0G Chain" },
      { type: "Transfer", token: "USDC", amount: "25,000 USDC", time: "3d ago", chain: "Ethereum" },
    ],
  }

  const ogProcessingSteps = [
    { step: "Fetching cross-chain data", component: "0G Storage", status: "complete" },
    { step: "Running AI risk assessment", component: "0G Compute", status: "complete" },
    { step: "Analyzing DeFi positions", component: "0G Compute", status: "complete" },
    { step: "Storing analysis results", component: "0G Storage", status: "complete" },
    { step: "Ensuring data availability", component: "0G DA", status: "complete" },
  ]

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
          <span className="font-medium">Wallet Analysis</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered wallet analysis using 0G Compute with data stored on 0G Storage
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Analyze Wallet</span>
            </CardTitle>
            <CardDescription>Enter a wallet address to get comprehensive cross-chain analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && walletAddress.trim() && handleAnalyze()}
                  className="text-sm sm:text-base lg:text-lg min-h-[44px]"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !walletAddress}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze with 0G"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">0G Labs Processing Pipeline</h3>
                {ogProcessingSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.step}</p>
                      <Badge variant="outline" className="text-xs">
                        {step.component}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Progress value={100} className="mt-4" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="space-y-6">
            {/* Wallet Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Wallet Overview</span>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>Stored on 0G</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-xs sm:text-sm truncate flex-1">{mockWalletData.address}</p>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{mockWalletData.totalValue}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">AI Risk Score</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={mockWalletData.riskScore} className="flex-1" />
                      <span className="font-medium text-sm">{mockWalletData.riskScore}/100</span>
                    </div>
                    <Badge variant="outline" className="text-xs flex items-center space-x-1 w-fit">
                      <Cpu className="w-3 h-3" />
                      <span>0G Compute AI</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Supported Chains</p>
                    <div className="flex flex-wrap gap-1">
                      {mockWalletData.chains.map((chain) => (
                        <Badge key={chain} variant="secondary" className="text-xs">
                          {chain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="tokens" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="tokens" className="text-xs sm:text-sm py-2">
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="defi" className="text-xs sm:text-sm py-2">
                  DeFi
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs sm:text-sm py-2">
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tokens">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Holdings</CardTitle>
                    <CardDescription>Cross-chain token portfolio analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockWalletData.tokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="font-bold text-sm">{token.symbol}</span>
                            </div>
                            <div>
                              <p className="font-medium">{token.symbol}</p>
                              <p className="text-sm text-muted-foreground">{token.balance} tokens</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{token.value}</p>
                            <p
                              className={`text-sm ${token.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                            >
                              {token.change}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="defi">
                <Card>
                  <CardHeader>
                    <CardTitle>DeFi Positions</CardTitle>
                    <CardDescription>Active DeFi protocol positions and yields</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockWalletData.defiPositions.map((position, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{position.protocol}</p>
                            <p className="text-sm text-muted-foreground truncate">{position.position}</p>
                            {position.protocol === "0G Staking" && (
                              <Badge variant="default" className="text-xs mt-1 w-fit">
                                0G Native
                              </Badge>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-medium">{position.value}</p>
                            <p className="text-sm text-green-500">APY: {position.apy}</p>
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
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest wallet activity across all chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockWalletData.recentTransactions.map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-300" />
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
                            <p className="text-sm text-muted-foreground">{tx.time}</p>
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

              <TabsContent value="insights">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5" />
                      <span>AI-Powered Insights</span>
                    </CardTitle>
                    <CardDescription>Generated by 0G Compute AI models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Portfolio Diversification</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Well-diversified portfolio with strong exposure to 0G ecosystem. Consider increasing DeFi
                          yield farming positions.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Risk Assessment</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Medium risk profile. Large 0G staking position provides stable yield. Monitor ETH exposure
                          during market volatility.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">Optimization Suggestions</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Consider migrating more assets to 0G Chain for lower fees. Potential yield optimization in
                          Uniswap V3 positions.
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

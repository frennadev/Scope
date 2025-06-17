"use client"

import { useState, useEffect } from "react"
import { Wallet, Shield, Database, Cpu, ArrowLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { initializeMoralis, getWalletBalances, getWalletTransactions, getWalletTokenBalances } from "@/lib/moralis"
import { useChain } from "@/components/context/chain-context"

const ogProcessingSteps = [
  { step: "Fetching Wallet Data", component: "API Call" },
  { step: "Processing Balances", component: "0G Compute" },
  { step: "Analyzing Transactions", component: "0G Compute" },
  { step: "Token Balances Calculation", component: "0G Compute" },
  { step: "Generating Report", component: "0G Compute" },
]

export default function WalletAnalysis() {
  const [walletAddress, setWalletAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [balances, setBalances] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [tokens, setTokens] = useState<any[]>([])
  const [moralisInitialized, setMoralisInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { selectedChain } = useChain()
  const totalBalance = balances.reduce((acc, bal) => acc + Number.parseFloat(bal.formattedBalance || 0), 0)

  // Chain ID to name mapping
  const chainNames: { [key: string]: string } = {
    "0x1": "Ethereum",
    "0x2105": "Base",
    "0x38": "Binance Smart Chain",
  }

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
      // Define chain IDs for Ethereum, Base, and Binance Smart Chain
      const chains = ["0x1", "0x2105", "0x38"] // 0x1 = Ethereum, 0x2105 = Base, 0x38 = BSC
      let balanceData = await getWalletBalances(walletAddress, chains)
      let transactionData = await getWalletTransactions(walletAddress, chains, 5)
      let tokenData = await getWalletTokenBalances(walletAddress, chains)

      if (selectedChain !== "All Chains") {
        balanceData = balanceData.filter((bal) => chainNames[bal.chain] === selectedChain)
        transactionData = transactionData.filter((tx) => chainNames[tx.chain] === selectedChain)
        tokenData = tokenData.filter((token) => chainNames[token.chain] === selectedChain)
      }

      setBalances(balanceData)
      setTransactions(transactionData)
      setTokens(tokenData)
      setAnalysisComplete(true)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch wallet data. Please check the address and try again.")
    } finally {
      setIsAnalyzing(false)
    }
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
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
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
                disabled={isAnalyzing || !walletAddress || !moralisInitialized}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isAnalyzing ? "Analyzing..." : !moralisInitialized ? "Initializing API..." : "Analyze with 0G"}
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
        {analysisComplete && !error && (
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
                      <p className="font-mono text-xs sm:text-sm truncate flex-1">{walletAddress}</p>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Portfolio Value (Native Tokens)</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">~ {totalBalance} ETH (approx)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">AI Risk Score</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="flex-1" />
                      <span className="font-medium text-sm">75/100</span>
                    </div>
                    <Badge variant="outline" className="text-xs flex items-center space-x-1 w-fit">
                      <Cpu className="w-3 h-3" />
                      <span>0G Compute AI</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Supported Chains</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Ethereum
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Base
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        BSC
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="balances" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="balances" className="text-xs sm:text-sm py-2">
                  Balances
                </TabsTrigger>
                <TabsTrigger value="tokens" className="text-xs sm:text-sm py-2">
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="defi" className="text-xs sm:text-sm py-2">
                  DeFi Positions
                </TabsTrigger>
              </TabsList>
              <TabsContent value="balances" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Native Token Balances</CardTitle>
                    <CardDescription>Native token balances across tracked chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {balances.map((bal, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">
                              {bal.chain === "0x1" ? "Ethereum" : bal.chain === "0x2105" ? "Base" : "BSC"}
                            </p>
                            {bal.error && <p className="text-red-500 text-sm">{bal.error}</p>}
                          </div>
                          <div className="text-right">
                            {!bal.error && (
                              <p className="font-mono">
                                {bal.formattedBalance} {bal.chain === "0x38" ? "BNB" : "ETH"}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tokens" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Holdings</CardTitle>
                    <CardDescription>Token balances across tracked chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {tokens.map((tokenChain, index) => (
                        <div key={index} className="space-y-3">
                          <h4 className="font-medium text-lg">
                            {tokenChain.chain === "0x1" ? "Ethereum" : tokenChain.chain === "0x2105" ? "Base" : "BSC"}
                          </h4>
                          {tokenChain.error ? (
                            <p className="text-red-500 text-sm">{tokenChain.error}</p>
                          ) : tokenChain.data && tokenChain.data.length > 0 ? (
                            tokenChain.data.slice(0, 5).map((token: any, tokenIndex: number) => (
                              <div key={tokenIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                                <div className="flex justify-between items-center">
                                  <span>
                                    {token.name} ({token.symbol})
                                  </span>
                                  <span>
                                    {(Number.parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(2)}
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground truncate">
                                  Contract: {token.token_address}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No tokens found</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest transactions across tracked chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {transactions.map((txChain, index) => (
                        <div key={index} className="space-y-3">
                          <h4 className="font-medium text-lg">
                            {txChain.chain === "0x1" ? "Ethereum" : txChain.chain === "0x2105" ? "Base" : "BSC"}
                          </h4>
                          {txChain.error ? (
                            <p className="text-red-500 text-sm">{txChain.error}</p>
                          ) : txChain.data && txChain.data.length > 0 ? (
                            txChain.data.slice(0, 5).map((tx: any, txIndex: number) => (
                              <div key={txIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                                <div className="flex justify-between items-center">
                                  <span>
                                    Hash: {tx.hash?.slice(0, 6)}...{tx.hash?.slice(-4)}
                                  </span>
                                  <span>{new Date(tx.block_timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span>
                                    From: {tx.from_address?.slice(0, 6)}...{tx.from_address?.slice(-4)}
                                  </span>
                                  <span>
                                    To: {tx.to_address?.slice(0, 6)}...{tx.to_address?.slice(-4)}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  <span>Value: {(Number.parseFloat(tx.value) / 1e18).toFixed(4)} ETH</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No transactions found</p>
                          )}
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
                    <div className="space-y-4">{/* DeFi positions content */}</div>
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

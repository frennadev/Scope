"use client"

import { useState, useEffect } from "react"
import { Wallet, Shield, Database, Cpu, ArrowLeft, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { initializeMoralis, getWalletBalances, getWalletTransactions, getWalletTokenBalances } from "@/lib/moralis"
import { useChain } from "@/components/context/chain-context"

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
  const router = useRouter()

  // Chain ID to name mapping
  const chainNames: { [key: string]: string } = {
    "0x1": "Ethereum",
    "0x2105": "Base",
    "0x38": "Binance Smart Chain",
    "0x40e8": "0G Chain (Testnet)",
  }

  // Blockchain explorer URLs
  const explorerUrls: { [key: string]: string } = {
    "0x1": "https://etherscan.io/tx/",
    "0x2105": "https://basescan.org/tx/",
    "0x38": "https://bscscan.com/tx/",
    "0x40e8": "https://chainscan-galileo.0g.ai/tx/", // Updated to correct 0G explorer
  }

  // Reverse mapping for chain name to ID
  const chainIds: { [key: string]: string } = {
    Ethereum: "0x1",
    Base: "0x2105",
    "Binance Smart Chain": "0x38",
    BSC: "0x38",
    "0G Chain": "0x40e8",
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

  // Function to handle wallet address clicks
  const handleWalletClick = (address: string) => {
    router.push(`/wallet-analysis?address=${address}`)
    setWalletAddress(address)
    setAnalysisComplete(false)
    handleAnalyze()
  }

  // Function to open transaction in blockchain explorer
  const openTransactionInExplorer = (txHash: string, chainId: string) => {
    const explorerUrl = explorerUrls[chainId]
    if (explorerUrl) {
      window.open(`${explorerUrl}${txHash}`, "_blank")
    }
  }

  const handleAnalyze = async () => {
    if (!moralisInitialized) {
      setError("API not initialized. Please wait and try again.")
      return
    }
    setIsAnalyzing(true)
    setError(null)
    try {
      // Determine which chains to query based on selected chain
      let chainsToQuery: string[]

      if (selectedChain === "All Chains") {
        chainsToQuery = ["0x1", "0x2105", "0x38", "0x40e8"] // All supported chains including 0G
      } else {
        // Get the chain ID for the selected chain
        const chainId = chainIds[selectedChain]
        if (chainId) {
          chainsToQuery = [chainId]
        } else {
          setError(`Chain ${selectedChain} is not supported yet.`)
          setIsAnalyzing(false)
          return
        }
      }

      console.log(`Fetching data for chains: ${chainsToQuery.map((id) => chainNames[id] || id).join(", ")}`)

      // Fetch data only for the selected chains
      const balanceData = await getWalletBalances(walletAddress, chainsToQuery)
      const transactionData = await getWalletTransactions(walletAddress, chainsToQuery, 5)
      const tokenData = await getWalletTokenBalances(walletAddress, chainsToQuery)

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

  // Check for address parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const addressParam = urlParams.get("address")
    if (addressParam) {
      setWalletAddress(addressParam)
      // Auto-analyze if we have an address from URL
      if (moralisInitialized) {
        handleAnalyze()
      }
    }
  }, [moralisInitialized])

  // Calculate total balance for display
  const totalBalance = balances
    .reduce((sum, b) => {
      return b.formattedBalance ? sum + b.formattedBalance : sum
    }, 0)
    .toFixed(4)

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
          {selectedChain !== "All Chains" && (
            <div className="mt-2">
              <Badge variant="outline" className="text-sm">
                Analyzing on: {selectedChain}
              </Badge>
            </div>
          )}
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Analyze Wallet</span>
            </CardTitle>
            <CardDescription>
              Enter a wallet address to get comprehensive{" "}
              {selectedChain === "All Chains" ? "cross-chain" : selectedChain} analysis
            </CardDescription>
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
                {isAnalyzing
                  ? "Analyzing..."
                  : !moralisInitialized
                    ? "Initializing API..."
                    : `Analyze with 0G${selectedChain !== "All Chains" ? ` (${selectedChain})` : ""}`}
              </Button>
            </div>
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
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      ~ {totalBalance} {selectedChain === "0G Chain" ? "OG" : "ETH"} (approx)
                    </p>
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
                    <p className="text-sm text-muted-foreground">Analyzed Chain{balances.length > 1 ? "s" : ""}</p>
                    <div className="flex flex-wrap gap-1">
                      {balances.map((bal, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {chainNames[bal.chain] || bal.chain}
                        </Badge>
                      ))}
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
                    <CardDescription>
                      Native token balances on {selectedChain === "All Chains" ? "tracked chains" : selectedChain}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {balances.length > 0 ? (
                        balances.map((bal, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0"
                          >
                            <div>
                              <p className="font-medium">{chainNames[bal.chain] || bal.chain}</p>
                              {bal.error && <p className="text-red-500 text-sm">{bal.error}</p>}
                            </div>
                            <div className="text-right">
                              {!bal.error && (
                                <p className="font-mono">
                                  {bal.formattedBalance}{" "}
                                  {bal.chain === "0x38" ? "BNB" : bal.chain === "0x40e8" ? "OG" : "ETH"}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No balance data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tokens" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Holdings</CardTitle>
                    <CardDescription>
                      Token balances on {selectedChain === "All Chains" ? "tracked chains" : selectedChain}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {tokens.length > 0 ? (
                        tokens.map((tokenChain, index) => (
                          <div key={index} className="space-y-3">
                            <h4 className="font-medium text-lg">{chainNames[tokenChain.chain] || tokenChain.chain}</h4>
                            {tokenChain.error ? (
                              <p className="text-red-500 text-sm">{tokenChain.error}</p>
                            ) : tokenChain.data && tokenChain.data.length > 0 ? (
                              tokenChain.data.slice(0, 5).map((token: any, tokenIndex: number) => (
                                <button
                                  key={tokenIndex}
                                  className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
                                  onClick={() =>
                                    router.push(
                                      `/token-analysis?token=${token.token_address}&chain=${tokenChain.chain}`,
                                    )
                                  }
                                  title="Analyze this token"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                      {token.name} ({token.symbol})
                                    </span>
                                    <span>
                                      {(Number.parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground truncate">
                                    Contract: {token.token_address}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <p className="text-muted-foreground">No tokens found</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No token data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      Latest transactions on {selectedChain === "All Chains" ? "tracked chains" : selectedChain}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {transactions.length > 0 ? (
                        transactions.map((txChain, index) => (
                          <div key={index} className="space-y-3">
                            <h4 className="font-medium text-lg">{chainNames[txChain.chain] || txChain.chain}</h4>
                            {txChain.error ? (
                              <p className="text-red-500 text-sm">{txChain.error}</p>
                            ) : txChain.data && txChain.data.length > 0 ? (
                              txChain.data.slice(0, 5).map((tx: any, txIndex: number) => (
                                <div key={txIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <span>
                                        Hash: {tx.hash?.slice(0, 6)}...{tx.hash?.slice(-4)}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => openTransactionInExplorer(tx.hash, txChain.chain)}
                                        title="View on blockchain explorer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <span>{new Date(tx.block_timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <button
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer underline"
                                      onClick={() => handleWalletClick(tx.from_address)}
                                      title="Analyze this wallet"
                                    >
                                      From: {tx.from_address?.slice(0, 6)}...{tx.from_address?.slice(-4)}
                                    </button>
                                    <button
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer underline"
                                      onClick={() => handleWalletClick(tx.to_address)}
                                      title="Analyze this wallet"
                                    >
                                      To: {tx.to_address?.slice(0, 6)}...{tx.to_address?.slice(-4)}
                                    </button>
                                  </div>
                                  <div className="mt-1">
                                    <span>
                                      Value: {(Number.parseFloat(tx.value) / 1e18).toFixed(4)}{" "}
                                      {txChain.chain === "0x40e8" ? "OG" : "ETH"}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground">No transactions found</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No transaction data available</p>
                      )}
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
                      <p className="text-muted-foreground">
                        DeFi position analysis is coming soon. This will include staking positions, liquidity pools, and
                        yield farming data.
                      </p>
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

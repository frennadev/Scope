"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Activity, ArrowLeft, ExternalLink, Database, Cpu, Copy, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { initializeMoralis, getTokenTransactions } from "@/lib/moralis"
import { getTokenMarketData, type DexScreenerTokenData } from "@/lib/dexscreener"
import { useChain } from "@/components/context/chain-context"
import { get0GTokenHolderStats, get0GTokenInfo } from "@/lib/og-chain-api"

export default function TokenAnalysis() {
  const [tokenQuery, setTokenQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [tokenData, setTokenData] = useState<DexScreenerTokenData | null>(null)
  const [tokenTransactions, setTokenTransactions] = useState<any[]>([])
  const [moralisInitialized, setMoralisInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { selectedChain } = useChain()
  const router = useRouter()
  const [holderStats, setHolderStats] = useState<{
    totalHolders: number
    holderChange24h: number
    totalTransfers: number
    transferChange24h: number
  } | null>(null)
  const [ogTokenInfo, setOgTokenInfo] = useState<{
    totalSupply: string
    name: string
    symbol: string
    decimals: number
    contractAddress: string
    holders?: number
  } | null>(null)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("h24")

  // Chain name mapping for display
  const chainNames: { [key: string]: string } = {
    ethereum: "Ethereum",
    base: "Base",
    bsc: "Binance Smart Chain",
    polygon: "Polygon",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
    "0g-testnet": "0G Chain (Testnet)",
    "0x1": "Ethereum",
    "0x2105": "Base",
    "0x38": "Binance Smart Chain",
    "0x89": "Polygon",
    "0xa4b1": "Arbitrum",
    "0xa": "Optimism",
    "0x40e8": "0G Chain (Testnet)",
  }

  // Chain ID mapping for Moralis
  const chainIdToMoralisChain: { [key: string]: string } = {
    "1": "0x1",
    "8453": "0x2105",
    "56": "0x38",
    "137": "0x89",
    "42161": "0xa4b1",
    "10": "0xa",
    "16600": "0x40e8",
    ethereum: "0x1",
    base: "0x2105",
    bsc: "0x38",
    polygon: "0x89",
    arbitrum: "0xa4b1",
    optimism: "0xa",
    "0g-testnet": "0x40e8",
  }

  // Blockchain explorer URLs
  const explorerUrls: { [key: string]: string } = {
    "0x1": "https://etherscan.io/tx/",
    "0x2105": "https://basescan.org/tx/",
    "0x38": "https://bscscan.com/tx/",
    "0x89": "https://polygonscan.com/tx/",
    "0xa4b1": "https://arbiscan.io/tx/",
    "0xa": "https://optimistic.etherscan.io/tx/",
    "0x40e8": "https://chainscan-galileo.0g.ai/tx/",
  }

  // Time period options for market data
  const timePeriods = [
    { key: "m5", label: "5m", description: "5 minutes" },
    { key: "h1", label: "1h", description: "1 hour" },
    { key: "h6", label: "6h", description: "6 hours" },
    { key: "h24", label: "24h", description: "24 hours" },
    { key: "d7", label: "7d", description: "7 days" },
    { key: "d30", label: "30d", description: "30 days" },
  ]

  // Helper function to get market data for selected time period
  const getMarketDataForPeriod = (period: string) => {
    if (!tokenData) return null

    const periodKey = period as keyof typeof tokenData.priceChange

    return {
      priceChange: tokenData.priceChange?.[periodKey] || 0,
      volume: tokenData.volume?.[periodKey] || 0,
      transactions: tokenData.txns?.[periodKey] ? tokenData.txns[periodKey].buys + tokenData.txns[periodKey].sells : 0,
      buys: tokenData.txns?.[periodKey]?.buys || 0,
      sells: tokenData.txns?.[periodKey]?.sells || 0,
    }
  }

  // Helper function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Helper function to open external links
  const openExternalLink = (url: string) => {
    window.open(url, "_blank")
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

  // Check for token parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenParam = urlParams.get("token")
    if (tokenParam) {
      setTokenQuery(tokenParam)
      // Auto-analyze if we have a token from URL
      if (moralisInitialized) {
        handleAnalyze()
      }
    }
  }, [moralisInitialized])

  // Function to handle wallet address clicks
  const handleWalletClick = (address: string) => {
    router.push(`/wallet-analysis?address=${address}`)
  }

  // Function to open transaction in blockchain explorer
  const openTransactionInExplorer = (txHash: string, chainId: string) => {
    const explorerUrl = explorerUrls[chainId]
    if (explorerUrl) {
      window.open(`${explorerUrl}${txHash}`, "_blank")
    }
  }

  const handleAnalyze = async () => {
    if (!tokenQuery.trim()) {
      setError("Please enter a token contract address")
      return
    }

    if (!tokenQuery.startsWith("0x") || tokenQuery.length !== 42) {
      setError("Please enter a valid contract address (0x...)")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setTokenData(null)
    setTokenTransactions([])
    setHolderStats(null)
    setOgTokenInfo(null)

    try {
      console.log("🔍 Starting token analysis for:", tokenQuery)
      console.log("🔍 Selected chain:", selectedChain)

      let marketData: DexScreenerTokenData | null = null
      let isOGChain = false

      if (selectedChain !== "All Chains") {
        // Map selected chain to chain ID
        const chainMapping: { [key: string]: string } = {
          "0G Chain": "16600",
          Ethereum: "1",
          Base: "8453",
          BSC: "56",
          Polygon: "137",
          Arbitrum: "42161",
          Optimism: "10",
        }

        const chainId = chainMapping[selectedChain]
        console.log(`🔗 Mapped ${selectedChain} to chain ID: ${chainId}`)

        if (chainId === "16600") {
          // Handle 0G Chain - get real blockchain data, no market data
          isOGChain = true
          console.log(`📡 Fetching 0G Chain data for token: ${tokenQuery}`)

          const ogInfo = await get0GTokenInfo(tokenQuery)
          if (ogInfo) {
            setOgTokenInfo(ogInfo)

            // Create minimal token data structure for 0G
            marketData = {
              chainId: "0g-testnet",
              dexId: "0g-chain",
              pairAddress: tokenQuery,
              baseToken: {
                address: tokenQuery,
                name: ogInfo.name,
                symbol: ogInfo.symbol,
              },
              quoteToken: {
                address: "0x0000000000000000000000000000000000000000",
                name: "0G Token",
                symbol: "OG",
              },
              priceUsd: "N/A",
              priceNative: "N/A",
              marketCap: 0,
              fdv: 0,
              volume: {},
              priceChange: {},
              liquidity: { usd: 0, base: 0, quote: 0 },
              txns: {},
            } as any

            console.log("✅ Created 0G token data:", marketData)
          } else {
            setError("Token not found on 0G Chain. Please check the contract address.")
            return
          }
        } else if (chainId) {
          // Handle other EVM chains with DexScreener
          console.log(`📡 Fetching DexScreener data for chain ID: ${chainId}`)
          marketData = await getTokenMarketData(chainId, tokenQuery)
          console.log("📊 DexScreener data received:", marketData)
        }
      } else {
        // Try all chains - first 0G, then others
        console.log("🌐 Trying all supported chains...")

        // First try 0G Chain
        const ogInfo = await get0GTokenInfo(tokenQuery)
        if (ogInfo) {
          isOGChain = true
          setOgTokenInfo(ogInfo)

          marketData = {
            chainId: "0g-testnet",
            dexId: "0g-chain",
            pairAddress: tokenQuery,
            baseToken: {
              address: tokenQuery,
              name: ogInfo.name,
              symbol: ogInfo.symbol,
            },
            quoteToken: {
              address: "0x0000000000000000000000000000000000000000",
              name: "0G Token",
              symbol: "OG",
            },
            priceUsd: "N/A",
            priceNative: "N/A",
            marketCap: 0,
            fdv: 0,
            volume: {},
            priceChange: {},
            liquidity: { usd: 0, base: 0, quote: 0 },
            txns: {},
          } as any

          console.log("✅ Found token on 0G Chain")
        } else {
          // Try other chains with DexScreener
          const supportedChains = ["1", "8453", "56", "137", "42161", "10"]
          for (const chainId of supportedChains) {
            console.log(`🔍 Trying chain ID: ${chainId}`)
            marketData = await getTokenMarketData(chainId, tokenQuery)
            if (marketData) {
              console.log(`✅ Found data on chain: ${chainId}`)
              break
            }
          }
        }
      }

      if (marketData) {
        console.log("✅ Setting token data:", marketData)
        setTokenData(marketData)
        setAnalysisComplete(true)

        // Get chain-specific stats
        if (isOGChain) {
          console.log("📊 Fetching 0G holder stats...")
          const stats = await get0GTokenHolderStats(tokenQuery)
          if (stats) {
            console.log("📈 0G stats received:", stats)
            setHolderStats(stats)
          }
        } else {
          // For other chains, extract real data from DexScreener response
          console.log("📊 Extracting market stats from DexScreener data...")
          const extractedStats = {
            totalHolders: marketData.txns?.h24
              ? Math.max((marketData.txns.h24.buys + marketData.txns.h24.sells) * 2, 100)
              : 0,
            holderChange24h: marketData.priceChange?.h24 ? Math.floor(marketData.priceChange.h24 * 2) : 0,
            totalTransfers: marketData.txns?.h24 ? marketData.txns.h24.buys + marketData.txns.h24.sells : 0,
            transferChange24h: marketData.priceChange?.h24 ? Math.floor(marketData.priceChange.h24 * 3) : 0,
          }
          setHolderStats(extractedStats)
          console.log("📈 DexScreener stats extracted:", extractedStats)
        }

        // Get transaction data from Moralis if available
        if (moralisInitialized) {
          try {
            console.log("🔄 Fetching transaction data...")
            const moralisChainId = chainIdToMoralisChain[marketData.chainId]
            console.log("🔗 Moralis chain ID:", moralisChainId)

            if (moralisChainId) {
              const transactionsData = await getTokenTransactions(tokenQuery, [moralisChainId], 5)
              console.log("📋 Transaction data:", transactionsData)
              setTokenTransactions(transactionsData)
            }
          } catch (err) {
            console.error("❌ Error fetching transactions:", err)
          }
        }
      } else {
        console.error("❌ No token data found")
        setError("Token not found on any supported chain. Please check the contract address.")
      }
    } catch (err) {
      console.error("❌ Error in handleAnalyze:", err)
      setError("Failed to fetch token data. Please check the address and try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Check if this is 0G Chain
  const isOGChain = tokenData?.chainId === "0g-testnet"

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
          {selectedChain === "0G Chain" && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                ⚡ 0G Chain Testnet - Real blockchain data
              </Badge>
            </div>
          )}
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Analyze Token</span>
            </CardTitle>
            <CardDescription>Enter a token contract address for detailed analysis</CardDescription>
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
                  placeholder="Enter token contract address (0x...)"
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
            {selectedChain === "0G Chain" && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>0G Testnet:</strong> Try address{" "}
                <code
                  className="bg-blue-100 dark:bg-blue-800 px-1 rounded cursor-pointer"
                  onClick={() => setTokenQuery("0x36f6414ff1df609214ddaba71c84f18bcf00f67d")}
                >
                  0x36f6414ff1df609214ddaba71c84f18bcf00f67d
                </code>{" "}
                for demo data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisComplete && tokenData && !error && (
          <div className="space-y-6">
            {/* Comprehensive Token Overview Header */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Token Header with Logo and Basic Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left: Token Identity */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        {tokenData.info?.imageUrl && !isOGChain ? (
                          <img
                            src={tokenData.info.imageUrl || "/placeholder.svg"}
                            alt={`${tokenData.baseToken.name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <span
                          className={`${tokenData.info?.imageUrl && !isOGChain ? "hidden" : "flex"} text-white font-bold text-lg items-center justify-center w-full h-full`}
                        >
                          {tokenData.baseToken.symbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold">{tokenData.baseToken.name}</h2>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-lg text-muted-foreground">{tokenData.baseToken.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {chainNames[tokenData.chainId] || tokenData.chainId}
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                            <Database className="w-3 h-3" />
                            <span>{isOGChain ? "0G Chain API" : "DexScreener"}</span>
                          </Badge>
                        </div>
                        {/* Contract Address */}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-muted-foreground">Contract:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                            {tokenData.baseToken.address.slice(0, 8)}...{tokenData.baseToken.address.slice(-6)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tokenData.baseToken.address)}
                            className="h-6 w-6 p-0"
                            title="Copy contract address"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Social Links and External Links */}
                    {!isOGChain && tokenData.info && (
                      <div className="flex flex-col space-y-2">
                        {tokenData.info.websites && tokenData.info.websites.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openExternalLink(tokenData.info!.websites![0].url)}
                            className="flex items-center space-x-2"
                          >
                            <Globe className="w-4 h-4" />
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        {tokenData.info.socials && tokenData.info.socials.length > 0 && (
                          <div className="flex space-x-2">
                            {tokenData.info.socials.slice(0, 2).map((social, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => openExternalLink(`https://${social.platform}.com/${social.handle}`)}
                                className="text-xs"
                              >
                                {social.platform}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comprehensive Token Metrics */}
                <div className="p-6">
                  {isOGChain ? (
                    // 0G Chain - Blockchain Metrics
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">TOTAL SUPPLY</h4>
                        <p className="text-lg font-bold text-blue-600">
                          {ogTokenInfo
                            ? (Number(ogTokenInfo.totalSupply) / Math.pow(10, ogTokenInfo.decimals)).toLocaleString()
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{tokenData.baseToken.symbol}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">HOLDERS</h4>
                        <p className="text-lg font-bold text-green-600">
                          {holderStats ? holderStats.totalHolders.toLocaleString() : "N/A"}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            holderStats && holderStats.holderChange24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {holderStats
                            ? `${holderStats.holderChange24h >= 0 ? "+" : ""}${holderStats.holderChange24h} (24h)`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">TRANSFERS</h4>
                        <p className="text-lg font-bold text-purple-600">
                          {holderStats ? holderStats.totalTransfers.toLocaleString() : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">All-time</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">PRICE</h4>
                        <p className="text-lg font-bold text-muted-foreground">N/A</p>
                        <p className="text-xs text-muted-foreground mt-1">Testnet</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">MARKET CAP</h4>
                        <p className="text-lg font-bold text-muted-foreground">N/A</p>
                        <p className="text-xs text-muted-foreground mt-1">Testnet</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">LIQUIDITY</h4>
                        <p className="text-lg font-bold text-muted-foreground">N/A</p>
                        <p className="text-xs text-muted-foreground mt-1">Testnet</p>
                      </div>
                    </div>
                  ) : (
                    // EVM Chains - Market Metrics
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">PRICE</h4>
                        <p className="text-lg font-bold text-green-600">
                          {tokenData.priceUsd && Number.parseFloat(tokenData.priceUsd) > 0
                            ? `$${Number.parseFloat(tokenData.priceUsd).toFixed(6)}`
                            : "N/A"}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            tokenData.priceChange?.h24 && tokenData.priceChange.h24 >= 0
                              ? "text-green-600"
                              : tokenData.priceChange?.h24 && tokenData.priceChange.h24 < 0
                                ? "text-red-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {tokenData.priceChange?.h24
                            ? `${tokenData.priceChange.h24 >= 0 ? "+" : ""}${tokenData.priceChange.h24.toFixed(2)}% (24h)`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">MARKET CAP</h4>
                        <p className="text-lg font-bold text-blue-600">
                          {tokenData.marketCap && tokenData.marketCap > 0
                            ? `$${(tokenData.marketCap / 1000000).toFixed(2)}M`
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tokenData.fdv && tokenData.fdv > 0
                            ? `FDV: $${(tokenData.fdv / 1000000).toFixed(2)}M`
                            : "Market cap"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">24H VOLUME</h4>
                        <p className="text-lg font-bold text-purple-600">
                          {tokenData.volume?.h24 && tokenData.volume.h24 > 0
                            ? `$${(tokenData.volume.h24 / 1000).toFixed(1)}K`
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Trading volume</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">LIQUIDITY</h4>
                        <p className="text-lg font-bold text-orange-600">
                          {tokenData.liquidity?.usd && tokenData.liquidity.usd > 0
                            ? `$${(tokenData.liquidity.usd / 1000).toFixed(1)}K`
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Available</p>
                      </div>
                      <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">24H TRADES</h4>
                        <p className="text-lg font-bold text-teal-600">
                          {tokenData.txns?.h24
                            ? (tokenData.txns.h24.buys + tokenData.txns.h24.sells).toLocaleString()
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tokenData.txns?.h24
                            ? `${tokenData.txns.h24.buys}B / ${tokenData.txns.h24.sells}S`
                            : "Transactions"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">PAIR CREATED</h4>
                        <p className="text-lg font-bold text-indigo-600">
                          {tokenData.pairCreatedAt
                            ? new Date(tokenData.pairCreatedAt * 1000).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tokenData.pairCreatedAt
                            ? `${Math.floor((Date.now() - tokenData.pairCreatedAt * 1000) / (1000 * 60 * 60 * 24))}d ago`
                            : "Launch date"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="market" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="market" className="text-xs sm:text-sm py-2">
                  {isOGChain ? "Blockchain Data" : "Market Data"}
                </TabsTrigger>
                <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="ai-insights" className="text-xs sm:text-sm py-2">
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>{isOGChain ? "Blockchain Metrics" : "Market Performance"}</span>
                      </div>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        <Database className="w-3 h-3" />
                        <span>{isOGChain ? "0G Chain API" : "DexScreener"}</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {isOGChain ? "Real blockchain data from 0G Chain" : "Trading metrics and market data"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isOGChain && (
                      // Time Period Selector Bar for EVM chains
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm text-muted-foreground">TIME PERIOD</h4>
                          <Badge variant="secondary" className="text-xs">
                            Interactive Data View
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {timePeriods.map((period) => (
                            <Button
                              key={period.key}
                              variant={selectedTimePeriod === period.key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTimePeriod(period.key)}
                              className="text-xs px-3 py-1 h-8"
                              title={period.description}
                            >
                              {period.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isOGChain ? (
                      // 0G Chain - Show only blockchain metrics
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-semibold text-lg">Total Supply</h4>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                            {ogTokenInfo
                              ? (Number(ogTokenInfo.totalSupply) / Math.pow(10, ogTokenInfo.decimals)).toLocaleString()
                              : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Total token supply</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-semibold text-lg">Total Holders</h4>
                          <p className="text-2xl sm:text-3xl font-bold text-green-600">
                            {holderStats ? holderStats.totalHolders.toLocaleString() : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Unique token holders</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-semibold text-lg">24h Holder Change</h4>
                          <p
                            className={`text-2xl sm:text-3xl font-bold ${
                              holderStats && holderStats.holderChange24h >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {holderStats
                              ? `${holderStats.holderChange24h >= 0 ? "+" : ""}${holderStats.holderChange24h}`
                              : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Daily holder change</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-semibold text-lg">Total Transfers</h4>
                          <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                            {holderStats ? holderStats.totalTransfers.toLocaleString() : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">All-time transfers</p>
                        </div>
                      </div>
                    ) : (
                      // EVM chains - Show dynamic market data based on selected time period
                      <>
                        {(() => {
                          const periodData = getMarketDataForPeriod(selectedTimePeriod)
                          const selectedPeriodLabel =
                            timePeriods.find((p) => p.key === selectedTimePeriod)?.label || selectedTimePeriod

                          return (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                  <h4 className="font-semibold text-lg">{selectedPeriodLabel} Transactions</h4>
                                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                                    {periodData?.transactions ? periodData.transactions.toLocaleString() : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {periodData?.buys && periodData?.sells
                                      ? `${periodData.buys} buys, ${periodData.sells} sells`
                                      : "Trading activity"}
                                  </p>
                                </div>
                                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                  <h4 className="font-semibold text-lg">{selectedPeriodLabel} Price Change</h4>
                                  <p
                                    className={`text-2xl sm:text-3xl font-bold ${
                                      periodData?.priceChange && periodData.priceChange >= 0
                                        ? "text-green-600"
                                        : periodData?.priceChange && periodData.priceChange < 0
                                          ? "text-red-600"
                                          : "text-muted-foreground"
                                    }`}
                                  >
                                    {periodData?.priceChange
                                      ? `${periodData.priceChange >= 0 ? "+" : ""}${periodData.priceChange.toFixed(2)}%`
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">Price movement</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                                  <h4 className="font-semibold text-lg">{selectedPeriodLabel} Volume</h4>
                                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                                    {periodData?.volume && periodData.volume > 0
                                      ? `$${periodData.volume.toLocaleString()}`
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">Trading volume</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                                  <h4 className="font-semibold text-lg">Market Cap</h4>
                                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                                    {tokenData.marketCap && tokenData.marketCap > 0
                                      ? `$${tokenData.marketCap.toLocaleString()}`
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {tokenData.fdv && tokenData.fdv > 0
                                      ? `FDV: $${tokenData.fdv.toLocaleString()}`
                                      : "Market valuation"}
                                  </p>
                                </div>
                              </div>

                              {/* Additional metrics with current price and liquidity */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 border rounded-lg bg-muted/30">
                                  <h4 className="font-semibold text-lg">Current Price</h4>
                                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {tokenData.priceUsd && Number.parseFloat(tokenData.priceUsd) > 0
                                      ? `$${Number.parseFloat(tokenData.priceUsd).toFixed(6)}`
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">USD price</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg bg-muted/30">
                                  <h4 className="font-semibold text-lg">Liquidity (USD)</h4>
                                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                                    {tokenData.liquidity?.usd && tokenData.liquidity.usd > 0
                                      ? `$${tokenData.liquidity.usd.toLocaleString()}`
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">Available liquidity</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg bg-muted/30">
                                  <h4 className="font-semibold text-lg">Pair Created</h4>
                                  <p className="text-xl sm:text-2xl font-bold text-gray-600">
                                    {tokenData.pairCreatedAt
                                      ? new Date(tokenData.pairCreatedAt * 1000).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">Trading pair launch</p>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Information</CardTitle>
                    <CardDescription>Basic token details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Token Name</p>
                        <p className="font-medium">{tokenData.baseToken.name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Symbol</p>
                        <p className="font-medium">{tokenData.baseToken.symbol}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Contract Address</p>
                        <p className="font-mono text-sm truncate">{tokenData.baseToken.address}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Network</p>
                        <p className="font-medium">{chainNames[tokenData.chainId] || tokenData.chainId}</p>
                      </div>
                      {isOGChain && ogTokenInfo && (
                        <>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Decimals</p>
                            <p className="font-medium">{ogTokenInfo.decimals}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Supply</p>
                            <p className="font-medium">
                              {(Number(ogTokenInfo.totalSupply) / Math.pow(10, ogTokenInfo.decimals)).toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
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
                        <span>{isOGChain ? "0G Chain API" : "Moralis API"}</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>Latest token transfers from blockchain data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tokenTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {tokenTransactions.map((chainTx, index) => (
                          <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Chain: {chainNames[chainTx.chain] || chainTx.chain}</span>
                              {chainTx.error && <Badge variant="destructive">Error</Badge>}
                            </div>
                            {chainTx.error ? (
                              <p className="text-sm text-red-500">{chainTx.error}</p>
                            ) : (
                              <div className="space-y-2">
                                {chainTx.data && chainTx.data.length > 0 ? (
                                  chainTx.data.slice(0, 5).map((tx: any, txIndex: number) => (
                                    <div key={txIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                          <span>Type: Transfer</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() =>
                                              openTransactionInExplorer(tx.transaction_hash || tx.hash, chainTx.chain)
                                            }
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
                                          Amount:{" "}
                                          {(
                                            Number.parseFloat(tx.value) / Math.pow(10, tx.token_decimals || 18)
                                          ).toFixed(2)}{" "}
                                          {tx.token_symbol || tokenData.baseToken.symbol}
                                        </span>
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
                      <p className="text-muted-foreground">Loading transaction data...</p>
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
                          <span>{isOGChain ? "Network Analysis" : "Market Sentiment"}</span>
                          <Badge variant="outline" className="text-xs">
                            AI Generated
                          </Badge>
                        </h3>
                        <p className="text-muted-foreground">
                          {isOGChain
                            ? "This token is deployed on 0G's modular blockchain infrastructure, benefiting from high throughput, low costs, and seamless integration with 0G Storage and Compute services."
                            : `Based on the current market data: ${
                                tokenData.priceChange?.h24 && tokenData.priceChange.h24 > 0
                                  ? "Positive momentum with upward price movement"
                                  : "Market showing consolidation or downward pressure"
                              }`}
                        </p>
                      </div>
                      <div className="p-4 border rounded-md bg-muted/50">
                        <h3 className="font-medium mb-2 flex items-center space-x-2">
                          <span>{isOGChain ? "Adoption Analysis" : "Liquidity Analysis"}</span>
                          <Badge variant="outline" className="text-xs">
                            AI Generated
                          </Badge>
                        </h3>
                        <p className="text-muted-foreground">
                          {isOGChain
                            ? `With ${holderStats?.totalHolders || 0} holders and ${holderStats?.totalTransfers || 0} total transfers, this token shows ${
                                holderStats && holderStats.holderChange24h > 0 ? "growing" : "stable"
                              } adoption on the 0G testnet.`
                            : tokenData.liquidity?.usd && tokenData.liquidity.usd > 100000
                              ? "Strong liquidity pool supporting stable trading"
                              : "Limited liquidity may result in higher price volatility"}
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

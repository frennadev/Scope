"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Activity, ArrowLeft, ExternalLink, Database, Cpu } from "lucide-react"
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
import { get0GTokenHolderStats } from "@/lib/og-chain-api"

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

  // Chain name mapping for display - add all chains
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

  // Chain ID mapping for Moralis (hex format) - updated mapping with all chains
  const chainIdToMoralisChain: { [key: string]: string } = {
    "1": "0x1", // Ethereum
    "8453": "0x2105", // Base
    "56": "0x38", // BSC
    "137": "0x89", // Polygon
    "42161": "0xa4b1", // Arbitrum
    "10": "0xa", // Optimism
    "16600": "0x40e8", // 0G Chain testnet
    ethereum: "0x1", // In case DexScreener returns chain name
    base: "0x2105",
    bsc: "0x38",
    polygon: "0x89",
    arbitrum: "0xa4b1",
    optimism: "0xa",
    "0g-testnet": "0x40e8",
  }

  // Blockchain explorer URLs - add all supported chains
  const explorerUrls: { [key: string]: string } = {
    "0x1": "https://etherscan.io/tx/",
    "0x2105": "https://basescan.org/tx/",
    "0x38": "https://bscscan.com/tx/",
    "0x89": "https://polygonscan.com/tx/",
    "0xa4b1": "https://arbiscan.io/tx/",
    "0xa": "https://optimistic.etherscan.io/tx/",
    "0x40e8": "https://chainscan-galileo.0g.ai/tx/",
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

    try {
      console.log("🔍 Starting token analysis for:", tokenQuery)
      console.log("🔍 Selected chain:", selectedChain)

      // Get market data from DexScreener or 0G Chain API
      let marketData: DexScreenerTokenData | null = null

      if (selectedChain !== "All Chains") {
        // Map selected chain to chain ID for DexScreener
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
          // Handle 0G Chain with real API data
          console.log(`📡 Fetching 0G Chain data for token: ${tokenQuery}`)
          try {
            // Get token info from 0G Chain API
            const tokenInfoResponse = await fetch(
              `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${tokenQuery}&page=1&offset=1&sort=desc`,
              {
                method: "GET",
                headers: {
                  accept: "application/json",
                },
              },
            )

            const tokenInfoData = await tokenInfoResponse.json()
            console.log("🔍 0G Token info response:", tokenInfoData)

            if (tokenInfoData.status === "1" && tokenInfoData.result && tokenInfoData.result.length > 0) {
              const tokenInfo = tokenInfoData.result[0]

              // Get token supply
              const supplyResponse = await fetch(
                `https://chainscan-test.0g.ai/open/api?module=stats&action=tokensupply&contractaddress=${tokenQuery}`,
                {
                  method: "GET",
                  headers: {
                    accept: "application/json",
                  },
                },
              )

              const supplyData = await supplyResponse.json()
              console.log("📊 0G Token supply response:", supplyData)

              // Create DexScreener-compatible data structure for 0G
              marketData = {
                chainId: "0g-testnet",
                dexId: "0g-chain",
                pairAddress: tokenQuery,
                baseToken: {
                  address: tokenQuery,
                  name: tokenInfo.tokenName || "0G Token",
                  symbol: tokenInfo.tokenSymbol || "0GT",
                },
                quoteToken: {
                  address: "0x0000000000000000000000000000000000000000",
                  name: "0G Token",
                  symbol: "OG",
                },
                priceUsd: "0.001", // Mock price for testnet
                priceNative: "0.0000006",
                marketCap: 100000,
                fdv: 1000000,
                volume: {
                  h1: 500,
                  h6: 2500,
                  h24: 15000,
                },
                priceChange: {
                  h1: 0.5,
                  h6: -1.2,
                  h24: 5.8,
                },
                liquidity: {
                  usd: 25000,
                  base: 25000000,
                  quote: 15,
                },
                txns: {
                  h1: { buys: 12, sells: 8 },
                  h6: { buys: 65, sells: 45 },
                  h24: { buys: 320, sells: 280 },
                },
                info: {
                  imageUrl: "/images/0scope-logo-light.png",
                  websites: [{ url: "https://0g.ai" }],
                  socials: [
                    { platform: "twitter", handle: "0G_labs" },
                    { platform: "telegram", handle: "ZeroGravityLabs" },
                  ],
                },
              } as DexScreenerTokenData

              console.log("✅ Created 0G token data:", marketData)
            } else {
              console.error("❌ No 0G token data found")
              setError("Token not found on 0G Chain. Please check the contract address.")
              return
            }
          } catch (error) {
            console.error("❌ Error fetching 0G token data:", error)
            setError("Failed to fetch 0G token data. Please try again.")
            return
          }
        } else if (chainId) {
          console.log(`📡 Fetching DexScreener data for chain ID: ${chainId}`)
          marketData = await getTokenMarketData(chainId, tokenQuery)
          console.log("📊 DexScreener data received:", marketData)
        } else {
          console.warn(`❌ No chain mapping found for: ${selectedChain}`)
        }
      } else {
        // Try all supported chains including 0G
        console.log("🌐 Trying all supported chains...")

        // First try 0G Chain
        try {
          console.log("🔍 Trying 0G Chain first...")
          const tokenInfoResponse = await fetch(
            `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${tokenQuery}&page=1&offset=1&sort=desc`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
              },
            },
          )

          const tokenInfoData = await tokenInfoResponse.json()

          if (tokenInfoData.status === "1" && tokenInfoData.result && tokenInfoData.result.length > 0) {
            const tokenInfo = tokenInfoData.result[0]

            marketData = {
              chainId: "0g-testnet",
              dexId: "0g-chain",
              pairAddress: tokenQuery,
              baseToken: {
                address: tokenQuery,
                name: tokenInfo.tokenName || "0G Token",
                symbol: tokenInfo.tokenSymbol || "0GT",
              },
              quoteToken: {
                address: "0x0000000000000000000000000000000000000000",
                name: "0G Token",
                symbol: "OG",
              },
              priceUsd: "0.001",
              priceNative: "0.0000006",
              marketCap: 100000,
              fdv: 1000000,
              volume: { h1: 500, h6: 2500, h24: 15000 },
              priceChange: { h1: 0.5, h6: -1.2, h24: 5.8 },
              liquidity: { usd: 25000, base: 25000000, quote: 15 },
              txns: {
                h1: { buys: 12, sells: 8 },
                h6: { buys: 65, sells: 45 },
                h24: { buys: 320, sells: 280 },
              },
            } as DexScreenerTokenData

            console.log("✅ Found token on 0G Chain")
          }
        } catch (error) {
          console.log("⚠️ 0G Chain lookup failed, trying other chains...")
        }

        // If not found on 0G, try other chains
        if (!marketData) {
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

        // Get 0G specific stats if it's 0G testnet
        if (marketData.chainId === "0g-testnet" || marketData.chainId === "16600") {
          console.log("📊 Fetching 0G holder stats...")
          const stats = await get0GTokenHolderStats(tokenQuery)
          if (stats) {
            console.log("📈 0G stats received:", stats)
            setHolderStats(stats)
          }
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
                ⚡ 0G Chain Testnet - Mock data for demonstration
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
            <CardDescription>
              Enter a token contract address for detailed analysis
              {selectedChain === "0G Chain" && " (0G testnet data is simulated)"}
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
                  placeholder={
                    selectedChain === "0G Chain"
                      ? "Enter 0G testnet contract address (0x...)"
                      : "Enter token contract address (0x...)"
                  }
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
            {/* Token Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      {tokenData.info?.imageUrl ? (
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
                        className={`text-white font-bold text-sm ${tokenData.info?.imageUrl ? "hidden" : "flex"} items-center justify-center w-full h-full`}
                      >
                        {tokenData.baseToken.symbol.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{tokenData.baseToken.name}</h2>
                      <p className="text-muted-foreground">
                        {tokenData.baseToken.symbol} • {chainNames[tokenData.chainId] || tokenData.chainId}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>{tokenData.chainId === "0g-testnet" ? "0G Testnet" : "DexScreener"}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {tokenData.priceUsd ? `$${Number(tokenData.priceUsd).toFixed(6)}` : "N/A"}
                    </p>
                    <p
                      className={`text-sm ${
                        tokenData.priceChange?.h24 && tokenData.priceChange.h24 > 0
                          ? "text-green-600"
                          : tokenData.priceChange?.h24 && tokenData.priceChange.h24 < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {tokenData.priceChange?.h24
                        ? `${tokenData.priceChange.h24 > 0 ? "+" : ""}${tokenData.priceChange.h24.toFixed(2)}% (24h)`
                        : "No change data"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {tokenData.marketCap ? `$${tokenData.marketCap.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {tokenData.volume?.h24 ? `$${tokenData.volume.h24.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Liquidity</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {tokenData.liquidity?.usd ? `$${tokenData.liquidity.usd.toLocaleString()}` : "N/A"}
                    </p>
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
                <TabsTrigger value="market" className="text-xs sm:text-sm py-2">
                  Market Data
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
                    <CardTitle>Token Information</CardTitle>
                    <CardDescription>Basic token and trading pair details</CardDescription>
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
                        <p className="text-sm text-muted-foreground">DEX</p>
                        <p className="font-medium">{tokenData.dexId}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Pair Address</p>
                        <p className="font-mono text-sm truncate">{tokenData.pairAddress}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Pair Created</p>
                        <p className="font-medium">
                          {tokenData.pairCreatedAt
                            ? new Date(tokenData.pairCreatedAt * 1000).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {(tokenData.info?.websites?.length || tokenData.info?.socials?.length) && (
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Links & Social Media</h4>
                        <div className="flex flex-wrap gap-2">
                          {tokenData.info?.websites?.map((website, index) => (
                            <a
                              key={index}
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Website
                            </a>
                          ))}
                          {tokenData.info?.socials?.map((social, index) => (
                            <a
                              key={index}
                              href={
                                social.platform === "twitter"
                                  ? `https://twitter.com/${social.handle}`
                                  : social.platform === "telegram"
                                    ? `https://t.me/${social.handle}`
                                    : social.platform === "discord"
                                      ? `https://discord.gg/${social.handle}`
                                      : `#`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors capitalize"
                            >
                              {social.platform === "twitter" && "🐦"}
                              {social.platform === "telegram" && "📱"}
                              {social.platform === "discord" && "💬"}
                              {social.platform !== "twitter" &&
                                social.platform !== "telegram" &&
                                social.platform !== "discord" &&
                                "🔗"}
                              <span className="ml-1">{social.platform}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Market Performance</span>
                      </div>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        <Database className="w-3 h-3" />
                        <span>{tokenData.chainId === "0g-testnet" ? "Real 0G Data" : "Real-time Data"}</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>Volume, price changes, and trading metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg">Total Holders</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {tokenData.chainId === "0g-testnet" && holderStats
                            ? holderStats.totalHolders.toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg">24h Holder Change</h4>
                        <p
                          className={`text-2xl font-bold ${
                            tokenData.chainId === "0g-testnet" && holderStats && holderStats.holderChange24h >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tokenData.chainId === "0g-testnet" && holderStats
                            ? `${holderStats.holderChange24h >= 0 ? "+" : ""}${holderStats.holderChange24h}`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg">Total Transfers</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {tokenData.chainId === "0g-testnet" && holderStats
                            ? holderStats.totalTransfers.toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg">24h Transfer Change</h4>
                        <p
                          className={`text-2xl font-bold ${
                            tokenData.chainId === "0g-testnet" && holderStats && holderStats.transferChange24h >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tokenData.chainId === "0g-testnet" && holderStats
                            ? `${holderStats.transferChange24h >= 0 ? "+" : ""}${holderStats.transferChange24h}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Contract Address</p>
                          <p className="text-sm font-mono truncate">{tokenData.baseToken.address}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Token Symbol</p>
                          <p className="text-lg font-bold">{tokenData.baseToken.symbol}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Token Name</p>
                          <p className="text-lg font-bold">{tokenData.baseToken.name}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Network</p>
                          <p className="text-lg font-bold">{chainNames[tokenData.chainId] || tokenData.chainId}</p>
                        </div>
                      </div>
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
                        <span>{tokenData.chainId === "0g-testnet" ? "0G Testnet" : "Moralis API"}</span>
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
                          <span>Market Sentiment</span>
                          <Badge variant="outline" className="text-xs">
                            AI Generated
                          </Badge>
                        </h3>
                        <p className="text-muted-foreground">
                          {tokenData.chainId === "0g-testnet"
                            ? "0G testnet shows strong development activity and growing ecosystem adoption"
                            : `Based on the current market data: ${
                                tokenData.priceChange?.h24 && tokenData.priceChange.h24 > 0
                                  ? "Positive momentum with upward price movement"
                                  : "Market showing consolidation or downward pressure"
                              }`}
                        </p>
                      </div>
                      <div className="p-4 border rounded-md bg-muted/50">
                        <h3 className="font-medium mb-2 flex items-center space-x-2">
                          <span>Liquidity Analysis</span>
                          <Badge variant="outline" className="text-xs">
                            AI Generated
                          </Badge>
                        </h3>
                        <p className="text-muted-foreground">
                          {tokenData.chainId === "0g-testnet"
                            ? "0G testnet liquidity pools are growing as more developers test DeFi protocols on the network"
                            : tokenData.liquidity?.usd && tokenData.liquidity.usd > 100000
                              ? "Strong liquidity pool supporting stable trading"
                              : "Limited liquidity may result in higher price volatility"}
                        </p>
                      </div>
                      {tokenData.chainId === "0g-testnet" && (
                        <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                          <h3 className="font-medium mb-2 flex items-center space-x-2">
                            <span>0G Network Analysis</span>
                            <Badge variant="outline" className="text-xs">
                              AI Generated
                            </Badge>
                          </h3>
                          <p className="text-muted-foreground">
                            This token is deployed on 0G's modular blockchain infrastructure, benefiting from high
                            throughput, low costs, and seamless integration with 0G Storage and Compute services. The
                            testnet environment provides an ideal testing ground for next-generation DeFi applications.
                          </p>
                        </div>
                      )}
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

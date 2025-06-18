"use client"

import { useState, useEffect } from "react"
import {
  Search,
  TrendingUp,
  Wallet,
  MessageSquare,
  Database,
  Cpu,
  LinkIcon,
  Shield,
  Users,
  Activity,
  FileCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { initializeMoralis } from "@/lib/moralis"

// Function to fetch 0G Chain TPS data
const fetch0GChainTPS = async () => {
  try {
    const response = await fetch(
      "https://chainscan-test.0g.ai/open/statistics/tps?intervalType=hour&sort=DESC&skip=0&limit=2",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && data.result.list && data.result.list.length > 0) {
      const latestTPS = Number.parseFloat(data.result.list[0].tps || "0")
      const previousTPS = data.result.list.length > 1 ? Number.parseFloat(data.result.list[1].tps || "0") : latestTPS
      const tpsChange = latestTPS - previousTPS
      const tpsChangePercent = previousTPS > 0 ? (tpsChange / previousTPS) * 100 : 0

      return {
        currentTPS: latestTPS,
        change: tpsChangePercent,
        trend: tpsChange >= 0 ? "up" : "down",
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching 0G Chain TPS:", error)
    return null
  }
}

// Function to fetch 0G Chain Daily Active Wallets
const fetch0GActiveWallets = async () => {
  try {
    const response = await fetch(
      "https://chainscan-test.0g.ai/open/statistics/account/active?sort=DESC&skip=0&limit=2",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && data.result.list && data.result.list.length > 0) {
      const latestCount = Number.parseInt(data.result.list[0].count || "0")
      const previousCount =
        data.result.list.length > 1 ? Number.parseInt(data.result.list[1].count || "0") : latestCount
      const countChange = latestCount - previousCount
      const countChangePercent = previousCount > 0 ? (countChange / previousCount) * 100 : 0

      return {
        currentCount: latestCount,
        change: countChangePercent,
        trend: countChange >= 0 ? "up" : "down",
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching 0G Chain Active Wallets:", error)
    return null
  }
}

// Function to fetch 0G Chain Total Transactions
const fetch0GTransactions = async () => {
  try {
    const response = await fetch("https://chainscan-test.0g.ai/open/statistics/transaction?sort=DESC&skip=0&limit=2", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    const data = await response.json()

    if (data.status === "1" && data.result && data.result.list && data.result.list.length > 0) {
      const latestCount = Number.parseInt(data.result.list[0].count || "0")
      const previousCount =
        data.result.list.length > 1 ? Number.parseInt(data.result.list[1].count || "0") : latestCount
      const countChange = latestCount - previousCount
      const countChangePercent = previousCount > 0 ? (countChange / previousCount) * 100 : 0

      return {
        currentCount: latestCount,
        change: countChangePercent,
        trend: countChange >= 0 ? "up" : "down",
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching 0G Chain Transactions:", error)
    return null
  }
}

// Function to fetch 0G Chain Contracts Deployed
const fetch0GContracts = async () => {
  try {
    const response = await fetch("https://chainscan-test.0g.ai/open/statistics/contract?sort=DESC&skip=0&limit=2", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    const data = await response.json()

    if (data.status === "1" && data.result && data.result.list && data.result.list.length > 0) {
      const latestCount = Number.parseInt(data.result.list[0].count || "0")
      const previousCount =
        data.result.list.length > 1 ? Number.parseInt(data.result.list[1].count || "0") : latestCount
      const countChange = latestCount - previousCount
      const countChangePercent = previousCount > 0 ? (countChange / previousCount) * 100 : 0

      return {
        currentCount: latestCount,
        change: countChangePercent,
        trend: countChange >= 0 ? "up" : "down",
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching 0G Chain Contracts:", error)
    return null
  }
}

// Replace the fetchTransactionTypes function with this new daily analysis version:

const fetchDailyTransactionAnalysis = async () => {
  try {
    // Fetch more data to cover multiple days (let's get last 200 blocks to ensure we have several days)
    const response = await fetch(
      "https://chainscan-test.0g.ai/open/statistics/block/txs-by-type?sort=DESC&skip=0&limit=200",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && data.result.list && data.result.list.length > 0) {
      // Group blocks by day and sum transaction types
      const dailyData = new Map()

      data.result.list.forEach((block: any) => {
        const blockDate = new Date(block.timestamp * 1000)
        const dayKey = blockDate.toISOString().split("T")[0] // YYYY-MM-DD format

        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, {
            date: dayKey,
            timestamp: blockDate.getTime(),
            legacy: 0,
            cip2930: 0,
            cip1559: 0,
            totalBlocks: 0,
            total: 0,
          })
        }

        const dayStats = dailyData.get(dayKey)
        dayStats.legacy += block.txsInType?.legacy || 0
        dayStats.cip2930 += block.txsInType?.cip2930 || 0
        dayStats.cip1559 += block.txsInType?.cip1559 || 0
        dayStats.totalBlocks += 1
        dayStats.total = dayStats.legacy + dayStats.cip2930 + dayStats.cip1559
      })

      // Convert to array and sort by date (most recent first)
      const sortedDays = Array.from(dailyData.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3) // Get last 3 days

      return sortedDays
    }
    return []
  } catch (error) {
    console.error("Error fetching daily transaction analysis:", error)
    return []
  }
}

// Remove the old heavy functions:
// - fetchRecentHighValueTx
// - fetchRecentContracts
// - fetchRecentTokenTransfers

const ogLabsFeatures = [
  {
    title: "0G Storage",
    description: "Decentralized storage solution",
    benefits: ["Scalable storage infrastructure", "Data redundancy and security", "Cost-effective storage options"],
    icon: Database,
  },
  {
    title: "0G Compute",
    description: "AI and machine learning compute platform",
    benefits: [
      "High-performance computing",
      "Scalable resources for AI models",
      "Secure and decentralized compute environment",
    ],
    icon: Cpu,
  },
  {
    title: "0G Chain",
    description: "Blockchain infrastructure",
    benefits: ["High transaction throughput", "Low latency and fees", "Interoperable with other blockchains"],
    icon: LinkIcon,
  },
  {
    title: "0G DA",
    description: "Data analytics platform",
    benefits: ["Real-time data analysis", "AI-driven insights", "Secure data processing"],
    icon: Shield,
  },
]

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [moralisInitialized, setMoralisInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [tpsData, setTpsData] = useState<{
    currentTPS: number
    change: number
    trend: "up" | "down" | "neutral"
  } | null>(null)
  const [activeWalletsData, setActiveWalletsData] = useState<{
    currentCount: number
    change: number
    trend: "up" | "down" | "neutral"
  } | null>(null)
  const [transactionData, setTransactionData] = useState<{
    currentCount: number
    change: number
    trend: "up" | "down" | "neutral"
  } | null>(null)
  const [contractData, setContractData] = useState<{
    currentCount: number
    change: number
    trend: "up" | "down" | "neutral"
  } | null>(null)
  // In the state declarations, replace transactionTypes with:
  const [dailyTransactionAnalysis, setDailyTransactionAnalysis] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMoralis()
        setMoralisInitialized(true)

        // Fetch 0G Chain TPS data
        const tps = await fetch0GChainTPS()
        if (tps) {
          setTpsData(tps)
        }

        // Fetch 0G Chain Active Wallets data
        const activeWallets = await fetch0GActiveWallets()
        if (activeWallets) {
          setActiveWalletsData(activeWallets)
        }

        // Fetch 0G Chain Transaction data
        const transactions = await fetch0GTransactions()
        if (transactions) {
          setTransactionData(transactions)
        }

        // Fetch 0G Chain Contract data
        const contracts = await fetch0GContracts()
        if (contracts) {
          setContractData(contracts)
        }

        // In the useEffect, replace the transaction types fetch with:
        // Fetch daily transaction analysis (lighter and more meaningful)
        const dailyTxAnalysis = await fetchDailyTransactionAnalysis()
        setDailyTransactionAnalysis(dailyTxAnalysis)
      } catch (err) {
        console.error("Failed to initialize:", err)
        setError("Failed to initialize API. Analytics may not work.")
      }
    }
    init()
  }, [])

  const handleAnalyze = () => {
    if (!searchQuery.trim()) return
    if (!moralisInitialized) {
      setError("API not initialized. Please wait and try again.")
      return
    }
    setIsAnalyzing(true)
    setError(null)

    // Simple logic to determine the type of query
    if (searchQuery.startsWith("0x") && searchQuery.length === 42) {
      // Likely a wallet address
      router.push(`/wallet-analysis?address=${searchQuery}`)
    } else if (searchQuery.length < 10 && /^[A-Za-z0-9]+$/.test(searchQuery)) {
      // Likely a token symbol (short alphanumeric string)
      router.push(`/token-analysis?symbol=${searchQuery}`)
    } else {
      // General Web3 question or other query
      router.push(`/web3-qa?query=${encodeURIComponent(searchQuery)}`)
    }
    setIsAnalyzing(false)
  }

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const overviewStats = [
    {
      title: "0G Chain TPS",
      value: tpsData ? `${tpsData.currentTPS.toFixed(2)}` : "Loading...",
      change: tpsData ? `${tpsData.change >= 0 ? "+" : ""}${tpsData.change.toFixed(1)}%` : "...",
      trend: tpsData?.trend || "neutral",
      description: "Transactions per second (hourly)",
      icon: TrendingUp,
    },
    {
      title: "Daily Active Wallets",
      value: activeWalletsData ? formatNumber(activeWalletsData.currentCount) : "Loading...",
      change: activeWalletsData
        ? `${activeWalletsData.change >= 0 ? "+" : ""}${activeWalletsData.change.toFixed(1)}%`
        : "...",
      trend: activeWalletsData?.trend || "neutral",
      description: "Unique wallets in last 24h",
      icon: Users,
    },
    {
      title: "Total Transactions",
      value: transactionData ? formatNumber(transactionData.currentCount) : "Loading...",
      change: transactionData
        ? `${transactionData.change >= 0 ? "+" : ""}${transactionData.change.toFixed(1)}%`
        : "...",
      trend: transactionData?.trend || "neutral",
      description: "Daily transaction count",
      icon: Activity,
    },
    {
      title: "Contracts Deployed",
      value: contractData ? formatNumber(contractData.currentCount) : "Loading...",
      change: contractData ? `${contractData.change >= 0 ? "+" : ""}${contractData.change.toFixed(1)}%` : "...",
      trend: contractData?.trend || "neutral",
      description: "Smart contracts deployed daily",
      icon: FileCode,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 px-2">
              sc0pe Cross-Chain Analytics Platform
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-4 px-4">
              Decentralized analytics powered by 0G Labs - 0G Storage, Compute, Chain & DA
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                <Database className="w-3 h-3" />
                <span>0G Storage</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                <Cpu className="w-3 h-3" />
                <span>0G Compute</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                <LinkIcon className="w-3 h-3" />
                <span>0G Chain</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                <Shield className="w-3 h-3" />
                <span>0G DA</span>
              </Badge>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-2 sm:px-4">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Enter wallet address, token symbol, or ask a Web3 question..."
                className="pl-8 sm:pl-10 pr-20 sm:pr-24 lg:pr-32 py-2 sm:py-3 text-sm sm:text-base lg:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchQuery.trim() && handleAnalyze()}
              />
              <Button
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-auto"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !searchQuery.trim() || !moralisInitialized}
              >
                {isAnalyzing ? "Analyzing..." : !moralisInitialized ? "Initializing..." : "Analyze"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => setSearchQuery("0x742d35Cc6634C0532925a3b8D0C9964E4e2f")}
              >
                0x742d...4e2f
              </Badge>
              <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => setSearchQuery("ETH")}>
                ETH on 0G Chain
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs sm:inline hidden"
                onClick={() => setSearchQuery("What are the top DeFi protocols?")}
              >
                What are the top DeFi protocols?
              </Badge>
              <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => setSearchQuery("0G")}>
                0G token analysis
              </Badge>
            </div>
          </div>
        </div>

        {/* 0G Network Testnet Stats Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 px-2">Real-time 0G Network Testnet Activity</h2>
          <p className="text-muted-foreground text-sm sm:text-base px-2">
            Live metrics from the 0G testnet infrastructure
          </p>
        </div>

        {/* 0G Labs Infrastructure Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {overviewStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate pr-2">{stat.title}</CardTitle>
                <stat.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {stat.title === "0G Chain TPS" ? `${stat.change} from last hour` : `${stat.change} from yesterday`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stat.description}</p>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Daily Transaction Analysis */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Daily Transaction Analysis</CardTitle>
              <CardDescription>Daily transaction type breakdown and trends on 0G Chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dailyTransactionAnalysis.length > 0 ? (
                  dailyTransactionAnalysis.map((day, index) => {
                    const legacyPercent = day.total > 0 ? ((day.legacy / day.total) * 100).toFixed(1) : "0"
                    const cip2930Percent = day.total > 0 ? ((day.cip2930 / day.total) * 100).toFixed(1) : "0"
                    const cip1559Percent = day.total > 0 ? ((day.cip1559 / day.total) * 100).toFixed(1) : "0"

                    // Calculate daily change if we have previous day data
                    let dailyChange = null
                    let changePercent = null
                    if (index < dailyTransactionAnalysis.length - 1) {
                      const previousDay = dailyTransactionAnalysis[index + 1]
                      dailyChange = day.total - previousDay.total
                      changePercent = previousDay.total > 0 ? ((dailyChange / previousDay.total) * 100).toFixed(1) : "0"
                    }

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${index === 0 ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" : "bg-muted/20"}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold flex items-center space-x-2">
                              <span>
                                {new Date(day.timestamp).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                              {index === 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Today
                                </Badge>
                              )}
                              {index === 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  Yesterday
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {day.totalBlocks.toLocaleString()} blocks processed
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{day.total.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Total Transactions</p>
                            {dailyChange !== null && (
                              <p className={`text-xs ${dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {dailyChange >= 0 ? "+" : ""}
                                {dailyChange.toLocaleString()} ({changePercent}%)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center justify-between p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
                            <div>
                              <p className="font-medium text-blue-700 dark:text-blue-300">EIP-1559</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Modern gas model</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                {day.cip1559.toLocaleString()}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">{cip1559Percent}%</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-md bg-green-50 dark:bg-green-900/20">
                            <div>
                              <p className="font-medium text-green-700 dark:text-green-300">Legacy</p>
                              <p className="text-sm text-green-600 dark:text-green-400">Traditional txs</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                {day.legacy.toLocaleString()}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">{legacyPercent}%</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <div>
                              <p className="font-medium text-purple-700 dark:text-purple-300">EIP-2930</p>
                              <p className="text-sm text-purple-600 dark:text-purple-400">Access lists</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                {day.cip2930.toLocaleString()}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400">{cip2930Percent}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Show transaction type trends for today vs yesterday */}
                        {index === 0 && dailyTransactionAnalysis.length > 1 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium mb-2">Daily Trends</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              {["cip1559", "legacy", "cip2930"].map((type) => {
                                const todayCount = day[type]
                                const yesterdayCount = dailyTransactionAnalysis[1][type]
                                const change = todayCount - yesterdayCount
                                const changePercent =
                                  yesterdayCount > 0 ? ((change / yesterdayCount) * 100).toFixed(1) : "0"

                                return (
                                  <div key={type} className="text-center">
                                    <p className="text-muted-foreground capitalize">
                                      {type === "cip1559" ? "EIP-1559" : type === "cip2930" ? "EIP-2930" : "Legacy"}
                                    </p>
                                    <p className={`font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {change >= 0 ? "+" : ""}
                                      {change.toLocaleString()}
                                    </p>
                                    <p className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {changePercent}%
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading daily transaction analysis...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 0G Labs Features Showcase */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2">Powered by 0G Labs Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {ogLabsFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <feature.icon className="w-5 h-5 text-blue-500" />
                    <span>{feature.title}</span>
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2">Analytics Powered by 0G</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Link href="/wallet-analysis">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5" />
                    <span>Wallet Analysis</span>
                  </CardTitle>
                  <CardDescription>Deep wallet analysis with AI risk scoring via 0G Compute</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Analyze Wallet</Button>
                  <div className="mt-2 text-xs text-muted-foreground">
                    • AI-powered risk assessment
                    <br />• Cross-chain portfolio tracking
                    <br />• Stored on 0G Storage
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/token-analysis">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Token Analysis</span>
                  </CardTitle>
                  <CardDescription>Comprehensive token metrics and holder analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Research Token</Button>
                  <div className="mt-2 text-xs text-muted-foreground">
                    • Real-time price analytics
                    <br />• Whale movement detection
                    <br />• 0G Chain integration
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/web3-qa">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Web3 Q&A</span>
                  </CardTitle>
                  <CardDescription>AI-powered Web3 insights and analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Ask AI</Button>
                  <div className="mt-2 text-xs text-muted-foreground">
                    • Natural language queries
                    <br />• AI models on 0G Compute
                    <br />• Verifiable results
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

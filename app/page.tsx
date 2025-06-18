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

// Function to fetch recent high-value transactions
const fetchRecentHighValueTx = async () => {
  try {
    const response = await fetch(
      "https://chainscan-test.0g.ai/open/api?module=account&action=txlist&page=1&offset=50&sort=desc",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      // Filter for high-value transactions (>1 0G token = 1e18 wei)
      const highValueTx = data.result
        .filter((tx) => Number.parseFloat(tx.value || "0") > 1e18)
        .slice(0, 3)
        .map((tx) => ({
          type: "transaction",
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: (Number.parseFloat(tx.value) / 1e18).toFixed(2),
          timestamp: Number.parseInt(tx.timeStamp) * 1000,
        }))

      return highValueTx
    }
    return []
  } catch (error) {
    console.error("Error fetching high-value transactions:", error)
    return []
  }
}

// Function to fetch recent contract deployments
const fetchRecentContracts = async () => {
  try {
    const response = await fetch(
      "https://chainscan-test.0g.ai/open/api?module=account&action=txlist&page=1&offset=100&sort=desc",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      // Filter for contract deployments (where 'to' is empty/null)
      const contractDeployments = data.result
        .filter((tx) => !tx.to || tx.to === "")
        .slice(0, 2)
        .map((tx) => ({
          type: "contract",
          hash: tx.hash,
          from: tx.from,
          contractAddress: tx.contractAddress,
          timestamp: Number.parseInt(tx.timeStamp) * 1000,
        }))

      return contractDeployments
    }
    return []
  } catch (error) {
    console.error("Error fetching contract deployments:", error)
    return []
  }
}

// Function to fetch recent token transfers
const fetchRecentTokenTransfers = async () => {
  try {
    const response = await fetch(
      "https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&page=1&offset=20&sort=desc",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      const tokenTransfers = data.result.slice(0, 2).map((tx) => ({
        type: "token",
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        tokenSymbol: tx.tokenSymbol,
        tokenName: tx.tokenName,
        value: (Number.parseFloat(tx.value) / Math.pow(10, Number.parseInt(tx.tokenDecimal || "18"))).toFixed(2),
        timestamp: Number.parseInt(tx.timeStamp) * 1000,
      }))

      return tokenTransfers
    }
    return []
  } catch (error) {
    console.error("Error fetching token transfers:", error)
    return []
  }
}

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
  const [recentActivity, setRecentActivity] = useState<any[]>([])

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

        // Fetch real network activity
        const [highValueTx, contractsData, tokenTransfers] = await Promise.all([
          fetchRecentHighValueTx(),
          fetchRecentContracts(),
          fetchRecentTokenTransfers(),
        ])

        // Combine and sort all activities by timestamp
        const allActivities = [...highValueTx, ...contractsData, ...tokenTransfers]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 6)

        setRecentActivity(allActivities)
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
          {/* Recent Activity */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Recent Network Activity</CardTitle>
              <CardDescription>Latest analytics and AI computations across 0G infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === "transaction"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                              : activity.type === "contract"
                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          }`}
                        >
                          {activity.type === "transaction" ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : activity.type === "contract" ? (
                            <FileCode className="w-5 h-5" />
                          ) : (
                            <Activity className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {activity.type === "transaction"
                              ? `${activity.from?.slice(0, 6)}...${activity.from?.slice(-4)}`
                              : activity.type === "contract"
                                ? "New Contract"
                                : activity.tokenSymbol || "Token Transfer"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.type === "transaction"
                              ? `Large transfer: ${activity.value} OG`
                              : activity.type === "contract"
                                ? `Contract deployed by ${activity.from?.slice(0, 6)}...${activity.from?.slice(-4)}`
                                : `${activity.value} ${activity.tokenSymbol} transferred`}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            0G Chain
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {activity.type === "transaction"
                            ? `${activity.value} OG`
                            : activity.type === "contract"
                              ? "Deployed"
                              : `${activity.value} ${activity.tokenSymbol}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading recent activity...</p>
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

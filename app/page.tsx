"use client"

import { useState } from "react"
import { Search, TrendingUp, Wallet, MessageSquare, Database, Cpu, LinkIcon, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const overviewStats = [
    {
      title: "Total Value Analyzed",
      value: "$2.4B",
      change: "+12.5%",
      trend: "up",
      description: "Stored on 0G Storage",
    },
    {
      title: "AI Computations",
      value: "1.2M",
      change: "+8.3%",
      trend: "up",
      description: "Processed via 0G Compute",
    },
    {
      title: "Cross-Chain Queries",
      value: "45K",
      change: "+15.2%",
      trend: "up",
      description: "Including 0G Chain",
    },
    {
      title: "Data Availability",
      value: "99.9%",
      change: "0%",
      trend: "neutral",
      description: "Guaranteed by 0G DA",
    },
  ]

  const recentActivity = [
    {
      type: "wallet",
      address: "0x742d...4e2f",
      action: "Large ETH movement detected",
      value: "$2.3M",
      time: "2m ago",
      chain: "Ethereum",
      ogComponent: "0G Compute",
    },
    {
      type: "ai",
      model: "Risk Assessment AI",
      action: "Anomaly detection completed",
      value: "High Risk",
      time: "5m ago",
      chain: "0G Chain",
      ogComponent: "0G Compute",
    },
    {
      type: "storage",
      data: "Historical Analytics",
      action: "Data archived successfully",
      value: "2.1GB",
      time: "12m ago",
      chain: "Multi-chain",
      ogComponent: "0G Storage",
    },
  ]

  const ogLabsFeatures = [
    {
      icon: Database,
      title: "0G Storage Integration",
      description: "All analytics data stored on decentralized 0G Storage for permanent access and cost efficiency",
      benefits: ["Censorship resistant", "Cost effective", "Always available"],
    },
    {
      icon: Cpu,
      title: "0G Compute Power",
      description: "AI/ML models and complex analytics run on 0G's decentralized compute network",
      benefits: ["Verifiable results", "Scalable processing", "Transparent execution"],
    },
    {
      icon: LinkIcon,
      title: "0G Chain Native",
      description: "Built on 0G's modular EVM L1 for fast, low-cost, and interoperable operations",
      benefits: ["EVM compatible", "Low fees", "High throughput"],
    },
    {
      icon: Shield,
      title: "0G Data Availability",
      description: "Guaranteed data availability ensures analytics and models are always accessible",
      benefits: ["No downtime", "Data redundancy", "Network resilience"],
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Enter wallet address, token symbol, or ask a Web3 question..."
                className="pl-8 sm:pl-10 pr-20 sm:pr-24 lg:pr-32 py-2 sm:py-3 text-sm sm:text-base lg:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchQuery.trim() && console.log("Search:", searchQuery)}
              />
              <Button className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-auto">
                Analyze
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Badge variant="secondary" className="cursor-pointer text-xs">
                0x742d...4e2f
              </Badge>
              <Badge variant="secondary" className="cursor-pointer text-xs">
                ETH on 0G Chain
              </Badge>
              <Badge variant="secondary" className="cursor-pointer text-xs sm:inline hidden">
                What are the top DeFi protocols?
              </Badge>
              <Badge variant="secondary" className="cursor-pointer text-xs">
                0G token analysis
              </Badge>
            </div>
          </div>
        </div>

        {/* 0G Labs Infrastructure Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {overviewStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate pr-2">{stat.title}</CardTitle>
                <TrendingUp
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
                  {stat.change} from last month
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stat.description}</p>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Real-time 0G Network Activity</CardTitle>
              <CardDescription>Latest analytics and AI computations across 0G infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === "wallet"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : activity.type === "ai"
                              ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {activity.type === "wallet" ? (
                          <Wallet className="w-5 h-5" />
                        ) : activity.type === "ai" ? (
                          <Cpu className="w-5 h-5" />
                        ) : (
                          <Database className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.type === "wallet"
                            ? activity.address
                            : activity.type === "ai"
                              ? activity.model
                              : activity.data}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {activity.ogComponent}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.value}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 0G Network Status */}
          <Card>
            <CardHeader>
              <CardTitle>0G Network Status</CardTitle>
              <CardDescription>Real-time infrastructure monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ogLabsFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 dark:text-green-300">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
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

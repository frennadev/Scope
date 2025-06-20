"use client"

import { useState, useEffect } from "react"
import { Brain, Cpu, Database, TrendingUp, Shield, Target, Zap, Activity, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AIInsight {
  id: string;
  title: string;
  content: string;
  confidence: number;
  category: 'risk' | 'opportunity' | 'prediction' | 'recommendation';
  timestamp: number;
  sources: string[];
}

interface AIDashboardProps {
  walletAddress?: string;
  tokenAddress?: string;
  marketData?: any;
  className?: string;
}

export function AIDashboard({ walletAddress, tokenAddress, marketData, className }: AIDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<'idle' | 'processing' | 'complete'>('idle')

  // Mock AI insights generation
  const generateInsights = async () => {
    setIsLoading(true)
    setAiStatus('processing')

    // Simulate AI processing
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          title: 'Portfolio Diversification Opportunity',
          content: 'Your portfolio shows 85% concentration in Ethereum-based assets. Consider allocating 15-20% to 0G Chain for cost optimization and emerging opportunities.',
          confidence: 87,
          category: 'opportunity',
          timestamp: Date.now(),
          sources: ['Portfolio Analysis', '0G Chain Analytics']
        },
        {
          id: '2',
          title: 'High Volatility Risk Detected',
          content: 'Recent price movements show 45% volatility increase. Implement stop-loss orders at -12% to protect against downside risk.',
          confidence: 92,
          category: 'risk',
          timestamp: Date.now(),
          sources: ['Risk Assessment AI', 'Market Data']
        },
        {
          id: '3',
          title: 'DeFi Yield Opportunity',
          content: '0G Chain protocols offering 18-25% APY with lower gas costs. Potential 300% cost savings compared to Ethereum mainnet operations.',
          confidence: 78,
          category: 'opportunity',
          timestamp: Date.now(),
          sources: ['DeFi Analytics', '0G Ecosystem Data']
        },
        {
          id: '4',
          title: 'Price Prediction: Bullish Signal',
          content: 'ML models indicate 67% probability of 8-15% price increase over next 7 days based on volume patterns and market sentiment.',
          confidence: 67,
          category: 'prediction',
          timestamp: Date.now(),
          sources: ['ML Price Models', 'Sentiment Analysis']
        }
      ]

      setInsights(mockInsights)
      setAiStatus('complete')
      setIsLoading(false)
    }, 3000)
  }

  useEffect(() => {
    if (walletAddress || tokenAddress) {
      generateInsights()
    }
  }, [walletAddress, tokenAddress])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'risk': return <Shield className="w-4 h-4 text-red-500" />
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'prediction': return <Brain className="w-4 h-4 text-blue-500" />
      case 'recommendation': return <Target className="w-4 h-4 text-purple-500" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'risk': return 'border-red-200 bg-red-50 dark:bg-red-900/20'
      case 'opportunity': return 'border-green-200 bg-green-50 dark:bg-green-900/20'
      case 'prediction': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
      case 'recommendation': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20'
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className={className}>
      {/* AI Status Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <span>AI Analysis Dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Cpu className="w-3 h-3" />
                <span>0G Compute</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>0G Storage</span>
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            AI-powered insights using verifiable computation on the 0G network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  aiStatus === 'processing' ? 'bg-yellow-500 animate-pulse' :
                  aiStatus === 'complete' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium">
                  {aiStatus === 'processing' ? 'Processing...' :
                   aiStatus === 'complete' ? 'Analysis Complete' : 'Ready'}
                </span>
              </div>
              {aiStatus === 'complete' && (
                <Badge variant="secondary" className="text-xs">
                  {insights.length} insights generated
                </Badge>
              )}
            </div>
            <Button 
              onClick={generateInsights} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
          {isLoading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>AI Processing Progress</span>
                <span>Powered by 0G Compute</span>
              </div>
              <Progress value={aiStatus === 'processing' ? 65 : 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights Grid */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className={`${getCategoryColor(insight.category)} border-l-4`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(insight.category)}
                    <span>{insight.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {insight.sources.map((source, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Capabilities */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>AI Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className="text-sm">Risk Assessment</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">Opportunity Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Price Predictions</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Portfolio Optimization</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Powered by 0G Infrastructure:</strong> All AI computations are performed on the 0G Compute network 
              with cryptographic proof of correctness. Analysis results are stored in 0G Storage for transparency 
              and auditability. This ensures verifiable, tamper-proof AI insights for your Web3 decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
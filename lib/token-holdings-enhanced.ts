// Enhanced Token Holdings Service
// Fetches token balances with USD values, price changes, and market data

import { getTokenMarketData } from './dexscreener'

export interface EnhancedTokenHolding {
  // Basic token info
  name: string
  symbol: string
  token_address: string
  balance: string
  decimals: number
  
  // Enhanced market data
  balanceFormatted: number
  priceUsd: number
  valueUsd: number
  priceChange24h: number
  pricePerToken: number
  
  // Display formatting
  balanceDisplay: string
  valueDisplay: string
  priceDisplay: string
  changeDisplay: string
  changeColor: 'green' | 'red' | 'gray'
}

export interface EnhancedChainHoldings {
  chain: string
  chainName: string
  data: EnhancedTokenHolding[]
  totalValueUsd: number
  error?: string
}

export class TokenHoldingsService {
  private chainNames: { [key: string]: string } = {
    "0x1": "Ethereum",
    "0x2105": "Base", 
    "0x38": "Binance Smart Chain",
    "0x40e8": "0G Chain",
  }

  /**
   * Enhance token holdings with USD values and price data
   */
  async enhanceTokenHoldings(tokenData: any[]): Promise<EnhancedChainHoldings[]> {
    const enhancedHoldings: EnhancedChainHoldings[] = []

    for (const tokenChain of tokenData) {
      const chainName = this.chainNames[tokenChain.chain] || tokenChain.chain
      
      if (tokenChain.error) {
        enhancedHoldings.push({
          chain: tokenChain.chain,
          chainName,
          data: [],
          totalValueUsd: 0,
          error: tokenChain.error
        })
        continue
      }

      if (!tokenChain.data || tokenChain.data.length === 0) {
        enhancedHoldings.push({
          chain: tokenChain.chain,
          chainName,
          data: [],
          totalValueUsd: 0
        })
        continue
      }

      const enhancedTokens: EnhancedTokenHolding[] = []
      let chainTotal = 0

      // Process each token
      for (const token of tokenChain.data.slice(0, 10)) { // Limit to top 10 tokens
        try {
          const enhanced = await this.enhanceToken(token, tokenChain.chain)
          enhancedTokens.push(enhanced)
          chainTotal += enhanced.valueUsd
        } catch (error) {
          console.error(`Error enhancing token ${token.symbol}:`, error)
          // Add token with basic data if enhancement fails
          enhancedTokens.push(this.createFallbackToken(token))
        }
      }

      // Sort by USD value (highest first)
      enhancedTokens.sort((a, b) => b.valueUsd - a.valueUsd)

      enhancedHoldings.push({
        chain: tokenChain.chain,
        chainName,
        data: enhancedTokens,
        totalValueUsd: chainTotal
      })
    }

    return enhancedHoldings
  }

  /**
   * Enhance individual token with market data
   */
  private async enhanceToken(token: any, chainId: string): Promise<EnhancedTokenHolding> {
    // Calculate formatted balance
    const balanceFormatted = parseFloat(token.balance) / Math.pow(10, token.decimals)
    
    // Get market data for price information
    let priceUsd = 0
    let priceChange24h = 0
    
    try {
      // Convert chain ID for DexScreener
      const dexChainId = this.convertChainIdForDexScreener(chainId)
      const marketData = await getTokenMarketData(dexChainId, token.token_address)
      
      if (marketData) {
        priceUsd = parseFloat(marketData.priceUsd) || 0
        priceChange24h = marketData.priceChange?.h24 || 0
      }
    } catch (error) {
      console.warn(`Could not fetch market data for ${token.symbol}:`, error)
      // Use fallback pricing for known tokens
      priceUsd = this.getFallbackPrice(token.symbol, chainId)
    }

    // Calculate USD value
    const valueUsd = balanceFormatted * priceUsd

    // Format displays
    const balanceDisplay = this.formatBalance(balanceFormatted)
    const valueDisplay = this.formatUsdValue(valueUsd)
    const priceDisplay = this.formatPrice(priceUsd)
    const changeDisplay = this.formatPriceChange(priceChange24h)
    const changeColor = priceChange24h > 0 ? 'green' : priceChange24h < 0 ? 'red' : 'gray'

    return {
      name: token.name,
      symbol: token.symbol,
      token_address: token.token_address,
      balance: token.balance,
      decimals: token.decimals,
      balanceFormatted,
      priceUsd,
      valueUsd,
      priceChange24h,
      pricePerToken: priceUsd,
      balanceDisplay,
      valueDisplay,
      priceDisplay,
      changeDisplay,
      changeColor
    }
  }

  /**
   * Create fallback token data when enhancement fails
   */
  private createFallbackToken(token: any): EnhancedTokenHolding {
    const balanceFormatted = parseFloat(token.balance) / Math.pow(10, token.decimals)
    
    return {
      name: token.name,
      symbol: token.symbol,
      token_address: token.token_address,
      balance: token.balance,
      decimals: token.decimals,
      balanceFormatted,
      priceUsd: 0,
      valueUsd: 0,
      priceChange24h: 0,
      pricePerToken: 0,
      balanceDisplay: this.formatBalance(balanceFormatted),
      valueDisplay: '$0.00',
      priceDisplay: '$0.0000',
      changeDisplay: 'N/A',
      changeColor: 'gray'
    }
  }

  /**
   * Convert chain ID to DexScreener format
   */
  private convertChainIdForDexScreener(chainId: string): string {
    const mapping: { [key: string]: string } = {
      "0x1": "1",      // Ethereum
      "0x2105": "8453", // Base
      "0x38": "56",     // BSC
      "0x40e8": "16600" // 0G Chain
    }
    return mapping[chainId] || chainId
  }

  /**
   * Get fallback prices for known tokens
   */
  private getFallbackPrice(symbol: string, chainId: string): number {
    const fallbackPrices: { [key: string]: number } = {
      'USDC': 1.00,
      'USDT': 1.00,
      'DAI': 1.00,
      'WETH': 3500,
      'ETH': 3500,
      'BNB': 600,
      'MATIC': 0.80,
      'LINK': 15,
      'UNI': 8,
      'AAVE': 120,
      'COMP': 60,
      'MKR': 1500,
      'SNX': 3,
      'CRV': 0.40,
      'YFI': 8000,
      'SUSHI': 1.20,
      '1INCH': 0.50,
      'BAL': 5,
      'RARI': 2
    }

    // Special handling for 0G Chain tokens
    if (chainId === "0x40e8") {
      return 0.001 // Default price for 0G testnet tokens
    }

    return fallbackPrices[symbol.toUpperCase()] || 0
  }

  /**
   * Format balance for display
   */
  private formatBalance(balance: number): string {
    if (balance === 0) return '0'
    if (balance < 0.0001) return balance.toExponential(2)
    if (balance < 1) return balance.toFixed(4)
    if (balance < 1000) return balance.toFixed(2)
    if (balance < 1000000) return `${(balance / 1000).toFixed(1)}K`
    return `${(balance / 1000000).toFixed(1)}M`
  }

  /**
   * Format USD value for display
   */
  private formatUsdValue(value: number): string {
    if (value === 0) return '$0.00'
    if (value < 0.01) return `$${value.toFixed(4)}`
    if (value < 1000) return `$${value.toFixed(2)}`
    if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`
    return `$${(value / 1000000).toFixed(1)}M`
  }

  /**
   * Format price for display
   */
  private formatPrice(price: number): string {
    if (price === 0) return '$0.0000'
    if (price < 0.0001) return `$${price.toExponential(2)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  /**
   * Format price change percentage
   */
  private formatPriceChange(change: number): string {
    if (change === 0) return '0.00%'
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }
}

// Export singleton instance
export const tokenHoldingsService = new TokenHoldingsService() 
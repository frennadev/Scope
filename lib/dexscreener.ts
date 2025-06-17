import axios from "axios"

// DexScreener API base URL
const DEXSCREENER_API_URL = "https://api.dexscreener.com"

// Supported chain IDs for DexScreener
export const chainIdToDexScreenerChain: Record<string, string> = {
  "1": "ethereum",
  "8453": "base",
  "56": "bsc",
}

// Interface for DexScreener token data
export interface DexScreenerTokenData {
  chainId: string
  dexId: string
  pairAddress: string
  labels?: string[]
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  txns?: {
    h1?: { buys: number; sells: number }
    h6?: { buys: number; sells: number }
    h24?: { buys: number; sells: number }
    ANY_ADDITIONAL_PROPERTY?: { buys: number; sells: number }
  }
  volume?: {
    h1?: number
    h6?: number
    h24?: number
    ANY_ADDITIONAL_PROPERTY?: number
  }
  priceChange?: {
    h1?: number
    h6?: number
    h24?: number
    ANY_ADDITIONAL_PROPERTY?: number
  }
  liquidity: {
    usd: number
    base: number
    quote: number
  }
  fdv: number
  marketCap: number
  pairCreatedAt?: number
  info?: {
    imageUrl?: string
    websites?: Array<{ url: string }>
    socials?: Array<{ platform: string; handle: string }>
  }
  boosts?: {
    active: number
  }
}

/**
 * Fetch token data from DexScreener API
 * @param chainId The chain ID (e.g., '1' for Ethereum, '8453' for Base, '56' for BSC)
 * @param tokenAddress The token address to fetch data for
 * @returns Token data including market cap and FDV
 */
export async function getTokenMarketData(chainId: string, tokenAddress: string): Promise<DexScreenerTokenData | null> {
  try {
    const chain = chainIdToDexScreenerChain[chainId]
    if (!chain) {
      console.error(`Unsupported chain ID for DexScreener: ${chainId}`)
      return null
    }

    const response = await axios.get(`${DEXSCREENER_API_URL}/latest/dex/tokens/${tokenAddress}`)
    const data = response.data

    if (data && data.pairs && Array.isArray(data.pairs) && data.pairs.length > 0) {
      // Filter pairs by the requested chain and return the most liquid pair
      const chainPairs = data.pairs.filter((pair: any) => pair.chainId === chain)
      if (chainPairs.length > 0) {
        // Sort by liquidity and return the most liquid pair
        const sortedPairs = chainPairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
        return sortedPairs[0]
      }
      // If no pairs for the specific chain, return the most liquid pair overall
      const sortedPairs = data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
      return sortedPairs[0]
    } else {
      console.error(`No data found for token ${tokenAddress}`)
      return null
    }
  } catch (error) {
    console.error(`Error fetching DexScreener data for token ${tokenAddress} on chain ${chainId}:`, error)
    return null
  }
}

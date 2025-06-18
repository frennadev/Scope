import axios from "axios"

// DexScreener API base URL
const DEXSCREENER_API_URL = "https://api.dexscreener.com"

// Supported chain IDs for DexScreener
export const chainIdToDexScreenerChain: Record<string, string> = {
  "1": "ethereum",
  "8453": "base",
  "56": "bsc",
  "16600": "0g-testnet", // 0G Chain testnet
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
 * Fetch token data from DexScreener API or simulate 0G testnet data
 * @param chainId The chain ID (e.g., '1' for Ethereum, '16600' for 0G testnet)
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

    // Special handling for 0G testnet since DexScreener might not support it yet
    if (chainId === "16600" || chain === "0g-testnet") {
      return await generateMock0GTestnetData(tokenAddress)
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

/**
 * Generate data for 0G testnet tokens using real API calls
 */
async function generateMock0GTestnetData(tokenAddress: string): Promise<DexScreenerTokenData> {
  try {
    // Get token supply from 0G Chain API
    const supplyResponse = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=stats&action=tokensupply&contractaddress=${tokenAddress}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const supplyData = await supplyResponse.json()
    let totalSupply = "1000000000000000000000000" // Default 1M tokens with 18 decimals

    if (supplyData.status === "1" && supplyData.result) {
      totalSupply = supplyData.result
    }

    // Get token transactions to gather more info
    const txResponse = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${tokenAddress}&page=1&offset=10&sort=desc`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const txData = await txResponse.json()
    let tokenName = "0G Testnet Token"
    let tokenSymbol = "0GT"
    let tokenDecimals = 18

    if (txData.status === "1" && txData.result && Array.isArray(txData.result) && txData.result.length > 0) {
      const firstTx = txData.result[0]
      tokenName = firstTx.tokenName || tokenName
      tokenSymbol = firstTx.tokenSymbol || tokenSymbol
      tokenDecimals = Number.parseInt(firstTx.tokenDecimal || "18")
    }

    // Calculate market cap and other metrics based on total supply
    const totalSupplyNum = Number.parseFloat(totalSupply) / Math.pow(10, tokenDecimals)
    const mockPrice = 0.001 // Mock price in USD
    const marketCap = totalSupplyNum * mockPrice

    return {
      chainId: "0g-testnet",
      dexId: "0g-dex",
      pairAddress: "0x" + Math.random().toString(16).substr(2, 40),
      pairCreatedAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
      baseToken: {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
      },
      quoteToken: {
        address: "0x0000000000000000000000000000000000000000",
        name: "0G Token",
        symbol: "OG",
      },
      priceUsd: mockPrice.toString(),
      priceNative: "0.0000006",
      marketCap: marketCap,
      fdv: marketCap * 1.5, // Assume FDV is 1.5x market cap
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
  } catch (error) {
    console.error("Error fetching 0G token data:", error)

    // Fallback to static mock data if API fails
    return {
      chainId: "0g-testnet",
      dexId: "0g-dex",
      pairAddress: "0x" + Math.random().toString(16).substr(2, 40),
      pairCreatedAt: Math.floor(Date.now() / 1000) - 86400 * 30,
      baseToken: {
        address: tokenAddress,
        name: "0G Testnet Token",
        symbol: "0GT",
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
    } as DexScreenerTokenData
  }
}

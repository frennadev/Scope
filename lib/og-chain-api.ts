// 0G Chain API utilities for token analysis

export interface OGTokenInfo {
  totalSupply: string
  name: string
  symbol: string
  decimals: number
  contractAddress: string
  holders?: number
  transactions?: any[]
}

/**
 * Get token total supply from 0G Chain API
 */
export async function get0GTokenSupply(contractAddress: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=stats&action=tokensupply&contractaddress=${contractAddress}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result) {
      return data.result
    } else {
      console.error("Failed to fetch token supply:", data.message)
      return null
    }
  } catch (error) {
    console.error("Error fetching 0G token supply:", error)
    return null
  }
}

/**
 * Get comprehensive token information from 0G Chain
 */
export async function get0GTokenInfo(contractAddress: string): Promise<OGTokenInfo | null> {
  try {
    // Get token supply
    const totalSupply = await get0GTokenSupply(contractAddress)

    // Get token transactions to extract metadata
    const txResponse = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=100&sort=desc`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const txData = await txResponse.json()

    let tokenName = "Unknown Token"
    let tokenSymbol = "UNKNOWN"
    let tokenDecimals = 18
    let transactions: any[] = []

    if (txData.status === "1" && txData.result && Array.isArray(txData.result)) {
      transactions = txData.result

      if (transactions.length > 0) {
        const firstTx = transactions[0]
        tokenName = firstTx.tokenName || tokenName
        tokenSymbol = firstTx.tokenSymbol || tokenSymbol
        tokenDecimals = Number.parseInt(firstTx.tokenDecimal || "18")
      }
    }

    // Count unique holders from transactions
    const uniqueHolders = new Set()
    transactions.forEach((tx) => {
      if (tx.from) uniqueHolders.add(tx.from.toLowerCase())
      if (tx.to) uniqueHolders.add(tx.to.toLowerCase())
    })

    return {
      totalSupply: totalSupply || "0",
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      contractAddress,
      holders: uniqueHolders.size,
      transactions: transactions.slice(0, 10), // Return latest 10 transactions
    }
  } catch (error) {
    console.error("Error fetching 0G token info:", error)
    return null
  }
}

/**
 * Get token holder information (top holders)
 */
export async function get0GTokenHolders(contractAddress: string, limit = 50): Promise<any[]> {
  try {
    // Get all token transactions
    const response = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=1000&sort=desc`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      // Calculate balances for each address
      const balances = new Map<string, number>()

      data.result.forEach((tx: any) => {
        const value = Number.parseFloat(tx.value || "0")
        const decimals = Number.parseInt(tx.tokenDecimal || "18")
        const normalizedValue = value / Math.pow(10, decimals)

        // Add to receiver
        if (tx.to) {
          const currentBalance = balances.get(tx.to.toLowerCase()) || 0
          balances.set(tx.to.toLowerCase(), currentBalance + normalizedValue)
        }

        // Subtract from sender
        if (tx.from) {
          const currentBalance = balances.get(tx.from.toLowerCase()) || 0
          balances.set(tx.from.toLowerCase(), currentBalance - normalizedValue)
        }
      })

      // Convert to array and sort by balance
      const holders = Array.from(balances.entries())
        .filter(([address, balance]) => balance > 0) // Only positive balances
        .sort(([, a], [, b]) => b - a) // Sort by balance descending
        .slice(0, limit)
        .map(([address, balance]) => ({
          address,
          balance: balance.toString(),
          percentage: 0, // Will be calculated if total supply is known
        }))

      return holders
    }

    return []
  } catch (error) {
    console.error("Error fetching 0G token holders:", error)
    return []
  }
}

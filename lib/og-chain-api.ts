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

/**
 * Get token holder and transfer statistics from 0G Chain API
 */
export async function get0GTokenHolderStats(contractAddress: string): Promise<{
  totalHolders: number
  holderChange24h: number
  totalTransfers: number
  transferChange24h: number
} | null> {
  try {
    console.log(`🔍 Fetching holder stats for token: ${contractAddress}`)

    // Get token holder statistics using the correct endpoint
    const holderStatsResponse = await fetch(
      `https://chainscan-test.0g.ai/open/statistics/token/holder?contract=${contractAddress}&sort=DESC&skip=0&limit=2`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const holderStatsData = await holderStatsResponse.json()
    console.log(`📊 Token holder stats response for ${contractAddress}:`, holderStatsData)

    let totalHolders = 0
    let holderChange24h = 0

    if (holderStatsData.status === "1" && holderStatsData.result) {
      const { list } = holderStatsData.result

      if (list && Array.isArray(list) && list.length > 0) {
        // Get the most recent holder count
        const latestData = list[0]
        totalHolders = Number.parseInt(latestData.holderCount || "0")

        // Calculate 24h change if we have at least 2 data points
        if (list.length >= 2) {
          const previousData = list[1]
          const previousHolders = Number.parseInt(previousData.holderCount || "0")
          holderChange24h = totalHolders - previousHolders
        }
      }
    }

    // Get ALL transfer statistics to calculate total transfers across all time
    let totalTransfers = 0
    let transferChange24h = 0
    let yesterdayTransfers = 0

    try {
      // First, get the total count of available transfer stat records
      const initialResponse = await fetch(
        `https://chainscan-test.0g.ai/open/statistics/token/transfer?contract=${contractAddress}&sort=DESC&skip=0&limit=1`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        },
      )

      const initialData = await initialResponse.json()
      const totalRecords = initialData.result?.total || 0

      console.log(`📈 Found ${totalRecords} days of transfer statistics`)

      // Determine how many pages we need to fetch (with a reasonable limit)
      const maxPagesToFetch = Math.min(Math.ceil(totalRecords / 100), 10) // Limit to 10 pages max (1000 days)
      const limit = 100 // Fetch 100 records per page

      // Fetch all pages of transfer statistics
      for (let page = 0; page < maxPagesToFetch; page++) {
        const skip = page * limit
        console.log(`📊 Fetching transfer stats page ${page + 1}/${maxPagesToFetch} (skip=${skip}, limit=${limit})`)

        const transferStatsResponse = await fetch(
          `https://chainscan-test.0g.ai/open/statistics/token/transfer?contract=${contractAddress}&sort=DESC&skip=${skip}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          },
        )

        const transferStatsData = await transferStatsResponse.json()

        if (transferStatsData.status === "1" && transferStatsData.result && transferStatsData.result.list) {
          const { list } = transferStatsData.result

          // Sum up all transfer counts from this page
          list.forEach((item: any, index: number) => {
            const dailyTransfers = Number.parseInt(item.transferCount || "0")
            totalTransfers += dailyTransfers

            // Track yesterday's transfers for 24h change calculation
            if (page === 0 && index === 1) {
              yesterdayTransfers = dailyTransfers
            }
          })

          // If this is the first page, calculate 24h change
          if (page === 0 && list.length >= 2) {
            const todayTransfers = Number.parseInt(list[0].transferCount || "0")
            transferChange24h = todayTransfers - yesterdayTransfers
          }

          console.log(`📊 Page ${page + 1} processed, running total: ${totalTransfers.toLocaleString()} transfers`)
        }
      }
    } catch (error) {
      console.error("❌ Error fetching transfer stats:", error)
    }

    console.log(`🎯 FINAL STATS:`)
    console.log(`   - Total Holders: ${totalHolders.toLocaleString()}`)
    console.log(`   - Holder Change 24h: ${holderChange24h >= 0 ? "+" : ""}${holderChange24h}`)
    console.log(`   - Total Transfers (All-Time Sum): ${totalTransfers.toLocaleString()}`)
    console.log(`   - Transfer Change 24h: ${transferChange24h >= 0 ? "+" : ""}${transferChange24h}`)

    return {
      totalHolders,
      holderChange24h,
      totalTransfers,
      transferChange24h,
    }
  } catch (error) {
    console.error("❌ Error fetching 0G token holder stats:", error)
    return null
  }
}

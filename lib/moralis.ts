import Moralis from "moralis"

// Singleton pattern for Moralis initialization
let moralisInitialized = false
let moralisInstance: typeof Moralis | null = null

// Initialize Moralis with the API key
export const initializeMoralis = async () => {
  if (moralisInitialized && moralisInstance) {
    console.log("Moralis API already initialized, returning existing instance")
    return moralisInstance
  }

  try {
    await Moralis.start({
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjRiNDdmODcwLTk0NzQtNDg2My05ZDNjLTI3ZTQwM2QzZTc4YSIsIm9yZ0lkIjoiNDU0MzA5IiwidXNlcklkIjoiNDY3NDIzIiwidHlwZUlkIjoiY2M5YjllMzUtMzJmZi00NTMzLTk2OGUtODE3ZTI4NDE5NGNiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTAxMDk0NjEsImV4cCI6NDkwNTg2OTQ2MX0.C7Ib1i_oa73zvnteKDybTAeWnv-dIeJX8U96-R-VfJI",
    })
    moralisInitialized = true
    moralisInstance = Moralis
    console.log("Moralis API initialized successfully")
    return Moralis
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during Moralis initialization"
    console.error("Failed to initialize Moralis API:", errorMessage)
    throw new Error(`Moralis initialization failed: ${errorMessage}`)
  }
}

// Function to get wallet balances
export const getWalletBalances = async (address: string, chains: string[]) => {
  const balances = []
  for (const chain of chains) {
    try {
      // Special handling for 0G testnet
      if (chain === "0x40e8" || chain === "16600") {
        balances.push(await get0GBalance(address))
        continue
      }

      const response = await Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain,
      })
      const balanceStr = response.raw.balance
      // Convert string balance to number for arithmetic operation
      const balanceNum = Number.parseFloat(balanceStr)
      balances.push({
        chain,
        balance: balanceStr,
        formattedBalance: balanceNum / 1e18, // Now safe as balanceNum is a number
      })
    } catch (error: unknown) {
      console.error(`Error fetching balance for ${chain}:`, error)
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      balances.push({
        chain,
        error: `Failed to fetch balance: ${errorMessage}`,
      })
    }
  }
  return balances
}

// Function to get wallet transactions
export const getWalletTransactions = async (address: string, chains: string[], limit = 10) => {
  const transactions = []
  for (const chain of chains) {
    try {
      // Special handling for 0G testnet
      if (chain === "0x40e8" || chain === "16600") {
        transactions.push(await get0GTransactions(address, limit))
        continue
      }

      const response = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain,
        limit,
      })
      transactions.push({
        chain,
        data: response.raw.result,
      })
    } catch (error: unknown) {
      console.error(`Error fetching transactions for ${chain}:`, error)
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      transactions.push({
        chain,
        error: `Failed to fetch transactions: ${errorMessage}`,
      })
    }
  }
  return transactions
}

// Function to get wallet token balances
export const getWalletTokenBalances = async (address: string, chains: string[]) => {
  const tokenBalances = []
  for (const chain of chains) {
    try {
      // Special handling for 0G testnet
      if (chain === "0x40e8" || chain === "16600") {
        tokenBalances.push(await get0GTokenBalances(address))
        continue
      }

      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      })
      tokenBalances.push({
        chain,
        data: response.raw,
      })
    } catch (error: unknown) {
      console.error(`Error fetching token balances for ${chain}:`, error)
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      tokenBalances.push({
        chain,
        error: `Failed to fetch token balances: ${errorMessage}`,
      })
    }
  }
  return tokenBalances
}

// Function to get token information by contract address or symbol
export const getTokenInfo = async (query: string, chains: string[]) => {
  const tokenInfo = []
  for (const chain of chains) {
    try {
      // Special handling for 0G testnet
      if (chain === "0x40e8" || chain === "16600") {
        tokenInfo.push(await get0GTokenInfo(query))
        continue
      }

      // First try searching by contract address
      let response
      if (query.startsWith("0x") && query.length === 42) {
        response = await Moralis.EvmApi.token.getTokenPrice({
          address: query,
          chain,
        })
        tokenInfo.push({
          chain,
          data: response.raw,
        })
      } else {
            // If not an address, try searching (Note: Moralis API may not directly support symbol search)
    console.warn(`Symbol search not directly supported for ${query} on chain ${chain}. Using fallback token data.`)
        tokenInfo.push({
          chain,
          error: `Symbol search not supported yet for ${query}`,
        })
      }
    } catch (error: unknown) {
      console.error(`Error fetching token info for ${query} on ${chain}:`, error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      tokenInfo.push({
        chain,
        error: `Failed to fetch token info: ${errorMessage}`,
      })
    }
  }
  return tokenInfo
}

// Function to get token transactions (transfers)
export const getTokenTransactions = async (tokenAddress: string, chains: string[], limit = 10) => {
  const transactions = []
  for (const chain of chains) {
    try {
      // Special handling for 0G testnet
      if (chain === "0x40e8" || chain === "16600") {
        transactions.push(await get0GTokenTransactions(tokenAddress, limit))
        continue
      }

      const response = await Moralis.EvmApi.token.getTokenTransfers({
        address: tokenAddress,
        chain,
        limit,
      })
      transactions.push({
        chain,
        data: response.raw.result,
      })
    } catch (error: unknown) {
      console.error(`Error fetching token transactions for ${tokenAddress} on ${chain}:`, error)
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      transactions.push({
        chain,
        error: `Failed to fetch token transactions: ${errorMessage}`,
      })
    }
  }
  return transactions
}

// Helper function to get token metadata from 0G Chain
async function get0GTokenMetadata(contractAddress: string) {
  try {
    console.log(`Fetching metadata for token: ${contractAddress}`)

    // Get token transactions to extract metadata
    const txResponse = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=10&sort=desc`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const txData = await txResponse.json()
    console.log(`Token metadata response for ${contractAddress}:`, txData)

    if (txData.status === "1" && txData.result && Array.isArray(txData.result) && txData.result.length > 0) {
      const firstTx = txData.result[0]
      return {
        name: firstTx.tokenName || "Unknown Token",
        symbol: firstTx.tokenSymbol || "UNKNOWN",
        decimals: Number.parseInt(firstTx.tokenDecimal || "18"),
      }
    } else {
      console.warn(`No transaction data found for token ${contractAddress}`)
      return {
        name: "Unknown Token",
        symbol: "UNKNOWN",
        decimals: 18,
      }
    }
  } catch (error) {
    console.error(`Error fetching token metadata for ${contractAddress}:`, error)
    return {
      name: "Unknown Token",
      symbol: "UNKNOWN",
      decimals: 18,
    }
  }
}

// Function to discover all tokens a wallet has interacted with
async function discoverAllTokensForWallet(address: string): Promise<Set<string>> {
  const discoveredTokens = new Set<string>()

  try {
    console.log(`Discovering all tokens for wallet: ${address}`)

    // Get ALL token transactions for this wallet (both sent and received)
    // We'll fetch multiple pages to ensure we get all tokens
    const maxPages = 5 // Adjust this based on how thorough you want to be
    const offsetPerPage = 100 // Reduced from 1000 to be more conservative

    for (let page = 1; page <= maxPages; page++) {
      try {
        console.log(`Fetching token transactions page ${page}...`)

        const response = await fetch(
          `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&address=${address}&page=${page}&offset=${offsetPerPage}&sort=desc`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          },
        )

        const data = await response.json()
        console.log(`Page ${page} response:`, data)

        if (data.status === "1" && data.result && Array.isArray(data.result)) {
          if (data.result.length === 0) {
            console.log(`No more transactions found on page ${page}, stopping discovery`)
            break
          }

          // Extract all unique contract addresses from this page
          data.result.forEach((tx: any) => {
            if (tx.contractAddress && tx.contractAddress.trim() !== "") {
              const contractAddr = tx.contractAddress.toLowerCase().trim()
              discoveredTokens.add(contractAddr)
              console.log(
                `Discovered token: ${contractAddr} (${tx.tokenSymbol || "UNKNOWN"} - ${tx.tokenName || "Unknown"})`,
              )
            }
          })

          console.log(
            `Page ${page}: Found ${data.result.length} transactions, total unique tokens so far: ${discoveredTokens.size}`,
          )

          // If we got less than the full page, we've reached the end
          if (data.result.length < offsetPerPage) {
            console.log(`Reached end of transactions on page ${page}`)
            break
          }
        } else {
          console.log(`No valid data on page ${page}:`, data.message || "Unknown error")
          if (data.status === "0") {
            console.log("API returned status 0, might be end of data or error")
          }
          break
        }

        // Add delay between pages to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error)
        break
      }
    }

    console.log(`Token discovery complete. Found ${discoveredTokens.size} unique tokens:`, Array.from(discoveredTokens))
  } catch (error) {
    console.error("Error during token discovery:", error)
  }

  return discoveredTokens
}

// 0G Chain API functions
async function get0GBalance(address: string) {
  try {
    const response = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=balance&address=${address}&tag=latest_state`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result) {
      const balanceStr = data.result
      const balanceNum = Number.parseFloat(balanceStr)
      return {
        chain: "0x40e8",
        balance: balanceStr,
        formattedBalance: balanceNum / 1e18, // Convert from wei to 0G tokens
      }
    } else {
      throw new Error(data.message || "Failed to fetch balance")
    }
  } catch (error) {
    console.error("Error fetching 0G balance:", error)
    return {
      chain: "0x40e8",
      error: `Failed to fetch 0G balance: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function get0GTransactions(address: string, limit: number) {
  try {
    const response = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=txlist&address=${address}&page=1&offset=${limit}&sort=desc`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      const transactions = data.result.map((tx: any) => {
        let timestamp = new Date().toISOString() // Default to current time

        if (tx.timeStamp) {
          try {
            const timestampNum = Number.parseInt(tx.timeStamp)
            if (!isNaN(timestampNum) && timestampNum > 0) {
              timestamp = new Date(timestampNum * 1000).toISOString()
            }
          } catch (e) {
            console.warn("Invalid timestamp for transaction:", tx.hash, tx.timeStamp)
          }
        }

        return {
          hash: tx.hash,
          from_address: tx.from,
          to_address: tx.to,
          value: tx.value || "0",
          block_timestamp: timestamp,
          gas_used: tx.gasUsed || "0",
          gas_price: tx.gasPrice || "0",
        }
      })

      return {
        chain: "0x40e8",
        data: transactions,
      }
    } else {
      throw new Error(data.message || "Failed to fetch transactions")
    }
  } catch (error) {
    console.error("Error fetching 0G transactions:", error)
    return {
      chain: "0x40e8",
      error: `Failed to fetch 0G transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Completely rewritten function to discover and check ALL tokens dynamically
async function get0GTokenBalances(address: string) {
  try {
    console.log(`=== Starting comprehensive token balance check for wallet: ${address} ===`)

    // Step 1: Discover ALL tokens this wallet has ever interacted with
    const discoveredTokens = await discoverAllTokensForWallet(address)

    if (discoveredTokens.size === 0) {
      console.log("No tokens discovered from transaction history")
      return {
        chain: "0x40e8",
        data: [],
      }
    }

    console.log(`=== Checking balances for ${discoveredTokens.size} discovered tokens ===`)

    // Step 2: Check balance for each discovered token
    const tokenBalances = []
    let checkedCount = 0

    for (const contractAddress of discoveredTokens) {
      try {
        checkedCount++
        console.log(`[${checkedCount}/${discoveredTokens.size}] Checking balance for token: ${contractAddress}`)

        // Get token metadata
        const metadata = await get0GTokenMetadata(contractAddress)
        console.log(`Token metadata: ${metadata.name} (${metadata.symbol}) - ${metadata.decimals} decimals`)

        // Get current token balance using the tokenbalance API
        const balanceResponse = await fetch(
          `https://chainscan-test.0g.ai/open/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          },
        )

        const balanceData = await balanceResponse.json()
        console.log(`Balance API response:`, balanceData)

        if (balanceData.status === "1" && balanceData.result !== undefined) {
          const balance = Number.parseFloat(balanceData.result || "0")
          const formattedBalance = balance / Math.pow(10, metadata.decimals)

          console.log(`✅ ${metadata.symbol}: Raw balance = ${balance}, Formatted = ${formattedBalance}`)

          // Include ALL tokens (even with 0 balance) for debugging, but you can filter for > 0 if needed
          tokenBalances.push({
            token_address: contractAddress,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
            balance: balanceData.result,
            formattedBalance: formattedBalance,
            hasBalance: balance > 0,
          })
        } else {
          console.warn(`❌ Failed to get balance for token ${contractAddress}:`, balanceData.message || "Unknown error")
        }
      } catch (error) {
        console.error(`❌ Error checking balance for token ${contractAddress}:`, error)
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // Filter to only show tokens with positive balances
    const tokensWithBalance = tokenBalances.filter((token) => token.hasBalance)

    console.log(`=== SUMMARY ===`)
    console.log(`Total tokens discovered: ${discoveredTokens.size}`)
    console.log(`Total tokens checked: ${checkedCount}`)
    console.log(`Tokens with positive balance: ${tokensWithBalance.length}`)

    tokensWithBalance.forEach((token) => {
      console.log(`  - ${token.symbol}: ${token.formattedBalance}`)
    })

    return {
      chain: "0x40e8",
      data: tokensWithBalance, // Only return tokens with positive balances
    }
  } catch (error) {
    console.error("Error fetching 0G token balances:", error)
    return {
      chain: "0x40e8",
      error: `Failed to fetch 0G token balances: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function get0GTokenInfo(query: string) {
  return {
    chain: "0x40e8",
    data: {
      tokenName: "0G Token",
      tokenSymbol: "0G",
      tokenAddress: query,
      usdPrice: 0.125,
      usdPrice24hrPercentChange: 15.7,
    },
  }
}

async function get0GTokenTransactions(tokenAddress: string, limit: number) {
  try {
    const response = await fetch(
      `https://chainscan-test.0g.ai/open/api?module=account&action=tokentx&contractaddress=${tokenAddress}&page=1&offset=${limit}&sort=desc`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    )

    const data = await response.json()

    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      const transactions = data.result.map((tx: any) => {
        let timestamp = new Date().toISOString() // Default to current time

        if (tx.timeStamp) {
          try {
            const timestampNum = Number.parseInt(tx.timeStamp)
            if (!isNaN(timestampNum) && timestampNum > 0) {
              timestamp = new Date(timestampNum * 1000).toISOString()
            }
          } catch (e) {
            console.warn("Invalid timestamp for token transaction:", tx.hash, tx.timeStamp)
          }
        }

        return {
          transaction_hash: tx.hash,
          from_address: tx.from,
          to_address: tx.to,
          value: tx.value || "0",
          token_decimals: Number.parseInt(tx.tokenDecimal || "18"),
          token_symbol: tx.tokenSymbol || "UNKNOWN",
          block_timestamp: timestamp,
        }
      })

      return {
        chain: "0x40e8",
        data: transactions,
      }
    } else {
      throw new Error(data.message || "Failed to fetch token transactions")
    }
  } catch (error) {
    console.error("Error fetching 0G token transactions:", error)
    return {
      chain: "0x40e8",
      error: `Failed to fetch 0G token transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

import Moralis from 'moralis';

// Initialize Moralis with the API key
export const initializeMoralis = async () => {
  try {
    await Moralis.start({
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjRiNDdmODcwLTk0NzQtNDg2My05ZDNjLTI3ZTQwM2QzZTc4YSIsIm9yZ0lkIjoiNDU0MzA5IiwidXNlcklkIjoiNDY3NDIzIiwidHlwZUlkIjoiY2M5YjllMzUtMzJmZi00NTMzLTk2OGUtODE3ZTI4NDE5NGNiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTAxMDk0NjEsImV4cCI6NDkwNTg2OTQ2MX0.C7Ib1i_oa73zvnteKDybTAeWnv-dIeJX8U96-R-VfJI',
    });
    console.log('Moralis API initialized successfully');
    return Moralis;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Moralis initialization';
    console.error('Failed to initialize Moralis API:', errorMessage);
    throw new Error(`Moralis initialization failed: ${errorMessage}`);
  }
};

// Function to get wallet balances
export const getWalletBalances = async (address: string, chains: string[]) => {
  const balances = [];
  for (const chain of chains) {
    try {
      const response = await Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain,
      });
      const balanceStr = response.raw.balance;
      // Convert string balance to number for arithmetic operation
      const balanceNum = parseFloat(balanceStr);
      balances.push({
        chain,
        balance: balanceStr,
        formattedBalance: balanceNum / 1e18, // Now safe as balanceNum is a number
      });
    } catch (error: unknown) {
      console.error(`Error fetching balance for ${chain}:`, error);
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      balances.push({
        chain,
        error: `Failed to fetch balance: ${errorMessage}`,
      });
    }
  }
  return balances;
};

// Function to get wallet transactions
export const getWalletTransactions = async (address: string, chains: string[], limit: number = 10) => {
  const transactions = [];
  for (const chain of chains) {
    try {
      const response = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain,
        limit,
      });
      transactions.push({
        chain,
        data: response.raw.result,
      });
    } catch (error: unknown) {
      console.error(`Error fetching transactions for ${chain}:`, error);
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      transactions.push({
        chain,
        error: `Failed to fetch transactions: ${errorMessage}`,
      });
    }
  }
  return transactions;
};

// Function to get wallet token balances
export const getWalletTokenBalances = async (address: string, chains: string[]) => {
  const tokenBalances = [];
  for (const chain of chains) {
    try {
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      });
      tokenBalances.push({
        chain,
        data: response.raw,
      });
    } catch (error: unknown) {
      console.error(`Error fetching token balances for ${chain}:`, error);
      // Cast error to Error type for safe message access
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      tokenBalances.push({
        chain,
        error: `Failed to fetch token balances: ${errorMessage}`,
      });
    }
  }
  return tokenBalances;
};

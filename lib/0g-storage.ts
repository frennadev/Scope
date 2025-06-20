// 0G Storage Client for Next.js
// This implementation uses localStorage as a fallback until proper server-side 0G SDK integration

// Types for 0G Storage
export interface CachedTokenData {
  data: any;
  timestamp: number;
  chainId: string;
  tokenAddress: string;
  source: 'dexscreener' | 'moralis' | 'custom' | '0g-api';
}

export interface UserData {
  userId: string;
  watchlist: string[];
  preferences: {
    defaultChain: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: number;
  updatedAt: number;
}

export interface AnalyticsData {
  date: string;
  totalQueries: number;
  uniqueTokens: number;
  crossChainQueries: number;
  cacheHitRate: number;
  topTokens: Array<{ address: string; queries: number }>;
  chainDistribution: Record<string, number>;
}

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 1 * 60 * 60 * 1000;

export class ZeroGStorage {
  private isInitialized: boolean = false;
  private isClientSide: boolean = false;
  private storageReady: boolean = false;

  constructor() {
    this.isClientSide = typeof window !== 'undefined';
    this.initializeStorage();
  }

  private initializeStorage(): void {
    try {
      if (this.isClientSide) {
        // Client-side: Use localStorage
        console.log('🌐 0G Storage: Running in client-side mode with localStorage');
        this.storageReady = typeof localStorage !== 'undefined';
        this.isInitialized = true;
      } else {
        // Server-side: For now, just mark as initialized but not ready for storage
        console.log('🖥️ 0G Storage: Running in server-side mode (storage disabled)');
        this.storageReady = false;
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ 0G Storage: Initialization failed:', error);
      this.isInitialized = true;
      this.storageReady = false;
    }
  }

  /**
   * Check if 0G Storage is properly initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Generate a cache key for token data
   */
  private getCacheKey(tokenAddress: string, chainId: string): string {
    return `token_${chainId}_${tokenAddress.toLowerCase()}`;
  }

  /**
   * Check if cached data is still valid (not expired)
   */
  private isCacheValid(cachedData: CachedTokenData): boolean {
    const now = Date.now();
    return (now - cachedData.timestamp) < CACHE_EXPIRATION;
  }

  /**
   * Store token data in localStorage (0G Storage integration coming soon)
   */
  async cacheTokenData(
    tokenAddress: string, 
    chainId: string, 
    data: any, 
    source: 'dexscreener' | 'moralis' | 'custom' | '0g-api' = 'dexscreener'
  ): Promise<boolean> {
    try {
      if (!this.isReady()) {
        console.warn('0G Storage: Not initialized, skipping cache storage');
        return false;
      }

      const cacheKey = this.getCacheKey(tokenAddress, chainId);
      const cachedData: CachedTokenData = {
        data,
        timestamp: Date.now(),
        chainId,
        tokenAddress: tokenAddress.toLowerCase(),
        source
      };

      if (this.storageReady && typeof localStorage !== 'undefined') {
        localStorage.setItem(`0g_cache_${cacheKey}`, JSON.stringify(cachedData));
        console.log(`💾 0G Storage: Cached data for ${cacheKey} in localStorage`);
        return true;
      }

      console.log(`📝 0G Storage: Cache storage skipped (not available) for ${cacheKey}`);
      return false;
    } catch (error) {
      console.error('❌ 0G Storage: Error caching token data:', error);
      return false;
    }
  }

  /**
   * Retrieve cached token data from localStorage (0G Storage integration coming soon)
   */
  async getCachedTokenData(tokenAddress: string, chainId: string): Promise<any | null> {
    try {
      const cacheKey = this.getCacheKey(tokenAddress, chainId);

      if (this.storageReady && typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(`0g_cache_${cacheKey}`);
        if (cached) {
          const cachedData: CachedTokenData = JSON.parse(cached);
          if (this.isCacheValid(cachedData)) {
            console.log(`✅ 0G Storage: Retrieved cached data for ${cacheKey}`);
            return cachedData.data;
          } else {
            localStorage.removeItem(`0g_cache_${cacheKey}`);
            console.log(`⏰ 0G Storage: Expired cache removed for ${cacheKey}`);
          }
        }
      }

      console.log(`🔍 0G Storage: No cached data found for ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('❌ 0G Storage: Error retrieving cached data:', error);
      return null;
    }
  }

  /**
   * Store analytics data (0G Storage integration coming soon)
   */
  async storeAnalytics(analyticsData: AnalyticsData): Promise<boolean> {
    try {
      if (!this.isReady()) {
        console.warn('0G Storage: Not initialized, cannot store analytics');
        return false;
      }

      if (this.storageReady && typeof localStorage !== 'undefined') {
        const analyticsKey = `0g_analytics_${analyticsData.date}`;
        localStorage.setItem(analyticsKey, JSON.stringify(analyticsData));
        console.log(`📊 0G Storage: Analytics stored for ${analyticsData.date}`);
        return true;
      }

      console.log(`📊 0G Storage: Analytics storage skipped for ${analyticsData.date}`);
      return false;
    } catch (error) {
      console.error('❌ 0G Storage: Error storing analytics:', error);
      return false;
    }
  }

  /**
   * Get storage health status
   */
  async getStorageHealth(): Promise<{
    isReady: boolean;
    storageConnected: boolean;
    kvConnected: boolean;
    lastCheck: number;
  }> {
    const health = {
      isReady: this.isReady(),
      storageConnected: this.storageReady,
      kvConnected: this.storageReady,
      lastCheck: Date.now()
    };

    if (!this.storageReady) {
      console.log('🔧 0G Storage: Using fallback mode');
    }

    return health;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    hitRate: number;
    totalSize: number;
  }> {
    let totalEntries = 0;
    let totalSize = 0;

    if (this.storageReady && typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('0g_cache_')) {
          totalEntries++;
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
          }
        }
      }
    }

    return {
      totalEntries,
      hitRate: 0, // Would need to track hits/misses
      totalSize
    };
  }
}

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Format storage size in human readable format
 */
export function formatStorageSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

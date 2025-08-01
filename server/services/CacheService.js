import NodeCache from 'node-cache';

export class CacheService {
  constructor() {
    // Initialize cache with default TTL of 1 hour
    this.cache = new NodeCache({ 
      stdTTL: 3600, // 1 hour
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false // Don't clone objects for better performance
    });
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Set up event listeners
    this.cache.on('set', (key, value) => {
      this.stats.sets++;
    });
    
    this.cache.on('del', (key, value) => {
      this.stats.deletes++;
    });
    
    this.cache.on('expired', (key, value) => {
      console.log(`Cache key expired: ${key}`);
    });
  }

  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    } else {
      this.stats.misses++;
      return null;
    }
  }

  set(key, value, ttl = null) {
    try {
      if (ttl) {
        this.cache.set(key, value, ttl);
      } else {
        this.cache.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    this.cache.flushAll();
    this.resetStats();
  }

  has(key) {
    return this.cache.has(key);
  }

  keys() {
    return this.cache.keys();
  }

  getStats() {
    const cacheStats = this.cache.getStats();
    return {
      ...this.stats,
      keys: cacheStats.keys,
      ksize: cacheStats.ksize,
      vsize: cacheStats.vsize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // Utility methods for common caching patterns
  getOrSet(key, fetchFunction, ttl = null) {
    const cached = this.get(key);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    return Promise.resolve(fetchFunction()).then(result => {
      this.set(key, result, ttl);
      return result;
    });
  }

  // Cache warming - preload frequently accessed data
  warm(keyValuePairs) {
    keyValuePairs.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  // Get cache size information
  getSizeInfo() {
    const stats = this.cache.getStats();
    return {
      keyCount: stats.keys,
      keySize: stats.ksize,
      valueSize: stats.vsize,
      totalSize: stats.ksize + stats.vsize
    };
  }

  // Clean up expired keys manually
  cleanup() {
    const expiredKeys = [];
    const keys = this.cache.keys();
    
    keys.forEach(key => {
      if (!this.cache.has(key)) {
        expiredKeys.push(key);
      }
    });
    
    return expiredKeys;
  }
}
/**
 * Database utility functions for query optimization
 */

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Calculate pagination offset and limit
 */
export function calculatePagination(params: PaginationParams): {
  offset: number;
  limit: number;
  page: number;
} {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20)); // Max 100 items per page
  const offset = (page - 1) * limit;

  return { offset, limit, page };
}

/**
 * Build pagination result
 */
export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Query filter builder for common patterns
 */
export class QueryFilterBuilder {
  private filters: Record<string, any> = {};

  /**
   * Add equality filter
   */
  eq(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.filters[field] = { type: 'eq', value };
    }
    return this;
  }

  /**
   * Add IN filter
   */
  in(field: string, values: any[]): this {
    if (values && values.length > 0) {
      this.filters[field] = { type: 'in', value: values };
    }
    return this;
  }

  /**
   * Add greater than or equal filter
   */
  gte(field: string, value: any): this {
    if (value !== undefined && value !== null) {
      this.filters[field] = { type: 'gte', value };
    }
    return this;
  }

  /**
   * Add less than or equal filter
   */
  lte(field: string, value: any): this {
    if (value !== undefined && value !== null) {
      this.filters[field] = { type: 'lte', value };
    }
    return this;
  }

  /**
   * Add LIKE filter (case-insensitive)
   */
  ilike(field: string, value: string): this {
    if (value && value.trim()) {
      this.filters[field] = { type: 'ilike', value: `%${value}%` };
    }
    return this;
  }

  /**
   * Apply filters to Supabase query
   */
  apply(query: any): any {
    let filteredQuery = query;

    for (const [field, filter] of Object.entries(this.filters)) {
      switch (filter.type) {
        case 'eq':
          filteredQuery = filteredQuery.eq(field, filter.value);
          break;
        case 'in':
          filteredQuery = filteredQuery.in(field, filter.value);
          break;
        case 'gte':
          filteredQuery = filteredQuery.gte(field, filter.value);
          break;
        case 'lte':
          filteredQuery = filteredQuery.lte(field, filter.value);
          break;
        case 'ilike':
          filteredQuery = filteredQuery.ilike(field, filter.value);
          break;
      }
    }

    return filteredQuery;
  }

  /**
   * Get filter count
   */
  count(): number {
    return Object.keys(this.filters).length;
  }
}

/**
 * Simple in-memory cache for query results
 */
export class QueryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000;
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set cached value
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Global query cache instance (60 second TTL)
 */
export const queryCache = new QueryCache(60);

// Clear expired cache entries every 5 minutes
setInterval(() => {
  queryCache.clearExpired();
}, 5 * 60 * 1000);

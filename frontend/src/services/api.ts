const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MarketsResponse {
  markets: Market[];
  pagination: PaginationInfo;
}

export interface SearchResponse extends MarketsResponse {
  searchQuery: string;
}

export interface MarketStats {
  totalMarkets: number;
  totalVolume: number;
  categoryStats: Record<string, { count: number; volume: number }>;
}

// Import Market type from existing data file
import { Market } from '../data/markets';

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get markets with filtering, pagination, and sorting
  async getMarkets(params: {
    category?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<MarketsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/markets${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchApi<MarketsResponse>(endpoint);
  }

  // Get single market by ID
  async getMarketById(id: string): Promise<Market> {
    return this.fetchApi<Market>(`/markets/${id}`);
  }

  // Search markets
  async searchMarkets(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.fetchApi<SearchResponse>(`/markets/search?${searchParams.toString()}`);
  }

  // Get markets by category
  async getMarketsByCategory(
    category: string,
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<MarketsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/markets/category/${category}${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchApi<MarketsResponse>(endpoint);
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    return this.fetchApi<string[]>('/markets/categories');
  }

  // Get market statistics
  async getMarketStats(): Promise<MarketStats> {
    return this.fetchApi<MarketStats>('/markets/stats');
  }

  // Health check
  async healthCheck(): Promise<{ message: string; timestamp: string; version: string }> {
    return this.fetchApi<{ message: string; timestamp: string; version: string }>('/health');
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience
export const {
  getMarkets,
  getMarketById,
  searchMarkets,
  getMarketsByCategory,
  getCategories,
  getMarketStats,
  healthCheck
} = apiService;

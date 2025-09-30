const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// Import mock data for fallback
import { 
  markets as mockMarkets, 
  categories as mockCategories, 
  getMarketsByCategory as getMockMarketsByCategory, 
  searchMarkets as searchMockMarkets 
} from '../data/markets';

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
      console.warn('API Error, falling back to mock data:', error);
      throw error; // Let individual methods handle fallback
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
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const queryString = searchParams.toString();
      const endpoint = `/markets${queryString ? `?${queryString}` : ''}`;
      
      return await this.fetchApi<MarketsResponse>(endpoint);
    } catch {
      // Fallback to mock data
      const { category, page = 1, limit = 20 } = params;
      const filteredMarkets = category ? getMockMarketsByCategory(category) : mockMarkets;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMarkets = filteredMarkets.slice(startIndex, endIndex);
      
      return {
        markets: paginatedMarkets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredMarkets.length / limit),
          totalCount: filteredMarkets.length,
          hasNextPage: endIndex < filteredMarkets.length,
          hasPrevPage: page > 1
        }
      };
    }
  }

  // Get single market by ID
  async getMarketById(id: string): Promise<Market> {
    try {
      return await this.fetchApi<Market>(`/markets/${id}`);
    } catch {
      // Fallback to mock data
      const market = mockMarkets.find(m => m.id === id);
      if (!market) {
        throw new Error('Market not found');
      }
      return market;
    }
  }

  // Search markets
  async searchMarkets(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      return await this.fetchApi<SearchResponse>(`/markets/search?${searchParams.toString()}`);
    } catch {
      // Fallback to mock data
      const { q, page = 1, limit = 20 } = params;
      const searchResults = searchMockMarkets(q);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = searchResults.slice(startIndex, endIndex);
      
      return {
        markets: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(searchResults.length / limit),
          totalCount: searchResults.length,
          hasNextPage: endIndex < searchResults.length,
          hasPrevPage: page > 1
        },
        searchQuery: q
      };
    }
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
    try {
      return await this.fetchApi<string[]>('/markets/categories');
    } catch {
      // Fallback to mock data
      return mockCategories;
    }
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

import { useState, useEffect } from 'react';
import { apiService, MarketsResponse, SearchResponse } from '../services/api';
import { Market } from '../data/markets';

// Hook for fetching markets with filtering and pagination
export const useMarkets = (params: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} = {}) => {
  const [data, setData] = useState<MarketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getMarkets(params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [params.category, params.page, params.limit, params.sort, params.order]);

  return { data, loading, error, refetch: () => setLoading(true) };
};

// Hook for fetching a single market
export const useMarket = (id: string | null) => {
  const [data, setData] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchMarket = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getMarketById(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market');
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [id]);

  return { data, loading, error };
};

// Hook for searching markets
export const useSearchMarkets = (query: string, page: number = 1, limit: number = 20) => {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      setLoading(false);
      return;
    }

    const searchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.searchMarkets({ q: query, page, limit });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search markets');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchMarkets, 300);
    return () => clearTimeout(timeoutId);
  }, [query, page, limit]);

  return { data, loading, error };
};

// Hook for fetching categories - no caching, fresh data every time
export const useCategories = () => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getCategories();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Fetch once per component mount - no caching between mounts

  return { data, loading, error };
};

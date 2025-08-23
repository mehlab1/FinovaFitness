import { useState, useEffect, useCallback } from 'react';
import posService, { POSSummary, POSTransaction, POSFilters } from '../services/posService';

interface UsePOSDataReturn {
  // State
  posSummary: POSSummary | null;
  recentTransactions: POSTransaction[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPOSSummary: (filters?: POSFilters) => Promise<void>;
  fetchRecentTransactions: (limit?: number) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const usePOSData = (): UsePOSDataReturn => {
  const [posSummary, setPOSSummary] = useState<POSSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  const formatDate = useCallback((date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const fetchPOSSummary = useCallback(async (filters?: POSFilters) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await posService.getPOSSummary(filters);
      if (response.success) {
        setPOSSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch POS summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching POS summary');
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const fetchRecentTransactions = useCallback(async (limit: number = 10) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await posService.getRecentTransactions(limit);
      if (response.success) {
        setRecentTransactions(response.data);
      } else {
        setError(response.message || 'Failed to fetch recent transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recent transactions');
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      // Fetch both summary and recent transactions
      const [summaryResponse, transactionsResponse] = await Promise.all([
        posService.refreshPOSData(),
        posService.getRecentTransactions(10)
      ]);

      if (summaryResponse.success) {
        setPOSSummary(summaryResponse.data);
      } else {
        setError(summaryResponse.message || 'Failed to refresh POS summary');
      }

      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.data);
      } else {
        setError(transactionsResponse.message || 'Failed to refresh recent transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while refreshing data');
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  // Initial data fetch
  useEffect(() => {
    fetchPOSSummary();
    fetchRecentTransactions();
  }, [fetchPOSSummary, fetchRecentTransactions]);

  return {
    // State
    posSummary,
    recentTransactions,
    loading,
    error,
    
    // Actions
    fetchPOSSummary,
    fetchRecentTransactions,
    refreshData,
    clearError,
    
    // Utilities
    formatCurrency,
    formatDate
  };
};

export default usePOSData;

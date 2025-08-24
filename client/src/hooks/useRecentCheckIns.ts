import { useState, useCallback, useEffect } from 'react';
import { checkInApi } from '@/services/checkInApi';
import { CheckIn } from '@/types/checkIn';
import { useToast } from '@/hooks/use-toast';

interface UseRecentCheckInsReturn {
  fetchRecentCheckIns: (limit?: number) => Promise<void>;
  checkIns: CheckIn[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => void;
}

export const useRecentCheckIns = (autoRefresh: boolean = true): UseRecentCheckInsReturn => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecentCheckIns = useCallback(async (limit: number = 10): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const checkIns = await checkInApi.getRecentCheckIns(limit);
      setCheckIns(checkIns);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent check-ins';
      setError(errorMessage);
      setCheckIns([]);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    fetchRecentCheckIns();
  }, [fetchRecentCheckIns]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRecentCheckIns();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchRecentCheckIns]);

  // Initial fetch
  useEffect(() => {
    fetchRecentCheckIns();
  }, [fetchRecentCheckIns]);

  return {
    fetchRecentCheckIns,
    checkIns,
    isLoading,
    error,
    clearError,
    refresh,
  };
};

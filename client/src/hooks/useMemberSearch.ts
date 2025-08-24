import { useState, useCallback, useEffect } from 'react';
import { memberSearchApi, MemberSearchResponse } from '@/services/memberSearchApi';
import { Member } from '@/types/checkIn';
import { useToast } from '@/hooks/use-toast';

interface UseMemberSearchReturn {
  searchMembers: (query: string) => Promise<void>;
  members: Member[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  clearResults: () => void;
}

export const useMemberSearch = (): UseMemberSearchReturn => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchMembers = useCallback(async (query: string): Promise<void> => {
    if (query.length < 2) {
      setMembers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: MemberSearchResponse = await memberSearchApi.searchMembers(query);
      
      if (response.success) {
        setMembers(response.data);
      } else {
        throw new Error(response.message || 'Failed to search members');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search members';
      setError(errorMessage);
      setMembers([]);
      
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

  const clearResults = useCallback(() => {
    setMembers([]);
    setError(null);
  }, []);

  // Clear expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      memberSearchApi.clearExpiredCache();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return {
    searchMembers,
    members,
    isLoading,
    error,
    clearError,
    clearResults,
  };
};

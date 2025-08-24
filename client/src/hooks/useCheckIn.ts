import { useState, useCallback } from 'react';
import { checkInApi } from '@/services/checkInApi';
import { CheckInData } from '@/types/checkIn';

interface UseCheckInReturn {
  checkInMember: (checkInData: CheckInData) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useCheckIn = (): UseCheckInReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInMember = useCallback(async (
    checkInData: CheckInData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await checkInApi.checkInMember(checkInData);
      
      console.log('Check-in response:', response); // Debug log
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to check in member');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in member';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkInMember,
    isLoading,
    error,
    clearError,
  };
};

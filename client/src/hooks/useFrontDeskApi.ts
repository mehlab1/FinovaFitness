import { useState, useCallback } from 'react';
import frontDeskApi, { 
  MemberCreationData, 
  CreatedMember, 
  ApiResponse,
  ValidationError 
} from '../services/frontDeskApi';

interface UseFrontDeskApiReturn {
  createMember: (memberData: MemberCreationData) => Promise<CreatedMember>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useFrontDeskApi = (): UseFrontDeskApiReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createMember = useCallback(async (memberData: MemberCreationData): Promise<CreatedMember> => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<CreatedMember> = await frontDeskApi.createMember(memberData);
      return response.data;
    } catch (err: any) {
      let errorMessage = 'Failed to create member';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.errors && Array.isArray(err.errors)) {
        // Handle validation errors
        const validationErrors = err.errors as ValidationError[];
        errorMessage = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createMember,
    loading,
    error,
    clearError
  };
};

export default useFrontDeskApi;

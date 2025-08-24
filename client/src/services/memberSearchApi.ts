import { apiClient } from '@/lib/api-client';
import { Member } from '../types/checkIn';

export interface MemberSearchResponse {
  success: boolean;
  data: Member[];
  message?: string;
}

class MemberSearchApiService {
  private cache = new Map<string, { data: Member[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Search members with autocomplete functionality
   */
  async searchMembers(query: string): Promise<MemberSearchResponse> {
    // Check cache first
    const cached = this.cache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        success: true,
        data: cached.data
      };
    }

    try {
      const response = await apiClient.get(`/api/checkin/search?q=${encodeURIComponent(query)}`);
      
      // Cache the result
      this.cache.set(query, {
        data: response.data,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error('Error searching members:', error);
      throw new Error('Failed to search members');
    }
  }

  /**
   * Get detailed member information
   */
  async getMemberDetails(userId: number): Promise<Member> {
    try {
      const response = await apiClient.get(`/api/members/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching member details:', error);
      throw new Error('Failed to fetch member details');
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export const memberSearchApi = new MemberSearchApiService();

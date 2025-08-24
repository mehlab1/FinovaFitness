import { apiClient } from '@/lib/api-client';
import { Member, CheckIn, CheckInData, ApiResponse } from '../types/checkIn';

class CheckInApiService {
  /**
   * Search for active members by name, email, or member ID
   */
  async searchMembers(searchTerm: string): Promise<Member[]> {
    try {
      const response = await apiClient.get(`/api/checkin/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching members:', error);
      throw new Error('Failed to search members');
    }
  }

  /**
   * Record a check-in for a member
   */
  async checkInMember(checkInData: CheckInData): Promise<{ success: boolean; check_in_id?: number; error?: string }> {
    try {
      const response = await apiClient.post('/api/checkin/checkin', checkInData);
      return response;
    } catch (error) {
      console.error('Error checking in member:', error);
      throw new Error('Failed to check in member');
    }
  }

  /**
   * Get recent check-ins
   */
  async getRecentCheckIns(limit: number = 10): Promise<CheckIn[]> {
    try {
      const response = await apiClient.get(`/api/checkin/recent?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
      throw new Error('Failed to fetch recent check-ins');
    }
  }

  /**
   * Get check-in history for a specific member
   */
  async getMemberCheckInHistory(userId: number): Promise<CheckIn[]> {
    try {
      const response = await apiClient.get(`/api/checkin/history/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching member check-in history:', error);
      throw new Error('Failed to fetch member check-in history');
    }
  }

  /**
   * Get consistency data for a member
   */
  async getMemberConsistency(userId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/checkin/consistency/${userId}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching member consistency:', error);
      throw new Error('Failed to fetch member consistency');
    }
  }
}

export const checkInApi = new CheckInApiService();

// Export individual functions for easier use
export const { searchMembers, checkInMember, getRecentCheckIns, getMemberCheckInHistory, getMemberConsistency } = checkInApi;

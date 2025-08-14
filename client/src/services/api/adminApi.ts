// Admin API service for gym management
const API_BASE_URL = 'http://localhost:3001/api';

// Get authentication token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
};

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
}

export interface SessionStats {
  sessionsToday: number;
  sessionsThisMonth: number;
  sessionsThisYear: number;
  totalSessions: number;
  trainerSessionBreakdown: {
    trainerId: number;
    trainerName: string;
    sessionsCount: number;
    completionRate: number;
  }[];
  sessionTypeBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
  recentSessions: {
    id: number;
    clientName: string;
    trainerName: string;
    sessionType: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    status: string;
  }[];
}

export const adminApi = {
  // Get member statistics (admin only)
  async getMemberStats(): Promise<MemberStats> {
    try {
      console.log('Fetching member stats...');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Users API response:', data);
      
      if (!data.users || !Array.isArray(data.users)) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from users API');
      }
      
      // Filter users by role 'member'
      const members = data.users.filter((user: any) => user.role === 'member');
      console.log('Filtered members:', members);
      
      const activeMembers = members.filter((member: any) => member.is_active);
      const inactiveMembers = members.filter((member: any) => !member.is_active);
      
      // Calculate new members this month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const newMembersThisMonth = members.filter((member: any) => 
        new Date(member.created_at) >= firstDayOfMonth
      );

      const stats = {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        inactiveMembers: inactiveMembers.length,
        newMembersThisMonth: newMembersThisMonth.length,
      };
      
      console.log('Calculated member stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting member stats:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        newMembersThisMonth: 0,
      };
    }
  },

  // Get session statistics (admin only)
  async getSessionStats(): Promise<SessionStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sessions/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching session stats:', error);
      throw error;
    }
  },
};

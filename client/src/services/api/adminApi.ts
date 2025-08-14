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

export interface RevenueStats {
  todayRevenue: number;
  todayTransactions: number;
  monthRevenue: number;
  monthTransactions: number;
  yearRevenue: number;
  yearTransactions: number;
  revenueBreakdown: {
    membership_fees: number;
    personal_training: number;
    group_classes: number;
    other: number;
  };
  recentTransactions: Array<{
    id: number;
    revenue_date: string;
    revenue_source: string;
    amount: number;
    payment_method: string;
    user_id: number;
    notes: string;
  }>;
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
      
      const activeMembers = members.filter((member: any) => member.is_active && member.subscription_status !== 'paused');
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

  // Get all users (admin only)
  async getAllUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.users || !Array.isArray(data.users)) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from users API');
      }
      
      return data.users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Create new staff member (admin only)
  async createStaffMember(staffData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(staffData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  },

  // Create new member with membership plan (admin only)
  async createMember(memberData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    membership_plan_id?: number;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/create-member`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  // Deactivate staff member (admin only)
  async deactivateStaffMember(userId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deactivating staff member:', error);
      throw error;
    }
  },

  // Reactivate staff member (admin only)
  async reactivateStaffMember(userId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reactivate`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reactivating staff member:', error);
      throw error;
    }
  },

  // Delete staff member permanently (admin only)
  async deleteStaffMember(userId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  },
};

// Revenue Management
export const getRevenueStats = async (): Promise<RevenueStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/revenue/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
};

export const getRevenueDetails = async (period: 'daily' | 'monthly' | 'yearly', startDate?: string, endDate?: string): Promise<any> => {
  try {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/admin/revenue/details?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching revenue details:', error);
    throw error;
  }
};

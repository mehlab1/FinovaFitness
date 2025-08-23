export interface MembershipPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: string;
  features?: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class MembershipPlansApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Fetch all active membership plans
   */
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontdesk/membership-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<MembershipPlan[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch membership plans');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific membership plan by ID
   */
  async getMembershipPlanById(id: number): Promise<MembershipPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/membership-plans/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<MembershipPlan> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch membership plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching membership plan:', error);
      throw error;
    }
  }

  /**
   * Create a new membership plan (admin only)
   */
  async createMembershipPlan(planData: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MembershipPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/membership-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<MembershipPlan> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create membership plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating membership plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing membership plan (admin only)
   */
  async updateMembershipPlan(id: number, planData: Partial<MembershipPlan>): Promise<MembershipPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/membership-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<MembershipPlan> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update membership plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating membership plan:', error);
      throw error;
    }
  }

  /**
   * Delete a membership plan (admin only)
   */
  async deleteMembershipPlan(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/membership-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete membership plan');
      }
    } catch (error) {
      console.error('Error deleting membership plan:', error);
      throw error;
    }
  }
}

export const membershipPlansApi = new MembershipPlansApi();
export default membershipPlansApi;

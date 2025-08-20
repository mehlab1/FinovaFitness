import { API_BASE_URL } from './index';

// Membership plans API
export const membershipApi = {
  // Get all membership plans
  getPlans: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/members/plans`);
      if (!response.ok) {
        throw new Error('Failed to fetch membership plans');
      }
      const data = await response.json();
      return data.plans;
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      throw error;
    }
  },

  // Get membership plan by ID
  getPlanById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/members/plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch membership plan');
      }
      const data = await response.json();
      return data.plan;
    } catch (error) {
      console.error('Error fetching membership plan:', error);
      throw error;
    }
  }
};

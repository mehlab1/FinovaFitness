// ==============================================
// MONTHLY PLAN API SERVICE
// ==============================================

export interface MonthlyPlan {
  id: number;
  trainer_id: number;
  plan_name: string;
  monthly_price: number;
  sessions_per_month: number;
  session_duration: number;
  session_type: 'personal' | 'group';
  max_subscribers: number;
  is_active: boolean;
  requires_admin_approval: boolean;
  admin_approved: boolean;
  admin_approval_date?: string;
  admin_approval_notes?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  trainer_first_name?: string;
  trainer_last_name?: string;
  trainer_email?: string;
  specialization?: string[];
  certification?: string[];
  experience_years?: number;
  bio?: string;
  rating?: number;
  total_sessions?: number;
}

export interface CreateMonthlyPlanData {
  trainer_id: number;
  plan_name: string;
  monthly_price: number;
  sessions_per_month: number;
  session_duration?: number;
  session_type?: 'personal' | 'group';
  max_subscribers?: number;
  description?: string;
}

export interface UpdateMonthlyPlanData {
  plan_name?: string;
  monthly_price?: number;
  sessions_per_month?: number;
  session_duration?: number;
  session_type?: 'personal' | 'group';
  max_subscribers?: number;
  description?: string;
  is_active?: boolean;
}

class MonthlyPlanApiService {
  private baseUrl = 'http://localhost:3001/api/monthly-plans';

  // ==============================================
  // CUSTOM FETCH WITH AUTH
  // ==============================================

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('401: No authentication token found. Please log in.');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // ==============================================
  // MONTHLY PLAN MANAGEMENT
  // ==============================================

  /**
   * Create a new monthly plan
   */
  async createMonthlyPlan(planData: CreateMonthlyPlanData): Promise<{ success: boolean; message: string; data: MonthlyPlan }> {
    return this.fetchWithAuth(`${this.baseUrl}/create`, {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  /**
   * Get all monthly plans for a specific trainer
   */
  async getTrainerMonthlyPlans(trainerId: number): Promise<{ success: boolean; message: string; data: MonthlyPlan[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/trainer/${trainerId}`);
  }

  /**
   * Get all approved monthly plans (for members to browse)
   */
  async getApprovedMonthlyPlans(): Promise<{ success: boolean; message: string; data: MonthlyPlan[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/approved`);
  }

  /**
   * Update a monthly plan
   */
  async updateMonthlyPlan(planId: number, planData: UpdateMonthlyPlanData): Promise<{ success: boolean; message: string; data: MonthlyPlan }> {
    return this.fetchWithAuth(`${this.baseUrl}/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  /**
   * Delete a monthly plan
   */
  async deleteMonthlyPlan(planId: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/${planId}`, {
      method: 'DELETE',
    });
  }

  // ==============================================
  // PUBLIC ENDPOINTS (for reference)
  // ==============================================

  /**
   * Get approved monthly plans without authentication (for public browsing)
   */
  async getPublicApprovedMonthlyPlans(): Promise<{ success: boolean; message: string; data: MonthlyPlan[] }> {
    const response = await fetch(`${this.baseUrl}/approved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Debug method to get trainer information (no authentication required)
   */
  async getDebugTrainers(): Promise<{ success: boolean; message: string; data: any[] }> {
    const response = await fetch(`${this.baseUrl}/debug/trainers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }
}

export const monthlyPlanApi = new MonthlyPlanApiService();
export default monthlyPlanApi;

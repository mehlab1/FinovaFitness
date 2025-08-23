// ==============================================
// ADMIN MONTHLY PLAN API SERVICE
// ==============================================

const API_BASE_URL = 'http://localhost:3001/api/admin/monthly-plans';

export interface MonthlyPlan {
  id: number;
  trainer_id: number;
  plan_name: string;
  monthly_price: number;
  sessions_per_month: number;
  session_duration: number;
  session_type: 'personal' | 'group';
  max_subscribers: number;
  description?: string;
  is_active: boolean;
  requires_admin_approval: boolean;
  admin_approved: boolean | null;
  admin_approval_date?: string;
  admin_approval_notes?: string;
  created_at: string;
  updated_at: string;
  trainer_first_name: string;
  trainer_last_name: string;
  trainer_email: string;
  specialization?: string;
  certification?: string;
  experience_years?: number;
  bio?: string;
  rating?: number;
  total_sessions?: number;
  hours_since_created?: number;
  active_subscriptions?: number;
  total_revenue?: number;
}

export interface MonthlyPlanStats {
  totalPlans: number;
  pendingPlans: number;
  approvedPlans: number;
  rejectedPlans: number;
  activeSubscriptions: number;
  totalRevenue: number;
  plansByTrainer: Array<{
    trainer_id: number;
    trainer_name: string;
    total_plans: number;
    approved_plans: number;
    rejected_plans: number;
    pending_plans: number;
  }>;
  recentActivity: Array<{
    id: number;
    plan_name: string;
    admin_approved: boolean;
    admin_approval_date: string;
    admin_approval_notes?: string;
    trainer_name: string;
  }>;
}

export interface MonthlyPlanDetails extends MonthlyPlan {
  subscriptions: Array<{
    id: number;
    member_id: number;
    trainer_id: number;
    plan_id: number;
    subscription_start_date: string;
    subscription_end_date?: string;
    auto_renewal: boolean;
    status: string;
    sessions_remaining: number;
    total_paid: number;
    payment_date: string;
    next_billing_date?: string;
    cancellation_date?: string;
    cancellation_reason?: string;
    created_at: string;
    updated_at: string;
    member_name: string;
    member_email: string;
  }>;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get pending monthly plans
export const getPendingMonthlyPlans = async (): Promise<MonthlyPlan[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pending`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching pending monthly plans:', error);
    throw error;
  }
};

// Get approved monthly plans
export const getApprovedMonthlyPlans = async (): Promise<MonthlyPlan[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/approved`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching approved monthly plans:', error);
    throw error;
  }
};

// Get monthly plan statistics
export const getMonthlyPlanStats = async (): Promise<MonthlyPlanStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching monthly plan stats:', error);
    throw error;
  }
};

// Get monthly plan details
export const getMonthlyPlanDetails = async (planId: number): Promise<MonthlyPlanDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${planId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching monthly plan details:', error);
    throw error;
  }
};

// Approve a monthly plan
export const approveMonthlyPlan = async (
  planId: number, 
  adminId: number, 
  comments?: string
): Promise<{ success: boolean; message: string; data: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${planId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        admin_id: adminId,
        comments
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error approving monthly plan:', error);
    throw error;
  }
};

// Reject a monthly plan
export const rejectMonthlyPlan = async (
  planId: number, 
  adminId: number, 
  comments?: string
): Promise<{ success: boolean; message: string; data: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${planId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        admin_id: adminId,
        comments
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error rejecting monthly plan:', error);
    throw error;
  }
};

// ==============================================
// MEMBER MONTHLY PLAN API SERVICE
// ==============================================

const API_BASE_URL = 'http://localhost:3001/api/member/monthly-plans';

export interface AvailableMonthlyPlan {
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
  admin_approved: boolean;
  admin_approval_date?: string;
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
  active_subscriptions: number;
  is_subscribed: boolean;
}

export interface MemberSubscription {
  id: number;
  member_id: number;
  trainer_id: number;
  plan_id: number;
  subscription_start_date: string;
  subscription_end_date?: string;
  auto_renewal: boolean;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'paused';
  sessions_remaining: number;
  total_paid: number;
  payment_date: string;
  next_billing_date?: string;
  cancellation_date?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  plan_name: string;
  monthly_price: number;
  sessions_per_month: number;
  session_duration: number;
  session_type: string;
  trainer_first_name: string;
  trainer_last_name: string;
  trainer_email: string;
  specialization?: string;
  rating?: number;
}

export interface SubscriptionDetails extends MemberSubscription {
  plan_description?: string;
  bio?: string;
  experience_years?: number;
  completed_sessions: number;
  scheduled_sessions: number;
  upcoming_sessions: Array<{
    id: number;
    subscription_id: number;
    scheduled_date: string;
    scheduled_time: string;
    slot_id: number;
    session_number: number;
    status: string;
    date: string;
    start_time: string;
    end_time: string;
  }>;
}

export interface SubscriptionRequest {
  plan_id: number;
}

export interface CancelSubscriptionRequest {
  subscription_id: number;
  reason?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get available monthly plans
export const getAvailableMonthlyPlans = async (
  memberId: number,
  filters?: {
    trainer_name?: string;
    price_min?: number;
    price_max?: number;
    session_type?: string;
  }
): Promise<AvailableMonthlyPlan[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.trainer_name) params.append('trainer_name', filters.trainer_name);
    if (filters?.price_min) params.append('price_min', filters.price_min.toString());
    if (filters?.price_max) params.append('price_max', filters.price_max.toString());
    if (filters?.session_type) params.append('session_type', filters.session_type);

    const response = await fetch(`${API_BASE_URL}/${memberId}/available?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching available monthly plans:', error);
    throw error;
  }
};

// Request subscription to a plan
export const requestSubscription = async (
  memberId: number,
  planId: number
): Promise<{ success: boolean; message: string; data: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${memberId}/request-subscription`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plan_id: planId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error requesting subscription:', error);
    throw error;
  }
};

// Get member's subscriptions
export const getMemberSubscriptions = async (memberId: number): Promise<MemberSubscription[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${memberId}/subscriptions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching member subscriptions:', error);
    throw error;
  }
};

// Get subscription details
export const getSubscriptionDetails = async (
  memberId: number,
  subscriptionId: number
): Promise<SubscriptionDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${memberId}/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = async (
  memberId: number,
  subscriptionId: number,
  reason?: string
): Promise<{ success: boolean; message: string; data: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${memberId}/cancel-subscription`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subscription_id: subscriptionId, reason })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

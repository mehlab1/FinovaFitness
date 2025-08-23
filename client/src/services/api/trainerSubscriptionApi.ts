// ==============================================
// TRAINER SUBSCRIPTION API SERVICE
// ==============================================

const API_BASE_URL = 'http://localhost:3001/api/trainer/subscriptions';

export interface PendingSubscription {
  id: number;
  member_id: number;
  trainer_id: number;
  plan_id: number;
  subscription_start_date: string;
  subscription_end_date?: string;
  auto_renewal: boolean;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'paused' | 'rejected';
  sessions_remaining: number;
  total_paid: number;
  payment_date: string;
  created_at: string;
  updated_at: string;
  plan_name: string;
  monthly_price: number;
  sessions_per_month: number;
  session_duration: number;
  session_type: string;
  member_first_name: string;
  member_last_name: string;
  member_email: string;
  member_phone?: string;
  membership_start_date?: string;
  membership_status?: string;
  hours_since_request: number;
}

export interface TrainerSubscription extends PendingSubscription {
  completed_sessions: number;
  scheduled_sessions: number;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  pending_requests: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  rejected_subscriptions: number;
  expired_subscriptions: number;
  total_revenue: number;
  avg_revenue_per_subscription: number;
  recent_activity: Array<{
    status: string;
    created_at: string;
    plan_name: string;
    first_name: string;
    last_name: string;
  }>;
}

export interface SubscriptionDetails extends TrainerSubscription {
  plan_description?: string;
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

export interface ApprovalRequest {
  subscription_id: number;
  notes?: string;
}

export interface RejectionRequest {
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

// Get pending subscription requests
export const getPendingSubscriptions = async (): Promise<PendingSubscription[]> => {
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
    console.error('Error fetching pending subscriptions:', error);
    throw error;
  }
};

// Get all trainer subscriptions
export const getTrainerSubscriptions = async (
  status?: string
): Promise<TrainerSubscription[]> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/subscriptions?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching trainer subscriptions:', error);
    throw error;
  }
};

// Get subscription statistics
export const getTrainerSubscriptionStats = async (): Promise<SubscriptionStats> => {
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
    console.error('Error fetching subscription stats:', error);
    throw error;
  }
};

// Get subscription details
export const getSubscriptionDetails = async (
  subscriptionId: number
): Promise<SubscriptionDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
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

// Approve subscription request
export const approveSubscriptionRequest = async (
  subscriptionId: number,
  notes?: string
): Promise<{ success: boolean; message: string; data: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subscription_id: subscriptionId, notes })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error approving subscription request:', error);
    throw error;
  }
};

// Reject subscription request
export const rejectSubscriptionRequest = async (
  subscriptionId: number,
  reason?: string
): Promise<{ success: boolean; message: string; data: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reject`, {
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
    console.error('Error rejecting subscription request:', error);
    throw error;
  }
};

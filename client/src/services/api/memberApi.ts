const BASE_URL = 'http://localhost:3001/api';

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
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

export const memberApi = {
  // Get member dashboard data
  getDashboard: async () => {
    const response = await fetch(`${BASE_URL}/members/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get member bookings
  getBookings: async () => {
    const response = await fetch(`${BASE_URL}/members/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get available trainers
  getTrainers: async () => {
    const response = await fetch(`${BASE_URL}/members/trainers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get nutritionists
  getNutritionists: async () => {
    const response = await fetch(`${BASE_URL}/members/nutritionists`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get workout schedule
  getWorkoutSchedule: async () => {
    const response = await fetch(`${BASE_URL}/members/workout-schedule`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create training request
  createTrainingRequest: async (data: any) => {
    const response = await fetch(`${BASE_URL}/members/training-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get announcements
  getAnnouncements: async () => {
    const response = await fetch(`${BASE_URL}/members/announcements`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get facilities
  getFacilities: async () => {
    const response = await fetch(`${BASE_URL}/members/facilities`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get membership plans
  getMembershipPlans: async () => {
    const response = await fetch(`${BASE_URL}/members/membership-plans`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get gym classes
  getClasses: async () => {
    const response = await fetch(`${BASE_URL}/members/classes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Book a class
  bookClass: async (classId: number, date: string, time: string) => {
    const response = await fetch(`${BASE_URL}/members/book-class`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ classId, date, time }),
    });
    return handleResponse(response);
  },

  // Get member profile data
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/members/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update member profile
  updateProfile: async (profileData: any) => {
    const response = await fetch(`${BASE_URL}/members/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Log new weight
  logWeight: async (weightData: { weight: number; notes?: string }) => {
    const response = await fetch(`${BASE_URL}/members/weight-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(weightData),
    });
    return handleResponse(response);
  },

  // Get weight change data
  getWeightChange: async () => {
    const response = await fetch(`${BASE_URL}/members/weight-change`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/members/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Reset password
  resetPassword: async (resetData: { email: string; verificationCode: string; newPassword: string }) => {
    const response = await fetch(`${BASE_URL}/members/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resetData),
    });
    return handleResponse(response);
  },

  // Plan change functionality
  calculatePlanChange: async (newPlanId: number) => {
    const response = await fetch(`${BASE_URL}/members/calculate-plan-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPlanId }),
    });
    return handleResponse(response);
  },

  initiatePlanChange: async (planChangeData: {
    newPlanId: number;
    currentPlanBalance: number;
    newPlanPrice: number;
    balanceDifference: number;
  }) => {
    const response = await fetch(`${BASE_URL}/members/initiate-plan-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planChangeData),
    });
    return handleResponse(response);
  },

  confirmPlanChange: async (confirmationData: {
    requestId: number;
    email: string;
    password: string;
  }) => {
    const response = await fetch(`${BASE_URL}/members/confirm-plan-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(confirmationData),
    });
    return handleResponse(response);
  },

  getBalance: async () => {
    const response = await fetch(`${BASE_URL}/members/balance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Top up balance
  topUpBalance: async (amount: number) => {
    const response = await fetch(`${BASE_URL}/members/top-up-balance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },
};

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Trainer API functions
export const trainerApi = {
  getDashboard: () => apiCall('/trainers/dashboard'),
  getSchedule: (date?: string) => apiCall(`/trainers/schedule${date ? `?date=${date}` : ''}`),
  getRequests: () => apiCall('/trainers/requests'),
  updateRequest: (id: number, data: any) => apiCall(`/trainers/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getSessionNotes: () => apiCall('/trainers/session-notes'),
  saveSessionNotes: (data: any) => apiCall('/trainers/session-notes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAnalytics: () => apiCall('/trainers/analytics'),
  getSubscriptions: () => apiCall('/trainers/subscriptions')
};

// Member API functions
export const memberApi = {
  getDashboard: () => apiCall('/members/dashboard'),
  getBookings: () => apiCall('/members/bookings'),
  getTrainers: () => apiCall('/members/trainers'),
  getNutritionists: () => apiCall('/members/nutritionists'),
  getAnnouncements: () => apiCall('/members/announcements'),
  getWorkoutSchedule: () => apiCall('/members/workout-schedule'),
  getMembershipPlans: () => apiCall('/members/membership-plans'),
  getFacilities: () => apiCall('/members/facilities'),
  createTrainingRequest: (data: any) => apiCall('/members/training-request', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  bookFacility: (data: any) => apiCall('/members/book-facility', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Auth API functions
export const authApi = {
  login: (email: string, password: string) => apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (userData: any) => apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getProfile: () => apiCall('/users/profile')
};

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

export default {
  trainerApi,
  memberApi,
  authApi
};

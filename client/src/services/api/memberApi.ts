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
};

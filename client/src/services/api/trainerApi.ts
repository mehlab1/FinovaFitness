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

export const trainerApi = {
  // Get trainer dashboard data
  getDashboard: async () => {
    const response = await fetch(`${BASE_URL}/trainers/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get trainer schedule
  getSchedule: async (date?: string) => {
    const url = date 
      ? `${BASE_URL}/trainers/schedule?date=${date}`
      : `${BASE_URL}/trainers/schedule`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get client requests
  getRequests: async () => {
    const response = await fetch(`${BASE_URL}/trainers/requests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update request status
  updateRequest: async (id: number, data: any) => {
    const response = await fetch(`${BASE_URL}/trainers/requests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get analytics data
  getAnalytics: async () => {
    const response = await fetch(`${BASE_URL}/trainers/analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get session notes
  getSessionNotes: async (sessionId?: number) => {
    const url = sessionId 
      ? `${BASE_URL}/trainers/session-notes/${sessionId}`
      : `${BASE_URL}/trainers/session-notes`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create/update session notes
  saveSessionNotes: async (sessionId: number, notes: any) => {
    const response = await fetch(`${BASE_URL}/trainers/session-notes/${sessionId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notes),
    });
    return handleResponse(response);
  },

  // Get client subscriptions
  getSubscriptions: async () => {
    const response = await fetch(`${BASE_URL}/trainers/subscriptions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get trainer profile
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/trainers/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update trainer profile
  updateProfile: async (profileData: any) => {
    const response = await fetch(`${BASE_URL}/trainers/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Update trainer availability
  updateAvailability: async (availability: any[]) => {
    const response = await fetch(`${BASE_URL}/trainers/availability`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ availability }),
    });
    return handleResponse(response);
  },

  // Generate time slots based on availability
  generateTimeSlots: async (availability: any[]) => {
    const response = await fetch(`${BASE_URL}/trainers/generate-slots`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ availability }),
    });
    return handleResponse(response);
  },

  // Get trainer availability settings
  getAvailability: async () => {
    const response = await fetch(`${BASE_URL}/trainers/availability`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get available time slots for a specific date
  getAvailableSlots: async (date: string) => {
    const response = await fetch(`${BASE_URL}/trainers/available-slots?date=${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Block specific time slots (mark as unavailable)
  blockTimeSlots: async (blockData: {
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/trainers/block-slots`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blockData),
    });
    return handleResponse(response);
  },

  // Unblock time slots (mark as available again)
  unblockTimeSlots: async (blockId: number) => {
    const response = await fetch(`${BASE_URL}/trainers/block-slots/${blockId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

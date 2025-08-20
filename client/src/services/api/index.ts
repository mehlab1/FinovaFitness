// Export all API modules
export { trainerApi } from './trainerApi';
export { memberApi } from './memberApi';
export { userApi } from './userApi';
export { adminApi } from './adminApi';
export { nutritionistApi } from './nutritionistApi';

// Export facilities APIs
export { adminFacilitiesApi, publicFacilitiesApi, userFacilitiesApi } from './facilitiesApi';

// Export auth API
export { authApi } from './authApi';

// Export membership API
export { membershipApi } from './membershipApi';

// Common API utilities
export const API_BASE_URL = 'http://localhost:3001/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Generic API call helper
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: getAuthHeaders(),
    ...options,
  });
  return handleApiResponse(response);
};

// HTTP client API object
export const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },
  post: async (url: string, data?: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleApiResponse(response);
  },
  put: async (url: string, data?: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleApiResponse(response);
  },
  patch: async (url: string, data?: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleApiResponse(response);
  },
  delete: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },
};

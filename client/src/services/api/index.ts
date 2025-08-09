// Export all API modules
export { trainerApi } from './trainerApi';
export { memberApi } from './memberApi';

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

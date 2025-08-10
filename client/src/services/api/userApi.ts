import { API_BASE_URL, handleApiResponse } from './index';

export interface UserRegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  token: string;
}

export const userApi = {
  // Register a new user
  async register(userData: UserRegistrationData): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return handleApiResponse(response);
  },

  // Login user
  async login(credentials: UserLoginData): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleApiResponse(response);
  },

  // Get user profile
  async getProfile(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return handleApiResponse(response);
  },

  // Update user profile
  async updateProfile(profileData: Partial<UserRegistrationData>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });

    return handleApiResponse(response);
  },
};

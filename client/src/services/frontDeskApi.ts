export interface MemberCreationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  membership_plan_id: number;
  payment_method: 'cash' | 'card' | 'check' | 'bank_transfer';
  payment_confirmed: boolean;
}

export interface CreatedMember {
  user: {
    id: number;
    email: string;
    role: string;
    is_active: number;
  };
  profile: {
    user_id: number;
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    emergency_contact?: string;
  };
  membership_plan: {
    id: number;
    name: string;
    price: number;
    duration: string;
    description?: string;
  };
  default_password: string;
  payment_details: {
    method: string;
    amount: number;
    confirmed: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  error?: string;
}

class FrontDeskApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  // Create new member
  async createMember(memberData: MemberCreationData): Promise<ApiResponse<CreatedMember>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontdesk/create-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(data.message || 'Failed to create member');
      }

      return data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  // Get membership plans
  async getMembershipPlans(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontdesk/membership-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch membership plans');
      }

      return data;
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      throw error;
    }
  }

  // Get POS summary
  async getPOSSummary(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontdesk/pos-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch POS summary');
      }

      return data;
    } catch (error) {
      console.error('Error fetching POS summary:', error);
      throw error;
    }
  }
}

export const frontDeskApi = new FrontDeskApi();
export default frontDeskApi;

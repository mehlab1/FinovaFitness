import { ApiResponse } from './frontDeskApi';

export interface POSTransaction {
  id: number;
  member_name: string;
  member_email: string;
  plan_name: string;
  plan_price: number;
  payment_method: string;
  transaction_date: string;
  transaction_status: string;
  revenue_amount: number;
}

export interface POSSummary {
  total_revenue: number;
  total_transactions: number;
  today_revenue: number;
  today_transactions: number;
  payment_methods: {
    cash: number;
    card: number;
    check: number;
    bank_transfer: number;
  };
  recent_transactions: POSTransaction[];
}

export interface POSFilters {
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  transaction_status?: string;
}

class POSService {
  private baseUrl = 'http://localhost:3001/api/frontdesk';

  /**
   * Get POS summary data
   */
  async getPOSSummary(filters?: POSFilters): Promise<ApiResponse<POSSummary>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.start_date) queryParams.append('start_date', filters.start_date);
      if (filters?.end_date) queryParams.append('end_date', filters.end_date);
      if (filters?.payment_method) queryParams.append('payment_method', filters.payment_method);
      if (filters?.transaction_status) queryParams.append('transaction_status', filters.transaction_status);

      const url = `${this.baseUrl}/pos-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching POS summary:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<ApiResponse<POSTransaction[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/recent-transactions?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions by date range
   */
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    filters?: Omit<POSFilters, 'start_date' | 'end_date'>
  ): Promise<ApiResponse<POSTransaction[]>> {
    try {
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });
      
      if (filters?.payment_method) queryParams.append('payment_method', filters.payment_method);
      if (filters?.transaction_status) queryParams.append('transaction_status', filters.transaction_status);

      const response = await fetch(`${this.baseUrl}/transactions-by-date?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }

  /**
   * Get payment method breakdown
   */
  async getPaymentMethodBreakdown(filters?: POSFilters): Promise<ApiResponse<{
    cash: number;
    card: number;
    check: number;
    bank_transfer: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.start_date) queryParams.append('start_date', filters.start_date);
      if (filters?.end_date) queryParams.append('end_date', filters.end_date);

      const url = `${this.baseUrl}/payment-breakdown${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment method breakdown:', error);
      throw error;
    }
  }

  /**
   * Export POS data to CSV
   */
  async exportToCSV(filters?: POSFilters): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.start_date) queryParams.append('start_date', filters.start_date);
      if (filters?.end_date) queryParams.append('end_date', filters.end_date);
      if (filters?.payment_method) queryParams.append('payment_method', filters.payment_method);
      if (filters?.transaction_status) queryParams.append('transaction_status', filters.transaction_status);

      const url = `${this.baseUrl}/export-pos-data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error exporting POS data:', error);
      throw error;
    }
  }

  /**
   * Get daily revenue for chart
   */
  async getDailyRevenue(days: number = 30): Promise<ApiResponse<{
    date: string;
    revenue: number;
    transactions: number;
  }[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/daily-revenue?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching daily revenue:', error);
      throw error;
    }
  }

  /**
   * Get monthly revenue for chart
   */
  async getMonthlyRevenue(months: number = 12): Promise<ApiResponse<{
    month: string;
    revenue: number;
    transactions: number;
  }[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/monthly-revenue?months=${months}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  }

  /**
   * Refresh POS data (force cache refresh)
   */
  async refreshPOSData(): Promise<ApiResponse<POSSummary>> {
    try {
      const response = await fetch(`${this.baseUrl}/pos-summary?refresh=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error refreshing POS data:', error);
      throw error;
    }
  }
}

export const posService = new POSService();
export default posService;

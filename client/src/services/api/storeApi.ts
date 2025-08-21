// ==============================================
// AUTHENTICATION HELPER
// ==============================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// ==============================================
// TYPES & INTERFACES
// ==============================================

export interface StoreCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreItem {
  id: number;
  name: string;
  description: string;
  price: number;
  member_discount_percentage: number;
  category_id: number;
  category_name?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  rating: number;
  review_count: number;
  wishlist_count: number;
  is_featured: boolean;
  is_member_only: boolean;
  min_loyalty_points_required: number;
  max_purchase_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface StoreOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  member_discount_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  pickup_notes?: string;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  loyalty_points_value: number;
  promotional_code?: string;
  promotional_discount: number;
  created_at: string;
  updated_at: string;
  items: StoreOrderItem[];
}

export interface StoreOrderItem {
  id: number;
  order_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface StorePromotion {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  usage_limit: number;
  used_count: number;
  is_member_only: boolean;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
}

export interface StoreAnalytics {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_selling_products: Array<{
    id: number;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  revenue_by_period: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  low_stock_items: Array<{
    id: number;
    name: string;
    current_stock: number;
    threshold: number;
  }>;
}

export interface InventoryOverview {
  id: number;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  category_name: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// ==============================================
// STORE API SERVICE
// ==============================================

class StoreApiService {
  private baseUrl = 'http://localhost:3001/api/store';

  // ==============================================
  // CUSTOM FETCH WITH AUTH
  // ==============================================

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('401: No authentication token found. Please log in as an admin user.');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // ==============================================
  // CATEGORY MANAGEMENT
  // ==============================================

  async getAllCategories(): Promise<StoreCategory[]> {
    return this.fetchWithAuth(`${this.baseUrl}/categories`);
  }

  async addCategory(category: { name: string; description?: string }): Promise<StoreCategory> {
    return this.fetchWithAuth(`${this.baseUrl}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, category: { name: string; description?: string }): Promise<StoreCategory> {
    return this.fetchWithAuth(`${this.baseUrl}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  // ==============================================
  // PRODUCT MANAGEMENT
  // ==============================================

  async getAllItems(params?: {
    category_id?: number;
    search?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: StoreItem[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${this.baseUrl}/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth(url);
  }

  async addItem(item: {
    name: string;
    description: string;
    price: number;
    member_discount_percentage: number;
    category_id: number;
    stock_quantity: number;
    low_stock_threshold: number;
    is_featured?: boolean;
    is_member_only?: boolean;
    min_loyalty_points_required?: number;
    max_purchase_quantity?: number;
  }): Promise<StoreItem> {
    return this.fetchWithAuth(`${this.baseUrl}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: number, item: Partial<StoreItem>): Promise<StoreItem> {
    return this.fetchWithAuth(`${this.baseUrl}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: number): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/items/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStock(id: number, stock_quantity: number): Promise<StoreItem> {
    return this.fetchWithAuth(`${this.baseUrl}/items/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock_quantity }),
    });
  }

  // ==============================================
  // ORDER MANAGEMENT
  // ==============================================

  async getAllOrders(params?: {
    status?: string;
    payment_status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: StoreOrder[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${this.baseUrl}/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth(url);
  }

  async updateOrderStatus(id: number, status: string): Promise<StoreOrder> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async confirmPayment(id: number): Promise<StoreOrder> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/orders/${id}/payment`, {
      method: 'PUT',
    });
  }

  async processRefund(orderId: number, refundData: {
    refund_amount: number;
    refund_reason: string;
  }): Promise<StoreOrder> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  // ==============================================
  // INVENTORY MANAGEMENT
  // ==============================================

  async getInventoryOverview(): Promise<InventoryOverview[]> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/inventory`);
  }

  async getLowStockAlerts(): Promise<InventoryOverview[]> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/alerts/low-stock`);
  }

  // ==============================================
  // PROMOTION MANAGEMENT
  // ==============================================

  async getAllPromotions(): Promise<StorePromotion[]> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/promotions`);
  }

  async createPromotion(promotion: {
    code: string;
    name: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    usage_limit: number;
    is_member_only: boolean;
    valid_from: string;
    valid_until: string;
  }): Promise<StorePromotion> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/promotions`, {
      method: 'POST',
      body: JSON.stringify(promotion),
    });
  }

  async updatePromotion(id: number, promotion: Partial<StorePromotion>): Promise<StorePromotion> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promotion),
    });
  }

  // ==============================================
  // REPORTS & ANALYTICS
  // ==============================================

  async generateSalesReport(params?: {
    period: 'daily' | 'weekly' | 'monthly';
    start_date?: string;
    end_date?: string;
  }): Promise<StoreAnalytics> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const url = `${this.baseUrl}/admin/reports/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth(url);
  }

  async generateInventoryReport(): Promise<{
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_inventory_value: number;
  }> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/reports/inventory`);
  }

  // ==============================================
  // PUBLIC ENDPOINTS (for reference)
  // ==============================================

  async validatePromoCode(data: {
    code: string;
    cart_total: number;
    is_member: boolean;
  }): Promise<{
    valid: boolean;
    discount_amount: number;
    message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/validate-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }
}

export const storeApi = new StoreApiService();
export default storeApi;

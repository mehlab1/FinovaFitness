// ==============================================
// STORE API SERVICE FOR MEMBERS & ADMIN
// ==============================================

import {
  StoreCategory,
  StoreItem,
  CartItem,
  StoreOrder,
  WishlistItem,
  ProductReview,
  LoyaltyPoints,
  PromotionalCode,
  CheckoutData,
  CheckoutResponse,
  ReviewsResponse,
  ApiResponse,
  StoreAnalytics,
  InventoryOverview,
  StorePromotion
} from '../../types/store';

class StoreApiService {
  private baseUrl = 'http://localhost:3001/api/store';

  // ==============================================
  // AUTHENTICATION HELPER
  // ==============================================

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('401: No authentication token found. Please log in.');
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

  async addCategory(categoryData: { name: string; description?: string }): Promise<StoreCategory> {
    return this.fetchWithAuth(`${this.baseUrl}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryId: number, categoryData: { name: string; description?: string }): Promise<StoreCategory> {
    return this.fetchWithAuth(`${this.baseUrl}/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
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
  }): Promise<StoreItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${this.baseUrl}/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth(url);
  }

  async deleteItem(itemId: number): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // ==============================================
  // INVENTORY MANAGEMENT
  // ==============================================

  async getInventoryOverview(): Promise<InventoryOverview[]> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/inventory`);
  }

  async updateStock(itemId: number, newStock: number): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/items/${itemId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock_quantity: newStock }),
    });
  }

  // ==============================================
  // ORDER MANAGEMENT
  // ==============================================

  async getAllOrders(): Promise<StoreOrder[]> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/orders`);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async confirmPayment(orderId: number, paymentStatus: string = 'confirmed'): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
  }

  // ==============================================
  // PROMOTION MANAGEMENT
  // ==============================================

  async getAllPromotions(): Promise<StorePromotion[]> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/promotions`);
  }

  async updatePromotion(promotionId: number, updateData: { is_active?: boolean }): Promise<StorePromotion> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/promotions/${promotionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ==============================================
  // ANALYTICS & REPORTS
  // ==============================================

  async generateSalesReport(params: { period: string }): Promise<StoreAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('period', params.period);
    
    return this.fetchWithAuth(`${this.baseUrl}/admin/reports/sales?${queryParams.toString()}`);
  }

  async generateInventoryReport(): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/admin/reports/inventory`);
  }

  // ==============================================
  // CART MANAGEMENT
  // ==============================================

  async createOrGetCart(): Promise<{ id: number }> {
    return this.fetchWithAuth(`${this.baseUrl}/cart`, {
      method: 'POST',
      body: JSON.stringify({ user_id: this.getUserId() }),
    });
  }

  async addToCart(cartId: number, itemId: number, quantity: number): Promise<CartItem[]> {
    return this.fetchWithAuth(`${this.baseUrl}/cart/items`, {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, item_id: itemId, quantity }),
    });
  }

  async getCart(cartId: number): Promise<CartItem[]> {
    return this.fetchWithAuth(`${this.baseUrl}/cart/${cartId}`);
  }

  async updateCartItem(cartId: number, itemId: number, quantity: number): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cart/${cartId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  // ==============================================
  // CHECKOUT & ORDERS
  // ==============================================

  async checkout(checkoutData: CheckoutData): Promise<CheckoutResponse> {
    return this.fetchWithAuth(`${this.baseUrl}/checkout-enhanced`, {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  async getOrderByNumber(orderNumber: string): Promise<StoreOrder> {
    return this.fetchWithAuth(`${this.baseUrl}/orders/${orderNumber}`);
  }

  async getMemberOrderHistory(): Promise<StoreOrder[]> {
    return this.fetchWithAuth(`${this.baseUrl}/member/orders`);
  }

  // ==============================================
  // WISHLIST MANAGEMENT
  // ==============================================

  async getWishlist(): Promise<WishlistItem[]> {
    return this.fetchWithAuth(`${this.baseUrl}/member/wishlist`);
  }

  async addToWishlist(itemId: number): Promise<WishlistItem> {
    return this.fetchWithAuth(`${this.baseUrl}/member/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    });
  }

  async removeFromWishlist(itemId: number): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/member/wishlist/${itemId}`, {
      method: 'DELETE',
    });
  }

  // ==============================================
  // LOYALTY POINTS
  // ==============================================

  async getLoyaltyPointsBalance(): Promise<LoyaltyPoints> {
    return this.fetchWithAuth(`${this.baseUrl}/member/loyalty-points`);
  }

  async applyLoyaltyPoints(cartId: number, pointsToUse: number): Promise<{
    message: string;
    points_used: number;
    discount_value: number;
  }> {
    return this.fetchWithAuth(`${this.baseUrl}/member/loyalty-points/apply`, {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, points_to_use: pointsToUse }),
    });
  }

  // ==============================================
  // PROMOTIONAL CODES
  // ==============================================

  async validatePromotionalCode(code: string, cartTotal: number): Promise<{
    promotion: PromotionalCode;
  }> {
    return this.fetchWithAuth(`${this.baseUrl}/validate-promo-code`, {
      method: 'POST',
      body: JSON.stringify({ 
        code, 
        cart_total: cartTotal, 
        is_member: true 
      }),
    });
  }

  // ==============================================
  // PRODUCT REVIEWS
  // ==============================================

  async getProductReviews(itemId: number, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    return this.fetchWithAuth(`${this.baseUrl}/items/${itemId}/reviews?page=${page}&limit=${limit}`);
  }

  async addProductReview(itemId: number, review: {
    rating: number;
    review_text: string;
    guest_name?: string;
    guest_email?: string;
  }): Promise<ProductReview> {
    return this.fetchWithAuth(`${this.baseUrl}/items/${itemId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  private getUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
  }

  // ==============================================
  // ERROR HANDLING
  // ==============================================

  private handleError(error: any): never {
    console.error('Store API Error:', error);
    
    if (error.message.includes('401')) {
      throw new Error('Please log in to access the store.');
    }
    
    if (error.message.includes('403')) {
      throw new Error('You do not have permission to access this feature.');
    }
    
    if (error.message.includes('404')) {
      throw new Error('The requested resource was not found.');
    }
    
    if (error.message.includes('500')) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'An unexpected error occurred.');
  }
}

// ==============================================
// EXPORT SINGLETON INSTANCE
// ==============================================

export const storeApi = new StoreApiService();
export default storeApi;
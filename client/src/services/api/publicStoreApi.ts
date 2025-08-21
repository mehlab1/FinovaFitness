// ==============================================
// PUBLIC STORE API SERVICE FOR NON-MEMBERS
// ==============================================

import {
  StoreCategory,
  StoreItem,
  CartItem,
  StoreOrder,
  ProductReview,
  PromotionalCode,
  CheckoutData,
  CheckoutResponse,
  ReviewsResponse,
  ApiResponse,
  StoreCart,
  GuestUser
} from '../../types/store';

class PublicStoreApiService {
  private baseUrl = 'http://localhost:3001/api/store';

  // ==============================================
  // PUBLIC FETCH HELPER (No authentication required)
  // ==============================================

  private async fetchPublic(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          // If not JSON, use the text as is
        }
        
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // ==============================================
  // CATEGORY MANAGEMENT (Public)
  // ==============================================

  async getAllCategories(): Promise<StoreCategory[]> {
    try {
      const categories = await this.fetchPublic(`${this.baseUrl}/categories`);
      return categories.map((category: any) => ({
        id: Number(category.id),
        name: String(category.name),
        description: category.description || undefined,
        is_active: Boolean(category.is_active),
        created_at: String(category.created_at),
        updated_at: String(category.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // ==============================================
  // PRODUCT MANAGEMENT (Public)
  // ==============================================

  async getAllItems(params?: {
    category_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<StoreItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${this.baseUrl}/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const items = await this.fetchPublic(url);
      
      return items.map((item: any) => ({
        id: Number(item.id),
        name: String(item.name),
        description: String(item.description || ''),
        price: Number(item.price),
        member_discount_percentage: Number(item.member_discount_percentage || 0),
        category_id: Number(item.category_id),
        category_name: item.category_name || undefined,
        category_description: item.category_description || undefined,
        stock_quantity: Number(item.stock_quantity),
        low_stock_threshold: Number(item.low_stock_threshold || 5),
        is_active: Boolean(item.is_active),
        image_url: item.image_url || undefined,
        created_at: String(item.created_at),
        updated_at: String(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  // ==============================================
  // CART MANAGEMENT (Public - Guest Users)
  // ==============================================

  async createGuestCart(guestData: GuestUser): Promise<StoreCart> {
    try {
      console.log('Creating guest cart with data:', guestData);
      
      const cart = await this.fetchPublic(`${this.baseUrl}/cart`, {
        method: 'POST',
        body: JSON.stringify(guestData),
      });
      
      console.log('Guest cart created successfully:', cart);
      
      return {
        id: Number(cart.id),
        user_id: cart.user_id ? Number(cart.user_id) : undefined,
        guest_email: cart.guest_email || undefined,
        guest_name: cart.guest_name || undefined,
        guest_phone: cart.guest_phone || undefined,
        created_at: String(cart.created_at),
        updated_at: String(cart.updated_at)
      };
    } catch (error) {
      console.error('Error creating guest cart:', error);
      throw error;
    }
  }

  async addToCart(cartId: number, itemId: number, quantity: number): Promise<CartItem[]> {
    try {
      const cartItems = await this.fetchPublic(`${this.baseUrl}/cart/items`, {
        method: 'POST',
        body: JSON.stringify({ 
          cart_id: cartId, 
          item_id: itemId, 
          quantity: quantity 
        }),
      });
      
      return cartItems.map((item: any) => ({
        id: Number(item.id),
        cart_id: Number(item.cart_id),
        item_id: Number(item.item_id),
        quantity: Number(item.quantity),
        price_at_time: Number(item.price_at_time),
        member_discount_applied: Number(item.member_discount_applied || 0),
        name: String(item.name),
        description: String(item.description || ''),
        image_url: item.image_url || undefined,
        category_name: item.category_name || undefined,
        stock_quantity: Number(item.stock_quantity),
        created_at: String(item.created_at)
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async getCart(cartId: number): Promise<CartItem[]> {
    try {
      const cartItems = await this.fetchPublic(`${this.baseUrl}/cart/${cartId}`);
      
      return cartItems.map((item: any) => ({
        id: Number(item.id),
        cart_id: Number(item.cart_id),
        item_id: Number(item.item_id),
        quantity: Number(item.quantity),
        price_at_time: Number(item.price_at_time),
        member_discount_applied: Number(item.member_discount_applied || 0),
        name: String(item.name),
        description: String(item.description || ''),
        image_url: item.image_url || undefined,
        category_name: item.category_name || undefined,
        stock_quantity: Number(item.stock_quantity),
        created_at: String(item.created_at)
      }));
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  async updateCartItem(cartId: number, itemId: number, quantity: number): Promise<{ message: string }> {
    try {
      const result = await this.fetchPublic(`${this.baseUrl}/cart/${cartId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      
      return {
        message: String(result.message || 'Cart updated successfully')
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(cartId: number, itemId: number): Promise<{ message: string }> {
    try {
      const result = await this.fetchPublic(`${this.baseUrl}/cart/${cartId}/items/${itemId}`, {
        method: 'DELETE',
      });
      
      return {
        message: String(result.message || 'Item removed from cart')
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // ==============================================
  // CHECKOUT & ORDERS (Public)
  // ==============================================

  async processCheckout(checkoutData: CheckoutData): Promise<CheckoutResponse> {
    try {
      const response = await this.fetchPublic(`${this.baseUrl}/checkout`, {
        method: 'POST',
        body: JSON.stringify(checkoutData),
      });
      
      return {
        message: String(response.message),
        order: {
          id: Number(response.order.id),
          order_number: String(response.order.order_number),
          final_amount: Number(response.order.final_amount),
          status: String(response.order.status)
        }
      };
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<StoreOrder> {
    try {
      const order = await this.fetchPublic(`${this.baseUrl}/orders/${orderNumber}`);
      
      return {
        id: Number(order.id),
        cart_id: order.cart_id ? Number(order.cart_id) : undefined,
        order_number: String(order.order_number),
        customer_name: String(order.customer_name),
        customer_email: String(order.customer_email),
        customer_phone: order.customer_phone || undefined,
        total_amount: Number(order.total_amount),
        member_discount_total: Number(order.member_discount_total || 0),
        final_amount: Number(order.final_amount),
        payment_method: order.payment_method as 'online' | 'in_person',
        payment_status: order.payment_status as 'pending' | 'confirmed' | 'failed',
        order_status: order.order_status as 'pending' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled',
        pickup_notes: order.pickup_notes || undefined,
        admin_notes: order.admin_notes || undefined,
        created_at: String(order.created_at),
        updated_at: String(order.updated_at),
        items: order.items ? order.items.map((item: any) => ({
          id: Number(item.id),
          order_id: Number(item.order_id),
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          price_at_time: Number(item.price_at_time),
          member_discount_applied: Number(item.member_discount_applied || 0),
          subtotal: Number(item.subtotal),
          name: String(item.name),
          item_name: String(item.item_name || item.name),
          description: String(item.description || ''),
          image_url: item.image_url || undefined,
          category_name: item.category_name || undefined,
          total_price: Number(item.total_price || item.subtotal),
          created_at: String(item.created_at)
        })) : []
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrdersByEmail(email: string): Promise<StoreOrder[]> {
    try {
      const orders = await this.fetchPublic(`${this.baseUrl}/orders/email/${encodeURIComponent(email)}`);
      
      return orders.map((order: any) => ({
        id: Number(order.id),
        cart_id: order.cart_id ? Number(order.cart_id) : undefined,
        order_number: String(order.order_number),
        customer_name: String(order.customer_name),
        customer_email: String(order.customer_email),
        customer_phone: order.customer_phone || undefined,
        total_amount: Number(order.total_amount),
        member_discount_total: Number(order.member_discount_total || 0),
        final_amount: Number(order.final_amount),
        payment_method: order.payment_method as 'online' | 'in_person',
        payment_status: order.payment_status as 'pending' | 'confirmed' | 'failed',
        order_status: order.order_status as 'pending' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled',
        pickup_notes: order.pickup_notes || undefined,
        admin_notes: order.admin_notes || undefined,
        created_at: String(order.created_at),
        updated_at: String(order.updated_at),
        items: order.items ? order.items.map((item: any) => ({
          id: Number(item.id),
          order_id: Number(item.order_id),
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          price_at_time: Number(item.price_at_time),
          member_discount_applied: Number(item.member_discount_applied || 0),
          subtotal: Number(item.subtotal),
          name: String(item.name),
          item_name: String(item.item_name || item.name),
          description: String(item.description || ''),
          image_url: item.image_url || undefined,
          category_name: item.category_name || undefined,
          total_price: Number(item.total_price || item.subtotal),
          created_at: String(item.created_at)
        })) : []
      }));
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      throw error;
    }
  }

  // ==============================================
  // PRODUCT REVIEWS (Public)
  // ==============================================

  async getProductReviews(itemId: number, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {
      const response = await this.fetchPublic(`${this.baseUrl}/items/${itemId}/reviews?page=${page}&limit=${limit}`);
      
      return {
        reviews: response.reviews.map((review: any) => ({
          id: Number(review.id),
          item_id: Number(review.item_id),
          user_id: review.user_id ? Number(review.user_id) : undefined,
          user_name: review.user_name || undefined,
          guest_name: review.guest_name || undefined,
          guest_email: review.guest_email || undefined,
          rating: Number(review.rating),
          review_text: String(review.review_text),
          is_verified_purchase: Boolean(review.is_verified_purchase),
          is_approved: Boolean(review.is_approved),
          created_at: String(review.created_at)
        })),
        pagination: {
          page: Number(response.pagination.page),
          limit: Number(response.pagination.limit),
          total: Number(response.pagination.total),
          pages: Number(response.pagination.pages)
        }
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  // ==============================================
  // PROMOTIONAL CODES (Public)
  // ==============================================

  async validatePromotionalCode(code: string): Promise<PromotionalCode | null> {
    try {
      const promoCode = await this.fetchPublic(`${this.baseUrl}/promotions/validate/${encodeURIComponent(code)}`);
      
      if (!promoCode) return null;
      
      return {
        id: Number(promoCode.id),
        code: String(promoCode.code),
        name: String(promoCode.name),
        description: String(promoCode.description || ''),
        discount_type: promoCode.discount_type as 'percentage' | 'fixed',
        discount_value: Number(promoCode.discount_value),
        discount_amount: Number(promoCode.discount_amount || 0),
        min_order_amount: Number(promoCode.min_order_amount || 0),
        is_member_only: Boolean(promoCode.is_member_only),
        valid_until: String(promoCode.valid_until),
        created_at: String(promoCode.created_at),
        updated_at: String(promoCode.updated_at)
      };
    } catch (error) {
      console.error('Error validating promotional code:', error);
      throw error;
    }
  }
}

export const publicStoreApi = new PublicStoreApiService();

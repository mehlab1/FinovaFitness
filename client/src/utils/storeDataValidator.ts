// ==============================================
// STORE DATA VALIDATOR UTILITY
// ==============================================

import {
  StoreItem,
  StoreCategory,
  CartItem,
  StoreOrder,
  CheckoutData,
  PromotionalCode,
  ProductReview,
  GuestUser,
  StoreCart
} from '../types/store';

// ==============================================
// VALIDATION FUNCTIONS
// ==============================================

export class StoreDataValidator {
  // ==============================================
  // CATEGORY VALIDATION
  // ==============================================

  static validateCategory(category: any): StoreCategory {
    if (!category || typeof category !== 'object') {
      throw new Error('Category must be an object');
    }

    const validated: StoreCategory = {
      id: this.validateNumber(category.id, 'Category ID'),
      name: this.validateString(category.name, 'Category name'),
      description: category.description ? this.validateString(category.description, 'Category description') : undefined,
      is_active: this.validateBoolean(category.is_active, 'Category active status'),
      created_at: this.validateString(category.created_at, 'Category created date'),
      updated_at: this.validateString(category.updated_at, 'Category updated date')
    };

    return validated;
  }

  // ==============================================
  // PRODUCT VALIDATION
  // ==============================================

  static validateProduct(product: any): StoreItem {
    if (!product || typeof product !== 'object') {
      throw new Error('Product must be an object');
    }

    const validated: StoreItem = {
      id: this.validateNumber(product.id, 'Product ID'),
      name: this.validateString(product.name, 'Product name'),
      description: this.validateString(product.description || '', 'Product description'),
      price: this.validateNumber(product.price, 'Product price'),
      member_discount_percentage: this.validateNumber(product.member_discount_percentage || 0, 'Member discount percentage'),
      category_id: this.validateNumber(product.category_id, 'Product category ID'),
      category_name: product.category_name ? this.validateString(product.category_name, 'Category name') : undefined,
      category_description: product.category_description ? this.validateString(product.category_description, 'Category description') : undefined,
      stock_quantity: this.validateNumber(product.stock_quantity, 'Stock quantity'),
      low_stock_threshold: this.validateNumber(product.low_stock_threshold || 5, 'Low stock threshold'),
      is_active: this.validateBoolean(product.is_active, 'Product active status'),
      image_url: product.image_url ? this.validateString(product.image_url, 'Image URL') : undefined,
      created_at: this.validateString(product.created_at, 'Product created date'),
      updated_at: this.validateString(product.updated_at, 'Product updated date')
    };

    // Validate price constraints
    if (validated.price < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (validated.member_discount_percentage < 0 || validated.member_discount_percentage > 100) {
      throw new Error('Member discount percentage must be between 0 and 100');
    }

    if (validated.stock_quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    if (validated.low_stock_threshold < 0) {
      throw new Error('Low stock threshold cannot be negative');
    }

    return validated;
  }

  // ==============================================
  // CART VALIDATION
  // ==============================================

  static validateCart(cart: any): StoreCart {
    if (!cart || typeof cart !== 'object') {
      throw new Error('Cart must be an object');
    }

    const validated: StoreCart = {
      id: this.validateNumber(cart.id, 'Cart ID'),
      user_id: cart.user_id ? this.validateNumber(cart.user_id, 'User ID') : undefined,
      guest_email: cart.guest_email ? this.validateString(cart.guest_email, 'Guest email') : undefined,
      guest_name: cart.guest_name ? this.validateString(cart.guest_name, 'Guest name') : undefined,
      guest_phone: cart.guest_phone ? this.validateString(cart.guest_phone, 'Guest phone') : undefined,
      created_at: this.validateString(cart.created_at, 'Cart created date'),
      updated_at: this.validateString(cart.updated_at, 'Cart updated date')
    };

    return validated;
  }

  static validateCartItem(cartItem: any): CartItem {
    if (!cartItem || typeof cartItem !== 'object') {
      throw new Error('Cart item must be an object');
    }

    const validated: CartItem = {
      id: this.validateNumber(cartItem.id, 'Cart item ID'),
      cart_id: this.validateNumber(cartItem.cart_id, 'Cart ID'),
      item_id: this.validateNumber(cartItem.item_id, 'Item ID'),
      quantity: this.validateNumber(cartItem.quantity, 'Quantity'),
      price_at_time: this.validateNumber(cartItem.price_at_time, 'Price at time'),
      member_discount_applied: this.validateNumber(cartItem.member_discount_applied || 0, 'Member discount applied'),
      name: this.validateString(cartItem.name, 'Item name'),
      description: this.validateString(cartItem.description || '', 'Item description'),
      image_url: cartItem.image_url ? this.validateString(cartItem.image_url, 'Image URL') : undefined,
      category_name: cartItem.category_name ? this.validateString(cartItem.category_name, 'Category name') : undefined,
      stock_quantity: this.validateNumber(cartItem.stock_quantity, 'Stock quantity'),
      created_at: this.validateString(cartItem.created_at, 'Cart item created date')
    };

    // Validate quantity constraints
    if (validated.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (validated.price_at_time < 0) {
      throw new Error('Price at time cannot be negative');
    }

    if (validated.member_discount_applied < 0) {
      throw new Error('Member discount applied cannot be negative');
    }

    return validated;
  }

  // ==============================================
  // ORDER VALIDATION
  // ==============================================

  static validateOrder(order: any): StoreOrder {
    if (!order || typeof order !== 'object') {
      throw new Error('Order must be an object');
    }

    const validated: StoreOrder = {
      id: this.validateNumber(order.id, 'Order ID'),
      cart_id: order.cart_id ? this.validateNumber(order.cart_id, 'Cart ID') : undefined,
      order_number: this.validateString(order.order_number, 'Order number'),
      customer_name: this.validateString(order.customer_name, 'Customer name'),
      customer_email: this.validateString(order.customer_email, 'Customer email'),
      customer_phone: order.customer_phone ? this.validateString(order.customer_phone, 'Customer phone') : undefined,
      total_amount: this.validateNumber(order.total_amount, 'Total amount'),
      member_discount_total: this.validateNumber(order.member_discount_total || 0, 'Member discount total'),
      final_amount: this.validateNumber(order.final_amount, 'Final amount'),
      payment_method: this.validatePaymentMethod(order.payment_method),
      payment_status: this.validatePaymentStatus(order.payment_status),
      order_status: this.validateOrderStatus(order.order_status),
      pickup_notes: order.pickup_notes ? this.validateString(order.pickup_notes, 'Pickup notes') : undefined,
      admin_notes: order.admin_notes ? this.validateString(order.admin_notes, 'Admin notes') : undefined,
      created_at: this.validateString(order.created_at, 'Order created date'),
      updated_at: this.validateString(order.updated_at, 'Order updated date'),
      items: order.items ? order.items.map((item: any) => this.validateOrderItem(item)) : []
    };

    // Validate amount constraints
    if (validated.total_amount < 0) {
      throw new Error('Total amount cannot be negative');
    }

    if (validated.member_discount_total < 0) {
      throw new Error('Member discount total cannot be negative');
    }

    if (validated.final_amount < 0) {
      throw new Error('Final amount cannot be negative');
    }

    if (validated.final_amount > validated.total_amount) {
      throw new Error('Final amount cannot be greater than total amount');
    }

    return validated;
  }

  static validateOrderItem(orderItem: any): any {
    if (!orderItem || typeof orderItem !== 'object') {
      throw new Error('Order item must be an object');
    }

    const validated = {
      id: this.validateNumber(orderItem.id, 'Order item ID'),
      order_id: this.validateNumber(orderItem.order_id, 'Order ID'),
      item_id: this.validateNumber(orderItem.item_id, 'Item ID'),
      quantity: this.validateNumber(orderItem.quantity, 'Quantity'),
      price_at_time: this.validateNumber(orderItem.price_at_time, 'Price at time'),
      member_discount_applied: this.validateNumber(orderItem.member_discount_applied || 0, 'Member discount applied'),
      subtotal: this.validateNumber(orderItem.subtotal, 'Subtotal'),
      name: this.validateString(orderItem.name, 'Item name'),
      item_name: this.validateString(orderItem.item_name || orderItem.name, 'Item name'),
      description: this.validateString(orderItem.description || '', 'Item description'),
      image_url: orderItem.image_url ? this.validateString(orderItem.image_url, 'Image URL') : undefined,
      category_name: orderItem.category_name ? this.validateString(orderItem.category_name, 'Category name') : undefined,
      total_price: this.validateNumber(orderItem.total_price || orderItem.subtotal, 'Total price'),
      created_at: this.validateString(orderItem.created_at, 'Order item created date')
    };

    // Validate quantity and price constraints
    if (validated.quantity <= 0) {
      throw new Error('Order item quantity must be greater than 0');
    }

    if (validated.price_at_time < 0) {
      throw new Error('Order item price at time cannot be negative');
    }

    if (validated.subtotal < 0) {
      throw new Error('Order item subtotal cannot be negative');
    }

    return validated;
  }

  // ==============================================
  // CHECKOUT VALIDATION
  // ==============================================

  static validateCheckoutData(checkoutData: any): CheckoutData {
    if (!checkoutData || typeof checkoutData !== 'object') {
      throw new Error('Checkout data must be an object');
    }

    const validated: CheckoutData = {
      cart_id: this.validateNumber(checkoutData.cart_id, 'Cart ID'),
      customer_name: this.validateString(checkoutData.customer_name, 'Customer name'),
      customer_email: this.validateString(checkoutData.customer_email, 'Customer email'),
      customer_phone: checkoutData.customer_phone ? this.validateString(checkoutData.customer_phone, 'Customer phone') : undefined,
      payment_method: this.validatePaymentMethod(checkoutData.payment_method),
      pickup_notes: checkoutData.pickup_notes ? this.validateString(checkoutData.pickup_notes, 'Pickup notes') : undefined,
      promotional_code: checkoutData.promotional_code ? this.validateString(checkoutData.promotional_code, 'Promotional code') : undefined
    };

    // Validate email format
    if (!this.isValidEmail(validated.customer_email)) {
      throw new Error('Invalid customer email format');
    }

    return validated;
  }

  // ==============================================
  // PROMOTIONAL CODE VALIDATION
  // ==============================================

  static validatePromotionalCode(promoCode: any): PromotionalCode {
    if (!promoCode || typeof promoCode !== 'object') {
      throw new Error('Promotional code must be an object');
    }

    const validated: PromotionalCode = {
      id: this.validateNumber(promoCode.id, 'Promotional code ID'),
      code: this.validateString(promoCode.code, 'Promotional code'),
      name: this.validateString(promoCode.name, 'Promotional code name'),
      description: this.validateString(promoCode.description || '', 'Promotional code description'),
      discount_type: this.validateDiscountType(promoCode.discount_type),
      discount_value: this.validateNumber(promoCode.discount_value, 'Discount value'),
      discount_amount: this.validateNumber(promoCode.discount_amount || 0, 'Discount amount'),
      min_order_amount: this.validateNumber(promoCode.min_order_amount || 0, 'Minimum order amount'),
      is_member_only: this.validateBoolean(promoCode.is_member_only, 'Member only status'),
      valid_until: this.validateString(promoCode.valid_until, 'Valid until date'),
      created_at: this.validateString(promoCode.created_at, 'Promotional code created date'),
      updated_at: this.validateString(promoCode.updated_at, 'Promotional code updated date')
    };

    // Validate discount constraints
    if (validated.discount_value <= 0) {
      throw new Error('Discount value must be greater than 0');
    }

    if (validated.discount_type === 'percentage' && validated.discount_value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    if (validated.min_order_amount < 0) {
      throw new Error('Minimum order amount cannot be negative');
    }

    return validated;
  }

  // ==============================================
  // GUEST USER VALIDATION
  // ==============================================

  static validateGuestUser(guestUser: any): GuestUser {
    if (!guestUser || typeof guestUser !== 'object') {
      throw new Error('Guest user must be an object');
    }

    const validated: GuestUser = {
      guest_name: this.validateString(guestUser.guest_name, 'Guest name'),
      guest_email: this.validateString(guestUser.guest_email, 'Guest email'),
      guest_phone: guestUser.guest_phone ? this.validateString(guestUser.guest_phone, 'Guest phone') : undefined
    };

    // Validate email format
    if (!this.isValidEmail(validated.guest_email)) {
      throw new Error('Invalid guest email format');
    }

    // Validate name length
    if (validated.guest_name.trim().length < 2) {
      throw new Error('Guest name must be at least 2 characters long');
    }

    return validated;
  }

  // ==============================================
  // PRODUCT REVIEW VALIDATION
  // ==============================================

  static validateProductReview(review: any): ProductReview {
    if (!review || typeof review !== 'object') {
      throw new Error('Product review must be an object');
    }

    const validated: ProductReview = {
      id: this.validateNumber(review.id, 'Review ID'),
      item_id: this.validateNumber(review.item_id, 'Item ID'),
      user_id: review.user_id ? this.validateNumber(review.user_id, 'User ID') : undefined,
      user_name: review.user_name ? this.validateString(review.user_name, 'User name') : undefined,
      guest_name: review.guest_name ? this.validateString(review.guest_name, 'Guest name') : undefined,
      guest_email: review.guest_email ? this.validateString(review.guest_email, 'Guest email') : undefined,
      rating: this.validateNumber(review.rating, 'Rating'),
      review_text: this.validateString(review.review_text, 'Review text'),
      is_verified_purchase: this.validateBoolean(review.is_verified_purchase, 'Verified purchase status'),
      is_approved: this.validateBoolean(review.is_approved, 'Approved status'),
      created_at: this.validateString(review.created_at, 'Review created date')
    };

    // Validate rating constraints
    if (validated.rating < 1 || validated.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate review text length
    if (validated.review_text.trim().length < 10) {
      throw new Error('Review text must be at least 10 characters long');
    }

    return validated;
  }

  // ==============================================
  // HELPER VALIDATION FUNCTIONS
  // ==============================================

  private static validateNumber(value: any, fieldName: string): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    return value;
  }

  private static validateString(value: any, fieldName: string): string {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    return value;
  }

  private static validateBoolean(value: any, fieldName: string): boolean {
    if (typeof value !== 'boolean') {
      throw new Error(`${fieldName} must be a boolean`);
    }
    return value;
  }

  private static validatePaymentMethod(value: any): 'online' | 'in_person' {
    if (value !== 'online' && value !== 'in_person') {
      throw new Error('Payment method must be either "online" or "in_person"');
    }
    return value;
  }

  private static validatePaymentStatus(value: any): 'pending' | 'confirmed' | 'failed' {
    if (value !== 'pending' && value !== 'confirmed' && value !== 'failed') {
      throw new Error('Payment status must be "pending", "confirmed", or "failed"');
    }
    return value;
  }

  private static validateOrderStatus(value: any): 'pending' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled' {
    const validStatuses = ['pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!validStatuses.includes(value)) {
      throw new Error(`Order status must be one of: ${validStatuses.join(', ')}`);
    }
    return value;
  }

  private static validateDiscountType(value: any): 'percentage' | 'fixed' {
    if (value !== 'percentage' && value !== 'fixed') {
      throw new Error('Discount type must be either "percentage" or "fixed"');
    }
    return value;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==============================================
  // BATCH VALIDATION FUNCTIONS
  // ==============================================

  static validateCategories(categories: any[]): StoreCategory[] {
    if (!Array.isArray(categories)) {
      throw new Error('Categories must be an array');
    }
    return categories.map((category, index) => {
      try {
        return this.validateCategory(category);
      } catch (error) {
        throw new Error(`Category at index ${index}: ${error instanceof Error ? error.message : 'Invalid category'}`);
      }
    });
  }

  static validateProducts(products: any[]): StoreItem[] {
    if (!Array.isArray(products)) {
      throw new Error('Products must be an array');
    }
    return products.map((product, index) => {
      try {
        return this.validateProduct(product);
      } catch (error) {
        throw new Error(`Product at index ${index}: ${error instanceof Error ? error.message : 'Invalid product'}`);
      }
    });
  }

  static validateCartItems(cartItems: any[]): CartItem[] {
    if (!Array.isArray(cartItems)) {
      throw new Error('Cart items must be an array');
    }
    return cartItems.map((item, index) => {
      try {
        return this.validateCartItem(item);
      } catch (error) {
        throw new Error(`Cart item at index ${index}: ${error instanceof Error ? error.message : 'Invalid cart item'}`);
      }
    });
  }

  static validateOrders(orders: any[]): StoreOrder[] {
    if (!Array.isArray(orders)) {
      throw new Error('Orders must be an array');
    }
    return orders.map((order, index) => {
      try {
        return this.validateOrder(order);
      } catch (error) {
        throw new Error(`Order at index ${index}: ${error instanceof Error ? error.message : 'Invalid order'}`);
      }
    });
  }

  static validateProductReviews(reviews: any[]): ProductReview[] {
    if (!Array.isArray(reviews)) {
      throw new Error('Product reviews must be an array');
    }
    return reviews.map((review, index) => {
      try {
        return this.validateProductReview(review);
      } catch (error) {
        throw new Error(`Review at index ${index}: ${error instanceof Error ? error.message : 'Invalid review'}`);
      }
    });
  }
}

// ==============================================
// EXPORT VALIDATOR INSTANCE
// ==============================================

export const storeDataValidator = new StoreDataValidator();

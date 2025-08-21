// ==============================================
// STORE TYPES & INTERFACES
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
  category_description?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  item_id: number;
  quantity: number;
  price_at_time: number;
  member_discount_applied: number;
  name: string;
  description: string;
  image_url?: string;
  category_name?: string;
  stock_quantity: number;
  created_at: string;
}

export interface StoreCart {
  id: number;
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreOrder {
  id: number;
  cart_id?: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  member_discount_total: number;
  final_amount: number;
  payment_method: 'online' | 'in_person';
  payment_status: 'pending' | 'confirmed' | 'failed';
  order_status: 'pending' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';
  pickup_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  items: StoreOrderItem[];
}

export interface StoreOrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  price_at_time: number;
  member_discount_applied: number;
  subtotal: number;
  name: string;
  item_name: string;
  description: string;
  image_url?: string;
  category_name?: string;
  total_price: number;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  item_id: number;
  name: string;
  price: number;
  image_url?: string;
  rating: number;
  review_count: number;
  category_name?: string;
  added_at: string;
}

export interface ProductReview {
  id: number;
  item_id: number;
  user_id?: number;
  user_name?: string;
  guest_name?: string;
  guest_email?: string;
  rating: number;
  review_text: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface LoyaltyPoints {
  loyalty_points: number;
  points_value: number;
}

export interface PromotionalCode {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  min_order_amount: number;
  is_member_only: boolean;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutData {
  cart_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: 'online' | 'in_person';
  pickup_notes?: string;
  promotional_code?: string;
  loyalty_points_to_use?: number;
}

export interface CheckoutResponse {
  message: string;
  order: {
    id: number;
    order_number: string;
    final_amount: number;
    status: string;
  };
}

// ==============================================
// ADMIN MANAGEMENT TYPES
// ==============================================

export interface StoreAnalytics {
  revenue: {
    total: number;
    period: string;
    growth_percentage: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    canceled: number;
  };
  products: {
    total: number;
    active: number;
    low_stock: number;
    out_of_stock: number;
  };
  top_products: Array<{
    id: number;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  low_stock_items: StoreItem[];
  salesByPeriod: Array<{
    period: string;
    sales: number;
    orders: number;
  }>;
  categoryPerformance: Array<{
    category_id: number;
    category_name: string;
    sales: number;
    orders: number;
  }>;
}

export interface InventoryOverview {
  id: number;
  name: string;
  category_name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
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
  is_active: boolean;
  is_member_only: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

// ==============================================
// COMPONENT PROPS INTERFACES
// ==============================================

export interface StoreComponentProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface ProductCardProps {
  product: StoreItem;
  onAddToCart: (product: StoreItem) => void;
  onAddToWishlist: (productId: number) => void;
  onViewDetails: (product: StoreItem) => void;
  isInWishlist: boolean;
}

export interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

export interface CheckoutStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: any;
}

// ==============================================
// STATE INTERFACES
// ==============================================

export interface StoreState {
  products: StoreItem[];
  categories: StoreCategory[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: StoreOrder[];
  loyaltyPoints: LoyaltyPoints | null;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  memberDiscount: number;
  loyaltyPointsDiscount: number;
  promotionalDiscount: number;
  finalTotal: number;
}

export interface FilterState {
  searchTerm: string;
  selectedCategory: number | null;
  sortBy: 'name' | 'price' | 'price_desc' | 'newest';
  priceRange: [number, number];
}

// ==============================================
// API RESPONSE INTERFACES
// ==============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ReviewsResponse {
  reviews: ProductReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==============================================
// INVENTORY TRANSACTION TYPES
// ==============================================

export interface InventoryTransaction {
  id: number;
  item_id: number;
  transaction_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_by?: number;
  created_at: string;
}

// ==============================================
// GUEST USER TYPES
// ==============================================

export interface GuestUser {
  guest_email: string;
  guest_name: string;
  guest_phone?: string;
}

// ==============================================
// STOCK UPDATE TYPES
// ==============================================

export interface StockUpdateData {
  stock_quantity: number;
  notes?: string;
  transaction_type?: 'adjustment' | 'purchase' | 'return';
}

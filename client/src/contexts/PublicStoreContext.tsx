// ==============================================
// PUBLIC STORE CONTEXT FOR NON-MEMBERS
// ==============================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { publicStoreApi } from '../services/api/publicStoreApi';
import {
  StoreItem,
  StoreCategory,
  CartItem,
  StoreOrder,
  CheckoutData,
  CheckoutResponse,
  ProductReview,
  PromotionalCode,
  ReviewsResponse,
  GuestUser,
  StoreCart
} from '../types/store';

// ==============================================
// STATE INTERFACES
// ==============================================

interface PublicStoreState {
  // Products & Categories
  products: StoreItem[];
  categories: StoreCategory[];
  selectedCategory: number | null;
  searchQuery: string;
  sortBy: 'name' | 'price' | 'newest';
  sortOrder: 'asc' | 'desc';
  
  // Cart Management
  cartId: number | null;
  cartItems: CartItem[];
  isCartLoading: boolean;
  
  // Checkout Process
  checkoutData: CheckoutData | null;
  currentOrder: StoreOrder | null;
  orderComplete: boolean;
  
  // Product Details
  selectedProduct: StoreItem | null;
  productReviews: ProductReview[];
  reviewsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Promotional Codes
  appliedPromoCode: PromotionalCode | null;
  
  // Loading States
  isLoading: boolean;
  isProductsLoading: boolean;
  isCategoriesLoading: boolean;
  isCheckoutLoading: boolean;
  
  // Error States
  error: string | null;
  productsError: string | null;
  categoriesError: string | null;
  cartError: string | null;
  checkoutError: string | null;
}

// ==============================================
// ACTION TYPES
// ==============================================

type PublicStoreAction =
  // Products & Categories
  | { type: 'SET_PRODUCTS'; payload: StoreItem[] }
  | { type: 'SET_CATEGORIES'; payload: StoreCategory[] }
  | { type: 'SET_SELECTED_CATEGORY'; payload: number | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: 'name' | 'price' | 'newest' }
  | { type: 'SET_SORT_ORDER'; payload: 'asc' | 'desc' }
  
  // Cart Management
  | { type: 'SET_CART_ID'; payload: number | null }
  | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem[] }
  | { type: 'UPDATE_CART_ITEM'; payload: { itemId: number; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'CLEAR_CART' }
  
  // Checkout Process
  | { type: 'SET_CHECKOUT_DATA'; payload: CheckoutData | null }
  | { type: 'SET_CURRENT_ORDER'; payload: StoreOrder | null }
  | { type: 'SET_ORDER_COMPLETE'; payload: boolean }
  
  // Product Details
  | { type: 'SET_SELECTED_PRODUCT'; payload: StoreItem | null }
  | { type: 'SET_PRODUCT_REVIEWS'; payload: ReviewsResponse }
  
  // Promotional Codes
  | { type: 'SET_APPLIED_PROMO_CODE'; payload: PromotionalCode | null }
  
  // Loading States
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCTS_LOADING'; payload: boolean }
  | { type: 'SET_CATEGORIES_LOADING'; payload: boolean }
  | { type: 'SET_CART_LOADING'; payload: boolean }
  | { type: 'SET_CHECKOUT_LOADING'; payload: boolean }
  
  // Error States
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES_ERROR'; payload: string | null }
  | { type: 'SET_CART_ERROR'; payload: string | null }
  | { type: 'SET_CHECKOUT_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERRORS' };

// ==============================================
// INITIAL STATE
// ==============================================

const initialState: PublicStoreState = {
  // Products & Categories
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  
  // Cart Management
  cartId: null,
  cartItems: [],
  isCartLoading: false,
  
  // Checkout Process
  checkoutData: null,
  currentOrder: null,
  orderComplete: false,
  
  // Product Details
  selectedProduct: null,
  productReviews: [],
  reviewsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  
  // Promotional Codes
  appliedPromoCode: null,
  
  // Loading States
  isLoading: false,
  isProductsLoading: false,
  isCategoriesLoading: false,
  isCheckoutLoading: false,
  
  // Error States
  error: null,
  productsError: null,
  categoriesError: null,
  cartError: null,
  checkoutError: null
};

// ==============================================
// REDUCER
// ==============================================

function publicStoreReducer(state: PublicStoreState, action: PublicStoreAction): PublicStoreState {
  switch (action.type) {
    // Products & Categories
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, productsError: null };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, categoriesError: null };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    
    // Cart Management
    case 'SET_CART_ID':
      return { ...state, cartId: action.payload };
    case 'SET_CART_ITEMS':
      return { ...state, cartItems: action.payload, cartError: null };
    case 'ADD_TO_CART':
      return { ...state, cartItems: action.payload, cartError: null };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.item_id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        cartError: null
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.item_id !== action.payload),
        cartError: null
      };
    case 'CLEAR_CART':
      return { ...state, cartItems: [], cartId: null };
    
    // Checkout Process
    case 'SET_CHECKOUT_DATA':
      return { ...state, checkoutData: action.payload };
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload };
    case 'SET_ORDER_COMPLETE':
      return { ...state, orderComplete: action.payload };
    
    // Product Details
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    case 'SET_PRODUCT_REVIEWS':
      return {
        ...state,
        productReviews: action.payload.reviews,
        reviewsPagination: action.payload.pagination
      };
    
    // Promotional Codes
    case 'SET_APPLIED_PROMO_CODE':
      return { ...state, appliedPromoCode: action.payload };
    
    // Loading States
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PRODUCTS_LOADING':
      return { ...state, isProductsLoading: action.payload };
    case 'SET_CATEGORIES_LOADING':
      return { ...state, isCategoriesLoading: action.payload };
    case 'SET_CART_LOADING':
      return { ...state, isCartLoading: action.payload };
    case 'SET_CHECKOUT_LOADING':
      return { ...state, isCheckoutLoading: action.payload };
    
    // Error States
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PRODUCTS_ERROR':
      return { ...state, productsError: action.payload };
    case 'SET_CATEGORIES_ERROR':
      return { ...state, categoriesError: action.payload };
    case 'SET_CART_ERROR':
      return { ...state, cartError: action.payload };
    case 'SET_CHECKOUT_ERROR':
      return { ...state, checkoutError: action.payload };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
        productsError: null,
        categoriesError: null,
        cartError: null,
        checkoutError: null
      };
    
    default:
      return state;
  }
}

// ==============================================
// CONTEXT
// ==============================================

interface PublicStoreContextType {
  state: PublicStoreState;
  dispatch: React.Dispatch<PublicStoreAction>;
  
  // Data Loading
  loadCategories: () => Promise<void>;
  loadProducts: (params?: {
    category_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  
  // Cart Operations
  createGuestCart: (guestData: GuestUser) => Promise<StoreCart>;
  addToCart: (itemId: number, quantity: number) => Promise<void>;
  loadCart: () => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  
  // Checkout Operations
  processCheckout: (checkoutData: CheckoutData) => Promise<CheckoutResponse>;
  loadOrder: (orderNumber: string) => Promise<void>;
  loadOrdersByEmail: (email: string) => Promise<StoreOrder[]>;
  
  // Product Details
  loadProductReviews: (itemId: number, page?: number) => Promise<void>;
  
  // Promotional Codes
  validatePromoCode: (code: string) => Promise<PromotionalCode | null>;
  clearPromoCode: () => void;
  
  // Filter Operations
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setSortBy: (sortBy: 'name' | 'price' | 'newest') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  
  // Utility Functions
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getFilteredProducts: () => StoreItem[];
}

const PublicStoreContext = createContext<PublicStoreContextType | undefined>(undefined);

// ==============================================
// PROVIDER COMPONENT
// ==============================================

interface PublicStoreProviderProps {
  children: ReactNode;
}

export function PublicStoreProvider({ children }: PublicStoreProviderProps) {
  const [state, dispatch] = useReducer(publicStoreReducer, initialState);

  // ==============================================
  // LOAD CART ID FROM LOCAL STORAGE
  // ==============================================

  useEffect(() => {
    const savedCartId = localStorage.getItem('publicStoreCartId');
    if (savedCartId) {
      const cartId = parseInt(savedCartId, 10);
      if (!isNaN(cartId)) {
        dispatch({ type: 'SET_CART_ID', payload: cartId });
        // Load cart items if cart ID exists
        loadCart();
      }
    }
  }, []);

  // ==============================================
  // DATA LOADING FUNCTIONS
  // ==============================================

  const loadCategories = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CATEGORIES_LOADING', payload: true });
      dispatch({ type: 'SET_CATEGORIES_ERROR', payload: null });
      
      const categories = await publicStoreApi.getAllCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      dispatch({ type: 'SET_CATEGORIES_ERROR', payload: errorMessage });
      console.error('Error loading categories:', error);
    } finally {
      dispatch({ type: 'SET_CATEGORIES_LOADING', payload: false });
    }
  }, [dispatch]);

  const loadProducts = useCallback(async (params?: {
    category_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      dispatch({ type: 'SET_PRODUCTS_LOADING', payload: true });
      dispatch({ type: 'SET_PRODUCTS_ERROR', payload: null });
      
      const products = await publicStoreApi.getAllItems(params);
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      dispatch({ type: 'SET_PRODUCTS_ERROR', payload: errorMessage });
      console.error('Error loading products:', error);
    } finally {
      dispatch({ type: 'SET_PRODUCTS_LOADING', payload: false });
    }
  }, [dispatch]);

  // ==============================================
  // CART OPERATIONS
  // ==============================================

  const createGuestCart = async (guestData: GuestUser): Promise<StoreCart> => {
    try {
      dispatch({ type: 'SET_CART_LOADING', payload: true });
      dispatch({ type: 'SET_CART_ERROR', payload: null });
      
      const cart = await publicStoreApi.createGuestCart(guestData);
      
      // Save cart ID to localStorage
      localStorage.setItem('publicStoreCartId', cart.id.toString());
      dispatch({ type: 'SET_CART_ID', payload: cart.id });
      
      return cart;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create cart';
      dispatch({ type: 'SET_CART_ERROR', payload: errorMessage });
      console.error('Error creating guest cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_CART_LOADING', payload: false });
    }
  };

  const addToCart = async (itemId: number, quantity: number) => {
    if (!state.cartId) {
      throw new Error('No cart available. Please provide guest information first.');
    }

    try {
      dispatch({ type: 'SET_CART_LOADING', payload: true });
      dispatch({ type: 'SET_CART_ERROR', payload: null });
      
      const cartItems = await publicStoreApi.addToCart(state.cartId, itemId, quantity);
      dispatch({ type: 'ADD_TO_CART', payload: cartItems });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      dispatch({ type: 'SET_CART_ERROR', payload: errorMessage });
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_CART_LOADING', payload: false });
    }
  };

  const loadCart = async () => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_CART_LOADING', payload: true });
      dispatch({ type: 'SET_CART_ERROR', payload: null });
      
      const cartItems = await publicStoreApi.getCart(state.cartId);
      dispatch({ type: 'SET_CART_ITEMS', payload: cartItems });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load cart';
      dispatch({ type: 'SET_CART_ERROR', payload: errorMessage });
      console.error('Error loading cart:', error);
      
      // If cart doesn't exist, clear cart ID
      if (error instanceof Error && error.message.includes('404')) {
        localStorage.removeItem('publicStoreCartId');
        dispatch({ type: 'SET_CART_ID', payload: null });
        dispatch({ type: 'SET_CART_ITEMS', payload: [] });
      }
    } finally {
      dispatch({ type: 'SET_CART_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_CART_LOADING', payload: true });
      dispatch({ type: 'SET_CART_ERROR', payload: null });
      
      await publicStoreApi.updateCartItem(state.cartId, itemId, quantity);
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { itemId, quantity } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart item';
      dispatch({ type: 'SET_CART_ERROR', payload: errorMessage });
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_CART_LOADING', payload: false });
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_CART_LOADING', payload: true });
      dispatch({ type: 'SET_CART_ERROR', payload: null });
      
      await publicStoreApi.removeFromCart(state.cartId, itemId);
      dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      dispatch({ type: 'SET_CART_ERROR', payload: errorMessage });
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_CART_LOADING', payload: false });
    }
  };

  const clearCart = () => {
    localStorage.removeItem('publicStoreCartId');
    dispatch({ type: 'CLEAR_CART' });
  };

  // ==============================================
  // CHECKOUT OPERATIONS
  // ==============================================

  const processCheckout = async (checkoutData: CheckoutData): Promise<CheckoutResponse> => {
    try {
      dispatch({ type: 'SET_CHECKOUT_LOADING', payload: true });
      dispatch({ type: 'SET_CHECKOUT_ERROR', payload: null });
      
      const response = await publicStoreApi.processCheckout(checkoutData);
      
      // Clear cart after successful checkout
      clearCart();
      dispatch({ type: 'SET_ORDER_COMPLETE', payload: true });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process checkout';
      dispatch({ type: 'SET_CHECKOUT_ERROR', payload: errorMessage });
      console.error('Error processing checkout:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_CHECKOUT_LOADING', payload: false });
    }
  };

  const loadOrder = async (orderNumber: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const order = await publicStoreApi.getOrderByNumber(orderNumber);
      dispatch({ type: 'SET_CURRENT_ORDER', payload: order });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load order';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading order:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadOrdersByEmail = async (email: string): Promise<StoreOrder[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const orders = await publicStoreApi.getOrdersByEmail(email);
      return orders;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load orders';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading orders:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ==============================================
  // PRODUCT DETAILS
  // ==============================================

  const loadProductReviews = async (itemId: number, page: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const reviewsResponse = await publicStoreApi.getProductReviews(itemId, page);
      dispatch({ type: 'SET_PRODUCT_REVIEWS', payload: reviewsResponse });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load product reviews';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading product reviews:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ==============================================
  // PROMOTIONAL CODES
  // ==============================================

  const validatePromoCode = async (code: string): Promise<PromotionalCode | null> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const promoCode = await publicStoreApi.validatePromotionalCode(code);
      if (promoCode) {
        dispatch({ type: 'SET_APPLIED_PROMO_CODE', payload: promoCode });
      }
      return promoCode;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate promotional code';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error validating promotional code:', error);
      throw error;
    }
  };

  const clearPromoCode = () => {
    dispatch({ type: 'SET_APPLIED_PROMO_CODE', payload: null });
  };

  // ==============================================
  // UTILITY FUNCTIONS
  // ==============================================

  const getCartTotal = useCallback((): number => {
    return state.cartItems.reduce((total, item) => {
      const itemTotal = (item.price_at_time - item.member_discount_applied) * item.quantity;
      return total + itemTotal;
    }, 0);
  }, [state.cartItems]);

  const getCartItemCount = useCallback((): number => {
    return state.cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [state.cartItems]);

  const getFilteredProducts = useCallback((): StoreItem[] => {
    let filtered = [...state.products];

    // Filter by category
    if (state.selectedCategory) {
      filtered = filtered.filter(product => product.category_id === state.selectedCategory);
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.category_name && product.category_name.toLowerCase().includes(query))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
      }
      
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [state.products, state.selectedCategory, state.searchQuery, state.sortBy, state.sortOrder]);

  // ==============================================
  // FILTER OPERATIONS (Memoized)
  // ==============================================

  const setSearchQuery = useCallback((query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }), [dispatch]);
  const setSelectedCategory = useCallback((categoryId: number | null) => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: categoryId }), [dispatch]);
  const setSortBy = useCallback((sortBy: 'name' | 'price' | 'newest') => dispatch({ type: 'SET_SORT_BY', payload: sortBy }), [dispatch]);
  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => dispatch({ type: 'SET_SORT_ORDER', payload: sortOrder }), [dispatch]);

  // ==============================================
  // CONTEXT VALUE
  // ==============================================

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    
    // Data Loading
    loadCategories,
    loadProducts,
    
    // Cart Operations
    createGuestCart,
    addToCart,
    loadCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Checkout Operations
    processCheckout,
    loadOrder,
    loadOrdersByEmail,
    
    // Product Details
    loadProductReviews,
    
    // Promotional Codes
    validatePromoCode,
    clearPromoCode,
    
    // Filter Operations
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setSortOrder,
    
    // Utility Functions
    getCartTotal,
    getCartItemCount,
    getFilteredProducts
  }), [
    state,
    loadCategories,
    loadProducts,
    createGuestCart,
    addToCart,
    loadCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    processCheckout,
    loadOrder,
    loadOrdersByEmail,
    loadProductReviews,
    validatePromoCode,
    clearPromoCode,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setSortOrder,
    getCartTotal,
    getCartItemCount,
    getFilteredProducts
  ]);

  return (
    <PublicStoreContext.Provider value={contextValue}>
      {children}
    </PublicStoreContext.Provider>
  );
}

// ==============================================
// HOOK
// ==============================================

export function usePublicStore() {
  const context = useContext(PublicStoreContext);
  if (context === undefined) {
    throw new Error('usePublicStore must be used within a PublicStoreProvider');
  }
  return context;
}

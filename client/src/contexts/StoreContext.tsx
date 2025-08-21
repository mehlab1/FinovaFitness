// ==============================================
// STORE CONTEXT FOR STATE MANAGEMENT
// ==============================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { storeApi } from '../services/api/storeApi';
import {
  StoreState,
  StoreItem,
  StoreCategory,
  CartItem,
  WishlistItem,
  StoreOrder,
  LoyaltyPoints,
  FilterState
} from '../types/store';

// ==============================================
// INITIAL STATE
// ==============================================

const initialState: StoreState = {
  products: [],
  categories: [],
  cart: [],
  wishlist: [],
  orders: [],
  loyaltyPoints: null,
  loading: false,
  error: null,
};

const initialFilterState: FilterState = {
  searchTerm: '',
  selectedCategory: null,
  sortBy: 'name',
  priceRange: [0, 1000],
};

// ==============================================
// ACTION TYPES
// ==============================================

type StoreAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: StoreItem[] }
  | { type: 'SET_CATEGORIES'; payload: StoreCategory[] }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { itemId: number; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: number }
  | { type: 'SET_ORDERS'; payload: StoreOrder[] }
  | { type: 'SET_LOYALTY_POINTS'; payload: LoyaltyPoints }
  | { type: 'CLEAR_CART' }
  | { type: 'RESET_STORE' };

// ==============================================
// REDUCER
// ==============================================

const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_CART':
      return { ...state, cart: action.payload };
    
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.item_id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.item_id !== action.payload),
      };
    
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    
    case 'ADD_TO_WISHLIST':
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.item_id !== action.payload),
      };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'SET_LOYALTY_POINTS':
      return { ...state, loyaltyPoints: action.payload };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'RESET_STORE':
      return initialState;
    
    default:
      return state;
  }
};

// ==============================================
// CONTEXT INTERFACE
// ==============================================

interface StoreContextType {
  state: StoreState;
  filters: FilterState;
  dispatch: React.Dispatch<StoreAction>;
  setFilters: (filters: Partial<FilterState>) => void;
  
  // Actions
  fetchProducts: (filters?: Partial<FilterState>, forceRefresh?: boolean) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCart: (cartId: number) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchLoyaltyPoints: () => Promise<void>;
  
  addToCart: (cartId: number, product: StoreItem, quantity: number) => Promise<void>;
  updateCartItem: (cartId: number, itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartId: number, itemId: number) => Promise<void>;
  
  addToWishlist: (itemId: number) => Promise<void>;
  removeFromWishlist: (itemId: number) => Promise<void>;
  
  clearCart: () => void;
  resetStore: () => void;
  
  // Computed values
  cartTotal: number;
  cartItemCount: number;
  isInWishlist: (itemId: number) => boolean;
  getFilteredProducts: () => StoreItem[];
}

// ==============================================
// CONTEXT CREATION
// ==============================================

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ==============================================
// PROVIDER COMPONENT
// ==============================================

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [filters, setFiltersState] = React.useState<FilterState>(initialFilterState);

  // ==============================================
  // FILTER MANAGEMENT
  // ==============================================

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // ==============================================
  // API ACTIONS
  // ==============================================

  const fetchProducts = useCallback(async (filterOverrides?: Partial<FilterState>, forceRefresh: boolean = false) => {
    // Prevent redundant API calls if products are already loaded and no force refresh
    if (!forceRefresh && state.products.length > 0 && !state.loading) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const currentFilters = { ...filters, ...filterOverrides };
      const products = await storeApi.getAllItems({
        category_id: currentFilters.selectedCategory || undefined,
        search: currentFilters.searchTerm || undefined,
        is_active: true,
      });
      
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch products' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [filters, state.products.length, state.loading]);

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await storeApi.getAllCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchCart = useCallback(async (cartId: number) => {
    try {
      const cart = await storeApi.getCart(cartId);
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const wishlist = await storeApi.getWishlist();
      dispatch({ type: 'SET_WISHLIST', payload: wishlist });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const orders = await storeApi.getMemberOrderHistory();
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, []);

  const fetchLoyaltyPoints = useCallback(async () => {
    try {
      const loyaltyPoints = await storeApi.getLoyaltyPointsBalance();
      dispatch({ type: 'SET_LOYALTY_POINTS', payload: loyaltyPoints });
    } catch (error) {
      console.error('Failed to fetch loyalty points:', error);
    }
  }, []);

  // ==============================================
  // CART ACTIONS
  // ==============================================

  const addToCart = useCallback(async (cartId: number, product: StoreItem, quantity: number) => {
    try {
      await storeApi.addToCart(cartId, product.id, quantity);
      await fetchCart(cartId);
    } catch (error) {
      throw error;
    }
  }, [fetchCart]);

  const updateCartItem = useCallback(async (cartId: number, itemId: number, quantity: number) => {
    try {
      await storeApi.updateCartItem(cartId, itemId, quantity);
      await fetchCart(cartId);
    } catch (error) {
      throw error;
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (cartId: number, itemId: number) => {
    try {
      await storeApi.updateCartItem(cartId, itemId, 0); // Set quantity to 0 to remove
      await fetchCart(cartId);
    } catch (error) {
      throw error;
    }
  }, [fetchCart]);

  // ==============================================
  // WISHLIST ACTIONS
  // ==============================================

  const addToWishlist = useCallback(async (itemId: number) => {
    try {
      const wishlistItem = await storeApi.addToWishlist(itemId);
      dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
    } catch (error) {
      throw error;
    }
  }, []);

  const removeFromWishlist = useCallback(async (itemId: number) => {
    try {
      await storeApi.removeFromWishlist(itemId);
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
    } catch (error) {
      throw error;
    }
  }, []);

  // ==============================================
  // UTILITY ACTIONS
  // ==============================================

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const resetStore = () => {
    dispatch({ type: 'RESET_STORE' });
    setFiltersState(initialFilterState);
  };

  // ==============================================
  // COMPUTED VALUES
  // ==============================================

  const cartTotal = state.cart.reduce((total, item) => {
    const itemTotal = (item.price_at_time - item.member_discount_applied) * item.quantity;
    return total + itemTotal;
  }, 0);

  const cartItemCount = state.cart.reduce((count, item) => count + item.quantity, 0);

  const isInWishlist = (itemId: number): boolean => {
    return state.wishlist.some(item => item.item_id === itemId);
  };

  const getFilteredProducts = (): StoreItem[] => {
    let filtered = [...state.products];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.selectedCategory) {
      filtered = filtered.filter(product => product.category_id === filters.selectedCategory);
    }

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  };

  // ==============================================
  // CONTEXT VALUE
  // ==============================================

  const contextValue: StoreContextType = {
    state,
    filters,
    dispatch,
    setFilters,
    
    // Actions
    fetchProducts,
    fetchCategories,
    fetchCart,
    fetchWishlist,
    fetchOrders,
    fetchLoyaltyPoints,
    
    addToCart,
    updateCartItem,
    removeFromCart,
    
    addToWishlist,
    removeFromWishlist,
    
    clearCart,
    resetStore,
    
    // Computed values
    cartTotal,
    cartItemCount,
    isInWishlist,
    getFilteredProducts,
  };

  // ==============================================
  // INITIAL DATA LOADING
  // ==============================================

  useEffect(() => {
    // Only fetch initial data once
    const initializeStore = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchWishlist(),
          fetchOrders(),
          fetchLoyaltyPoints(),
        ]);
      } catch (error) {
        console.error('Failed to initialize store data:', error);
      }
    };

    initializeStore();
  }, [fetchCategories, fetchWishlist, fetchOrders, fetchLoyaltyPoints]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// ==============================================
// HOOK FOR USING STORE CONTEXT
// ==============================================

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

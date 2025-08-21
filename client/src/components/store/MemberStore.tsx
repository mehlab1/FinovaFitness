// ==============================================
// MAIN MEMBER STORE COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { StoreProvider } from '../../contexts/StoreContext';
import { StoreComponentProps } from '../../types/store';
import { ProductCatalog } from './ProductCatalog';
import { ShoppingCart } from './ShoppingCart';
import { OrderHistory } from './OrderHistory';
import { Wishlist } from './Wishlist';
import { Checkout } from './Checkout';

type StoreTab = 'catalog' | 'cart' | 'wishlist' | 'orders' | 'checkout';

export const MemberStore: React.FC<StoreComponentProps> = ({ showToast }) => {
  const [currentTab, setCurrentTab] = useState<StoreTab>('catalog');
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartInitializing, setCartInitializing] = useState(true);

  // ==============================================
  // CART INITIALIZATION
  // ==============================================

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const { storeApi } = await import('../../services/api/storeApi');
        const cart = await storeApi.createOrGetCart();
        setCartId(cart.id);
      } catch (error) {
        console.error('Failed to initialize cart:', error);
        showToast('Failed to initialize shopping cart', 'error');
      } finally {
        setCartInitializing(false);
      }
    };

    initializeCart();
  }, [showToast]);

  // ==============================================
  // TAB NAVIGATION
  // ==============================================

  const handleTabChange = (tab: StoreTab) => {
    setCurrentTab(tab);
  };

  const handleCheckout = () => {
    if (!cartId) {
      showToast('Please wait for cart to initialize', 'error');
      return;
    }
    setCurrentTab('checkout');
  };

  const handleBackToCatalog = () => {
    setCurrentTab('catalog');
  };

  // ==============================================
  // RENDER CURRENT TAB
  // ==============================================

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'catalog':
        return (
          <ProductCatalog
            showToast={showToast}
            onCheckout={handleCheckout}
            cartId={cartId}
          />
        );
      
      case 'cart':
        return (
          <ShoppingCart
            showToast={showToast}
            onCheckout={handleCheckout}
            onBackToCatalog={handleBackToCatalog}
            cartId={cartId}
          />
        );
      
      case 'wishlist':
        return (
          <Wishlist
            showToast={showToast}
            onBackToCatalog={handleBackToCatalog}
          />
        );
      
      case 'orders':
        return (
          <OrderHistory
            showToast={showToast}
            onBackToCatalog={handleBackToCatalog}
          />
        );
      
      case 'checkout':
        return (
          <Checkout
            showToast={showToast}
            onBackToCart={() => setCurrentTab('cart')}
            onOrderComplete={() => {
              setCurrentTab('orders');
              showToast('Order placed successfully!', 'success');
            }}
            cartId={cartId}
          />
        );
      
      default:
        return (
          <ProductCatalog
            showToast={showToast}
            onCheckout={handleCheckout}
            cartId={cartId}
          />
        );
    }
  };

  // ==============================================
  // NAVIGATION TABS
  // ==============================================

  const tabs = [
    { id: 'catalog', label: 'Products', icon: 'fas fa-shopping-bag' },
    { id: 'cart', label: 'Cart', icon: 'fas fa-shopping-cart' },
    { id: 'wishlist', label: 'Wishlist', icon: 'fas fa-heart' },
    { id: 'orders', label: 'Orders', icon: 'fas fa-box' },
  ];

  if (cartInitializing) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing your shopping cart...</p>
        </div>
      </div>
    );
  }

  return (
    <StoreProvider>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
            MEMBER STORE
          </h1>
          <p className="text-gray-300">Discover premium fitness products with exclusive member discounts</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as StoreTab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  currentTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                    : 'glass-card text-gray-300 hover:text-white hover:bg-green-500/10 border border-green-400/20 hover:border-green-400/40'
                }`}
              >
                <i className={`${tab.icon} text-lg`}></i>
                <span>{tab.label}</span>
                {currentTab === tab.id && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[600px]">
          {renderCurrentTab()}
        </div>

        {/* Store Features Banner */}
        {currentTab === 'catalog' && (
          <div className="mt-12">
            <div className="glass-card p-8 rounded-2xl border border-green-400/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-percentage text-2xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-bold text-green-400 mb-2">Member Discounts</h3>
                  <p className="text-gray-300 text-sm">
                    Exclusive discounts on all products for members
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-star text-2xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-bold text-blue-400 mb-2">Loyalty Points</h3>
                  <p className="text-gray-300 text-sm">
                    Earn points on every purchase and redeem for rewards
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-shipping-fast text-2xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-bold text-purple-400 mb-2">Fast Pickup</h3>
                  <p className="text-gray-300 text-sm">
                    Order online and pick up at the gym within hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreProvider>
  );
};

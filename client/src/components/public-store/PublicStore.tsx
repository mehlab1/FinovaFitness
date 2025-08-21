// ==============================================
// MAIN PUBLIC STORE COMPONENT
// ==============================================

import React, { useState } from 'react';
import { PublicStoreProvider, usePublicStore } from '../../contexts/PublicStoreContext';
import { PublicProductCatalog } from './PublicProductCatalog';
import { PublicShoppingCart } from './PublicShoppingCart';
import { PublicCheckout } from './PublicCheckout';
import { PublicProductDetailsModal } from './PublicProductDetailsModal';

type PublicStoreTab = 'catalog' | 'cart' | 'checkout' | 'order-complete';

interface PublicStoreProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PublicStoreContent: React.FC<PublicStoreProps> = ({ showToast }) => {
  const [currentTab, setCurrentTab] = useState<PublicStoreTab>('catalog');
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('');
  const { cartItemCount } = usePublicStore();

  // ==============================================
  // HANDLERS
  // ==============================================

  const handleTabChange = (tab: PublicStoreTab) => {
    setCurrentTab(tab);
  };

  const handleProceedToCheckout = () => {
    setCurrentTab('checkout');
  };

  const handleBackToCart = () => {
    setCurrentTab('cart');
  };

  const handleOrderComplete = (orderNumber: string) => {
    setCompletedOrderNumber(orderNumber);
    setCurrentTab('order-complete');
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
          <PublicProductCatalog
            showToast={showToast}
          />
        );
      
      case 'cart':
        return (
          <PublicShoppingCart
            showToast={showToast}
            onProceedToCheckout={handleProceedToCheckout}
          />
        );
      
      case 'checkout':
        return (
          <PublicCheckout
            showToast={showToast}
            onOrderComplete={handleOrderComplete}
            onBackToCart={handleBackToCart}
          />
        );
      
      case 'order-complete':
        return <OrderComplete orderNumber={completedOrderNumber} onBackToCatalog={handleBackToCatalog} />;
      
      default:
        return (
          <PublicProductCatalog
            showToast={showToast}
          />
        );
    }
  };

  // ==============================================
  // NAVIGATION TABS
  // ==============================================

  const tabs = [
    { id: 'catalog', label: 'Products', icon: 'fas fa-shopping-bag' },
    { id: 'cart', label: 'Cart', icon: 'fas fa-shopping-cart', badge: cartItemCount },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          FITNESS STORE
        </h1>
        <p className="text-gray-300">Premium fitness products and equipment - Guest checkout available</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as PublicStoreTab)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'glass-card text-gray-300 hover:text-white hover:bg-blue-500/10 border border-blue-400/20 hover:border-blue-400/40'
              }`}
            >
              <i className={`${tab.icon} text-lg`}></i>
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
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
          <div className="glass-card p-8 rounded-2xl border border-blue-400/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-plus text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">Guest Checkout</h3>
                <p className="text-gray-300 text-sm">
                  No account required - shop as a guest
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-truck text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Free Pickup</h3>
                <p className="text-gray-300 text-sm">
                  Collect your order at our gym location
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">Secure Payment</h3>
                <p className="text-gray-300 text-sm">
                  Safe and encrypted payment processing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================
// ORDER COMPLETE COMPONENT
// ==============================================

interface OrderCompleteProps {
  orderNumber: string;
  onBackToCatalog: () => void;
}

const OrderComplete: React.FC<OrderCompleteProps> = ({ orderNumber, onBackToCatalog }) => {
  return (
    <div className="animate-fade-in text-center">
      <div className="glass-card p-12 rounded-2xl border border-green-400/30 max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-4xl text-white"></i>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-300 mb-6">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {/* Order Number */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-400 mb-2">Order Number</p>
          <p className="text-xl font-bold text-green-400 font-mono">{orderNumber}</p>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-envelope text-blue-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Email Confirmation</h4>
              <p className="text-xs text-gray-300">You'll receive an order confirmation email shortly</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-clock text-green-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Processing</h4>
              <p className="text-xs text-gray-300">Your order will be ready for pickup within hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-map-marker-alt text-purple-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Pickup</h4>
              <p className="text-xs text-gray-300">Collect your order at Finova Fitness Gym</p>
            </div>
          </div>
        </div>

        {/* Pickup Information */}
        <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">Pickup Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-gray-400 mb-1">Location</p>
              <p className="text-white">Finova Fitness Gym<br />123 Fitness Street, Islamabad</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Hours</p>
              <p className="text-white">Monday - Sunday<br />6:00 AM - 10:00 PM</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBackToCatalog}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 hover-glow"
          >
            Continue Shopping
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            <i className="fas fa-print mr-2"></i>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// MAIN COMPONENT WITH PROVIDER
// ==============================================

export const PublicStore: React.FC<PublicStoreProps> = ({ showToast }) => {
  return (
    <PublicStoreProvider>
      <PublicStoreContent showToast={showToast} />
      <PublicProductDetailsModal showToast={showToast} />
    </PublicStoreProvider>
  );
};

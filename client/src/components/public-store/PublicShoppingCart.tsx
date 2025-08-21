// ==============================================
// PUBLIC SHOPPING CART COMPONENT
// ==============================================

import React, { useState } from 'react';
import { usePublicStore } from '../../contexts/PublicStoreContext';
import { CartItem } from '../../types/store';

interface PublicShoppingCartProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onProceedToCheckout: () => void;
}

export const PublicShoppingCart: React.FC<PublicShoppingCartProps> = ({ 
  showToast, 
  onProceedToCheckout 
}) => {
  const {
    state,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    getCartItemCount
  } = usePublicStore();

  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  // ==============================================
  // COMPUTED VALUES
  // ==============================================

  // Get cart total from context
  const cartTotal = getCartTotal() || 0;
  const cartItemCount = getCartItemCount() || 0;

  // ==============================================
  // HANDLERS
  // ==============================================

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await updateCartItem(itemId, newQuantity);
      showToast('Cart updated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update cart', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      showToast('Item removed from cart', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to remove item', 'error');
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItemCount === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    onProceedToCheckout();
  };

  // ==============================================
  // RENDER
  // ==============================================

  if (!state.cartId) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-gray-700 text-center">
        <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-xl font-bold text-white mb-2">No Active Cart</h3>
        <p className="text-gray-300 mb-4">
          You need to provide guest information to start shopping.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // Loading State
  if (state.isCartLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {cartItemCount === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-gray-700 text-center">
          <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h3>
          <p className="text-gray-300 mb-4">
            Add some products to your cart to get started.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="glass-card p-6 rounded-2xl border border-blue-400/30 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                    <i className="fas fa-shopping-cart text-blue-400 mr-3"></i>
                    Shopping Cart
                  </h2>
                  <p className="text-gray-300 flex items-center">
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                      {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                    </span>
                    in your cart
                  </p>
                </div>
                
                <div className="text-center lg:text-right">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    PKR {cartTotal.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                    Total Amount
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4 mb-8">
            {state.cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                isUpdating={updatingItems.has(item.item_id)}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="glass-card p-6 rounded-2xl border border-green-400/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <i className="fas fa-receipt text-green-400 mr-3"></i>
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({cartItemCount} items)</span>
                <span>PKR {cartTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>Included</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>Free Pickup</span>
              </div>
              
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>PKR {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Guest Notice */}
            <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-blue-400 mt-1 mr-3"></i>
                <div>
                  <h4 className="text-sm font-semibold text-blue-300 mb-1">Guest Checkout</h4>
                  <p className="text-xs text-gray-300">
                    You're shopping as a guest. Your order will be ready for pickup at our gym location.
                    You'll receive order updates via email.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 transform"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Continue Shopping</span>
              </button>
              
              <button
                onClick={handleProceedToCheckout}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-200 hover-glow flex items-center justify-center space-x-2 hover:scale-105 transform shadow-lg shadow-blue-500/25"
              >
                <span>Proceed to Checkout</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-4 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-truck text-green-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Free Pickup</h4>
              <p className="text-xs text-gray-300">Collect your order at our gym</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shield-alt text-blue-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Secure Payment</h4>
              <p className="text-xs text-gray-300">Safe and encrypted transactions</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-clock text-purple-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Fast Processing</h4>
              <p className="text-xs text-gray-300">Orders ready within hours</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==============================================
// CART ITEM CARD COMPONENT
// ==============================================

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: number, quantity: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
  isUpdating: boolean;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onRemove,
  isUpdating
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.stock_quantity) {
      setQuantity(newQuantity);
      onQuantityChange(item.item_id, newQuantity);
    }
  };

  const itemTotal = item.price_at_time * item.quantity;

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-700 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Product Image & Info */}
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={item.image_url || 'https://via.placeholder.com/80x80?text=Product'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl border-2 border-gray-600"
              />
              {item.stock_quantity <= 5 && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                  Low Stock
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                {item.category_name || 'Uncategorized'}
              </span>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                {item.stock_quantity} in stock
              </span>
            </div>
          </div>
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Price */}
          <div className="text-center lg:text-right">
            <div className="text-xl font-bold text-green-400">
              PKR {item.price_at_time.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">per item</div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
            >
              <i className="fas fa-minus"></i>
            </button>
            
            <div className="w-16 text-center">
              {isUpdating ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
              ) : (
                <span className="text-xl font-bold text-white bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-600">
                  {quantity}
                </span>
              )}
            </div>
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= item.stock_quantity || isUpdating}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-green-400 hover:text-green-300 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          {/* Item Total */}
          <div className="text-center lg:text-right">
            <div className="text-xl font-bold text-white">
              PKR {itemTotal.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">total</div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.item_id)}
            disabled={isUpdating}
            className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center group"
            title="Remove item"
          >
            <i className="fas fa-trash group-hover:scale-110 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

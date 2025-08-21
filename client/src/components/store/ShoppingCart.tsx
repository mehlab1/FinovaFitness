// ==============================================
// SHOPPING CART COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StoreComponentProps, CartItem } from '../../types/store';
import { CartItemComponent } from './CartItemComponent';

interface ShoppingCartProps extends StoreComponentProps {
  onCheckout: () => void;
  onBackToCatalog: () => void;
  cartId: number | null;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  showToast,
  onCheckout,
  onBackToCatalog,
  cartId,
}) => {
  const {
    state,
    fetchCart,
    updateCartItem,
    removeFromCart,
    cartTotal,
    cartItemCount,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  // ==============================================
  // INITIAL DATA LOADING
  // ==============================================

  useEffect(() => {
    if (cartId) {
      loadCart();
    }
  }, [cartId]);

  const loadCart = async () => {
    if (!cartId) return;
    
    setLoading(true);
    try {
      await fetchCart(cartId);
    } catch (error) {
      showToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // CART ACTIONS
  // ==============================================

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (!cartId) return;

    setUpdatingItem(itemId);
    try {
      if (quantity === 0) {
        await removeFromCart(cartId, itemId);
        showToast('Item removed from cart', 'success');
      } else {
        await updateCartItem(cartId, itemId, quantity);
        showToast('Cart updated', 'success');
      }
    } catch (error) {
      showToast('Failed to update cart', 'error');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!cartId) return;

    try {
      await removeFromCart(cartId, itemId);
      showToast('Item removed from cart', 'success');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  // ==============================================
  // PRICE CALCULATIONS
  // ==============================================

  const subtotal = state.cart.reduce((total, item) => {
    return total + (item.price_at_time * item.quantity);
  }, 0);

  const memberDiscountTotal = state.cart.reduce((total, item) => {
    return total + (item.member_discount_applied * item.quantity);
  }, 0);

  const finalTotal = subtotal - memberDiscountTotal;

  // ==============================================
  // RENDER LOADING STATE
  // ==============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading cart...</p>
        </div>
      </div>
    );
  }

  // ==============================================
  // RENDER EMPTY CART
  // ==============================================

  if (state.cart.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-shopping-cart text-3xl text-gray-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added any products to your cart yet. Start shopping to discover amazing fitness products!
        </p>
        <button
          onClick={onBackToCatalog}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
        >
          <i className="fas fa-shopping-bag"></i>
          <span>Start Shopping</span>
        </button>
      </div>
    );
  }

  // ==============================================
  // RENDER CART CONTENT
  // ==============================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Shopping Cart</h2>
          <p className="text-gray-300">
            {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToCatalog}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Continue Shopping</span>
          </button>
          
          <button
            onClick={onCheckout}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <i className="fas fa-credit-card"></i>
            <span>Proceed to Checkout</span>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {state.cart.map((item) => (
          <CartItemComponent
            key={item.id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            isUpdating={updatingItem === item.id}
          />
        ))}
      </div>

      {/* Cart Summary */}
      <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <i className="fas fa-receipt mr-2 text-green-400"></i>
          Order Summary
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal ({cartItemCount} items):</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {memberDiscountTotal > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Member Discount:</span>
              <span>-${memberDiscountTotal.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-600 pt-3">
            <div className="flex justify-between text-xl font-bold text-white">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Member Benefits */}
        {memberDiscountTotal > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
            <div className="flex items-center space-x-2 text-green-400">
              <i className="fas fa-star"></i>
              <span className="font-semibold">Member Savings!</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              You saved ${memberDiscountTotal.toFixed(2)} with your member discount
            </p>
          </div>
        )}

        {/* Checkout Button */}
        <div className="mt-6">
          <button
            onClick={onCheckout}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <i className="fas fa-lock"></i>
            <span>Secure Checkout - ${finalTotal.toFixed(2)}</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
            <i className="fas fa-shield-alt"></i>
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-700">
        <button
          onClick={onBackToCatalog}
          className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Continue Shopping</span>
        </button>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <i className="fas fa-truck"></i>
            <span>Free pickup at gym</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fas fa-undo"></i>
            <span>Easy returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// PUBLIC CHECKOUT COMPONENT
// ==============================================

import React, { useState } from 'react';
import { usePublicStore } from '../../contexts/PublicStoreContext';
import { CheckoutData } from '../../types/store';

interface PublicCheckoutProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOrderComplete: (orderNumber: string) => void;
  onBackToCart: () => void;
}

export const PublicCheckout: React.FC<PublicCheckoutProps> = ({
  showToast,
  onOrderComplete,
  onBackToCart
}) => {
  const {
    state,
    processCheckout,
    getCartTotal,
    getCartItemCount
  } = usePublicStore();

  const cartTotal = getCartTotal();
  const cartItemCount = getCartItemCount();

  const [formData, setFormData] = useState<CheckoutData>({
    cart_id: state.cartId || 0,
    customer_name: localStorage.getItem('guestName') || '',
    customer_email: localStorage.getItem('guestEmail') || '',
    customer_phone: localStorage.getItem('guestPhone') || '',
    payment_method: 'in_person',
    pickup_notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ==============================================
  // HANDLERS
  // ==============================================

  const handleInputChange = (field: keyof CheckoutData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Full name is required';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Please enter a valid phone number';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (cartItemCount === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await processCheckout(formData);
      showToast('Order placed successfully!', 'success');
      onOrderComplete(response.order.order_number);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Checkout failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

  if (!state.cartId || cartItemCount === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-gray-700 text-center">
        <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-xl font-bold text-white mb-2">No Items to Checkout</h3>
        <p className="text-gray-300 mb-4">
          Your cart is empty. Add some products to proceed with checkout.
        </p>
        <button
          onClick={onBackToCart}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Checkout</h2>
            <p className="text-gray-300">Complete your purchase</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              PKR {cartTotal.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="glass-card p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Customer Information</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.customer_name
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-gray-800/50 focus:border-blue-400'
                } text-white placeholder-gray-400`}
                placeholder="Enter your full name"
                disabled={isProcessing}
              />
              {errors.customer_name && (
                <p className="text-red-400 text-sm mt-1">{errors.customer_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="customer_email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.customer_email
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-gray-800/50 focus:border-blue-400'
                } text-white placeholder-gray-400`}
                placeholder="Enter your email address"
                disabled={isProcessing}
              />
              {errors.customer_email && (
                <p className="text-red-400 text-sm mt-1">{errors.customer_email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.customer_phone
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-gray-800/50 focus:border-blue-400'
                } text-white placeholder-gray-400`}
                placeholder="Enter your phone number"
                disabled={isProcessing}
              />
              {errors.customer_phone && (
                <p className="text-red-400 text-sm mt-1">{errors.customer_phone}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Payment Method *
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="in_person"
                    checked={formData.payment_method === 'in_person'}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    disabled={isProcessing}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-money-bill-wave text-green-400"></i>
                    <span className="text-white">Pay at Pickup (Cash/Card)</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    disabled={isProcessing}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-credit-card text-blue-400"></i>
                    <span className="text-white">Online Payment</span>
                  </div>
                </label>
              </div>
              {errors.payment_method && (
                <p className="text-red-400 text-sm mt-1">{errors.payment_method}</p>
              )}
            </div>

            {/* Pickup Notes */}
            <div>
              <label htmlFor="pickup_notes" className="block text-sm font-medium text-gray-300 mb-2">
                Pickup Notes <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="pickup_notes"
                value={formData.pickup_notes}
                onChange={(e) => handleInputChange('pickup_notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-400 transition-colors"
                placeholder="Any special instructions for pickup..."
                disabled={isProcessing}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 hover-glow disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Order...
                </div>
              ) : (
                `Place Order - PKR ${cartTotal.toLocaleString()}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Order Details */}
          <div className="glass-card p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Items ({cartItemCount})</span>
                <span>PKR {cartTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>Included</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span className="text-green-400">Free Pickup</span>
              </div>
              
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>PKR {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Cart Items Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Items in Cart:</h4>
              {state.cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/40x40?text=Product'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-medium truncate max-w-32">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-semibold">
                    PKR {(item.price_at_time * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Information */}
          <div className="glass-card p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Pickup Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-map-marker-alt text-blue-400"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Pickup Location</h4>
                  <p className="text-sm text-gray-300">
                    Finova Fitness Gym<br />
                    123 Fitness Street<br />
                    Islamabad, Pakistan
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-clock text-green-400"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Pickup Hours</h4>
                  <p className="text-sm text-gray-300">
                    Monday - Sunday<br />
                    6:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-phone text-purple-400"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Contact</h4>
                  <p className="text-sm text-gray-300">
                    +92 300 1234567<br />
                    info@finovafitness.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onBackToCart}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

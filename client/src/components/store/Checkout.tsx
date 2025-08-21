// ==============================================
// CHECKOUT COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StoreComponentProps, CheckoutData } from '../../types/store';
import { storeApi } from '../../services/api/storeApi';

interface CheckoutProps extends StoreComponentProps {
  onBackToCart: () => void;
  onOrderComplete: () => void;
  cartId: number | null;
}

type CheckoutStep = 'customer-info' | 'payment-method' | 'review' | 'confirmation';

export const Checkout: React.FC<CheckoutProps> = ({
  showToast,
  onBackToCart,
  onOrderComplete,
  cartId,
}) => {
  const {
    state,
    fetchCart,
    cartTotal,
    cartItemCount,
  } = useStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer-info');
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({
    cart_id: cartId || 0,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: 'in_person',
    pickup_notes: '',
    promotional_code: '',
    loyalty_points_to_use: 0,
  });

  const [loyaltyPoints, setLoyaltyPoints] = useState<{ loyalty_points: number; points_value: number } | null>(null);
  const [promotionalDiscount, setPromotionalDiscount] = useState(0);
  const [loyaltyPointsDiscount, setLoyaltyPointsDiscount] = useState(0);

  // ==============================================
  // INITIAL DATA LOADING
  // ==============================================

  useEffect(() => {
    if (cartId) {
      loadCart();
      loadLoyaltyPoints();
    }
  }, [cartId]);

  const loadCart = async () => {
    if (!cartId) return;
    
    try {
      await fetchCart(cartId);
    } catch (error) {
      showToast('Failed to load cart', 'error');
    }
  };

  const loadLoyaltyPoints = async () => {
    try {
      const points = await storeApi.getLoyaltyPointsBalance();
      setLoyaltyPoints(points);
    } catch (error) {
      console.error('Failed to load loyalty points:', error);
    }
  };

  // ==============================================
  // CHECKOUT DATA HANDLERS
  // ==============================================

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...updates }));
  };

  const handlePromotionalCode = async (code: string) => {
    if (!code.trim()) {
      setPromotionalDiscount(0);
      return;
    }

    try {
      const response = await storeApi.validatePromotionalCode(code, cartTotal);
      setPromotionalDiscount(response.promotion.discount_amount);
      showToast('Promotional code applied successfully!', 'success');
    } catch (error) {
      setPromotionalDiscount(0);
      showToast('Invalid promotional code', 'error');
    }
  };

  const handleLoyaltyPointsChange = async (points: number) => {
    if (!cartId || !loyaltyPoints) return;

    try {
      if (points > 0) {
        const response = await storeApi.applyLoyaltyPoints(cartId, points);
        setLoyaltyPointsDiscount(response.discount_value);
        showToast(`${response.points_used} loyalty points applied!`, 'success');
      } else {
        setLoyaltyPointsDiscount(0);
      }
    } catch (error) {
      showToast('Failed to apply loyalty points', 'error');
    }
  };

  // ==============================================
  // STEP NAVIGATION
  // ==============================================

  const nextStep = () => {
    switch (currentStep) {
      case 'customer-info':
        if (validateCustomerInfo()) {
          setCurrentStep('payment-method');
        }
        break;
      case 'payment-method':
        setCurrentStep('review');
        break;
      case 'review':
        processOrder();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'payment-method':
        setCurrentStep('customer-info');
        break;
      case 'review':
        setCurrentStep('payment-method');
        break;
    }
  };

  // ==============================================
  // VALIDATION
  // ==============================================

  const validateCustomerInfo = (): boolean => {
    if (!checkoutData.customer_name?.trim()) {
      showToast('Please enter your name', 'error');
      return false;
    }
    if (!checkoutData.customer_email?.trim()) {
      showToast('Please enter your email', 'error');
      return false;
    }
    if (!checkoutData.customer_phone?.trim()) {
      showToast('Please enter your phone number', 'error');
      return false;
    }
    return true;
  };

  // ==============================================
  // ORDER PROCESSING
  // ==============================================

  const processOrder = async () => {
    if (!cartId) {
      showToast('Cart not initialized. Please try again.', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderData: CheckoutData = {
        cart_id: cartId,
        customer_name: checkoutData.customer_name || '',
        customer_email: checkoutData.customer_email || '',
        customer_phone: checkoutData.customer_phone || '',
        payment_method: checkoutData.payment_method || 'in_person',
        pickup_notes: checkoutData.pickup_notes || '',
        promotional_code: checkoutData.promotional_code || undefined,
        loyalty_points_to_use: checkoutData.loyalty_points_to_use || undefined,
      };

      const response = await storeApi.checkout(orderData);
      setCurrentStep('confirmation');
      showToast('Order placed successfully!', 'success');
      
      // Clear cart and redirect after a delay
      setTimeout(() => {
        onOrderComplete();
      }, 3000);
    } catch (error) {
      showToast('Failed to process order', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // PRICE CALCULATIONS
  // ==============================================

  const subtotal = cartTotal;
  const memberDiscount = state.cart.reduce((total, item) => {
    return total + (item.member_discount_applied * item.quantity);
  }, 0);
  const finalTotal = subtotal - memberDiscount - promotionalDiscount - loyaltyPointsDiscount;

  // ==============================================
  // RENDER STEPS
  // ==============================================

  const renderStep = () => {
    switch (currentStep) {
      case 'customer-info':
        return (
          <CustomerInfoStep
            data={checkoutData}
            onUpdate={updateCheckoutData}
          />
        );
      case 'payment-method':
        return (
          <PaymentMethodStep
            data={checkoutData}
            onUpdate={updateCheckoutData}
            loyaltyPoints={loyaltyPoints}
            onPromotionalCode={handlePromotionalCode}
            onLoyaltyPointsChange={handleLoyaltyPointsChange}
          />
        );
      case 'review':
        return (
          <ReviewStep
            data={checkoutData}
            cart={state.cart}
            subtotal={subtotal}
            memberDiscount={memberDiscount}
            promotionalDiscount={promotionalDiscount}
            loyaltyPointsDiscount={loyaltyPointsDiscount}
            finalTotal={finalTotal}
            loading={loading}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep />
        );
      default:
        return null;
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Checkout</h2>
          <p className="text-gray-300">
            Step {['customer-info', 'payment-method', 'review', 'confirmation'].indexOf(currentStep) + 1} of 4
          </p>
        </div>
        
        {currentStep !== 'confirmation' && (
          <button
            onClick={onBackToCart}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Cart</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {currentStep !== 'confirmation' && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(['customer-info', 'payment-method', 'review', 'confirmation'].indexOf(currentStep) + 1) * 25}%` 
            }}
          ></div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 'confirmation' && (
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 'customer-info'}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Previous</span>
          </button>
          
          <button
            onClick={nextStep}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{currentStep === 'review' ? 'Place Order' : 'Next'}</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// ==============================================
// CUSTOMER INFO STEP
// ==============================================

interface CustomerInfoStepProps {
  data: Partial<CheckoutData>;
  onUpdate: (updates: Partial<CheckoutData>) => void;
}

const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({ data, onUpdate }) => {
  return (
    <div className="glass-card p-8 rounded-2xl border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <i className="fas fa-user mr-3 text-green-400"></i>
        Customer Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.customer_name || ''}
            onChange={(e) => onUpdate({ customer_name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={data.customer_email || ''}
            onChange={(e) => onUpdate({ customer_email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={data.customer_phone || ''}
            onChange={(e) => onUpdate({ customer_phone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Pickup Notes
          </label>
          <textarea
            value={data.pickup_notes || ''}
            onChange={(e) => onUpdate({ pickup_notes: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
            placeholder="Any special instructions for pickup"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

// ==============================================
// PAYMENT METHOD STEP
// ==============================================

interface PaymentMethodStepProps {
  data: Partial<CheckoutData>;
  onUpdate: (updates: Partial<CheckoutData>) => void;
  loyaltyPoints: { loyalty_points: number; points_value: number } | null;
  onPromotionalCode: (code: string) => void;
  onLoyaltyPointsChange: (points: number) => void;
}

const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  data,
  onUpdate,
  loyaltyPoints,
  onPromotionalCode,
  onLoyaltyPointsChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <div className="glass-card p-8 rounded-2xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-credit-card mr-3 text-green-400"></i>
          Payment Method
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="payment_method"
              value="in_person"
              checked={data.payment_method === 'in_person'}
              onChange={(e) => onUpdate({ payment_method: e.target.value as 'in_person' | 'online' })}
              className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 focus:ring-green-400"
            />
            <div>
              <div className="text-white font-semibold">Pay at Gym</div>
              <div className="text-gray-400 text-sm">Pay when you pick up your order</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="payment_method"
              value="online"
              checked={data.payment_method === 'online'}
              onChange={(e) => onUpdate({ payment_method: e.target.value as 'in_person' | 'online' })}
              className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 focus:ring-green-400"
            />
            <div>
              <div className="text-white font-semibold">Online Payment</div>
              <div className="text-gray-400 text-sm">Pay securely online (coming soon)</div>
            </div>
          </label>
        </div>
      </div>

      {/* Promotional Code */}
      <div className="glass-card p-8 rounded-2xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-tag mr-3 text-green-400"></i>
          Promotional Code
        </h3>
        
        <div className="flex space-x-4">
          <input
            type="text"
            value={data.promotional_code || ''}
            onChange={(e) => onUpdate({ promotional_code: e.target.value })}
            onBlur={(e) => onPromotionalCode(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
            placeholder="Enter promotional code"
          />
          <button
            onClick={() => onPromotionalCode(data.promotional_code || '')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Loyalty Points */}
      {loyaltyPoints && loyaltyPoints.loyalty_points > 0 && (
        <div className="glass-card p-8 rounded-2xl border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <i className="fas fa-star mr-3 text-green-400"></i>
            Loyalty Points
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Available Points:</span>
              <span className="text-white font-semibold">{loyaltyPoints.loyalty_points}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Points Value:</span>
              <span className="text-green-400 font-semibold">${Number(loyaltyPoints.points_value).toFixed(2)}</span>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Points to Use
              </label>
              <input
                type="number"
                min="0"
                max={loyaltyPoints.loyalty_points}
                value={data.loyalty_points_to_use || 0}
                onChange={(e) => {
                  const points = parseInt(e.target.value) || 0;
                  onUpdate({ loyalty_points_to_use: points });
                  onLoyaltyPointsChange(points);
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================
// REVIEW STEP
// ==============================================

interface ReviewStepProps {
  data: Partial<CheckoutData>;
  cart: any[];
  subtotal: number;
  memberDiscount: number;
  promotionalDiscount: number;
  loyaltyPointsDiscount: number;
  finalTotal: number;
  loading: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  cart,
  subtotal,
  memberDiscount,
  promotionalDiscount,
  loyaltyPointsDiscount,
  finalTotal,
  loading,
}) => {
  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="glass-card p-8 rounded-2xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-receipt mr-3 text-green-400"></i>
          Order Summary
        </h3>
        
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-600">
              <div>
                <div className="text-white font-semibold">{item.name}</div>
                <div className="text-gray-400 text-sm">Qty: {item.quantity}</div>
              </div>
              <div className="text-right">
                <div className="text-white">${((Number(item.price_at_time) - Number(item.member_discount_applied)) * item.quantity).toFixed(2)}</div>
                {Number(item.member_discount_applied) > 0 && (
                  <div className="text-green-400 text-sm">Member discount applied</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {memberDiscount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Member Discount:</span>
              <span>-${memberDiscount.toFixed(2)}</span>
            </div>
          )}
          {promotionalDiscount > 0 && (
            <div className="flex justify-between text-blue-400">
              <span>Promotional Discount:</span>
              <span>-${promotionalDiscount.toFixed(2)}</span>
            </div>
          )}
          {loyaltyPointsDiscount > 0 && (
            <div className="flex justify-between text-purple-400">
              <span>Loyalty Points Discount:</span>
              <span>-${loyaltyPointsDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-600 pt-2 flex justify-between text-white font-bold text-lg">
            <span>Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="glass-card p-8 rounded-2xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-user mr-3 text-green-400"></i>
          Customer Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400">Name:</span>
            <div className="text-white font-semibold">{data.customer_name}</div>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <div className="text-white font-semibold">{data.customer_email}</div>
          </div>
          <div>
            <span className="text-gray-400">Phone:</span>
            <div className="text-white font-semibold">{data.customer_phone}</div>
          </div>
          <div>
            <span className="text-gray-400">Payment Method:</span>
            <div className="text-white font-semibold">
              {data.payment_method === 'in_person' ? 'Pay at Gym' : 'Online Payment'}
            </div>
          </div>
        </div>
        
        {data.pickup_notes && (
          <div className="mt-4">
            <span className="text-gray-400">Pickup Notes:</span>
            <div className="text-white font-semibold">{data.pickup_notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================
// CONFIRMATION STEP
// ==============================================

const ConfirmationStep: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-check text-3xl text-green-400"></i>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Order Confirmed!</h2>
      <p className="text-gray-300 mb-8 max-w-md mx-auto">
        Thank you for your order! You will receive a confirmation email shortly. 
        Please bring your order number when picking up your items at the gym.
      </p>
      <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-6 max-w-md mx-auto">
        <div className="text-green-400 font-semibold mb-2">What's Next?</div>
        <ul className="text-gray-300 text-sm space-y-2 text-left">
          <li className="flex items-center space-x-2">
            <i className="fas fa-envelope text-green-400"></i>
            <span>Check your email for order confirmation</span>
          </li>
          <li className="flex items-center space-x-2">
            <i className="fas fa-clock text-green-400"></i>
            <span>Your order will be ready within 2-4 hours</span>
          </li>
          <li className="flex items-center space-x-2">
            <i className="fas fa-map-marker-alt text-green-400"></i>
            <span>Pick up at the gym front desk</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// ==============================================
// CART ITEM COMPONENT
// ==============================================

import React, { useState } from 'react';
import { CartItemProps, CartItem } from '../../types/store';

export const CartItemComponent: React.FC<CartItemProps & { isUpdating: boolean }> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  // ==============================================
  // PRICE CALCULATIONS
  // ==============================================

  const itemSubtotal = Number(item.price_at_time) * item.quantity;
  const itemDiscount = Number(item.member_discount_applied) * item.quantity;
  const itemTotal = itemSubtotal - itemDiscount;
  const hasDiscount = Number(item.member_discount_applied) > 0;

  // ==============================================
  // EVENT HANDLERS
  // ==============================================

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= item.stock_quantity) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.item_id, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemove(item.item_id);
  };

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-700/50 hover:border-green-400/30 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
              <i className="fas fa-image text-2xl text-gray-600"></i>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {item.category_name || 'Uncategorized'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {item.name}
              </h3>
              
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Price Information */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-gray-400 line-through">
                        ${Number(item.price_at_time).toFixed(2)} each
                      </span>
                      <span className="text-green-400 font-semibold">
                        ${(Number(item.price_at_time) - Number(item.member_discount_applied)).toFixed(2)} each
                      </span>
                    </>
                  ) : (
                    <span className="text-white font-semibold">
                      ${Number(item.price_at_time).toFixed(2)} each
                    </span>
                  )}
                </div>
                
                {hasDiscount && (
                  <p className="text-xs text-green-400">
                    Member discount: -${Number(item.member_discount_applied).toFixed(2)} per item
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-minus text-sm"></i>
                </button>
                
                <div className="w-16 text-center">
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto"></div>
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {quantity}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= item.stock_quantity || isUpdating}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>

              {/* Stock Status */}
              <div className="text-center">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.stock_quantity === 0 
                    ? 'bg-red-500/20 text-red-400' 
                    : item.stock_quantity <= 5 
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {item.stock_quantity === 0 
                    ? 'Out of Stock' 
                    : item.stock_quantity <= 5 
                    ? `Only ${item.stock_quantity} left`
                    : `${item.stock_quantity} in stock`
                  }
                </span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex flex-col items-end space-y-3">
              {/* Total Price */}
              <div className="text-right">
                <div className="space-y-1">
                  {hasDiscount && (
                    <div className="text-xs text-gray-400 line-through">
                      ${itemSubtotal.toFixed(2)}
                    </div>
                  )}
                  <div className="text-lg font-bold text-white">
                    ${itemTotal.toFixed(2)}
                  </div>
                  {hasDiscount && (
                    <div className="text-xs text-green-400">
                      Saved ${itemDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleRemove}
                disabled={isUpdating}
                className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1 text-sm"
              >
                <i className="fas fa-trash"></i>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
            <p className="text-white text-sm">Updating...</p>
          </div>
        </div>
      )}
    </div>
  );
};

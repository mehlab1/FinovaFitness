// ==============================================
// PUBLIC PRODUCT CARD COMPONENT
// ==============================================

import React, { useState } from 'react';
import { StoreItem } from '../../types/store';
import { usePublicStore } from '../../contexts/PublicStoreContext';

interface PublicProductCardProps {
  product: StoreItem;
  onShowGuestInfo: () => void;
}

export function PublicProductCard({ product, onShowGuestInfo }: PublicProductCardProps) {
  const { addToCart, state } = usePublicStore();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getStockStatus = (stockQuantity: number, lowStockThreshold: number): {
    text: string;
    color: string;
    className: string;
  } => {
    if (stockQuantity === 0) {
      return {
        text: 'Out of Stock',
        color: 'text-red-600',
        className: 'bg-red-50 text-red-600'
      };
    } else if (stockQuantity <= lowStockThreshold) {
      return {
        text: `Low Stock (${stockQuantity} left)`,
        color: 'text-orange-600',
        className: 'bg-orange-50 text-orange-600'
      };
    } else {
      return {
        text: 'In Stock',
        color: 'text-green-600',
        className: 'bg-green-50 text-green-600'
      };
    }
  };

  // ==============================================
  // EVENT HANDLERS
  // ==============================================

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
      setError(null);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) {
      setError('This item is out of stock');
      return;
    }

    if (quantity > product.stock_quantity) {
      setError(`Only ${product.stock_quantity} items available in stock`);
      return;
    }

    // Check if user has a cart, if not show guest info modal
    if (!state.cartId) {
      onShowGuestInfo();
      return;
    }

    try {
      setIsAddingToCart(true);
      setError(null);
      
      await addToCart(product.id, quantity);
      
      // Reset quantity after successful add
      setQuantity(1);
      
      // Show success feedback (could be a toast notification)
      console.log(`Added ${quantity} ${product.name} to cart`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuickAdd = async () => {
    if (product.stock_quantity === 0) {
      setError('This item is out of stock');
      return;
    }

    // Check if user has a cart, if not show guest info modal
    if (!state.cartId) {
      onShowGuestInfo();
      return;
    }

    try {
      setIsAddingToCart(true);
      setError(null);
      
      await addToCart(product.id, 1);
      
      // Show success feedback
      console.log(`Added ${product.name} to cart`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

  const stockStatus = getStockStatus(product.stock_quantity, product.low_stock_threshold);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-product.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}>
          {stockStatus.text}
        </div>
        
        {/* Category Badge */}
        {product.category_name && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {product.category_name}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 hover:line-clamp-none transition-all duration-200">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.member_discount_percentage > 0 && (
              <span className="text-sm text-green-600 font-medium">
                {product.member_discount_percentage}% off for members
              </span>
            )}
          </div>
        </div>

        {/* Stock Information */}
        <div className="mb-3">
          <p className={`text-sm font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </p>
          {product.stock_quantity > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {product.stock_quantity} available
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Add to Cart Section */}
        <div className="space-y-3">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                disabled={isOutOfStock}
                className="w-12 h-8 text-center border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock_quantity || isOutOfStock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCart ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span>Add to Cart</span>
                </div>
              )}
            </button>

            {/* Quick Add Button */}
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock || isAddingToCart}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Quick add 1 item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

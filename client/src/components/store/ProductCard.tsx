// ==============================================
// PRODUCT CARD COMPONENT
// ==============================================

import React, { useState } from 'react';
import { ProductCardProps, StoreItem } from '../../types/store';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  onViewDetails,
  isInWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // ==============================================
  // PRICE CALCULATIONS
  // ==============================================

  // Ensure price is a number
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const safePrice = isNaN(price) || price === null || price === undefined ? 0 : price;
  const memberDiscount = (safePrice * product.member_discount_percentage) / 100;
  const memberPrice = safePrice - memberDiscount;
  const hasDiscount = product.member_discount_percentage > 0;

  // ==============================================
  // STOCK STATUS
  // ==============================================

  const getStockStatus = () => {
    if (product.stock_quantity === 0) return { status: 'out_of_stock', text: 'Out of Stock', color: 'text-red-400' };
    if (product.stock_quantity <= product.low_stock_threshold) return { status: 'low_stock', text: 'Low Stock', color: 'text-yellow-400' };
    return { status: 'in_stock', text: 'In Stock', color: 'text-green-400' };
  };

  const stockStatus = getStockStatus();

  // ==============================================
  // EVENT HANDLERS
  // ==============================================

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) return;
    
    setIsLoading(true);
    try {
      await onAddToCart(product, quantity);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      await onRemoveFromWishlist(product.id);
    } else {
      await onAddToWishlist(product.id);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <div className="group relative">
      <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-700/50 hover:border-green-400/30 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Product Image */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
            <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
              <i className="fas fa-image text-4xl text-gray-600 group-hover:text-green-400 transition-colors duration-300"></i>
            </div>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
          >
            <i className={`fas fa-heart text-lg transition-all duration-300 ${
              isInWishlist 
                ? 'text-red-400 animate-pulse' 
                : 'text-white hover:text-red-400'
            }`}></i>
          </button>

          {/* Stock Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-sm ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>

          {/* Member Discount Badge */}
          {hasDiscount && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                {product.member_discount_percentage}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="relative z-10">
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {product.category_name || 'Uncategorized'}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg line-through text-gray-500">
                    ${safePrice.toFixed(2)}
                  </span>
                  <span className="text-xl font-bold text-green-400">
                    ${memberPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-white">
                  ${safePrice.toFixed(2)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-green-400 mt-1">
                Member Price (Save ${memberDiscount.toFixed(2)})
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">Quantity:</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="w-12 text-center text-white font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock_quantity}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-cart"></i>
                  <span>{product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onViewDetails(product)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-eye"></i>
              <span>View Details</span>
            </button>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-transparent to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-500 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

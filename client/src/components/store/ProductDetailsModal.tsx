// ==============================================
// PRODUCT DETAILS MODAL COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { StoreItem, ProductReview } from '../../types/store';
import { storeApi } from '../../services/api/storeApi';

interface ProductDetailsModalProps {
  product: StoreItem;
  isInWishlist: boolean;
  onAddToCart: (product: StoreItem, quantity: number) => void;
  onAddToWishlist: (productId: number) => void;
  onRemoveFromWishlist: (productId: number) => void;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isInWishlist,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

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
  // LOAD REVIEWS
  // ==============================================

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await storeApi.getProductReviews(product.id);
      setReviews(response.reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // ==============================================
  // EVENT HANDLERS
  // ==============================================

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) return;
    
    setLoading(true);
    try {
      await onAddToCart(product, quantity);
      onClose();
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {product.name}
            </h2>
            <p className="text-gray-300">
              {product.category_name || 'Uncategorized'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
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
              <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                <i className="fas fa-image text-6xl text-gray-600"></i>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
              {hasDiscount && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  {product.member_discount_percentage}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Price */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {hasDiscount ? (
                  <>
                    <span className="text-2xl line-through text-gray-500">
                      ${safePrice.toFixed(2)}
                    </span>
                    <span className="text-3xl font-bold text-green-400">
                      ${memberPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-white">
                    ${safePrice.toFixed(2)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-green-400 text-sm">
                  Member Price (Save ${memberDiscount.toFixed(2)})
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Quantity:</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-minus text-sm"></i>
                </button>
                <span className="w-16 text-center text-white font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
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
                onClick={handleWishlistToggle}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <i className={`fas fa-heart ${isInWishlist ? 'text-red-400' : ''}`}></i>
                <span>{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white">{product.category_name || 'Uncategorized'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stock:</span>
                <span className="text-white">{product.stock_quantity} units</span>
              </div>
              {product.low_stock_threshold > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Low Stock Threshold:</span>
                  <span className="text-white">{product.low_stock_threshold} units</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'details' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Product ID:</span>
                    <div className="text-white font-semibold">#{product.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Added:</span>
                    <div className="text-white font-semibold">
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Updated:</span>
                    <div className="text-white font-semibold">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <div className="text-white font-semibold">
                      {product.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-comments text-4xl text-gray-600 mb-4"></i>
                    <p className="text-gray-300">No reviews yet</p>
                    <p className="text-gray-400 text-sm">Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star text-sm ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                                  }`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-white font-semibold">
                              {review.user_name || review.guest_name}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{review.review_text}</p>
                        {review.is_verified_purchase && (
                          <div className="mt-2">
                            <span className="text-green-400 text-xs font-semibold">
                              <i className="fas fa-check-circle mr-1"></i>
                              Verified Purchase
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

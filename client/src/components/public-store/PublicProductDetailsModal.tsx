// ==============================================
// PUBLIC PRODUCT DETAILS MODAL COMPONENT
// ==============================================

import React, { useState } from 'react';
import { usePublicStore } from '../../contexts/PublicStoreContext';
import { StoreItem } from '../../types/store';

interface PublicProductDetailsModalProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PublicProductDetailsModal: React.FC<PublicProductDetailsModalProps> = ({ showToast }) => {
  const {
    state,
    addToCart,
    setSelectedProduct,
    setShowProductModal,
    hasCart
  } = usePublicStore();

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const product = state.selectedProduct;

  // ==============================================
  // HANDLERS
  // ==============================================

  const handleClose = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!state.cartId) {
      showToast('Please provide guest information first', 'error');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      showToast(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`, 'success');
      handleClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add item to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShowGuestModal = () => {
    // This would trigger the guest modal in the parent component
    showToast('Please provide guest information to add items to cart', 'info');
  };

  // ==============================================
  // RENDER
  // ==============================================

  if (!product || !state.showProductModal) {
    return null;
  }

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-400/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Product Details</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image_url || 'https://via.placeholder.com/500x400?text=Product+Image'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-2xl"
            />
            
            {/* Stock Status Badge */}
            {isOutOfStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </div>
            )}
            
            {isLowStock && !isOutOfStock && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Low Stock
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-gray-800/80 text-white px-3 py-1 rounded-full text-sm">
              {product.category_name || 'Uncategorized'}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name & Price */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-green-400">
                  PKR {product.price.toLocaleString()}
                </span>
                {product.member_discount_percentage > 0 && (
                  <span className="text-sm text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                    Members save {product.member_discount_percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Stock Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Availability</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-box text-gray-400"></i>
                  <span className="text-gray-300">
                    {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                  </span>
                </div>
                
                {isLowStock && !isOutOfStock && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-exclamation-triangle text-orange-400"></i>
                    <span className="text-orange-400 text-sm">Low stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-600 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-white border-x border-gray-600 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-gray-300">
                    <span className="text-sm">Total: </span>
                    <span className="font-semibold text-green-400">
                      PKR {(product.price * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-2">Product Details</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <p className="text-white">{product.category_name || 'Uncategorized'}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">SKU:</span>
                  <p className="text-white">#{product.id}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Price:</span>
                  <p className="text-white">PKR {product.price.toLocaleString()}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Stock:</span>
                  <p className="text-white">{product.stock_quantity} units</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
              
              {!isOutOfStock && (
                <button
                  onClick={state.cartId ? handleAddToCart : handleShowGuestModal}
                  disabled={isAddingToCart}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 hover-glow disabled:opacity-50"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              )}
            </div>

            {/* Guest Notice */}
            {!state.cartId && (
              <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-info-circle text-blue-400 mt-1 mr-3"></i>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Guest Checkout</h4>
                    <p className="text-xs text-gray-300">
                      You'll need to provide guest information to add items to cart. 
                      No account creation required!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Why Choose This Product?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-award text-green-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Premium Quality</h4>
              <p className="text-xs text-gray-300">High-quality materials and construction</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shipping-fast text-blue-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Fast Pickup</h4>
              <p className="text-xs text-gray-300">Ready for pickup within hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shield-alt text-purple-400"></i>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Secure Purchase</h4>
              <p className="text-xs text-gray-300">Safe and encrypted transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

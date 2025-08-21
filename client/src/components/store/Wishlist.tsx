// ==============================================
// WISHLIST COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StoreComponentProps, WishlistItem } from '../../types/store';

interface WishlistProps extends StoreComponentProps {
  onBackToCatalog: () => void;
}

export const Wishlist: React.FC<WishlistProps> = ({
  showToast,
  onBackToCatalog,
}) => {
  const {
    state,
    fetchWishlist,
    removeFromWishlist,
    addToCart,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // ==============================================
  // INITIAL DATA LOADING
  // ==============================================

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      await fetchWishlist();
    } catch (error) {
      showToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // WISHLIST ACTIONS
  // ==============================================

  const handleRemoveFromWishlist = async (itemId: number) => {
    setRemovingItem(itemId);
    try {
      await removeFromWishlist(itemId);
      showToast('Removed from wishlist', 'success');
    } catch (error) {
      showToast('Failed to remove from wishlist', 'error');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingToCart(item.item_id);
    try {
      // Note: This would need to be implemented in the store context
      // For now, we'll show a placeholder message
      showToast('Add to cart functionality coming soon', 'info');
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  // ==============================================
  // RENDER LOADING STATE
  // ==============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // ==============================================
  // RENDER EMPTY WISHLIST
  // ==============================================

  if (state.wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-heart text-3xl text-gray-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Your Wishlist is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Start building your wishlist by adding products you love. You can save items for later and get notified when they're back in stock!
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
  // RENDER WISHLIST CONTENT
  // ==============================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Wishlist</h2>
          <p className="text-gray-300">
            {state.wishlist.length} item{state.wishlist.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
        
        <button
          onClick={onBackToCatalog}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.wishlist.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            onRemove={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
            isRemoving={removingItem === item.item_id}
            isAddingToCart={addingToCart === item.item_id}
          />
        ))}
      </div>

      {/* Wishlist Summary */}
      <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Wishlist Summary</h3>
            <p className="text-gray-300">
              Total value: ${state.wishlist.reduce((total, item) => {
                const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0;
                return total + itemPrice;
              }, 0).toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <i className="fas fa-bell"></i>
              <span>Get notified when items are back in stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// WISHLIST ITEM CARD COMPONENT
// ==============================================

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (itemId: number) => void;
  onAddToCart: (item: WishlistItem) => void;
  isRemoving: boolean;
  isAddingToCart: boolean;
}

const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  onRemove,
  onAddToCart,
  isRemoving,
  isAddingToCart,
}) => {
  return (
    <div className="group relative">
      <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-700/50 hover:border-red-400/30 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Product Image */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
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
            <div className={`w-full h-full flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
              <i className="fas fa-image text-4xl text-gray-600 group-hover:text-red-400 transition-colors duration-300"></i>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.item_id)}
            disabled={isRemoving}
            className="absolute top-2 right-2 w-10 h-10 bg-black/50 hover:bg-red-500/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <i className="fas fa-times text-lg text-white group-hover:text-white"></i>
            )}
          </button>

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-sm text-gray-300">
              {item.category_name || 'Uncategorized'}
            </span>
          </div>

          {/* Rating */}
          {item.rating > 0 && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                <i className="fas fa-star text-yellow-400 text-xs"></i>
                <span className="text-white text-xs font-semibold">{item.rating}</span>
                {item.review_count > 0 && (
                  <span className="text-gray-300 text-xs">({item.review_count})</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="relative z-10">
          {/* Product Name */}
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-300 transition-colors duration-300 line-clamp-2">
            {item.name}
          </h3>

          {/* Price */}
          <div className="mb-4">
            <span className="text-xl font-bold text-white">
              ${(typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0).toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => onAddToCart(item)}
              disabled={isAddingToCart}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAddingToCart ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-cart"></i>
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => onRemove(item.item_id)}
              disabled={isRemoving}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-heart-broken"></i>
              <span>{isRemoving ? 'Removing...' : 'Remove from Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all duration-500 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

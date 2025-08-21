// ==============================================
// PUBLIC PRODUCT CATALOG COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { usePublicStore } from '../../contexts/PublicStoreContext';
import { PublicProductCard } from './PublicProductCard';
import { GuestInfoModal } from './GuestInfoModal';
import { StoreItem } from '../../types/store';

interface PublicProductCatalogProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PublicProductCatalog: React.FC<PublicProductCatalogProps> = ({ showToast }) => {
  const {
    state,
    loadProducts,
    loadCategories,
    addToCart,
    createGuestCart,
    getFilteredProducts,
    getCartItemCount,
    setSearchQuery: setContextSearchQuery,
    setSelectedCategory: setContextSelectedCategory,
    setSortBy: setContextSortBy,
    setSortOrder: setContextSortOrder
  } = usePublicStore();

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ==============================================
  // EFFECTS
  // ==============================================

  // Load data only once on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []); // Empty dependency array to run only once

  // ==============================================
  // HANDLERS
  // ==============================================

  const handleAddToCart = async (itemId: number, quantity: number) => {
    try {
      await addToCart(itemId, quantity);
      showToast(`Added ${quantity} item(s) to cart`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add item to cart', 'error');
    }
  };

  const handleViewDetails = (product: StoreItem) => {
    // This will be handled by the context's setSelectedProduct method
    // For now, we'll just show a toast
    showToast(`Viewing details for ${product.name}`, 'info');
  };

  const handleShowGuestModal = () => {
    setShowGuestModal(true);
  };

  const handleGuestSubmit = async (guestData: { guest_email: string; guest_name: string; guest_phone?: string }) => {
    try {
      await createGuestCart(guestData);
      setShowGuestModal(false);
      showToast('Guest cart created successfully! You can now add items to cart.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create guest cart', 'error');
      throw error;
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setContextSelectedCategory(categoryId);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setContextSearchQuery(value);
  };

  const handleSortChange = (value: 'name' | 'price' | 'newest') => {
    setSortBy(value);
    setContextSortBy(value);
  };

  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    setSortOrder(value);
    setContextSortOrder(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSortBy('name');
    setSortOrder('asc');
    setContextSearchQuery('');
    setContextSelectedCategory(null);
    setContextSortBy('name');
    setContextSortOrder('asc');
  };

  // ==============================================
  // COMPUTED VALUES
  // ==============================================

  // Get filtered products from context
  const filteredProducts = getFilteredProducts();
  const cartItemCount = getCartItemCount();

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Our Products</h2>
          <p className="text-gray-300">Discover our amazing collection of fitness products</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Cart Items</p>
            <p className="text-lg font-bold text-blue-400">{cartItemCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 rounded-2xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Products</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, description, or category..."
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-400 transition-colors"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-white focus:border-blue-400 transition-colors"
            >
              <option value="">All Categories</option>
              {state.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'name' | 'price' | 'newest')}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-white focus:border-blue-400 transition-colors"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-white focus:border-blue-400 transition-colors"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {state.isProductsLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading products...</p>
          </div>
        </div>
      ) : state.productsError ? (
        <div className="glass-card p-8 rounded-2xl border border-red-500/30 text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-3xl mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Products</h3>
          <p className="text-gray-300 mb-4">{state.productsError}</p>
          <button
            onClick={() => loadProducts()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : !filteredProducts || filteredProducts.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-gray-700 text-center">
          <i className="fas fa-search text-gray-400 text-3xl mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
          <p className="text-gray-300 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <PublicProductCard
              key={product.id}
              product={product}
              onShowGuestInfo={handleShowGuestModal}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredProducts && filteredProducts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Showing {filteredProducts.length} of {state.products.length} products
          </p>
        </div>
      )}

      {/* Guest Modal */}
      <GuestInfoModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSuccess={handleGuestSubmit}
      />
    </div>
  );
};

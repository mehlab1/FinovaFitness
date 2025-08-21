// ==============================================
// PRODUCT CATALOG COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StoreComponentProps, StoreItem } from '../../types/store';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductDetailsModal } from './ProductDetailsModal';

interface ProductCatalogProps extends StoreComponentProps {
  onCheckout: () => void;
  cartId: number | null;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  showToast, 
  onCheckout, 
  cartId 
}) => {
  const {
    state,
    filters,
    setFilters,
    fetchProducts,
    getFilteredProducts,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    cartItemCount,
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<StoreItem | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==============================================
  // INITIAL DATA LOADING
  // ==============================================

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        await fetchProducts();
      } catch (error) {
        showToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Only load products if they haven't been loaded yet
    if (state.products.length === 0 && !state.loading) {
      loadProducts();
    }
  }, []); // Empty dependency array to run only once

  // ==============================================
  // FILTER HANDLERS
  // ==============================================

  const handleSearchChange = (searchTerm: string) => {
    setFilters({ searchTerm });
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setFilters({ selectedCategory: categoryId });
  };

  const handleSortChange = (sortBy: 'name' | 'price' | 'price_desc' | 'newest') => {
    setFilters({ sortBy });
  };

  const handlePriceRangeChange = (priceRange: [number, number]) => {
    setFilters({ priceRange });
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategory: null,
      sortBy: 'name',
      priceRange: [0, 1000],
    });
  };

  // ==============================================
  // PRODUCT ACTIONS
  // ==============================================

  const handleAddToCart = async (product: StoreItem, quantity: number = 1) => {
    if (!cartId) {
      showToast('Cart not initialized', 'error');
      return;
    }

    try {
      await addToCart(cartId, product, quantity);
      showToast(`${product.name} added to cart`, 'success');
    } catch (error) {
      showToast('Failed to add item to cart', 'error');
    }
  };

  const handleAddToWishlist = async (productId: number) => {
    try {
      await addToWishlist(productId);
      showToast('Added to wishlist', 'success');
    } catch (error) {
      showToast('Failed to add to wishlist', 'error');
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      showToast('Removed from wishlist', 'success');
    } catch (error) {
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleViewProduct = (product: StoreItem) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // ==============================================
  // COMPUTED VALUES
  // ==============================================

  const filteredProducts = getFilteredProducts();
  const hasActiveFilters = filters.searchTerm || filters.selectedCategory || filters.sortBy !== 'name' || filters.priceRange[1] !== 1000;

  // ==============================================
  // RENDER LOADING STATE
  // ==============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  // ==============================================
  // RENDER ERROR STATE
  // ==============================================

  if (state.error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-2xl text-red-400"></i>
        </div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Products</h3>
        <p className="text-gray-300 mb-4">{state.error}</p>
        <button
          onClick={() => fetchProducts(undefined, true)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Cart Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Product Catalog</h2>
          <p className="text-gray-300">
            {filteredProducts.length} products available
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onCheckout}
            disabled={cartItemCount === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Checkout ({cartItemCount})</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        categories={state.categories}
        filters={filters}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onPriceRangeChange={handlePriceRangeChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-search text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Products Found</h3>
          <p className="text-gray-300 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms'
              : 'No products are currently available'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              onViewDetails={handleViewProduct}
              isInWishlist={isInWishlist(product.id)}
            />
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && showProductModal && (
        <ProductDetailsModal
          product={selectedProduct}
          isInWishlist={isInWishlist(selectedProduct.id)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

// ==============================================
// PRODUCT FILTERS COMPONENT
// ==============================================

import React, { useState } from 'react';
import { StoreCategory, FilterState } from '../../types/store';

interface ProductFiltersProps {
  categories: StoreCategory[];
  filters: FilterState;
  onSearchChange: (searchTerm: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onSortChange: (sortBy: 'name' | 'price' | 'price_desc' | 'newest') => void;
  onPriceRangeChange: (priceRange: [number, number]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onPriceRangeChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ==============================================
  // PRICE RANGE SLIDER
  // ==============================================

  const handlePriceRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    const isMin = event.target.name === 'minPrice';
    
    if (isMin) {
      onPriceRangeChange([value, filters.priceRange[1]]);
    } else {
      onPriceRangeChange([filters.priceRange[0], value]);
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <i className="fas fa-filter mr-2 text-green-400"></i>
          Filters
        </h3>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
            >
              <i className="fas fa-times text-xs"></i>
              <span>Clear All</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-white`}></i>
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`space-y-6 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            <i className="fas fa-search mr-2 text-green-400"></i>
            Search Products
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white placeholder-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            <i className="fas fa-tags mr-2 text-green-400"></i>
            Category
          </label>
          <select
            value={filters.selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            <i className="fas fa-sort mr-2 text-green-400"></i>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            <i className="fas fa-dollar-sign mr-2 text-green-400"></i>
            Price Range
          </label>
          
          <div className="space-y-4">
            {/* Price Range Slider */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={handlePriceRangeChange}
                name="maxPrice"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                <span>$0</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.priceRange[0]}
                  onChange={handlePriceRangeChange}
                  min="0"
                  max={filters.priceRange[1]}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.priceRange[1]}
                  onChange={handlePriceRangeChange}
                  min={filters.priceRange[0]}
                  max="1000"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-colors text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Price Presets */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Quick Price Ranges</label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Under $50', range: [0, 50] },
              { label: '$50 - $100', range: [50, 100] },
              { label: '$100 - $200', range: [100, 200] },
              { label: 'Over $200', range: [200, 1000] },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => onPriceRangeChange(preset.range as [number, number])}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filters.priceRange[0] === preset.range[0] && filters.priceRange[1] === preset.range[1]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-600">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg">
                  Search: "{filters.searchTerm}"
                </span>
              )}
              {filters.selectedCategory && (
                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">
                  Category: {categories.find(c => c.id === filters.selectedCategory)?.name}
                </span>
              )}
              {filters.sortBy !== 'name' && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg">
                  Sort: {filters.sortBy === 'price' ? 'Price (Low to High)' : 
                         filters.sortBy === 'price_desc' ? 'Price (High to Low)' : 'Newest First'}
                </span>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-lg">
                  Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsed Summary */}
      {!isExpanded && hasActiveFilters && (
        <div className="pt-4 border-t border-gray-600">
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg">
                Search: "{filters.searchTerm}"
              </span>
            )}
            {filters.selectedCategory && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">
                {categories.find(c => c.id === filters.selectedCategory)?.name}
              </span>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-lg">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ChevronDown, Star, Package } from 'lucide-react';
import GearPriceControl from './GearPriceControl';

export interface FilterState {
  sortBy: string;
  priceRange: [number, number];
  selectedBrands: string[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  showFeaturedOnly: boolean;
  hasDiscount: boolean;
}

export interface FilterBrand {
  _id: string;
  name: string;
  image?: string;
}

export interface FilterCategory {
  _id: string;
  name: string;
  value: string;
}

export interface FilterSubcategory {
  _id: string;
  name: string;
  value: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  brands: FilterBrand[];
  categories: FilterCategory[];
  subcategories: FilterSubcategory[];
  maxPrice?: number;
  showSubcategories?: boolean;
  showCategories?: boolean;
  className?: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  brands,
  categories,
  subcategories,
  maxPrice = 50000,
  showSubcategories = true,
  showCategories = false,
  className = ''
}) => {
  const [minPriceInput, setMinPriceInput] = useState(filters.priceRange[0].toString());
  const [maxPriceInput, setMaxPriceInput] = useState(filters.priceRange[1].toString());
  const [priceControlMode, setPriceControlMode] = useState<'preset' | 'manual' | 'gear'>('preset');

  // Update input values when filters change externally
  useEffect(() => {
    setMinPriceInput(filters.priceRange[0].toString());
    setMaxPriceInput(filters.priceRange[1].toString());
  }, [filters.priceRange]);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: 'newest',
      priceRange: [0, maxPrice],
      selectedBrands: [],
      selectedCategories: [],
      selectedSubcategories: [],
      showFeaturedOnly: false,
      hasDiscount: false
    });
    setPriceControlMode('preset');
  };

  const handleCustomPriceChange = () => {
    const minVal = Math.max(0, parseInt(minPriceInput) || 0);
    const maxVal = Math.max(minVal, parseInt(maxPriceInput) || maxPrice);

    updateFilters({
      priceRange: [minVal, maxVal]
    });
  };

  const handlePricePreset = (min: number, max: number) => {
    updateFilters({ priceRange: [min, max] });
    setPriceControlMode('preset');
  };

  const handleGearPriceChange = (min: number, max: number) => {
    updateFilters({ priceRange: [min, max] });
  };

  const hasActiveFilters =
    filters.selectedBrands.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.selectedSubcategories.length > 0 ||
    filters.showFeaturedOnly ||
    filters.hasDiscount ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  // Price preset options
  const pricePresets = [
    { label: 'Under LE 1,000', min: 0, max: 1000 },
    { label: 'LE 1,000 - LE 5,000', min: 1000, max: 5000 },
    { label: 'LE 5,000 - LE 10,000', min: 5000, max: 10000 },
    { label: 'LE 10,000 - LE 25,000', min: 10000, max: 25000 },
    { label: 'Above LE 25,000', min: 25000, max: maxPrice }
  ];

  return (
    <div className={`bg-white dark:bg-secondary-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500 ${className}`}>
      {/* Filter Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:text-primary-dark font-black uppercase tracking-widest transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Sort By */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
            Sort By
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="w-full px-4 py-3 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm font-bold transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="featured">Featured</option>
              <option value="name">A to Z</option>
              <option value="discount">Best Discount</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
            Preferences
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.showFeaturedOnly}
                onChange={(e) => updateFilters({ showFeaturedOnly: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary dark:bg-gray-800 transition-all"
              />
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Featured Only</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasDiscount}
                onChange={(e) => updateFilters({ hasDiscount: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary dark:bg-gray-800 transition-all"
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">On Sale</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              Price range
            </label>
            <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setPriceControlMode('preset')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${priceControlMode === 'preset' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Preset
              </button>
              <button
                onClick={() => setPriceControlMode('gear')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${priceControlMode === 'gear' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Gear
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-sm font-black text-primary tracking-tight">
              LE {filters.priceRange[0].toLocaleString()} — LE {filters.priceRange[1].toLocaleString()}
            </span>
          </div>

          {priceControlMode === 'gear' && (
            <GearPriceControl
              minValue={0}
              maxValue={maxPrice}
              currentMin={filters.priceRange[0]}
              currentMax={filters.priceRange[1]}
              onChange={handleGearPriceChange}
              className="mb-6"
            />
          )}

          {priceControlMode === 'preset' && (
            <div className="space-y-2">
              {pricePresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePricePreset(preset.min, preset.max)}
                  className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filters.priceRange[0] === preset.min && filters.priceRange[1] === preset.max
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary transition-all'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setPriceControlMode('manual')}
                className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-t border-dashed border-gray-200 dark:border-gray-700 mt-2 hover:text-primary transition-colors"
              >
                Custom Range
              </button>
            </div>
          )}

          {priceControlMode === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min</span>
                  <input
                    type="number"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max</span>
                  <input
                    type="number"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomPriceChange}
                className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Apply Custom
              </button>
            </div>
          )}
        </div>

        {/* Brands */}
        {brands.length > 0 && (
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
              Featured Brands
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {brands.map(brand => (
                <label key={brand._id} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                  <input
                    type="checkbox"
                    checked={filters.selectedBrands.includes(brand._id)}
                    onChange={(e) => {
                      const newBrands = e.target.checked
                        ? [...filters.selectedBrands, brand._id]
                        : filters.selectedBrands.filter(id => id !== brand._id);
                      updateFilters({ selectedBrands: newBrands });
                    }}
                    className="w-5 h-5 text-primary border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary dark:bg-gray-800 transition-all"
                  />
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      {brand.image ? (
                        <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Package className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors truncate">
                      {brand.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {showCategories && categories.length > 0 && (
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
              Collections
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(category => (
                <label key={category._id} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                  <input
                    type="checkbox"
                    checked={filters.selectedCategories.includes(category.name)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...filters.selectedCategories, category.name]
                        : filters.selectedCategories.filter(name => name !== category.name);
                      updateFilters({ selectedCategories: newCategories });
                    }}
                    className="w-5 h-5 text-primary border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary dark:bg-gray-800 transition-all"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        {showSubcategories && subcategories.length > 0 && (
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
              Subcategories
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {subcategories.map(subcategory => (
                <label key={subcategory._id} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                  <input
                    type="checkbox"
                    checked={filters.selectedSubcategories.includes(subcategory._id)}
                    onChange={(e) => {
                      const newSubcategories = e.target.checked
                        ? [...filters.selectedSubcategories, subcategory._id]
                        : filters.selectedSubcategories.filter(id => id !== subcategory._id);
                      updateFilters({ selectedSubcategories: newSubcategories });
                    }}
                    className="w-5 h-5 text-primary border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary dark:bg-gray-800 transition-all"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                    {subcategory.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
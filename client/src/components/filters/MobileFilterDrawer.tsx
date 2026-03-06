// components/filters/MobileFilterDrawer.tsx
import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';
import ProductFilters, { FilterState, FilterBrand, FilterCategory, FilterSubcategory } from './ProductFilters';

interface MobileFilterDrawerProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  brands: FilterBrand[];
  categories: FilterCategory[];
  subcategories: FilterSubcategory[];
  maxPrice?: number;
  showSubcategories?: boolean;
  showCategories?: boolean;
  totalResults: number;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  filters,
  onFiltersChange,
  brands,
  categories,
  subcategories,
  maxPrice = 500000,
  showSubcategories = true,
  showCategories = false,
  totalResults
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.selectedBrands.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.selectedSubcategories.length > 0 ||
    filters.showFeaturedOnly ||
    filters.hasDiscount ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  const activeFilterCount =
    filters.selectedBrands.length +
    filters.selectedCategories.length +
    filters.selectedSubcategories.length +
    (filters.showFeaturedOnly ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  const handleApplyFilters = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Filter Sidebar Tab - Always visible on mobile */}
      <div className="lg:hidden">
        {/* Filter Tab */}
        <div
          className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-2'
            }`}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-white p-3 rounded-r-2xl shadow-xl hover:bg-primary-dark transition-all duration-300 flex items-center space-x-2 min-w-[120px] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <div className="relative">
              <Filter className="w-5 h-5" />
              {hasActiveFilters && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs font-bold text-white">
                    {activeFilterCount > 9 ? '9+' : activeFilterCount}
                  </span>
                </div>
              )}
            </div>
            <div className="text-left relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Refine</div>
              <div className="text-sm font-black uppercase tracking-tight">Filters</div>
            </div>
          </button>
        </div>

        {/* Drawer */}
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className={`absolute left-0 top-0 h-full w-full max-w-[320px] bg-white dark:bg-secondary-dark shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-secondary-dark">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Filter className="w-5 h-5 text-primary" />
                  </div>
                  <span>Filters</span>
                </h2>
                {hasActiveFilters && (
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">
                    {activeFilterCount} Active Refinements
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="h-full overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <ProductFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
                brands={brands}
                categories={categories}
                subcategories={subcategories}
                maxPrice={maxPrice}
                showSubcategories={showSubcategories}
                showCategories={showCategories}
                className="border-0 shadow-none rounded-none"
              />
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-secondary-dark border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="flex space-x-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      onFiltersChange({
                        sortBy: 'newest',
                        priceRange: [0, maxPrice],
                        selectedBrands: [],
                        selectedCategories: [],
                        selectedSubcategories: [],
                        showFeaturedOnly: false,
                        hasDiscount: false
                      });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={handleApplyFilters}
                  className={`${hasActiveFilters ? 'flex-1' : 'w-full'} bg-primary text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all flex items-center justify-center space-x-3 shadow-xl shadow-primary/20`}
                >
                  <span>See Results</span>
                  <div className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">
                    {totalResults}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default MobileFilterDrawer;




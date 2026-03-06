// client/src/pages/ProductsPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/common/Pagination';
import SkeletonLoader from '../components/common/SkeletonLoader';
import ProductFilters, { FilterState } from '../components/filters/ProductFilters';
import MobileFilterDrawer from '../components/filters/MobileFilterDrawer';
import { useProductFilters } from '../components/filters/useProductFilters';

import { useAllProductsQuery } from '../redux/api/product.api';
import { addToCart } from '../redux/reducers/cart.reducer';
import { Product } from '../types/api-types';
import { Grid, List, Package, ShoppingCart, Star } from 'lucide-react';
import { useConstants } from '../hooks/useConstants';

// Brand display component
const BrandDisplay: React.FC<{ brand: any; isCompact?: boolean }> = ({ brand, isCompact = false }) => {
  if (!brand) return null;

  const brandName = typeof brand === 'object' ? brand.name : brand;
  const brandImage = typeof brand === 'object' ? brand.image : null;

  return (
    <div className="flex items-center gap-1 mb-1">
      {brandImage && (
        <img
          src={brandImage}
          alt={brandName}
          className={`rounded object-cover ${isCompact ? 'w-4 h-4' : 'w-6 h-6'}`}
        />
      )}
      <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">
        {brandName}
      </span>
    </div>
  );
};

// Centralized price calculation utility
const calculateFinalPrice = (product: Product) => {
  const hasDiscount = product.discount && product.discount > 0;
  return product.netPrice ||
    (hasDiscount ? product.price - (product.price * product.discount / 100) : product.price);
};

// Enhanced price display component
const PriceDisplay: React.FC<{
  product: Product;
  currencySymbol: string;
  isCompact?: boolean;
}> = ({ product, currencySymbol, isCompact = false }) => {
  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = calculateFinalPrice(product);

  if (hasDiscount) {
    return (
      <div className="space-y-1">
        {/* Discount Badge - Only show if not compact */}
        {!isCompact && (
          <div className="flex items-center gap-1">
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              -{product.discount}% OFF
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className={`font-bold text-red-600 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {currencySymbol} {finalPrice.toLocaleString()}
          </span>
          <span className={`text-gray-500 line-through ${isCompact ? 'text-sm' : 'text-base'}`}>
            {currencySymbol} {product.price.toLocaleString()}
          </span>
        </div>

        {/* Discount percentage in compact mode */}
        {isCompact && (
          <div className="text-xs text-red-600 font-medium">
            Save {product.discount}%
          </div>
        )}
      </div>
    );
  }

  // No discount - show regular price
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-primary ${isCompact ? 'text-lg' : 'text-xl'}`}>
        {currencySymbol} {finalPrice.toLocaleString()}
      </span>
    </div>
  );
};

// Utility function to get category string (moved outside component to avoid recreation)

// Utility function to truncate text (moved outside component to avoid recreation)
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currencySymbol } = useConstants();

  const [currentPage] = useState(1);
  const [selectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy] = useState<{ id: string; desc: boolean }>({ id: 'createdAt', desc: true });

  const limit = selectedCategory ? 1000 : 50; // Fetch all products for selected category

  // Fetch products with updated query
  const { data, isLoading, isError } = useAllProductsQuery({
    page: selectedCategory ? 1 : currentPage, // Always page 1 when category is selected
    limit,
    sortBy,
    category: selectedCategory || undefined, // Pass category to API if selected
  });

  const products = data?.products || [];

  // Extract unique brands and categories for filters
  const filterData = useMemo(() => {
    const uniqueBrands = Array.from(
      new Map(
        products
          .map(p => typeof p.brand === 'object' ? p.brand : { _id: p.brand, name: p.brand })
          .map(brand => [brand._id, brand])
      ).values()
    );

    const uniqueCategories = Array.from(
      new Map(
        products
          .map(p => typeof p.category === 'object' ? p.category : { _id: p.category, name: p.category, value: p.category })
          .map(cat => [cat._id, cat])
      ).values()
    );

    return {
      brands: uniqueBrands,
      categories: uniqueCategories,
      subcategories: [] // Add subcategories if your products have them
    };
  }, [products]);

  // Initialize filters
  const initialFilters: Partial<FilterState> = {
    selectedCategories: selectedCategory ? [selectedCategory] : [],
  };

  // Use the filter hook
  const {
    filters,
    paginatedProducts,
    currentPage: filterCurrentPage,
    totalPages: filterTotalPages,
    handleFiltersChange,
    handlePageChange: filterHandlePageChange,
    totalResults,
    maxPrice
  } = useProductFilters({
    products,
    brands: filterData.brands,
    categories: filterData.categories,
    subcategories: filterData.subcategories,
    initialFilters,
    maxPrice: 50000
  });

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.selectedCategories.length > 0) {
      params.set('category', filters.selectedCategories[0]);
    }
    if (filterCurrentPage > 1) {
      params.set('page', filterCurrentPage.toString());
    }

    setSearchParams(params);
  }, [filters.selectedCategories, filterCurrentPage, setSearchParams]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    const newFilters = {
      ...filters,
      selectedCategories: category ? [category] : []
    };
    handleFiltersChange(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    filterHandlePageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to cart handler - using centralized price calculation
  const handleAddToCart = useCallback((product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const finalPrice = calculateFinalPrice(product);

    const cartItemData = {
      productId: product._id,
      name: product.name,
      price: finalPrice,
      quantity: 1,
      stock: product.stock,
      photo: product.photos[0] || 'https://via.placeholder.com/300x300?text=No+Image',
      brand: typeof product.brand === 'object' ? product.brand : { _id: '', name: product.brand },
    };
    dispatch(addToCart(cartItemData));
  }, [dispatch]);

  // Navigate to product details
  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-lg font-medium text-red-600">Error loading products</div>
          <div className="text-gray-500 mt-2">Please try again later</div>
        </div>
      </div>
    );
  }

  const displayProducts = paginatedProducts;
  const selectedCategoryName = filters.selectedCategories.length > 0 ? filters.selectedCategories[0] : '';

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedCategoryName
              ? `${selectedCategoryName.charAt(0).toUpperCase() + selectedCategoryName.slice(1)} Products`
              : 'All Products'
            }
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedCategoryName
              ? `Discover our ${selectedCategoryName} collection`
              : 'Discover our complete product collection'
            }
          </p>
        </div>

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          filters={filters}
          onFiltersChange={handleFiltersChange}
          brands={filterData.brands}
          categories={filterData.categories}
          subcategories={filterData.subcategories}
          maxPrice={maxPrice}
          showSubcategories={false}
          showCategories={true}
          totalResults={totalResults}
        />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              brands={filterData.brands}
              categories={filterData.categories}
              subcategories={filterData.subcategories}
              maxPrice={maxPrice}
              showSubcategories={false}
              showCategories={true}
            />
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {totalResults} product{totalResults !== 1 ? 's' : ''} found
                  {selectedCategoryName && ` in ${selectedCategoryName}`}
                </div>
                {selectedCategoryName && (
                  <div className="text-xs text-primary bg-primary/5 px-2 py-1 rounded">
                    Showing all {selectedCategoryName} products
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors duration-200 ${viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors duration-200 ${viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {displayProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {selectedCategoryName
                    ? `No products found in ${selectedCategoryName}`
                    : 'No products available'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedCategoryName
                    ? 'Try adjusting your filters or selecting a different category'
                    : 'Check back later for new arrivals'
                  }
                </p>
                {selectedCategoryName && (
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg shadow-primary/20"
                  >
                    <span>View All Products</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Conditional Rendering based on view mode */}
                {viewMode === 'grid' ? (
                  // Grid View - Use existing ProductCard component
                  <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {displayProducts.map((product: Product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  // List View - Using centralized currency symbol
                  <div className="space-y-4">
                    {displayProducts.map((product: Product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-primary transition-all group flex gap-4 p-4"
                      >
                        {/* Product Image */}
                        <div className="relative bg-gray-100 w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={product.photos[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {/* Discount Badge */}
                            {product.discount && product.discount > 0 && (
                              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                -{product.discount}% OFF
                              </div>
                            )}
                            {product.featured && (
                              <div className="bg-primary text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                              </div>
                            )}
                            {product.stock === 0 && (
                              <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Out of Stock
                              </div>
                            )}
                            {product.stock > 0 && product.stock <= 5 && (
                              <div className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Low Stock
                              </div>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          {product.stock > 0 && (
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              className="absolute bottom-2 right-2 w-8 h-8 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          {/* Brand */}
                          <BrandDisplay brand={product.brand} isCompact={true} />

                          {/* Product Name */}
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-200 leading-tight">
                            {truncateText(product.name, 80)}
                          </h3>

                          {/* Description with WYSIWYG support */}
                          {product.description && (
                            <div
                              className="wysiwyg-content prose prose-sm max-w-none text-sm text-gray-600 mb-3 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: truncateText(product.description, 360)
                              }}
                              style={{
                                fontFamily: 'inherit',
                                lineHeight: '1.6',
                                color: '#4B5563'
                              }}
                            />
                          )}

                          {/* Price and Stock Info */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              {/* Enhanced Price Display - Now using centralized currency */}
                              <PriceDisplay
                                product={product}
                                currencySymbol={currencySymbol}
                                isCompact={false}
                              />

                              {product.stock > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {product.stock > 10 ? 'In Stock' : `${product.stock} left`}
                                </div>
                              )}
                            </div>

                            {/* Category Tag */}
                            {product.category && (
                              <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                                {typeof product.category === 'object'
                                  ? product.category.name
                                  : product.category
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filterTotalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={filterCurrentPage}
                      totalPages={filterTotalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
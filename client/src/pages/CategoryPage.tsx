import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementCartItem, decrementCartItem } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { ShoppingCart, Plus, Minus, AlertCircle } from 'lucide-react';

import React, { useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAllCategoriesQuery } from '../redux/api/category.api';
import { useGetSubcategoriesByCategoryQuery } from '../redux/api/subcategory.api';
import { useLatestProductsQuery } from '../redux/api/product.api';
import { useGetBrandsForDropdownQuery } from '../redux/api/brand.api';
import { Product } from '../types/api-types';
import Loader from '../components/common/Loader';
import ProductFilters, { } from '../components/filters/ProductFilters';
import MobileFilterDrawer from '../components/filters/MobileFilterDrawer';
import { useProductFilters } from '../components/filters/useProductFilters';

const CategoryPage: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{
    categorySlug: string;
    subcategorySlug?: string;
  }>();


  const productsPerPage = 12;

  // Fetch data
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: productsData, isLoading: productsLoading } = useLatestProductsQuery({ limit: 500 });
  const { data: brandsData, isLoading: brandsLoading } = useGetBrandsForDropdownQuery();

  const categories = categoriesData?.categories || [];
  const allProducts = productsData?.products || [];
  const brands = brandsData?.brands || [];

  // Cart functionality
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems) || [];
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handleAddToCart = useCallback((event: React.MouseEvent, product: Product) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.stock === 0) return;

    const cartItemData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      photo: product.photos[0] || '/placeholder-product.jpg',
      brand: typeof product.brand === 'object' ? product.brand : { _id: '', name: product.brand },
    };
    dispatch(addToCart(cartItemData));
  }, [dispatch]);

  const handleIncrement = useCallback((event: React.MouseEvent, product: Product) => {
    event.preventDefault();
    event.stopPropagation();
    const cartItem = safeCartItems.find(item => item.productId === product._id);
    if (cartItem && cartItem.quantity < product.stock) {
      dispatch(incrementCartItem(product._id));
    }
  }, [safeCartItems, dispatch]);

  const handleDecrement = useCallback((event: React.MouseEvent, productId: string) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(decrementCartItem(productId));
  }, [dispatch]);

  // Helper function to create consistent slugs
  const createSlug = (text: string): string => {
    return text.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Find current category
  const currentCategory = useMemo(() => {
    if (!categorySlug || !categories.length) return null;

    return categories.find(cat => {
      const nameSlug = createSlug(cat.name);
      const valueSlug = createSlug(cat.value);
      return nameSlug === categorySlug || valueSlug === categorySlug;
    });
  }, [categories, categorySlug]);

  // Fetch subcategories if we have a category
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useGetSubcategoriesByCategoryQuery(
    currentCategory?._id || '',
    { skip: !currentCategory?._id }
  );

  const subcategories = subcategoriesData?.subcategories || [];

  // Find current subcategory if subcategorySlug exists
  const currentSubcategory = useMemo(() => {
    if (!subcategorySlug || !subcategories.length) return null;

    return subcategories.find(subcat => {
      const nameSlug = createSlug(subcat.name);
      const valueSlug = createSlug(subcat.value);
      return nameSlug === subcategorySlug || valueSlug === subcategorySlug;
    });
  }, [subcategories, subcategorySlug]);

  // Filter products based on category/subcategory
  const categoryProducts = useMemo(() => {
    if (!allProducts.length) return [];

    // If we have a specific subcategory, filter by that subcategory only
    if (currentSubcategory) {
      return allProducts.filter(product => {
        if (Array.isArray(product.subcategories)) {
          return product.subcategories.some(subcat =>
            typeof subcat === 'object'
              ? subcat._id === currentSubcategory._id
              : subcat === currentSubcategory._id
          );
        }
        if (product.subcategory) {
          const productSubcat = typeof product.subcategory === 'object'
            ? product.subcategory.name || product.subcategory.value
            : product.subcategory;
          return productSubcat.toLowerCase().includes(currentSubcategory.name.toLowerCase()) ||
            productSubcat.toLowerCase().includes(currentSubcategory.value.toLowerCase());
        }
        return false;
      });
    }

    // If we only have a category, show all products from that category
    if (currentCategory) {
      return allProducts.filter(product => {
        // Check if product has categories array
        if (Array.isArray(product.categories)) {
          return product.categories.some(cat =>
            typeof cat === 'object'
              ? cat._id === currentCategory._id
              : cat === currentCategory._id
          );
        }
        // Fallback to single category string match
        if (product.category) {
          const productCat = typeof product.category === 'object'
            ? product.category.name || product.category.value
            : product.category;
          return productCat.toLowerCase().includes(currentCategory.name.toLowerCase()) ||
            productCat.toLowerCase().includes(currentCategory.value.toLowerCase());
        }
        return false;
      });
    }

    return [];
  }, [allProducts, currentCategory, currentSubcategory]);

  // Calculate max price from category products
  const maxPrice = useMemo(() => {
    if (categoryProducts.length === 0) return 50000;
    return Math.ceil(Math.max(...categoryProducts.map(p => p.price)) / 1000) * 1000;
  }, [categoryProducts]);

  // Use the new filter system
  const {
    filters,
    paginatedProducts,
    currentPage: filterCurrentPage,
    totalPages,
    handleFiltersChange,
    handlePageChange,
    totalResults
  } = useProductFilters({
    products: categoryProducts,
    brands: brands.map(brand => ({
      _id: brand._id,
      name: brand.name,
      image: brand.image // FIXED: Include image property
    })),
    categories: categories.map(cat => ({ _id: cat._id, name: cat.name, value: cat.value })),
    subcategories: subcategories.map(sub => ({ _id: sub._id, name: sub.name, value: sub.value })),
    maxPrice,
    initialFilters: {
      // If viewing a specific subcategory, pre-select it
      selectedSubcategories: currentSubcategory ? [currentSubcategory._id] : [],
    }
  });

  // Loading state
  if (categoriesLoading || productsLoading || subcategoriesLoading || brandsLoading) {
    return <Loader />;
  }

  // Category not found
  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-secondary-dark flex items-center justify-center transition-colors">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Category Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">The category you're looking for doesn't exist or may have been moved.</p>
          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-secondary-dark transition-colors duration-300">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/" className="hover:text-primary transition-colors">Collections</Link>
              <span>/</span>
              <Link to={`/category/${categorySlug}`} className="hover:text-primary transition-colors">
                {currentCategory.name}
              </Link>
              {currentSubcategory && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 dark:text-white font-bold">{currentSubcategory.name}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        <div
          className="relative w-full h-72 md:h-80 lg:h-96 bg-gray-200 dark:bg-gray-800 bg-center bg-cover"
          style={{
            backgroundImage: `url(${currentSubcategory?.image || currentCategory?.image || 'https://via.placeholder.com/1920x600?text=Category+Banner'})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight drop-shadow-lg">
                {currentSubcategory?.name || currentCategory.name}
              </h1>
              <p className="text-lg md:text-xl font-medium max-w-2xl opacity-90 drop-shadow-md">
                {currentSubcategory?.description || currentCategory?.description ||
                  `Discover our premium ${(currentSubcategory?.name || currentCategory.name).toLowerCase()} collection`}
              </p>
            </div>
          </div>
        </div>

        {/* Subcategories Quick Access - Only show when viewing main category */}
        {!subcategorySlug && subcategories.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Explore:</span>
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory._id}
                    to={`/category/${categorySlug}/${createSlug(subcategory.name)}`}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-all whitespace-nowrap border border-gray-100 dark:border-gray-700 hover:border-primary/30"
                  >
                    {subcategory.image && (
                      <img src={subcategory.image} alt={subcategory.name} className="w-7 h-7 rounded-lg object-cover" />
                    )}
                    <span>{subcategory.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0 sticky top-4 self-start">
              <div className="sticky top-4">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  brands={brands.map(brand => ({
                    _id: brand._id,
                    name: brand.name,
                    image: brand.image // FIXED: Include image property
                  }))}
                  categories={categories.map(cat => ({ _id: cat._id, name: cat.name, value: cat.value }))}
                  subcategories={subcategories.map(sub => ({ _id: sub._id, name: sub.name, value: sub.value }))}
                  maxPrice={maxPrice}
                  showSubcategories={subcategories.length > 0} // FIXED: Show when subcategories exist
                  showCategories={false} // Don't show categories in category page
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {totalResults} Products Found
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    Showing results {((filterCurrentPage - 1) * productsPerPage) + 1}–{Math.min(filterCurrentPage * productsPerPage, totalResults)}
                  </p>
                </div>
              </div>

              {/* Products Grid */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {paginatedProducts.map((product: Product) => {
                    const cartItem = safeCartItems.find(item => item.productId === product._id);
                    const isOutOfStock = product.stock === 0;

                    return (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 hover:border-primary/50 block"
                      >
                        <div className="aspect-square bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                          <img
                            src={product.photos[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-75' : ''
                              }`}
                          />
                          {product.featured && (
                            <div className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-lg">
                              FEATURED
                            </div>
                          )}
                          {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                              {product.stock} left
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                              SOLD OUT
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                          <div className="mb-4">
                            <span className="text-xl font-black text-primary">
                              LE {product.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Cart Section */}
                          <div className="space-y-3">
                            {cartItem && cartItem.quantity > 0 ? (
                              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl p-1.5 border border-gray-100 dark:border-gray-800">
                                <button
                                  onClick={(e) => handleDecrement(e, product._id)}
                                  className="w-9 h-9 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all duration-200 flex-shrink-0"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>

                                <span className="font-black text-gray-900 dark:text-white px-3 text-sm flex-shrink-0">{cartItem.quantity}</span>

                                <button
                                  onClick={(e) => handleIncrement(e, product)}
                                  disabled={cartItem.quantity >= product.stock}
                                  className="w-9 h-9 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={isOutOfStock}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-black tracking-tight transition-all ${isOutOfStock
                                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 active:scale-95'
                                  }`}
                              >
                                {isOutOfStock ? (
                                  <span className="text-xs sm:text-sm">Out of Stock</span>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm whitespace-nowrap">Add to Cart</span>
                                  </>
                                )}
                              </button>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-gray-100 dark:border-gray-700 group-hover:border-primary/30 transition-all">
                              View Details
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                    No products match your current filters. Try resetting or adjusting your selection.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(filterCurrentPage - 1, 1))}
                    disabled={filterCurrentPage === 1}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-all disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = filterCurrentPage <= 3 ? i + 1 : filterCurrentPage - 2 + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-11 h-11 rounded-xl text-sm font-black transition-all ${filterCurrentPage === pageNum
                          ? 'bg-primary text-white shadow-xl shadow-primary/30 active:scale-90'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(filterCurrentPage + 1, totalPages))}
                    disabled={filterCurrentPage === totalPages}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-all disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          filters={filters}
          onFiltersChange={handleFiltersChange}
          brands={brands.map(brand => ({
            _id: brand._id,
            name: brand.name,
            image: brand.image
          }))}
          categories={categories.map(cat => ({ _id: cat._id, name: cat.name, value: cat.value }))}
          subcategories={subcategories.map(sub => ({ _id: sub._id, name: sub.name, value: sub.value }))}
          maxPrice={maxPrice}
          showSubcategories={subcategories.length > 0} // FIXED: Show when subcategories exist
          showCategories={false}
          totalResults={totalResults}
        />
      </div>
    </>
  );
};

export default CategoryPage;
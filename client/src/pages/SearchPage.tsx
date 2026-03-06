import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Search,
  X,
  Grid,
  List,
  Star,
  ShoppingCart,
  Package,
  AlertCircle
} from 'lucide-react';
import { useSearchProductsQuery } from '../redux/api/product.api';
import { addToCart } from '../redux/reducers/cart.reducer';
import { Product } from '../types/api-types';
import Loader from '../components/common/Loader';
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
      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide">
        {brandName}
      </span>
    </div>
  );
};

// Enhanced price display component for product cards
const ProductCardPriceDisplay: React.FC<{
  originalPrice: number;
  netPrice?: number;
  discount?: number;
  currencySymbol?: string;
  isCompact?: boolean;
}> = ({ originalPrice, netPrice, discount = 0, currencySymbol = 'LE', isCompact = false }) => {
  const hasDiscount = discount > 0;
  const finalPrice = netPrice || (hasDiscount ? originalPrice - (originalPrice * discount / 100) : originalPrice);

  if (hasDiscount) {
    return (
      <div className="space-y-1">
        {!isCompact && (
          <div className="flex items-center gap-1">
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              -{discount}% OFF
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className={`font-black text-primary ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {currencySymbol} {finalPrice.toLocaleString()}
          </span>
          <span className={`text-gray-400 line-through ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {currencySymbol} {originalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-black text-primary ${isCompact ? 'text-lg' : 'text-xl'}`}>
        {currencySymbol} {finalPrice.toLocaleString()}
      </span>
    </div>
  );
};

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currencySymbol } = useConstants();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const {
    data: searchResults,
    isLoading,
    error,
    isFetching
  } = useSearchProductsQuery({
    search: searchQuery,
    page: currentPage,
    price: '',
    category: '',
    sort: '',
    brand: ''
  }, {
    skip: !searchQuery
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchQuery, currentPage, setSearchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleAddToCart = useCallback((product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const hasDiscount = product.discount && product.discount > 0;
    const finalPrice = product.netPrice ||
      (hasDiscount ? product.price - (product.price * product.discount / 100) : product.price);

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

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!searchResults || searchResults.totalPages <= 1) return null;

    const totalPages = searchResults.totalPages;
    const current = currentPage;
    const pages = [];

    pages.push(1);
    if (current > 4) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < totalPages - 3) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-all disabled:opacity-50"
        >
          Previous
        </button>

        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && handlePageChange(page)}
            disabled={page === '...'}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === current
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : page === '...'
                ? 'cursor-default dark:text-gray-600'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-all disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  if (!searchQuery) {
    return (
      <div className="min-h-screen bg-white dark:bg-secondary-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
              <Search className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search Catalog</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Discover our curated collection of professional products</p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full px-6 py-4 pl-14 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoFocus
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-6 py-4 pl-14 pr-14 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none shadow-sm"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {searchResults && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Package className="w-4 h-4" />
                <span className="font-bold">
                  {isLoading || isFetching ? 'Updating results...' : `${searchResults.totalProducts.toLocaleString()} matches found`}
                </span>
              </div>
              {searchResults.totalProducts > 0 && (
                <div className="text-gray-400 font-medium">
                  Showing results {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, searchResults.totalProducts)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Content */}
        {isLoading && currentPage === 1 ? (
          <div className="py-20 flex justify-center"><Loader /></div>
        ) : error ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Search Error</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">We encountered a problem fetching results. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              Retry Search
            </button>
          </div>
        ) : searchResults?.products && searchResults.products.length > 0 ? (
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/40 dark:bg-secondary-dark/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl" />
            )}

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {searchResults.products.map((product: Product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className={`bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/50 cursor-pointer group ${viewMode === 'list' ? 'flex gap-6 p-4' : 'overflow-hidden flex flex-col'}`}
                >
                  <div className={`relative bg-gray-50 dark:bg-gray-900 ${viewMode === 'list' ? 'w-40 h-40 rounded-xl' : 'aspect-square'} overflow-hidden flex-shrink-0`}>
                    <img
                      src={product.photos[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.discount && product.discount > 0 && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg">-{product.discount}%</div>
                      )}
                      {product.featured && (
                        <div className="bg-primary text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          FAV
                        </div>
                      )}
                    </div>
                    {product.stock > 0 && (
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl hover:bg-primary-dark"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className={`flex-1 ${viewMode === 'grid' ? 'p-5' : 'py-2 pr-4'}`}>
                    <BrandDisplay brand={product.brand} isCompact={true} />
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                      {product.name}
                    </h3>

                    {viewMode === 'list' && product.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                        {product.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}

                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <ProductCardPriceDisplay
                          originalPrice={product.price}
                          netPrice={product.netPrice}
                          discount={product.discount}
                          currencySymbol={product.currencySymbol || currencySymbol}
                          isCompact={viewMode === 'grid'}
                        />
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                          {product.stock > 0 ? (
                            <span className="text-primary">{product.stock <= 5 ? `Only ${product.stock} left` : 'Instock'}</span>
                          ) : (
                            <span className="text-red-500">Sold Out</span>
                          )}
                        </div>
                      </div>

                      {product.category && (
                        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-400 rounded-lg uppercase tracking-widest border border-gray-100 dark:border-gray-700">
                          {typeof product.category === 'object' ? product.category.name : product.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </div>
        ) : (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">We couldn't find anything matching "{searchQuery}"</p>
            <button
              onClick={() => handleSearchChange('')}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
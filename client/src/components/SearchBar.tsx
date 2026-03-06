import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ShoppingCart } from 'lucide-react';
import { useSearchProductsQuery } from '../redux/api/product.api';
import { Product } from '../types/api-types';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/reducers/cart.reducer';
import { useConstants } from '../hooks/useConstants';

interface HeaderSearchBarProps {
  className?: string;
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { currencySymbol } = useConstants();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const {
    data: searchResults,
    isLoading,
    error
  } = useSearchProductsQuery(
    {
      search: debouncedQuery,
      page: 1,
      price: '',
      category: '',
      sort: ''
    },
    {
      skip: !debouncedQuery || debouncedQuery.length < 2
    }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowResults(isSearchFocused && debouncedQuery.length >= 2);
  }, [isSearchFocused, debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setIsSearchFocused(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setShowResults(false);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setIsSearchFocused(false);
  };

  const handleAddToCart = useCallback((product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    const finalPrice = product.netPrice ?? product.price;
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`w-full ${className}`} ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className={`relative transition-all duration-300 ${isSearchFocused
          ? 'scale-[1.02] z-50'
          : ''
          }`}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search products..."
              className={`w-full h-11 pl-11 pr-24 text-sm 
                bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl
                transition-all duration-300 outline-none font-medium text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                ${isSearchFocused
                  ? 'border-primary dark:border-primary-light bg-white dark:bg-gray-800 ring-4 ring-primary/5 shadow-xl'
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            />

            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 
              transition-all duration-300 ${isSearchFocused ? 'text-primary scale-110' : 'text-gray-400'
              }`}>
              <Search className="w-4 h-4" />
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 
                  p-1 text-gray-400 hover:text-primary hover:bg-primary/5 
                  rounded-full transition-all duration-200 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 
                h-8 px-4 rounded-xl font-bold text-xs
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10
                ${searchQuery.trim()
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-secondary-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[450px] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Searching catalog...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl inline-block mb-3">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-red-500 dark:text-red-400 font-bold mb-1">Search Error</p>
                <p className="text-xs text-gray-500">Please try again in a moment.</p>
              </div>
            ) : searchResults?.products && searchResults.products.length > 0 ? (
              <div className="flex flex-col max-h-[450px]">
                <div className="bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {searchResults.totalProducts} Products Found
                  </p>
                  <button
                    onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                    className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-y-auto px-2 py-2 custom-scrollbar">
                  {searchResults.products.slice(0, 10).map((product: Product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="flex items-center p-3 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl cursor-pointer transition-all duration-200 group relative"
                    >
                      <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={product.photos[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-[8px] font-black uppercase">Out</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 ml-4 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs leading-tight mb-1 group-hover:text-primary transition-colors">
                          {truncateText(product.name, 45)}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-primary text-sm">
                            {currencySymbol}{product.price.toLocaleString()}
                          </span>
                          {product.stock > 0 && product.stock <= 5 && (
                            <span className="text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-md font-bold">
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </div>

                      {product.stock > 0 && (
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="ml-3 w-8 h-8 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg flex items-center justify-center transition-all shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-center">
                  <button
                    onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                    className="text-xs font-bold text-gray-500 hover:text-primary transition-all"
                  >
                    View more results for "{searchQuery}"
                  </button>
                </div>
              </div>
            ) : debouncedQuery.length >= 2 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Search className="w-8 h-8" />
                </div>
                <p className="text-gray-900 dark:text-white font-bold mb-1">No matches found</p>
                <p className="text-xs text-gray-500">Check for typos or try more general terms.</p>
              </div>
            ) : null}
          </div>
        )}
      </form>
    </div>
  );
};

export default HeaderSearchBar;
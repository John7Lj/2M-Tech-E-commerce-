import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementCartItem, decrementCartItem } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { Product } from '../types/api-types';
import { Eye, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useConstants } from '../hooks/useConstants';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.cartItems) || [];
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartItem = safeCartItems.find(item => item.productId === product._id);
  const { currencySymbol } = useConstants();

  const primaryImage = product.photos && product.photos.length > 0
    ? product.photos[0]
    : 'https://via.placeholder.com/300x300?text=No+Image';

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const hasDiscount = product.discount > 0;
  const discountPercentage = product.discount;
  const originalPrice = product.price;
  const finalPrice = product.netPrice || (originalPrice - (originalPrice * discountPercentage / 100));

  const getCategories = () => {
    if (!product.categories || product.categories.length === 0) return [];
    return product.categories.map(cat => {
      if (typeof cat === 'string') return cat;
      return (cat as any).name || (cat as any).value || '';
    }).filter(Boolean);
  };

  const getBrandName = () => {
    if (typeof product.brand === 'object') {
      return (product.brand as any).name;
    }
    return product.brand || '';
  };

  const handleAddToCart = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      const cartItemData = {
        productId: product._id,
        name: product.name,
        price: finalPrice,
        quantity: 1,
        stock: product.stock,
        photo: primaryImage,
        brand: typeof product.brand === 'object' ? product.brand : { _id: '', name: product.brand },
      };
      dispatch(addToCart(cartItemData));
      setIsAddingToCart(false);
    }, 300);
  }, [isOutOfStock, product, primaryImage, finalPrice, dispatch]);

  const handleIncrement = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (cartItem && cartItem.quantity < product.stock) {
      dispatch(incrementCartItem(product._id));
    }
  }, [cartItem, product.stock, product._id, dispatch]);

  const handleDecrement = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(decrementCartItem(product._id));
  }, [product._id, dispatch]);

  const handleNavigateToProduct = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('.quick-action-btn')) {
      return;
    }
    navigate(`/product/${product._id}`);
  }, [navigate, product._id]);

  const handleQuickView = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/product/${product._id}`);
  }, [navigate, product._id]);

  const categories = getCategories();
  const brandName = getBrandName();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-800 cursor-pointer flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNavigateToProduct}
    >
      {/* Image Container */}
      <div className="aspect-[4/5] bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-75' : ''
            }`}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && !isOutOfStock && (
            <div className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
              -{discountPercentage}%
            </div>
          )}
          {product.featured && !isOutOfStock && (
            <div className="bg-gray-900/80 dark:bg-white/90 text-white dark:text-gray-900 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm">
              FEATURED
            </div>
          )}
        </div>

        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl">
              SOLD OUT
            </span>
          </div>
        ) : isLowStock && (
          <div className="absolute top-3 right-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-bold border border-red-100 dark:border-red-800">
            ONLY {product.stock} LEFT
          </div>
        )}

        {/* Quick View */}
        {!isOutOfStock && (
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
            <button
              onClick={handleQuickView}
              className="quick-action-btn w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand */}
        {brandName && (
          <span className="text-[10px] font-bold text-primary dark:text-primary-light uppercase tracking-widest mb-1.5 block">
            {brandName}
          </span>
        )}

        {/* Name */}
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 text-sm leading-tight h-10">
          {product.name}
        </h3>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
          {categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Price & Cart Section */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-end justify-between mb-4">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through mb-0.5">
                  {currencySymbol}{originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {currencySymbol}{finalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <AnimatePresence mode="wait">
              {cartItem && cartItem.quantity > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-1 items-center justify-between bg-accent dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700"
                >
                  <button
                    onClick={handleDecrement}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold dark:text-white">{cartItem.quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={cartItem.quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${isOutOfStock
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : isAddingToCart
                      ? 'bg-primary/20 text-primary cursor-wait'
                      : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-primary/20'
                    }`}
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                    </>
                  )}
                </button>
              )}
            </AnimatePresence>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
              className="w-11 h-11 flex items-center justify-center bg-accent dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
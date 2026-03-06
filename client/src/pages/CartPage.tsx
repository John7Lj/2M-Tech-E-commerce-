import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  calculatePrice,
  resetCart,
  discountApplied,
  updateShippingCharges
} from '../redux/reducers/cart.reducer';
import { useApplyCouponMutation } from '../redux/api/coupon.api';
import { useCalculateShippingCostQuery } from '../redux/api/shippingTier.api';
import { Link } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { notify } from '../utils/util';
import { useConstants } from '../hooks/useConstants';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const { currencySymbol } = useConstants();
  const cartState = useSelector((state: RootState) => state.cart);

  const cartItems = Array.isArray(cartState.cartItems) ? cartState.cartItems : [];
  const { subTotal, tax, shippingCharges, total, discount } = cartState;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();

  const {
    data: shippingData,
    isLoading: isCalculatingShipping,
    error: shippingError
  } = useCalculateShippingCostQuery(subTotal, {
    skip: subTotal === 0
  });

  useEffect(() => {
    if (shippingData?.success && shippingData.shippingCost !== undefined) {
      dispatch(updateShippingCharges(shippingData.shippingCost));
    } else if (subTotal === 0) {
      dispatch(updateShippingCharges(0));
    } else if (shippingError) {
      dispatch(updateShippingCharges(50));
    }
  }, [shippingData, shippingError, subTotal, dispatch]);

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems, dispatch, discount]);

  const handleIncrement = (productId: string) => {
    dispatch(incrementCartItem(productId));
  };

  const handleDecrement = (productId: string) => {
    dispatch(decrementCartItem(productId));
  };

  const handleRemove = (productId: string) => {
    dispatch(removeCartItem(productId));
  };

  const handleClearCart = () => {
    dispatch(resetCart());
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      notify('Please enter a coupon code', 'info');
      return;
    }

    try {
      const response = await applyCoupon({ code: couponCode, orderTotal: subTotal }).unwrap();
      dispatch(discountApplied(response.discount));
      setAppliedCoupon(couponCode.toUpperCase().trim());
      setCouponCode('');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to apply coupon';
      notify(errorMessage, 'error');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(discountApplied(0));
    setAppliedCoupon('');
  };

  if (!cartState || typeof cartState !== 'object') {
    return (
      <div className="container mx-auto mt-20 mb-8 p-4 bg-white dark:bg-secondary-dark rounded-2xl shadow-xl transition-colors duration-500">
        <BackButton />
        <div className="text-center py-12">
          <p className="text-lg dark:text-gray-300">Cart data is corrupted. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const getShippingTierInfo = () => {
    if (!shippingData?.appliedTier) return null;
    const tier = shippingData.appliedTier;
    return `${currencySymbol}${tier.minOrderValue} - ${currencySymbol}${tier.maxOrderValue}`;
  };

  return (
    <div className="container mx-auto mt-20 mb-8 p-4 bg-white dark:bg-secondary-dark rounded-2xl shadow-xl transition-colors duration-500 border border-gray-100 dark:border-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 mb-6">
        <BackButton />
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mt-4">Your Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-xl font-bold text-gray-400 dark:text-gray-600 mb-6 uppercase tracking-widest">Your cart is empty</p>
              <Link
                to="/products"
                className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 hover:scale-105"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex flex-col md:flex-row items-center p-6 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 group transition-all hover:shadow-lg dark:hover:shadow-primary/5">
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.photo || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="h-24 w-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="flex-1 md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                    <Link to={`/product/${item.productId}`}>
                      <h4 className="font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</h4>
                    </Link>
                    <p className="text-primary font-black mt-1">{currencySymbol}{item.price.toLocaleString()}</p>

                    <div className="flex items-center justify-center md:justify-start mt-4 space-x-4">
                      <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleDecrement(item.productId)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-black text-gray-700 dark:text-gray-200 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.productId)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 text-right w-full md:w-auto">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subtotal</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{currencySymbol}{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                  </div>
                </div>
              ))}

              <div className="pt-6 flex justify-between items-center">
                <Link to="/products" className="text-sm font-black text-gray-400 hover:text-primary uppercase tracking-widest transition-all">
                  ← Continue Shopping
                </Link>
                <button
                  onClick={handleClearCart}
                  className="text-sm font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-all"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 sticky top-24">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Subtotal</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">{currencySymbol}{(subTotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Tax</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">{currencySymbol}{(tax || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Shipping</span>
                  {shippingData?.appliedTier && (
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter mt-1 italic">
                      {getShippingTierInfo()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">{currencySymbol}{(shippingCharges || 0).toLocaleString()}</span>
              </div>

              {(discount || 0) > 0 && (
                <div className="flex justify-between items-center py-3 bg-primary/5 px-4 rounded-xl border border-primary/10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Discount Applied</span>
                  <span className="text-sm font-black text-primary">-{currencySymbol}{(discount || 0).toLocaleString()}</span>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total</span>
                <span className="text-2xl font-black text-primary">{currencySymbol}{Math.max(0, (total || 0)).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  className="w-full pl-4 pr-24 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-gray-900 dark:bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-primary transition-all disabled:opacity-50"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                )}
              </div>

              {cartItems.length > 0 ? (
                <Link
                  to="/shipping"
                  className="block w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-center hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 active:scale-[0.98]"
                >
                  Confirm Order →
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-900 text-gray-400 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs cursor-not-allowed border border-gray-200 dark:border-gray-800"
                >
                  Cart is Empty
                </button>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 opacity-40 grayscale hover:grayscale-0 transition-all">
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
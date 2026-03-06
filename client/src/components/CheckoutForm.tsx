import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNewOrderMutation } from '../redux/api/order.api';
import { resetCart } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { NewOrderRequest } from '../types/api-types';
import { notify } from '../utils/util';
import BackButton from '../components/common/BackBtn';
import { useConstants } from '../hooks/useConstants';

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currencySymbol, constants } = useConstants();

  const { user } = useSelector((state: RootState) => state.user);
  const {
    shippingInfo,
    cartItems,
    subTotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cart);

  const [newOrder] = useNewOrderMutation();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      notify('Please login to place order', 'error');
      return;
    }

    if (cartItems.length === 0) {
      notify('Your cart is empty', 'error');
      return;
    }

    setIsProcessing(true);

    const orderData: NewOrderRequest = {
      shippingCharges,
      shippingInfo,
      tax,
      discount,
      total,
      subTotal,
      orderItems: cartItems,
    };

    try {
      const orderResponse = await newOrder(orderData);

      if (orderResponse.error) {
        let errorMessage = 'Failed to place order';
        if ('status' in orderResponse.error) {
          if (typeof orderResponse.error.data === 'string') {
            errorMessage = orderResponse.error.data;
          } else if (orderResponse.error.data && typeof orderResponse.error.data === 'object' && 'message' in orderResponse.error.data) {
            errorMessage = (orderResponse.error.data as any).message;
          }
        } else if ('message' in orderResponse.error) {
          errorMessage = orderResponse.error.message || 'Failed to place order';
        }
        throw new Error(errorMessage);
      }

      dispatch(resetCart());
      notify('Order placed successfully! You will pay on delivery.', 'success');
      navigate("/my-orders");

    } catch (error: any) {
      console.error(error);
      notify(error.message || 'Failed to place order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-secondary-dark p-6 transition-colors duration-500">
      <div className="w-full max-w-lg mb-8">
        <BackButton />
      </div>

      <form onSubmit={submitHandler} className="bg-white dark:bg-gray-950 p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">{constants.companyName}</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Secure Checkout</p>
        </div>

        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">Order Summary</h2>

        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-gray-500 uppercase tracking-tight">Subtotal</span>
            <span className="font-black text-gray-900 dark:text-white">{currencySymbol} {subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-gray-500 uppercase tracking-tight">Shipping</span>
            <span className="font-black text-gray-900 dark:text-white">{currencySymbol} {shippingCharges.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-gray-500 uppercase tracking-tight">Tax</span>
            <span className="font-black text-gray-900 dark:text-white">{currencySymbol} {tax.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-sm text-primary">
              <span className="font-black uppercase tracking-widest text-[10px]">Discount Applied</span>
              <span className="font-black">-{currencySymbol} {discount.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total</span>
            <span className="text-2xl font-black text-primary">{currencySymbol} {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center p-5 bg-primary/5 border border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
              />
              <div className="ml-4">
                <div className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">Cash on Delivery</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Pay upon arrival</div>
              </div>
            </label>

            <label className="flex items-center p-5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-2xl opacity-40 grayscale cursor-not-allowed">
              <input
                type="radio"
                disabled
                className="w-4 h-4 text-gray-300 border-gray-300"
              />
              <div className="ml-4">
                <div className="font-black text-gray-400 text-sm uppercase tracking-tight">Online Payment</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Coming Soon</div>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Delivery Address</h3>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {shippingInfo.address}, {shippingInfo.city}<br />
            {shippingInfo.state} • {shippingInfo.country}
          </p>
        </div>

        {paymentMethod === 'cod' && (
          <div className="mb-8 p-5 bg-gray-900 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                Prepare <span className="text-primary">{currencySymbol}{total.toFixed(0)}</span> for delivery
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-dark transition-all shadow-2xl shadow-primary/25 active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : `Confirm Order →`}
        </button>

        <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-900">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li><a href="/pages/faq" className="text-[9px] font-black text-gray-400 hover:text-primary uppercase tracking-widest">FAQ</a></li>
            <li><a href="/pages/privacy-policy" className="text-[9px] font-black text-gray-400 hover:text-primary uppercase tracking-widest">Privacy</a></li>
            <li><a href="/pages/terms-conditions" className="text-[9px] font-black text-gray-400 hover:text-primary uppercase tracking-widest">Terms</a></li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
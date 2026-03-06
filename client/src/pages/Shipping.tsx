import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingInfo } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { ShippingInfo } from '../types/api-types';
import { notify } from '../utils/util';
import BackButton from '../components/common/BackBtn';

const Shipping: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { shippingInfo } = useSelector((state: RootState) => state.cart);

    const [address, setAddress] = useState(shippingInfo.address || '');
    const [city, setCity] = useState(shippingInfo.city || '');
    const [state, setState] = useState(shippingInfo.state || '');
    const [country, setCountry] = useState(shippingInfo.country || '');
    const [phone, setPhone] = useState(shippingInfo.phone || '');

    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!address || !city || !state || !country || !phone) {
            notify('Please fill all the fields', 'error');
            return;
        }

        const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
        if (!phoneRegex.test(phone.trim())) {
            notify('Please enter a valid phone number (7–15 digits)', 'error');
            return;
        }

        const shippingData: ShippingInfo = {
            address,
            city,
            state,
            country,
            phone
        };

        dispatch(saveShippingInfo(shippingData));
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-secondary-dark flex flex-col items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="mb-10 flex items-center justify-between">
                        <BackButton />
                        <div className="text-right">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Step 1 of 2</p>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mt-1">Shipping</h2>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Delivery Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                    placeholder="Street address, apartment, suite"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                        placeholder="City"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">State</label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                        placeholder="State"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                    placeholder="Country"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">WhatsApp / Phone</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                        placeholder="+20 123 456 7890"
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                                </div>
                                <p className="text-[9px] text-gray-400 font-medium ml-1">We'll contact you for delivery confirmation</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-dark transition-all shadow-2xl shadow-primary/25 active:scale-[0.98]"
                        >
                            Proceed to Checkout →
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center space-x-8 opacity-50">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Checkout</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fast Delivery</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">24/7 Support</div>
                </div>
            </div>
        </div>
    );
};

export default Shipping;

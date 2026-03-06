import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CartReducerIntialState, CartItem, ShippingInfo } from "../../types/api-types";

// Helper function to safely parse localStorage data
const safeParseLocalStorage = (key: string, defaultValue: any) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        const parsed = JSON.parse(item);
        // Ensure cartItems is always an array
        if (key === 'cartItems' && !Array.isArray(parsed)) {
            return defaultValue;
        }
        return parsed;
    } catch (error) {
        return defaultValue;
    }
};

// Updated defaultShippingInfo without pinCode
const defaultShippingInfo: ShippingInfo = {
    address: '',
    city: '',
    state: '',
    country: '',
    phone: ''
};

const initialState: CartReducerIntialState = {
    loading: false,
    cartItems: safeParseLocalStorage('cartItems', []),
    subTotal: 0,
    tax: 0,
    shippingCharges: 0,
    discount: 0,
    total: 0,
    shippingInfo: safeParseLocalStorage('shippingInfo', defaultShippingInfo)
};

const saveToLocalStorage = (state: CartReducerIntialState) => {
    try {
        // Ensure cartItems is always an array before saving
        const cartItemsToSave = Array.isArray(state.cartItems) ? state.cartItems : [];
        localStorage.setItem('cartItems', JSON.stringify(cartItemsToSave));
        localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo));
    } catch (error) {
        console.warn('Error saving to localStorage:', error);
    }
};

export const cartReducer = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            state.loading = true;

            // Ensure cartItems is always an array
            if (!Array.isArray(state.cartItems)) {
                state.cartItems = [];
            }

            const index = state.cartItems.findIndex(item => item.productId === action.payload.productId);

            if (index !== -1) {
                // If the item already exists in the cart, increment its quantity
                // Limit the quantity to the stock available
                state.cartItems[index].quantity = Math.min(
                    state.cartItems[index].quantity + action.payload.quantity,
                    action.payload.stock
                );
            } else {
                // If the item doesn't exist in the cart, add it
                state.cartItems.push(action.payload);
            }

            state.loading = false;
            saveToLocalStorage(state);
        },
        removeCartItem: (state, action: PayloadAction<string>) => {
            state.loading = true;

            // Ensure cartItems is always an array
            if (!Array.isArray(state.cartItems)) {
                state.cartItems = [];
            } else {
                state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
            }

            state.loading = false;
            saveToLocalStorage(state);
        },
        incrementCartItem: (state, action: PayloadAction<string>) => {
            // Ensure cartItems is always an array
            if (!Array.isArray(state.cartItems)) {
                state.cartItems = [];
                return;
            }

            const item = state.cartItems.find(item => item.productId === action.payload);
            if (item && item.quantity < item.stock) {
                item.quantity += 1;
                saveToLocalStorage(state);
            }
        },
        decrementCartItem: (state, action: PayloadAction<string>) => {
            // Ensure cartItems is always an array
            if (!Array.isArray(state.cartItems)) {
                state.cartItems = [];
                return;
            }

            const item = state.cartItems.find(item => item.productId === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                saveToLocalStorage(state);
            } else if (item && item.quantity === 1) {
                state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
                saveToLocalStorage(state);
            }
        },
        calculatePrice: (state) => {
            // Ensure cartItems is always an array
            if (!Array.isArray(state.cartItems)) {
                state.cartItems = [];
            }

            const subTotal = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            state.subTotal = subTotal;
            // Fixed shipping charge of 50  if cart has items, 0 if empty
            state.shippingCharges = state.cartItems.length > 0 ? 50 : 0;
            state.tax = 0;
            state.total = state.subTotal + state.shippingCharges - state.discount;

            // If the discount is greater than the total price, limit the discount to the total price
            if (state.total < 0) {
                state.discount = state.subTotal + state.shippingCharges;
                state.total = 0;
            }
        },
        discountApplied: (state, action: PayloadAction<number>) => {
            state.discount = action.payload;
            // If the discount is greater than the total price, limit the discount to the total price
            if (state.discount > state.total) {
                state.discount = state.total;
            }
            saveToLocalStorage(state);
        },
        saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
            state.shippingInfo = action.payload;
            saveToLocalStorage(state);
        },
        resetCart: (state) => {
            try {
                localStorage.removeItem('cartItems');
                localStorage.removeItem('shippingInfo');
            } catch (error) {
                console.warn('Error clearing localStorage:', error);
            }

            // Reset to initial state
            state.loading = false;
            state.cartItems = [];
            state.subTotal = 0;
            state.tax = 0;
            state.shippingCharges = 0;
            state.discount = 0;
            state.total = 0;
            state.shippingInfo = defaultShippingInfo;
        }
    }
});

export const {
    addToCart,
    removeCartItem,
    incrementCartItem,
    decrementCartItem,
    calculatePrice,
    discountApplied,
    resetCart,
    saveShippingInfo
} = cartReducer.actions;

export default cartReducer.reducer;

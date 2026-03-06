export interface User {
    uid: string;
    name: string;
    dob: string;
    gender: string;
    email: string;
    displayName: string;
    photoURL: string;
    provider: string;
    _id: string;
    role: "admin" | "user";
}

export type MessageResponse = {
    success: boolean;
    message: string;
}

export type UserLoginResponse = {
    success: boolean;
    message: string;
    user: User;
}

export type UserLoginRequest = {
    idToken: string;
}

export type UserRegisterRequest = {
    idToken: string;
    name: string;
    gender: string;
    dob: string
}

export type AllUserResponse = {
    success: boolean;
    users: User[];
}

export type UserResponse = {
    success: boolean;
    user: User;
}

export interface UserReducerIntialState {
    user: User | null;
    loading: boolean;
}

// Brand Types
export interface Brand {
    _id: string;
    name: string;
    image: string;
    imagePublicId: string;
    createdAt: string;
    updatedAt: string;
}

export interface BrandResponse {
    success: boolean;
    brands: Brand[];
    totalBrands: number;
    totalPages: number;
    currentPage: number;
}

export interface BrandRequest {
    page: number;
    limit: number;
}

export interface BrandDetailResponse {
    success: boolean;
    brand: Brand;
}

// Update your BrandsDropdownResponse interface in api-types.ts
export interface BrandsDropdownResponse {
    success: boolean;
    brands: { _id: string; name: string; image: string }[]; // Added image property
}

export interface NewBrandRequest {
    formData: FormData;
}

export interface UpdateBrandRequest {
    brandId: string;
    formData: FormData;
}

export interface DeleteBrandRequest {
    brandId: string;
}

// Product - Updated with brand field as object reference
export interface Product {
    name: string;
    _id: string;
    category: string | { _id: string; name: string; value: string };
    categories?: Array<string | { _id: string; name: string; value: string }>;

    subcategory?: string | { _id: string; name: string; value: string };
    subcategories?: Array<string | { _id: string; name: string; value: string }>;
    brand: {
        _id: string;
        name: string;
        image?: string;
    } | string;  // Can be populated object or just ID string
    stock: number;
    photos: string[];
    photoPublicIds: string[];
    price: number;

    description: string;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    currencySymbol: string;
    discount: number;
    netPrice: number;
}

export interface ProductResponse {
    success: boolean;
    products: Product[];
    totalProducts: number;
    totalPages: number;
    currentPage: number;
}

interface SortBy {
    id: string;
    desc: boolean;
}

// UPDATED: Added optional brand parameter
export interface ProductRequest {
    page: number;
    limit: number;
    sortBy?: SortBy;
    category?: string;
    brand?: string; // Added brand filtering support
}

// New Product
export type NewProductRequest = {
    formData: FormData;
}

// Product Details
export type ProductDetailResponse = {
    success: boolean;
    product: Product;
}

// Update Product
export type UpdateProductRequest = {
    productId: string;
    formData: FormData;
}

// Delete Product
export type DeleteProductRequest = {
    productId: string;
}

// Categories 
export type CategoriesResponse = {
    success: boolean;
    categories: string[];
}

// feature Product
export type FeatureProductRequest = {
    productId: string;
}

// Search Product - Updated with brand
export type SearchProductRequest = {
    price: string;
    page: number;
    category: string;
    brand?: string; // Added brand search parameter
    search: string;
    sort: string;

}

export type SearchProductResponse = ProductResponse & {
    totalPage: number;
}

// -- Order Types -- 
// Cart Item - Updated with brand as object
export type CartItem = {
    productId: string;
    photo: string;
    name: string;
    brand: {
        _id: string;
        name: string;
    } | string;  // Can be populated object or just name/ID
    price: number;
    quantity: number;
    stock: number;
};

// Shipping Info - UPDATED: Removed pinCode requirement
export type ShippingInfo = {
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
}

// Order Item
export type OrderItem = Omit<CartItem, "stock"> & { _id: string };

// Order 
export type Order = {
    orderItems: OrderItem[];
    shippingInfo: ShippingInfo;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    status: string;
    user: {
        name: string;
        _id: string;
    };
    _id: string;
    createdAt: string;
    updatedAt: string;
}

// All Orders
export type AllOrdersResponse = {
    success: boolean;
    orders: Order[];
}

// Order Details
export type OrderDetailsResponse = {
    success: boolean;
    order: Order;
}

// New Order 
export type NewOrderRequest = {
    orderItems: CartItem[];
    subTotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    shippingInfo: ShippingInfo;
    couponCode?: string; // Passed for server-side coupon re-validation
}

// Update Order
export type UpdateOrderRequest = {
    orderId: string;
    status: string;
}

//  -- Coupon Types --
export type Coupon = {
    code: string;
    amount: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string | null;
    maxUses?: number | null;
    usedCount?: number;
    minOrderValue?: number;
}

export type AllCouponsResponse = {
    success: boolean;
    coupons: Coupon[];
}

export type AllCouponsRequest = {
    page: number;
}

export type ApplyCouponRequest = {
    code: string;
    orderTotal?: number; // Optional — used for minimum order value validation
}

export type ApplyCouponResponse = {
    success: boolean;
    discount: number;
    code: string;
    message: string;
}

export type NewCouponRequest = {
    code: string;
    amount: number | string;
    expiresAt?: string;
    maxUses?: number;
    minOrderValue?: number;
}

export type DeleteCouponRequest = {
    couponId: string;
}

interface Stats {
    totalRevenue: number;
    revenueByMonth: {
        [key: string]: number;
    };
    revenueByWeek: {
        [key: string]: number;
    };
    revenueByDay: {
        [key: string]: number;
    };
    salesByCategory: {
        [key: string]: number;
    };
    salesByBrand?: { // Added brand sales analytics
        [key: string]: number;
    };
    bestSellingProducts: {
        productId: string;
        quantity: number;
    }[];
    userGenderDemographic: {
        _id: string;
        count: number;
    }[];
    totalOrders: number;
    latestOrders: Order[];
    totalProducts: number;
    totalCoupons: number;
}

// Stats
export interface StatsResponse {
    success: boolean;
    stats: Stats;
}

// -- Reducer Types --

// Cart Reducer Initial State - Updated with brand as object
export interface CartReducerIntialState {
    loading: boolean;
    cartItems: CartItem[];
    subTotal: number;
    tax: number;
    total: number;
    shippingCharges: number;
    discount: number;
    shippingInfo: ShippingInfo;
}

export type CustomError = {
    status: number;
    data: {
        message: string;
        success: boolean;
    }
}

// -- Page Types --
export interface Page {
    _id: string;
    title: string;
    slug: string;
    content: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PageDetailResponse {
    success: boolean;
    page: Page;
}
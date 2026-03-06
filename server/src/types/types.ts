
import { Request } from 'express';

export interface NewProductBody {
    name: string;
    categories: string[] | string; // Multiple categories (can be array or JSON string)
    subcategories?: string[] | string; // Multiple subcategories (optional)
    brand: string;
    price: number;
    stock: number;
    description: string;
    discount?: number; // Added discount field
    status?: boolean; // NEW: Published status (default: true)
    featured?: boolean; // NEW: Featured status (default: false)
}

export interface BaseQueryType {
    name?: { $regex: string; $options: string } | string;
    categories?: string | { $in: string[] }; // Updated for multiple categories
    subcategories?: string | { $in: string[] }; // Added for subcategories
    brand?: string;
    price?: {
        $gte?: number;
        $lte?: number;
    };
    status?: boolean; // NEW: Status filter
    featured?: boolean; // NEW: Featured filter
}

export interface SearchProductsQuery {
    search?: string;
    category?: string;
    subcategory?: string; // Added subcategory search
    brand?: string;
    sort?: 'asc' | 'desc' | 'relevance';
    price?: string; // Assuming price is in the format "min,max"
    page?: string;
    includeUnpublished?: string;
}

export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    provider: string;
    role: 'user' | 'admin';
    _id: string;
}

export interface RequestWithUser extends Request {
    user: User;
}

// Order Types
export type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
    brand?: string;
}

export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
}

export interface NewOrderRequestBody {
    shippingInfo: ShippingInfoType;
    subTotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[];
    couponCode?: string; // Optional — passed when a coupon was applied in the cart
}
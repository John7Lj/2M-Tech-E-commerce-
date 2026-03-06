import { getViteServerUrl } from "../../utils/url";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ShippingTier {
    _id: string;
    minOrderValue: number;
    maxOrderValue: number;
    shippingCost: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ShippingTiersResponse {
    success: boolean;
    shippingTiers: ShippingTier[];
}

export interface CreateShippingTierRequest {
    minOrderValue: number;
    maxOrderValue: number;
    shippingCost: number;
}

export interface UpdateShippingTierRequest {
    minOrderValue?: number;
    maxOrderValue?: number;
    shippingCost?: number;
}

export interface ShippingCostResponse {
    success: boolean;
    orderValue: number;
    shippingCost: number;
    appliedTier: {
        minOrderValue: number;
        maxOrderValue: number;
        cost: number;
    } | null;
}

export const shippingTierApi = createApi({
    reducerPath: 'shippingTierApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/shipping-tiers`,
        credentials: 'include',
                prepareHeaders: async (headers) => {
            const token = localStorage.getItem('admin_token');
            const authPrefix = 'Bearer ';

            try {
                const { auth } = await import('../../firebaseConfig');
                const user = auth.currentUser;
                
                if (user) {
                    const freshToken = await user.getIdToken();
                    headers.set('Authorization', authPrefix + freshToken);
                } else if (token) {
                    headers.set('Authorization', authPrefix + token);
                }
            } catch (error) {
                if (token) {
                    headers.set('Authorization', authPrefix + token);
                }
            }
            
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['ShippingTier'],
    endpoints: (builder) => ({
        getAllShippingTiers: builder.query<ShippingTiersResponse, void>({
            query: () => '',
            providesTags: ['ShippingTier'],
        }),
        createShippingTier: builder.mutation<{ success: boolean; shippingTier: ShippingTier; message: string }, CreateShippingTierRequest>({
            query: (data) => ({
                url: '',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ShippingTier'],
        }),
        updateShippingTier: builder.mutation<{ success: boolean; shippingTier: ShippingTier; message: string }, { id: string } & UpdateShippingTierRequest>({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['ShippingTier'],
        }),
        deleteShippingTier: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ShippingTier'],
        }),
        calculateShippingCost: builder.query<ShippingCostResponse, number>({
            query: (orderValue) => `calculate?orderValue=${orderValue}`,
        }),
    }),
});

export const {
    useGetAllShippingTiersQuery,
    useCreateShippingTierMutation,
    useUpdateShippingTierMutation,
    useDeleteShippingTierMutation,
    useCalculateShippingCostQuery,
} = shippingTierApi;

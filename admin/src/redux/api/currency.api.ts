import { getViteServerUrl } from "../../utils/url";
// admin/src/redux/api/currency.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../../types/api-types";

export interface Currency {
    _id: string;
    symbol: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CurrencyResponse {
    success: boolean;
    currencies: Currency[];
}

export interface DefaultCurrencyResponse {
    success: boolean;
    currency: Currency | null;
}

export interface CreateCurrencyRequest {
    symbol: string;
}

export const currencyApi = createApi({
    reducerPath: 'currencyAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/currencies`,
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
            
            return headers;
        },
    }),
    tagTypes: ['Currency'],
    endpoints: (builder) => ({
        getAllCurrencies: builder.query<CurrencyResponse, void>({
            query: () => '/',
            providesTags: ['Currency']
        }),
        getDefaultCurrency: builder.query<DefaultCurrencyResponse, void>({
            query: () => '/default',
            providesTags: ['Currency']
        }),
        createCurrency: builder.mutation<MessageResponse, CreateCurrencyRequest>({
            query: (data) => ({
                url: '/new',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Currency'],
        }),
        setDefaultCurrency: builder.mutation<MessageResponse, string>({
            query: (currencyId) => ({
                url: `/default/${currencyId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Currency'],
        }),
        deleteCurrency: builder.mutation<MessageResponse, string>({
            query: (currencyId) => ({
                url: `/${currencyId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Currency'],
        }),
    }),
});

export const {
    useGetAllCurrenciesQuery,
    useGetDefaultCurrencyQuery,
    useCreateCurrencyMutation,
    useSetDefaultCurrencyMutation,
    useDeleteCurrencyMutation
} = currencyApi;

// admin/src/redux/api/currency.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
        baseUrl: import.meta.env.VITE_SERVER_URL 
            ? `${import.meta.env.VITE_SERVER_URL}/currencies`
            : `/currencies`,
        credentials: 'include',
    }),
    tagTypes: ['Currency'],
    endpoints: (builder) => ({
        
        getDefaultCurrency: builder.query<DefaultCurrencyResponse, void>({
            query: () => '/default',
            providesTags: ['Currency']
        }),
       
    }),
});

export const {
    useGetDefaultCurrencyQuery,

} = currencyApi;

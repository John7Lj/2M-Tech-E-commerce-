import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "../../firebaseConfig";
import { AllOrdersResponse, MessageResponse, NewOrderRequest, OrderDetailsResponse } from "../../types/api-types";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL
            ? `${import.meta.env.VITE_SERVER_URL}/orders`
            : `/orders`,
        credentials: 'include',
        prepareHeaders: async (headers) => {
            await auth.authStateReady();
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken();
                    headers.set('Authorization', `Bearer ${token}`);
                } catch (error) {
                    console.error("Error getting auth token", error);
                }
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['orders'],
    endpoints: (builder) => ({
        newOrder: builder.mutation<MessageResponse, NewOrderRequest>({
            query: (order) => ({
                url: `new`,
                method: 'POST',
                body: order,
            }),
            invalidatesTags: ['orders']
        }),
        myOrders: builder.query<AllOrdersResponse, string>({
            query: () => (`my`),
            providesTags: ['orders']
        }),
        allOrders: builder.query<AllOrdersResponse, string>({
            query: () => (`all`),
            providesTags: ['orders']
        }),
        orderDetails: builder.query<OrderDetailsResponse, string>({
            query: (id) => id,
            providesTags: ['orders']
        }),
    })
});

export const {
    useNewOrderMutation,
    useAllOrdersQuery,
    useMyOrdersQuery,
    useOrderDetailsQuery,
} = orderApi;

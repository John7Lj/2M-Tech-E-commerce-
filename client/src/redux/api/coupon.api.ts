import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AllCouponsResponse, ApplyCouponRequest, ApplyCouponResponse} from '../../types/api-types';


export const couponApi = createApi({
    reducerPath: 'couponApi',
    baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL 
        ? `${import.meta.env.VITE_SERVER_URL}/coupons`
        : `/coupons`,
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    },
}),
    endpoints: (builder) => ({
        getAllCoupons: builder.query<AllCouponsResponse, void>({
            query: () => 'all',
        }),
       
        applyCoupon: builder.mutation<ApplyCouponResponse, ApplyCouponRequest>({
            query: (coupon) => ({
                url: 'apply',
                method: 'POST',
                body: coupon,
            }),
        })
    }),
});

export const {
    useGetAllCouponsQuery,

    useApplyCouponMutation,

} = couponApi;

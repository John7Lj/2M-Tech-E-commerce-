import { getViteServerUrl } from "../../utils/url";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AllCouponsResponse, ApplyCouponRequest, ApplyCouponResponse, MessageResponse, NewCouponRequest } from '../../types/api-types';


export const couponApi = createApi({
    reducerPath: 'couponApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/coupons`,
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
    endpoints: (builder) => ({
        getAllCoupons: builder.query<AllCouponsResponse, void>({
            query: () => 'all',
        }),
        createCoupon: builder.mutation<MessageResponse, NewCouponRequest>({
            query: (newCoupon) => ({
                url: 'new',
                method: 'POST',
                body: newCoupon,
            }),
        }),
        deleteCoupon: builder.mutation<MessageResponse, string>({
            query: (couponId) => ({
                url: `delete/${couponId}`,
                method: 'DELETE',
            }),
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
    useCreateCouponMutation,
    useDeleteCouponMutation,
    useApplyCouponMutation,

} = couponApi;

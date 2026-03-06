// admin/src/redux/api/banner.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../../types/api-types";

export interface BannerProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    netPrice: number;
    photos: string[];
    brand: { name: string };
    categories: Array<{ name: string }>;
    stock: number;
    status: boolean;
  };
  discountPercentage: number;
}

export interface Banner {
  _id: string;
  name: string;
  description: string;
  image: string;
  imagePublicId: string;
  products: BannerProduct[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  banners: Banner[];
}

export interface BannerResponse {
  success: boolean;
  banner: Banner;
}

export interface CreateBannerRequest {
  formData: FormData;
}

export interface UpdateBannerRequest {
  id: string;
  formData: FormData;
}

export interface DeleteBannerRequest {
  id: string;
}

export interface ToggleBannerStatusRequest {
  id: string;
}

export const bannerApi = createApi({
  reducerPath: 'bannerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL
      ? `${import.meta.env.VITE_SERVER_URL}/banners`
      : `/banners`,
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
  tagTypes: ['Banner'],
  endpoints: (builder) => ({
    getAllBanners: builder.query<BannersResponse, { includeInactive?: boolean }>({
      query: ({ includeInactive = false } = {}) =>
        includeInactive ? '/all/?includeInactive=true' : '/all',
      providesTags: ['Banner']
    }),
    getBannerById: builder.query<BannerResponse, string>({
      query: (id) => `/${id}`,
      providesTags: ['Banner']
    }),
    createBanner: builder.mutation<MessageResponse, CreateBannerRequest>({
      query: ({ formData }) => ({
        url: '/new',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation<MessageResponse, UpdateBannerRequest>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation<MessageResponse, DeleteBannerRequest>({
      query: ({ id }) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    toggleBannerStatus: builder.mutation<MessageResponse, ToggleBannerStatusRequest>({
      query: ({ id }) => ({
        url: `/toggle/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useGetBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation
} = bannerApi;

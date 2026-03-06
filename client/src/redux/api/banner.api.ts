import { getViteServerUrl } from "../../utils/url";
// client/src/redux/api/banner.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export const bannerApi = createApi({
  reducerPath: 'bannerAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/banners`,
    credentials: 'include',
  }),
  tagTypes: ['Banner'],
  endpoints: (builder) => ({
    getAllBanners: builder.query<BannersResponse, void>({
      query: () => '/', // Only get active banners for client
      providesTags: ['Banner']
    }),
    getBannerById: builder.query<BannerResponse, string>({
      query: (id) => `/${id}`,
      providesTags: ['Banner']
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useGetBannerByIdQuery
} = bannerApi;

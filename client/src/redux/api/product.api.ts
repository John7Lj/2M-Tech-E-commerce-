// client/src/redux/api/product.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    CategoriesResponse,

    FeatureProductRequest,
    MessageResponse,

    ProductDetailResponse,
    ProductRequest,
    ProductResponse,
    SearchProductRequest,
    SearchProductResponse,

} from "../../types/api-types";

export const productApi = createApi({
    reducerPath: 'productAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL
            ? `${import.meta.env.VITE_SERVER_URL}/products`
            : `/products`,
        credentials: 'include',
    }),
    tagTypes: ['Product'],
    endpoints: (builder) => ({
        latestProducts: builder.query<ProductResponse, { limit?: number }>({
            query: ({ limit = 20 } = {}) => `/latest?limit=${limit}`,
            providesTags: ['Product']
        }),
        allProducts: builder.query<ProductResponse, ProductRequest>({
            query: ({ page, limit, sortBy, category, brand }) => {
                let url = `all?page=${page}&limit=${limit}`;

                if (sortBy) {
                    url += `&sortBy=${JSON.stringify(sortBy)}`;
                }

                if (category) {
                    url += `&category=${encodeURIComponent(category)}`;
                }

                if (brand) {
                    url += `&brand=${encodeURIComponent(brand)}`;
                }

                return url;
            },
            providesTags: ['Product'],
        }),
        categories: builder.query<CategoriesResponse, string>({
            query: () => '/categories',
            providesTags: ['Product']
        }),
        searchProducts: builder.query<SearchProductResponse, SearchProductRequest>({
            query: ({ price, search, sort, category, brand, page }) => {
                let base = `/search?search=${search}&page=${page}`;
                if (price) base += `&price=${price}`;
                if (sort) base += `&sort=${sort}`;
                if (category) base += `&category=${category}`;
                if (brand) base += `&brand=${brand}`;
                return base;
            },
            providesTags: ['Product'],
        }),

        productDetails: builder.query<ProductDetailResponse, string>({
            query: (id) => id,
            providesTags: ['Product']
        }),


        getAllFeaturedProducts: builder.query<ProductResponse, string>({
            query: () => 'featured',
            providesTags: ['Product']
        }),
        featureProduct: builder.mutation<MessageResponse, FeatureProductRequest>({
            query: ({ productId }) => ({
                url: `feature/${productId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Product']
        }),
        productsByCategory: builder.query<ProductResponse, { category: string; limit?: number }>({
            query: ({ category, limit = 8 }) => {
                return `/category/${encodeURIComponent(category)}?limit=${limit}`;
            },
            providesTags: ['Product']
        }),
        productsByBrand: builder.query<ProductResponse, { brandId: string; limit?: number }>({
            query: ({ brandId, limit = 8 }) => `/brand/${brandId}?limit=${limit}`,
            providesTags: ['Product']
        }),
    }),
});

export const {
    useLatestProductsQuery,
    useAllProductsQuery,
    useCategoriesQuery,
    useSearchProductsQuery,
    useProductDetailsQuery,
    useGetAllFeaturedProductsQuery,
    useFeatureProductMutation,
    useProductsByCategoryQuery,
    useProductsByBrandQuery
} = productApi;


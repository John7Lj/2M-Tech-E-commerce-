// admin/src/redux/api/product.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    CategoriesResponse,
    DeleteProductRequest,
    FeatureProductRequest,
    MessageResponse,
    NewProductRequest,
    ProductDetailResponse,
    ProductRequest,
    ProductResponse,
    SearchProductRequest,
    SearchProductResponse,
    UpdateProductRequest
} from "../../types/api-types";

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL
            ? `${import.meta.env.VITE_SERVER_URL}/products`
            : `/products`,
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
    tagTypes: ['Product'],
    endpoints: (builder) => ({
        latestProducts: builder.query<ProductResponse, { limit?: number }>({
            query: ({ limit = 20 } = {}) => `/latest?limit=${limit}&includeUnpublished=true`,
            providesTags: ['Product']
        }),
        allProducts: builder.query<ProductResponse, ProductRequest>({
            query: ({ page, limit, sortBy, category, brand }) => {
                let url = `all?page=${page}&limit=${limit}&includeUnpublished=true`;

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
                let base = `/search?search=${search}&page=${page}&includeUnpublished=true`;
                if (price) base += `&price=${price}`;
                if (sort) base += `&sort=${sort}`;
                if (category) base += `&category=${category}`;
                if (brand) base += `&brand=${brand}`;
                return base;
            },
            providesTags: ['Product'],
        }),
        newProduct: builder.mutation<MessageResponse, NewProductRequest>({
            query: ({ formData }) => ({
                url: `new`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Product'],
        }),
        productDetails: builder.query<ProductDetailResponse, string>({
            query: (id) => id,
            providesTags: ['Product']
        }),
        updateProduct: builder.mutation<MessageResponse, UpdateProductRequest>({
            query: ({ formData, productId }) => ({
                url: `${productId}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Product'],
        }),
        deleteProduct: builder.mutation<MessageResponse, DeleteProductRequest>({
            query: ({ productId }) => ({
                url: `${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
        getAllFeaturedProducts: builder.query<ProductResponse, string>({
            query: () => 'featured?includeUnpublished=true',
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
            query: ({ category, limit = 8 }) => `/category/${category}?limit=${limit}&includeUnpublished=true`,
            providesTags: ['Product']
        }),
        productsByBrand: builder.query<ProductResponse, { brandId: string; limit?: number }>({
            query: ({ brandId, limit = 8 }) => `/brand/${brandId}?limit=${limit}&includeUnpublished=true`,
            providesTags: ['Product']
        }),
    }),
});

export const {
    useLatestProductsQuery,
    useAllProductsQuery,
    useCategoriesQuery,
    useSearchProductsQuery,
    useNewProductMutation,
    useProductDetailsQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetAllFeaturedProductsQuery,
    useFeatureProductMutation,
    useProductsByCategoryQuery,
    useProductsByBrandQuery
} = productApi;

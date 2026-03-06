import { getViteServerUrl } from "../../utils/url";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    BrandResponse,
    BrandRequest,
    NewBrandRequest,
    UpdateBrandRequest,
    DeleteBrandRequest,
    MessageResponse,
    BrandDetailResponse,
    BrandsDropdownResponse
} from "../../types/api-types";

export const brandApi = createApi({
    reducerPath: 'brandAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/brands`,
        credentials: 'include',
    }),
    tagTypes: ['Brand'],
    endpoints: (builder) => ({
        getAllBrands: builder.query<BrandResponse, BrandRequest>({
            query: ({ page, limit }) => `all?page=${page}&limit=${limit}`,
            providesTags: ['Brand'],
        }),
        getBrandById: builder.query<BrandDetailResponse, string>({
            query: (id) => `${id}`,
            providesTags: ['Brand']
        }),
        getBrandsForDropdown: builder.query<BrandsDropdownResponse, void>({
            query: () => 'dropdown',
            providesTags: ['Brand']
        }),
        createBrand: builder.mutation<MessageResponse, NewBrandRequest>({
            query: ({ formData }) => ({
                url: 'new',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Brand'],
        }),
        updateBrand: builder.mutation<MessageResponse, UpdateBrandRequest>({
            query: ({ brandId, formData }) => ({
                url: `${brandId}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Brand'],
        }),
        deleteBrand: builder.mutation<MessageResponse, DeleteBrandRequest>({
            query: ({ brandId }) => ({
                url: `${brandId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Brand'],
        }),
    }),
});

export const {
    useGetAllBrandsQuery,
    useGetBrandByIdQuery,
    useGetBrandsForDropdownQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation
} = brandApi;

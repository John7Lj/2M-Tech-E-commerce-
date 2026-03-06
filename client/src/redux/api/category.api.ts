// client/src/redux/api/category.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Category {
  _id: string;
  name: string;a
  nameAr: string;
  value: string;
  description?: string;
  image?: string;
  bgColor?: string;
  hoverColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

interface CategoryResponse {
  success: boolean;
  category: Category;
  message?: string;
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/categories`,
    credentials: 'include',
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // Get all active categories (public)
    getAllCategories: builder.query<CategoriesResponse, void>({
      query: () => '/',
      providesTags: ['Category'],
    }),

    // Get all categories including inactive (admin)
    getAllCategoriesAdmin: builder.query<CategoriesResponse, void>({
      query: () => '/admin/all',
      providesTags: ['Category'],
    }),

    // Get single category
    getCategory: builder.query<CategoryResponse, string>({
      query: (id) => `/${id}`,
      providesTags: ['Category'],
    }),

  
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetAllCategoriesAdminQuery,
  useGetCategoryQuery,

} = categoryApi;

// admin/src/redux/api/subcategory.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Subcategory {
  _id: string;
  name: string;
  value: string;
  description?: string;
  image?: string;
  parentCategory: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryResponse {
  success: boolean;
  subcategories: Subcategory[];
}

export interface SingleSubcategoryResponse {
  success: boolean;
  subcategory: Subcategory;
}

export interface CreateSubcategoryRequest {
  formData: FormData;
}

const subcategoryApi = createApi({
  reducerPath: 'subcategoryApi',
  baseQuery: fetchBaseQuery({
    // FIXED: Changed from VITE_SERVER to VITE_SERVER_URL to match category.api.ts
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/subcategory/`,
    credentials: 'include', // ADDED: Include credentials like in category API
  }),
  tagTypes: ['Subcategory'],
  endpoints: (builder) => ({
    // Get all subcategories
    getAllSubcategories: builder.query<SubcategoryResponse, void>({
      query: () => 'all',
      providesTags: ['Subcategory'],
    }),

    // Get subcategories by category
    getSubcategoriesByCategory: builder.query<SubcategoryResponse, string>({
      query: (categoryId) => `category/${categoryId}`,
      providesTags: ['Subcategory'],
    }),

    // Get single subcategory
    getSubcategory: builder.query<SingleSubcategoryResponse, string>({
      query: (id) => id,
      providesTags: ['Subcategory'],
    }),

   

    
  }),
});

export const {
  useGetAllSubcategoriesQuery,
  useGetSubcategoriesByCategoryQuery,
  useGetSubcategoryQuery,

} = subcategoryApi;

export default subcategoryApi;

import { getViteServerUrl } from "../../utils/url";
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
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/subcategories/`,
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

    // Create subcategory
    createSubcategory: builder.mutation<SingleSubcategoryResponse, CreateSubcategoryRequest>({
      query: ({ formData }) => ({
        url: 'new',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Subcategory'],
    }),

    // Update subcategory
    updateSubcategory: builder.mutation<SingleSubcategoryResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: id,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Subcategory'],
    }),

    // Delete subcategory
    deleteSubcategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: id,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcategory'],
    }),

    // Permanent delete subcategory
    permanentDeleteSubcategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `permanent/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcategory'],
    }),
  }),
});

export const {
  useGetAllSubcategoriesQuery,
  useGetSubcategoriesByCategoryQuery,
  useGetSubcategoryQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  usePermanentDeleteSubcategoryMutation,
} = subcategoryApi;

export default subcategoryApi;

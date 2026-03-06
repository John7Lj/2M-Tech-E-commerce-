// admin/src/redux/api/page.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Page {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

export const pageApi = createApi({
  reducerPath: 'pageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL
      ? `${import.meta.env.VITE_SERVER_URL}/pages`
      : `/api/pages`,
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
  tagTypes: ['Page'],
  endpoints: (builder) => ({
    getAllPages: builder.query<Page[], void>({
      query: () => '/',
      transformResponse: (response: { success: boolean; pages: Page[] }) => response.pages,
      providesTags: ['Page'],
    }),

    getPageBySlug: builder.query<Page, string>({
      query: (slug) => `/${slug}`,
      providesTags: ['Page'],
    }),

    createPage: builder.mutation<Page, Omit<Page, '_id'>>({
      query: (page) => ({
        url: '/',
        method: 'POST',
        body: page,
      }),
      invalidatesTags: ['Page'],
    }),

    updatePage: builder.mutation<Page, { id: string; page: Partial<Page> }>({
      query: ({ id, page }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: page,
      }),
      invalidatesTags: ['Page'],
    }),

    deletePage: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Page'],
    }),
  }),
});

export const {
  useGetAllPagesQuery,
  useGetPageBySlugQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApi;

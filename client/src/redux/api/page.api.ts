import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Page, PageDetailResponse } from '../../types/api-types';

export const pageApi = createApi({
  reducerPath: 'pageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL
      ? `${import.meta.env.VITE_SERVER_URL}/pages`
      : `/api/pages`,
    credentials: 'include',
  }),
  tagTypes: ['Page'],
  endpoints: (builder) => ({
    getPageBySlug: builder.query<Page, string>({
      query: (slug) => `/${slug}`,
      transformResponse: (response: PageDetailResponse) => response.page,
      providesTags: ['Page'],
    }),
  }),
});

export const {
  useGetPageBySlugQuery,
} = pageApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Settings {
    _id: string;
    companyName: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    whatsapp: string;
    timezone: string;
    language: string;
    createdAt: string;
    updatedAt: string;
}

export interface SettingsResponse {
    success: boolean;
    settings: Settings;
    message?: string;
}

export const settingsApi = createApi({
    reducerPath: 'settingsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL 
            ? `${import.meta.env.VITE_SERVER_URL}/settings`
            : `/settings`,
        credentials: 'include',
        prepareHeaders: (headers, { endpoint }) => {
            // Don't set Content-Type for FormData uploads
            if (endpoint !== 'updateSettings') {
                headers.set('Content-Type', 'application/json');
            }
            return headers;
        },
    }),
    tagTypes: ['Settings'],
    endpoints: (builder) => ({
        getSettings: builder.query<SettingsResponse, void>({
            query: () => '',
            providesTags: ['Settings'],
        }),
        
    }),
});

export const {
    useGetSettingsQuery,
} = settingsApi;

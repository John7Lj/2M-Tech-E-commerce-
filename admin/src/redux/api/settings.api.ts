import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getViteServerUrl } from '../../utils/url';

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
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/settings`,
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
    tagTypes: ['Settings'],
    endpoints: (builder) => ({
        getSettings: builder.query<SettingsResponse, void>({
            query: () => '',
            providesTags: ['Settings'],
        }),
        updateSettings: builder.mutation<SettingsResponse, FormData>({
            query: (formData) => ({
                url: '',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Settings'],
        }),

    }),
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} = settingsApi;

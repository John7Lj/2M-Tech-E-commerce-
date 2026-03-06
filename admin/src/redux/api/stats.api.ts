// redux/api/stats.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StatsResponse } from '../../types/api-types';


export const statsApi = createApi({
    reducerPath: 'statsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL
            ? `${import.meta.env.VITE_SERVER_URL}/stats`
            : `/stats`,
        credentials: 'include',
                prepareHeaders: async (headers, { endpoint }) => {
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
    endpoints: (builder) => ({
        getStats: builder.query<StatsResponse, void>({
            query: () => '',
        }),
    }),
});

export const {
    useGetStatsQuery,
} = statsApi;

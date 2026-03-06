import { getViteServerUrl } from "../../utils/url";
// redux/api/stats.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StatsResponse } from '../../types/api-types';


export const statsApi = createApi({
    reducerPath: 'statsApi',
baseQuery: fetchBaseQuery({
    baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/stats`,
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
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

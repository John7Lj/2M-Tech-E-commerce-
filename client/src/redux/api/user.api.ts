import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../../firebaseConfig';
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserResponse } from '../../types/api-types';

export const userApi = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL
            ? `${import.meta.env.VITE_SERVER_URL}/auth`
            : `/auth`,
        credentials: 'include',
        prepareHeaders: async (headers, { endpoint }) => {
            const user = auth.currentUser;
            await auth.authStateReady();
            if (user) {
                try {
                    const token = await user.getIdToken();
                    headers.set('Authorization', `Bearer ${token}`);
                } catch (error) {
                    console.error("Error getting auth token", error);
                }
            }
            // Don't set Content-Type for FormData uploads
            if (endpoint !== 'updateProfile') {
                headers.set('Content-Type', 'application/json');
            }
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getAllUsers: builder.query({
            query: () => 'all',
        }),
        getUser: builder.query({
            query: (id: string) => `${id}`,
        }),
        loginUser: builder.mutation<UserLoginResponse, UserLoginRequest>({
            query: ({ idToken }) => ({
                url: 'login',
                method: 'POST',
                body: { idToken },
            }),
        }),
        signupUser: builder.mutation<UserLoginResponse, UserRegisterRequest>({
            query: ({ idToken, name, gender, dob }) => ({
                url: 'signup',
                method: 'POST',
                body: { idToken, name, gender, dob },
            }),
        }),
        getMe: builder.query<UserResponse, void>({
            query: () => 'me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<UserResponse, FormData>({
            query: (formData) => ({
                url: 'update-profile',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
        logoutUser: builder.mutation<void, void>({
            query: () => ({
                url: 'logout',
                method: 'POST',
            })
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserQuery,
    useLoginUserMutation,
    useSignupUserMutation,
    useGetMeQuery,
    useUpdateProfileMutation,
    useLogoutUserMutation,
} = userApi;

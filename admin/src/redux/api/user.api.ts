import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserResponse } from '../../types/api-types';

export const userApi = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_SERVER_URL
            ? `${import.meta.env.VITE_SERVER_URL}/auth`
            : `/auth`,
        credentials: 'include',
        prepareHeaders: async (headers) => {
            const token = localStorage.getItem('admin_token');
            const authPrefix = 'Bearer ';

            try {
                const { auth } = await import('../../firebaseConfig');
                await auth.authStateReady();
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

            headers.set('Content-Type', 'application/json');
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
    useLogoutUserMutation,
} = userApi;

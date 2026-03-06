import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreatePaymentIntentRequest {
  amount: number;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  client_secret: string;
  message: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL
      ? `${import.meta.env.VITE_SERVER_URL}/payments`
      : `/payments`,
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
            
            headers.set('Content-Type', 'application/json');
            return headers;
        },
  }),
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<CreatePaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (paymentIntent) => ({
        url: 'new',
        method: 'POST',
        body: paymentIntent,
      }),
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
} = paymentApi;

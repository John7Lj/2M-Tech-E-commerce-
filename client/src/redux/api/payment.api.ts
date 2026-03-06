import { getViteServerUrl } from "../../utils/url";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../../firebaseConfig';

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
    baseUrl: `${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}/payments`,
    credentials: 'include',
    prepareHeaders: async (headers) => {
      await auth.authStateReady();
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          headers.set('Authorization', `Bearer ${token}`);
        } catch (error) {
          console.error("Error getting auth token", error);
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

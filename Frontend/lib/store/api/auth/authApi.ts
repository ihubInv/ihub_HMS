"use client";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL + '/auth' }),
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string; role: string }>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<any, { name: string; email: string; password: string; rollNo: string; phone: string; role: string }>({
      query: (user) => ({
        url: 'register',
        method: 'POST',
        body: user,
      }),
    }),
    // ...other auth endpoints
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi; 
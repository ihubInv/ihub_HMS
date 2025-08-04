import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/users',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<any, { page?: number; limit?: number; role?: string; status?: string; search?: string }>({
      query: (params) => ({
        url: '',
        method: 'GET',
        params,
      }),
    }),
    getUser: builder.query<any, string>({
      query: (id) => `/${id}`,
    }),
    updateUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    // Add getUserDocuments if backend supports it
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useUpdateUserMutation } = userApi; 
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const maintenanceApi = createApi({
  reducerPath: 'maintenanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/maintenance',
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
    getMaintenanceRequests: builder.query<any, { page?: number; limit?: number; status?: string; priority?: string; search?: string }>({
      query: (params) => ({
        url: '',
        method: 'GET',
        params,
      }),
    }),
    // Add more endpoints as needed
  }),
});

export const { useGetMaintenanceRequestsQuery } = maintenanceApi; 
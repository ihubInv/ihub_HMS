import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bedApi = createApi({
  reducerPath: 'bedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/beds',
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
    getBed: builder.query<any, string>({
      query: (id) => `/${id}`,
    }),
    // Add more endpoints as needed
  }),
});

export const { useGetBedQuery } = bedApi; 
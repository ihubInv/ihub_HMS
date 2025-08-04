import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../index';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/reports',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOccupancyReport: builder.query<any, { startDate?: string; endDate?: string; format?: string }>({
      query: (params) => ({
        url: '/occupancy',
        params,
      }),
    }),
    getFinancialReport: builder.query<any, { startDate?: string; endDate?: string; format?: string }>({
      query: (params) => ({
        url: '/financial',
        params,
      }),
    }),
    getDemographicsReport: builder.query<any, { startDate?: string; endDate?: string; format?: string }>({
      query: (params) => ({
        url: '/demographics',
        params,
      }),
    }),
    getMaintenanceReport: builder.query<any, { startDate?: string; endDate?: string; format?: string }>({
      query: (params) => ({
        url: '/maintenance',
        params,
      }),
    }),
    getBookingsReport: builder.query<any, { startDate?: string; endDate?: string; status?: string; format?: string }>({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
    }),
  }),
});

export const {
  useGetOccupancyReportQuery,
  useGetFinancialReportQuery,
  useGetDemographicsReportQuery,
  useGetMaintenanceReportQuery,
  useGetBookingsReportQuery,
} = reportApi; 
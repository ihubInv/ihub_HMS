"use client"

import { emptyApi } from "../emptyApi";

export const dashboardApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<any, void>({
      query: () => "dashboard/stats",
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;

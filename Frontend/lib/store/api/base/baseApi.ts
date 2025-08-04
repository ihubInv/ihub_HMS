import { emptyApi } from "../emptyApi";

export const baseApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<string, void>({
      query: () => "health",
    }),
    getBuildingLayout: builder.query<any, void>({
      query: () => "dashboard/building-layout",
    }),
  }),
});

export const { useGetHealthQuery, useGetBuildingLayoutQuery } = baseApi;

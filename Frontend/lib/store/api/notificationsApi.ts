import { emptyApi } from "./emptyApi";

export const notificationsApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, { page?: number; limit?: number; type?: string; read?: boolean; priority?: string }>({
      query: ({ page = 1, limit = 20, type = "all", read, priority } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append("page", String(page));
        if (limit) params.append("limit", String(limit));
        if (type && type !== "all") params.append("type", type);
        if (read !== undefined) params.append("read", String(read));
        if (priority && priority !== "all") params.append("priority", priority);
        return {
          url: `/notifications?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<any, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi; 
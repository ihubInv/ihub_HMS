import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/bookings',
    credentials: 'include', // <-- send cookies with requests
    prepareHeaders: (headers, { getState }) => {
      // Add JWT token from Redux state if available
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Get all bookings (with filters)
    getBookings: builder.query<any, { page?: number; limit?: number; status?: string; floor?: string; search?: string }>({
      query: (params) => ({
        url: '',
        method: 'GET',
        params,
      }),
    }),
    // Get single booking
    getBooking: builder.query<any, string>({
      query: (id) => `/${id}`,
    }),
    // Create booking (with file upload)
    createBooking: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
      }),
    }),
    // Approve booking
    approveBooking: builder.mutation<any, { id: string; remarks?: string }>({
      query: ({ id, remarks }) => ({
        url: `/${id}/approve`,
        method: 'PUT',
        body: { remarks },
      }),
    }),
    // Reject booking
    rejectBooking: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
    }),
    // Cancel booking
    cancelBooking: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}/cancel`,
        method: 'PUT',
      }),
    }),
    // Update booking (modify)
    updateBooking: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: formData,
      }),
    }),
    // Get booking stats
    getBookingStats: builder.query<any, void>({
      query: () => 'stats',
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useApproveBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  useGetBookingStatsQuery,
  useUpdateBookingMutation, // <-- export the new hook
} = bookingApi; 
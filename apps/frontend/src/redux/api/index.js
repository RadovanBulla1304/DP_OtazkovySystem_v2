import * as authService from '@app/pages/auth/authService';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = authService.geTokenFromStorage();
    if (token) {
      headers.set('x-access-token', token);
    }
    return headers;
  }
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Users', 'CREOcards', 'CREOcardHistory'],
  endpoints: (builder) => ({
    getUserMe: builder.query({
      query: () => ({
        url: '/user/current',
        method: 'GET'
      })
    }),
    loginUser: builder.mutation({
      query: (data) => ({
        url: '/public/signin',
        method: 'POST',
        body: data
      })
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: '/admin/user',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Users'] : [])
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `/admin/user/${data.userId}`,
        method: 'PUT',
        body: data.data
      }),
      invalidatesTags: (result) => (result ? ['Users'] : [])
    }),
    removeUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/user/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Users']
    }),
    getUsersList: builder.query({
      query: () => ({
        url: '/admin/getAllUsers',
        method: 'GET'
      }),
      providesTags: ['Users']
    })
  })
});

export const {
  useGetUserMeQuery,
  useLazyGetUserMeQuery,
  useLoginUserMutation,
  useCreateUserMutation,
  useAddStudentMutation,
  useAddEmployeeOrAdminMutation,
  useCreateCREOcardMutation,
  useGetCREOcardsQuery,
  useCreateCREOcardHistoryMutation,
  useGetCREOcardHistoryQuery,
  useUpdateUserMutation,
  useRemoveUserMutation,
  useGetUsersListQuery
} = api;

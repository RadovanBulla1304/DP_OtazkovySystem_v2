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
    addStudent: builder.mutation({
      query: (data) => ({
        url: 'user/admin/addStudent',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Users'] : [])
    }),
    addEmployeeOrAdmin: builder.mutation({
      query: (data) => ({
        url: 'user/admin/addEmployeeOrAdmin',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Users'] : [])
    }),
    createCREOcard: builder.mutation({
      query: (data) => ({
        url: '/creocard/admin/addCREOcard',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['CREOcards'] : [])
    }),
    getCREOcards: builder.query({
      query: () => ({
        url: '/creocard/admin/getCREOcards',
        method: 'GET'
      }),
      providesTags: ['CREOcards']
    }),
    createCREOcardHistory: builder.mutation({
      query: (data) => ({
        url: '/creocardhistory/admin/addCREOcardHistory',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['CREOcardHistory'] : [])
    }),
    getCREOcardHistory: builder.query({
      query: (personalNumber) => ({
        url: `/creocardhistory/admin/getCREOcardHistory/${personalNumber}`,
        method: 'GET'
      }),
      providesTags: ['CREOcardHistory']
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
        url: '/admin/getAllUser',
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

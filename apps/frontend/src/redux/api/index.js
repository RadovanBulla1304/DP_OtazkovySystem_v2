import * as authService from '@app/pages/auth/authService';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { use } from 'react';

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
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // USERS
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
    }),
    // SUBJECTS
    createSubject: builder.mutation({
      query: (data) => ({
        url: '/subject',
        method: 'POST',
        body: data
      })
    }),
    getAllSubjects: builder.query({
      query: () => ({
        url: '/subject',
        method: 'GET',
        providesTags: ['Subjects'],
      })
    }),
    editSubject: builder.mutation({
      query: (data) => ({
        url: `/subject/${data.subjectId}`,
        method: 'PUT',
        body: data.data
      })
    }),
    deleteSubject: builder.mutation({
      query: (subjectId) => ({
        url: `/subject/${subjectId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Subjects'],
    }),
    getSubjectById: builder.query({
      query: (subjectId) => ({
        url: `/subject/${subjectId}`,
        method: 'GET'
      })
    }),
    asignUserToSubject: builder.mutation({
      query: (data) => ({
        url: '/subject/assign-user',
        method: 'POST',
        body: data
      })
    }),
    // MODULES
    createModul: builder.mutation({
      query: (data) => ({
        url: '/modul',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Moduls']
    }),

    getAllModuls: builder.query({
      query: () => ({
        url: '/modul',
        method: 'GET'
      }),
      providesTags: ['Moduls']
    }),

    getModulById: builder.query({
      query: (modulId) => ({
        url: `/modul/${modulId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [{ type: 'Moduls', id: arg }]
    }),

    getModulsBySubject: builder.query({
      query: (subjectId) => ({
        url: `/modul/subject/${subjectId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'Moduls', id: `SUBJECT-${arg}` },
        'Moduls'
      ]
    }),

    editModul: builder.mutation({
      query: ({ modulId, data }) => ({
        url: `/modul/${modulId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Moduls', id: arg.modulId },
        { type: 'Moduls', id: `SUBJECT-${result?.subject}` }
      ]
    }),

    deleteModul: builder.mutation({
      query: (modulId) => ({
        url: `/modul/${modulId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Moduls']
    }),

    deleteAllModulsBySubject: builder.mutation({
      query: (subjectId) => ({
        url: `/modul/subject/${subjectId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Moduls', id: `SUBJECT-${arg}` },
        'Moduls'
      ]
    })
  })
});

export const {
  // USERS
  useGetUserMeQuery,
  useLazyGetUserMeQuery,
  useLoginUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useRemoveUserMutation,
  useGetUsersListQuery,
  // SUBJECTS
  useCreateSubjectMutation,
  useGetAllSubjectsQuery,
  useEditSubjectMutation,
  useDeleteSubjectMutation,
  useGetSubjectByIdQuery,
  useAsignUserToSubjectMutation,
  // MODULS
  useCreateModulMutation,
  useGetAllModulsQuery,
  useLazyGetAllModulsQuery,
  useGetModulByIdQuery,
  useLazyGetModulByIdQuery,
  useGetModulsBySubjectQuery,
  useLazyGetModulsBySubjectQuery,
  useEditModulMutation,
  useDeleteModulMutation,
  useDeleteAllModulsBySubjectMutation,
} = api;

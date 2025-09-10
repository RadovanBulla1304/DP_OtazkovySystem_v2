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
  tagTypes: ['Users', 'Subjects', 'Moduls', 'Questions', 'QuestionRatings'],
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
    createTeacher: builder.mutation({
      query: (data) => ({
        url: '/admin/teacher',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Teachers'] : [])
    }),
    getAllTeachers: builder.query({
      query: () => ({
        url: '/admin/getAllTeachers',
        method: 'GET'
      }),
      providesTags: ['Teachers']
    }),
    removeTeacher: builder.mutation({
      query: (teacherId) => ({
        url: `/admin/teacher/${teacherId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Teachers']
    }),
    updateTeacher: builder.mutation({
      query: (data) => ({
        url: `/admin/teacher/${data.teacherId}`,
        method: 'PUT',
        body: data.data
      }),
      invalidatesTags: (result) => (result ? ['Teachers'] : [])
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: 'GET'
      }),
      providesTags: ['Users']
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
    unasignUserFromSubject: builder.mutation({
      query: (data) => ({
        url: '/subject/unassign-user',
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
    }),

    // QUESTIONS
    createQuestion: builder.mutation({
      query: (data) => ({
        url: '/question',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Questions']
    }),
    getQuestionsByModul: builder.query({
      query: (modulId) => ({
        url: `/question/module/${modulId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'Questions', id: `MODUL-${arg}` },
        'Questions'
      ]
    }),
    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `/question/${questionId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Questions']
    }),
    getQuestionsBySubjectId: builder.query({
      query: (subjectId) => ({
        url: `/question/subject/${subjectId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'Questions', id: `SUBJECT-${arg}` },
        'Questions'
      ]
    }),
    lazyGetQuestionsByModul: builder.query({
      query: (modulId) => ({
        url: `/question/modul/${modulId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'Questions', id: `MODUL-${arg}` },
        'Questions'
      ]
    }),
    getQuestionById: builder.query({
      query: (questionId) => ({
        url: `/question/${questionId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'Questions', id: arg }
      ]
    }),
    getQuestionByUserId: builder.query({
      query: (userId) => ({
        url: `/question/user/${userId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'Questions', id: `USER-${arg}` },
        'Questions'
      ]
    }),

    // QUESTION RATINGS
    createQuestionRating: builder.mutation({
      query: (data) => ({
        url: '/questionRating',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['QuestionRatings']
    }),
    editQuestionRating: builder.mutation({
      query: ({ id, data }) => ({
        url: `/questionRating/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['QuestionRatings']
    }),
    deleteQuestionRating: builder.mutation({
      query: (id) => ({
        url: `/questionRating/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['QuestionRatings']
    }),
    getRatingsByQuestionId: builder.query({
      query: (questionId) => ({
        url: `/questionRating/question/${questionId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'QuestionRatings', id: `QUESTION-${arg}` },
        'QuestionRatings'
      ]
    }),
    getRatingsByUserId: builder.query({
      query: (userId) => ({
        url: `/questionRating/user/${userId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) => [
        { type: 'QuestionRatings', id: `USER-${arg}` },
        'QuestionRatings'
      ]
    }),
  })
});

export const {
  // USERS / TEACHERS
  useGetUserMeQuery,
  useLazyGetUserMeQuery,
  useLoginUserMutation,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useCreateTeacherMutation,
  useRemoveTeacherMutation,
  useUpdateUserMutation,
  useUpdateTeacherMutation,
  useRemoveUserMutation,
  useGetUsersListQuery,
  useGetAllTeachersQuery,
  // SUBJECTS
  useCreateSubjectMutation,
  useGetAllSubjectsQuery,
  useEditSubjectMutation,
  useDeleteSubjectMutation,
  useGetSubjectByIdQuery,
  useAsignUserToSubjectMutation,
  useUnasignUserFromSubjectMutation,
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
  // QUESTIONS
  useCreateQuestionMutation,
  useGetQuestionsByModulQuery,
  useLazyGetQuestionsByModulQuery,
  useDeleteQuestionMutation,
  useGetQuestionsBySubjectIdQuery,
  useLazyGetQuestionsBySubjectIdQuery,
  useGetQuestionByIdQuery,
  useLazyGetQuestionByIdQuery,
  useGetQuestionByUserIdQuery,
  // QUESTION RATINGS
  useCreateQuestionRatingMutation,
  useEditQuestionRatingMutation,
  useDeleteQuestionRatingMutation,
  useGetRatingsByQuestionIdQuery,
  useGetRatingsByUserIdQuery,
} = api;

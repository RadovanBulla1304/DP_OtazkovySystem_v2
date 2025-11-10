import { useGetAllSubjectsQuery, useGetAllSubjectsAssignedToUserQuery, useGetTeacherSubjectsQuery, useGetUserMeQuery, useGetTeacherMeQuery } from '@app/redux/api';
import { useSyncExternalStore } from 'react';
import * as authService from '@app/pages/auth/authService';

function getCurrentSubjectId() {
    return localStorage.getItem('currentSubjectId');
}

export function useCurrentSubject() {
    const user = authService.getUserFromStorage();

    // Determine if user is teacher/admin
    const { data: userData, isLoading: isUserLoading } = useGetUserMeQuery();
    const { data: teacherData } = useGetTeacherMeQuery(undefined, {
        skip: !!userData || isUserLoading
    });

    const isAdmin = teacherData?.isAdmin || userData?.isAdmin;
    const isTeacher = !!teacherData && !teacherData.isAdmin;
    const isUser = !!userData && !userData.isAdmin;

    // Conditionally fetch subjects based on role
    // Admin teachers see all subjects
    const { data: allSubjects = [] } = useGetAllSubjectsQuery(undefined, {
        skip: !isAdmin
    });

    // Non-admin teachers see their assigned subjects
    const { data: teacherSubjects = [] } = useGetTeacherSubjectsQuery(undefined, {
        skip: !isTeacher
    });

    // Regular users see their assigned subjects
    const { data: userSubjects = [] } = useGetAllSubjectsAssignedToUserQuery(user?._id, {
        skip: !isUser || !user?._id
    });

    // Use appropriate subjects array based on role
    let subjects = [];
    if (isAdmin) {
        subjects = allSubjects;
    } else if (isTeacher) {
        subjects = teacherSubjects;
    } else if (isUser) {
        subjects = userSubjects;
    }

    const subjectId = useSyncExternalStore(
        (cb) => {
            window.addEventListener('subjectChanged', cb);
            return () => window.removeEventListener('subjectChanged', cb);
        },
        getCurrentSubjectId,
        getCurrentSubjectId
    );
    const currentSubject = subjects.find((s) => s.id === subjectId);
    return currentSubject;
}
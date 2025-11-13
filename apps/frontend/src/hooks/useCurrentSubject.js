import { useGetAllSubjectsQuery, useGetAllSubjectsAssignedToUserQuery, useGetTeacherSubjectsQuery, useGetUserMeQuery, useGetTeacherMeQuery } from '@app/redux/api';
import { useSyncExternalStore } from 'react';
import * as authService from '@app/pages/auth/authService';

function getCurrentSubjectId() {
    return localStorage.getItem('currentSubjectId');
}

export function useCurrentSubject() {
    const user = authService.getUserFromStorage();
    const isTeacherFromStorage = user?.isTeacher === true;

    // Fetch user or teacher data based on localStorage info
    const { data: userData } = useGetUserMeQuery(undefined, {
        skip: isTeacherFromStorage
    });
    const { data: teacherData } = useGetTeacherMeQuery(undefined, {
        skip: !isTeacherFromStorage
    });

    // Determine roles based on which data we have
    // For USERS: both admin and non-admin see their assigned subjects (no difference)
    // For TEACHERS: admin sees all subjects, non-admin sees only their assigned subjects
    const isAdminTeacher = isTeacherFromStorage && teacherData?.isAdmin;
    const isRegularTeacher = isTeacherFromStorage && !!teacherData && !teacherData.isAdmin;
    const isAnyUser = !isTeacherFromStorage && !!userData;

    // Conditionally fetch subjects based on role
    // Admin teachers see all subjects
    const { data: allSubjects = [] } = useGetAllSubjectsQuery(undefined, {
        skip: !isAdminTeacher
    });

    // Non-admin teachers see their assigned subjects
    const { data: teacherSubjects = [] } = useGetTeacherSubjectsQuery(undefined, {
        skip: !isRegularTeacher
    });

    // Regular users see their assigned subjects
    const { data: userSubjects = [] } = useGetAllSubjectsAssignedToUserQuery(user?._id, {
        skip: !isAnyUser || !user?._id
    });

    // Use appropriate subjects array based on role
    let subjects = [];
    if (isAdminTeacher) {
        subjects = allSubjects;
    } else if (isRegularTeacher) {
        subjects = teacherSubjects;
    } else if (isAnyUser) {
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
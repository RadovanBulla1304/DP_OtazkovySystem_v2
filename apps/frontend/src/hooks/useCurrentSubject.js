import { useGetAllSubjectsQuery } from '@app/redux/api';
import { useSyncExternalStore } from 'react';

function getCurrentSubjectId() {
    return localStorage.getItem('currentSubjectId');
}

export function useCurrentSubject() {
    const { data: subjects = [] } = useGetAllSubjectsQuery();
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
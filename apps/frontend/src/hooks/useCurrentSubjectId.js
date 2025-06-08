import { useSyncExternalStore } from "react";

function getCurrentSubjectId() {
    return localStorage.getItem("currentSubjectId");
}

export function useCurrentSubjectId() {
    return useSyncExternalStore(
        (cb) => {
            window.addEventListener("subjectChanged", cb); // listen for custom event
            return () => window.removeEventListener("subjectChanged", cb);
        },
        getCurrentSubjectId,
        getCurrentSubjectId
    );
}
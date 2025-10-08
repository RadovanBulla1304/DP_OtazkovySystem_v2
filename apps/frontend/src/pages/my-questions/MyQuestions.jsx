import { useCurrentSubject } from '@app/hooks/useCurrentSubject'; // adjust path as needed
import * as authService from '@app/pages/auth/authService';
import {
  useGetModulsBySubjectQuery,
  useGetQuestionByUserIdQuery,
  useGetQuestionsByModulQuery,
  useGetQuestionsBySubjectIdQuery
} from '@app/redux/api';
import { Box, Typography } from '@mui/material';
import React from 'react';
import DebugWeekControls from './components/DebugWeekControls';
import FilterControls from './components/FilterControls';
import ModuleQuestionsSection from './components/ModuleQuestionsSection';

const MyQuestions = () => {
  const auth = authService.getUserFromStorage();
  const userId = auth.id;

  // Get current subject from team switcher
  const currentSubject = useCurrentSubject();
  const subjectId = currentSubject?._id || currentSubject?.id || '';

  // Filter state
  const [filter, setFilter] = React.useState({
    date: '',
    modulId: ''
  });

  // Debug: manual week override
  const [debugWeekOverride, setDebugWeekOverride] = React.useState(null);

  // Fetch modules for the selected subject
  const { data: subjectModuls = [] } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch all user's questions
  const {
    data: questions = [],
    isLoading,
    error
  } = useGetQuestionByUserIdQuery(userId, {
    skip: !userId
  });

  // Fetch all questions for the currently filtered module (for Week 2 validation)
  const { data: currentModuleQuestions = [] } = useGetQuestionsByModulQuery(filter.modulId, {
    skip: !filter.modulId
  });

  // Fetch ALL questions in the subject (for when no specific module is selected)
  const { data: allSubjectQuestions = [] } = useGetQuestionsBySubjectIdQuery(subjectId, {
    skip: !subjectId || !!filter.modulId // Skip if no subject or if specific module is selected
  });

  // State management helpers (restored for Week 2 functionality)
  const getWeekStorageKey = React.useCallback(
    (moduleId, weekNum, type) => `module-${moduleId}-week-${weekNum}-${type}`,
    []
  );

  const saveWeekState = React.useCallback(
    (moduleId, weekNum, type, data) => {
      try {
        localStorage.setItem(getWeekStorageKey(moduleId, weekNum, type), JSON.stringify(data));
      } catch {
        // ignore storage errors
      }
    },
    [getWeekStorageKey]
  );

  const getWeekState = React.useCallback(
    (moduleId, weekNum, type) => {
      try {
        const raw = localStorage.getItem(getWeekStorageKey(moduleId, weekNum, type));
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    [getWeekStorageKey]
  );

  // State for currently selected module (for Week 2 question loading)
  // Note: Disabled for now to prevent infinite re-renders
  // TODO: Implement proper Week 2 validation question loading

  // Helper to determine current week for a module
  const getCurrentWeek = (modul) => {
    // Debug override takes precedence
    if (debugWeekOverride !== null) {
      return debugWeekOverride;
    }

    if (!modul || !modul.date_start || !modul.date_end) return 1;

    try {
      const now = new Date();
      const start = new Date(modul.date_start);
      const end = new Date(modul.date_end);

      if (now < start) return 0; // Not started
      if (now > end) return 4; // Finished (past week 3)

      const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      const week = Math.floor(diffDays / 7) + 1;
      return Math.min(Math.max(week, 1), 3);
    } catch {
      return 1;
    }
  };

  // State management helpers (disabled for now to prevent infinite loops)
  // TODO: Re-implement when Week 2 validation is properly implemented
  // const getWeekStorageKey = React.useCallback(
  //   (moduleId, weekNum, type) => `module-${moduleId}-week-${weekNum}-${type}`,
  //   []
  // );
  // const saveWeekState = React.useCallback(...);
  // const getWeekState = React.useCallback(...);

  // Helper to get module name by id
  const getModulName = (modulId) => {
    const modul = subjectModuls.find((m) => m._id === modulId);
    return modul ? modul.title || modul.name : modulId;
  };

  // Group questions by module
  const questionsByModule = React.useMemo(() => {
    const filtered = questions.filter((q) => {
      let pass = true;
      if (subjectId) {
        pass = pass && subjectModuls.some((m) => m._id === q.modul);
      }
      if (filter.modulId) {
        pass = pass && q.modul === filter.modulId;
      }
      if (filter.date) {
        pass = pass && q.createdAt.slice(0, 10) === filter.date;
      }
      return pass;
    });

    const grouped = {};
    filtered.forEach((q) => {
      if (!grouped[q.modul]) {
        grouped[q.modul] = [];
      }
      grouped[q.modul].push(q);
    });
    return grouped;
  }, [questions, subjectModuls, subjectId, filter]);

  // Helper to get validated questions for a module (restored Week 2 logic)
  const getValidatedQuestionsForModule = React.useCallback(
    (modulId) => {
      if (!modulId) {
        return [];
      }

      // Determine which questions to use based on filter
      let availableQuestions = [];
      if (filter.modulId) {
        // Specific module selected - use currentModuleQuestions
        if (modulId !== filter.modulId) {
          return []; // Only show for the filtered module
        }
        availableQuestions = currentModuleQuestions;
      } else {
        // No module filter - use questions from all subject for this specific module
        availableQuestions = allSubjectQuestions.filter((q) => q.modul === modulId);
      }

      // Always get/generate questions for validation (same logic as Week2.jsx)
      let questions = [];
      const stored = getWeekState(modulId, 2, 'selection');

      const pool = availableQuestions.filter(
        (q) => String(q.createdBy ?? q.created_by) !== String(userId)
      );

      if (stored && Array.isArray(stored) && stored.length > 0) {
        // Try to restore questions in the same order as stored
        questions = [];
        const missingIndices = [];

        stored.forEach((id, index) => {
          const foundQuestion = pool.find((p) => String(p._id) === String(id));
          if (foundQuestion) {
            questions[index] = foundQuestion;
          } else {
            missingIndices.push(index);
          }
        });

        // If some questions are missing, only replace those specific slots
        if (missingIndices.length > 0) {
          // Get questions not already selected
          const usedIds = questions.filter(Boolean).map((q) => q._id);
          const availablePool = pool.filter((q) => !usedIds.includes(q._id));

          // Shuffle only the available pool
          for (let i = availablePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
          }

          // Fill missing slots
          missingIndices.forEach((index, replacementIndex) => {
            if (availablePool[replacementIndex]) {
              questions[index] = availablePool[replacementIndex];
            }
          });

          // Update storage with new selection (maintaining order)
          const newStoredIds = questions.filter(Boolean).map((q) => q._id);
          // Pad to ensure we have 2 items if needed
          while (newStoredIds.length < 2 && availablePool[newStoredIds.length]) {
            newStoredIds.push(availablePool[newStoredIds.length]._id);
            questions.push(availablePool[newStoredIds.length - 1]);
          }
          saveWeekState(modulId, 2, 'selection', newStoredIds);
        }

        // Filter out any null/undefined entries and ensure we have up to 2 questions
        questions = questions.filter(Boolean).slice(0, 2);
      } else {
        // No stored selection - create new random selection
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        questions = pool.slice(0, 2);
        if (questions.length > 0) {
          saveWeekState(
            modulId,
            2,
            'selection',
            questions.map((q) => q._id)
          );
        }
      }

      return questions;
    },
    [
      filter.modulId,
      currentModuleQuestions,
      allSubjectQuestions,
      userId,
      getWeekState,
      saveWeekState
    ]
  );

  if (!subjectId) {
    return (
      <Box sx={{ pb: 3, pt: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Moje otázky
        </Typography>
        <Typography>Najprv vyberte predmet v team switcheri.</Typography>
      </Box>
    );
  }

  if (isLoading) return <Typography>Načítavam...</Typography>;
  if (error) return <Typography color="error">Chyba pri načítaní otázok.</Typography>;
  if (!questions.length) return <Typography>Nemáte žiadne otázky.</Typography>;

  return (
    <Box sx={{ pb: 3, pt: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Moje otázky
      </Typography>

      {/* Filters */}
      <FilterControls
        currentSubject={currentSubject}
        filter={filter}
        onFilterChange={setFilter}
        subjectModuls={subjectModuls}
      />

      {/* Debug controls */}
      <DebugWeekControls
        debugWeekOverride={debugWeekOverride}
        onWeekChange={setDebugWeekOverride}
      />

      {/* Questions grouped by module */}
      {Object.entries(questionsByModule).map(([modulId, moduleQuestions], index) => {
        const modul = subjectModuls.find((m) => m._id === modulId);
        const currentWeek = getCurrentWeek(modul);
        const weekStatus =
          currentWeek === 0 ? 'Nezačalo' : currentWeek >= 4 ? 'Dokončené' : `Týždeň ${currentWeek}`;

        const validatedQuestions = getValidatedQuestionsForModule(modulId);

        return (
          <ModuleQuestionsSection
            key={modulId}
            modulName={getModulName(modulId)}
            weekStatus={weekStatus}
            moduleQuestions={moduleQuestions}
            validatedQuestions={validatedQuestions}
            currentWeek={currentWeek}
            userId={userId}
            showDivider={index > 0}
          />
        );
      })}
    </Box>
  );
};

export default MyQuestions;

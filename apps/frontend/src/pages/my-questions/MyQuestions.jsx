import { useCurrentSubject } from '@app/hooks/useCurrentSubject'; // adjust path as needed
import * as authService from '@app/pages/auth/authService';
import {
  useGetModulsBySubjectQuery,
  useGetQuestionByUserIdQuery,
  useGetQuestionsByModulQuery,
  useGetQuestionsBySubjectIdQuery
} from '@app/redux/api';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React from 'react';

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

  // Render question based on module's current week
  const renderQuestion = (question, currentWeek, isValidatedByUser = false) => {
    const isInWeek3OrLater = currentWeek >= 3;

    // For Week 2 validation questions, use different styling and behavior
    if (isValidatedByUser) {
      const validated = question.validated_by && String(question.validated_by) === String(userId);

      return (
        <Card
          key={question._id}
          sx={{
            borderRadius: 2,
            height: 'fit-content',
            border: '1px solid',
            borderColor: validated ? 'success.main' : 'grey.300',
            bgcolor: validated ? 'success.50' : 'transparent',
            cursor: validated ? 'default' : 'pointer',
            '&:hover': validated ? {} : { backgroundColor: 'grey.50' }
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {question.text}
            </Typography>

            {/* Answer options */}
            <Box sx={{ mb: 2 }}>
              {question.options &&
                Object.entries(question.options).map(([key, value]) => (
                  <Typography
                    key={key}
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      ml: 1,
                      mb: 0.5
                    }}
                  >
                    {key.toUpperCase()}) {value}
                  </Typography>
                ))}
            </Box>

            {/* Show validation status if already validated */}
            {validated && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={question.validated ? 'Validná' : 'Nevalidná'}
                    color={question.validated ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                {question.validation_comment && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                  >
                    Komentár: {question.validation_comment}
                  </Typography>
                )}
              </Box>
            )}

            {/* Creation date */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Vytvorené: {new Date(question.createdAt).toLocaleDateString()}
              {!validated && <span> • Kliknite pre validáciu</span>}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    // Original rendering for user's own questions
    return (
      <Card key={question._id} sx={{ borderRadius: 2, height: 'fit-content' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {question.text}
          </Typography>

          {/* Answer options */}
          <Box sx={{ mb: 2 }}>
            {question.options &&
              Object.entries(question.options).map(([key, value]) => (
                <Typography
                  key={key}
                  variant="body2"
                  sx={{
                    color: key === question.correct ? 'success.dark' : 'text.secondary',
                    fontWeight: key === question.correct ? 600 : 400,
                    ml: 1,
                    mb: 0.5
                  }}
                >
                  {key.toUpperCase()}) {value} {key === question.correct && '✓'}
                </Typography>
              ))}
          </Box>

          {/* Week 3+ content - show validation status and feedback for own questions */}
          {!isValidatedByUser && isInWeek3OrLater && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {/* Validation status */}
                {question.validated_by ? (
                  <Chip
                    label={question.validated ? 'Validná' : 'Nevalidná'}
                    color={question.validated ? 'success' : 'error'}
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Nevalidovaná"
                    size="small"
                    sx={{
                      backgroundColor: '#000000',
                      color: 'white'
                    }}
                  />
                )}

                {/* User agreement status */}
                {question.user_agreement && (
                  <Chip
                    label={question.user_agreement.agreed ? 'Súhlasím' : 'Nesúhlasím'}
                    color={question.user_agreement.agreed ? 'success' : 'warning'}
                    size="small"
                  />
                )}
              </Box>

              {/* Validation comment */}
              {question.validation_comment && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                >
                  Validačný komentár: {question.validation_comment}
                </Typography>
              )}

              {/* User's response */}
              {question.user_agreement && question.user_agreement.comment && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.primary' }}
                >
                  Tvoja odpoveď: {question.user_agreement.comment}
                </Typography>
              )}
            </Box>
          )}

          {/* Creation date */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Vytvorené: {new Date(question.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (!subjectId) {
    return (
      <Box sx={{ p: 3 }}>
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Moje otázky
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Predmet"
          value={currentSubject?.name || ''}
          size="small"
          InputProps={{ readOnly: true }}
          sx={{ minWidth: 160 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="modul-filter-label">Modul</InputLabel>
          <Select
            labelId="modul-filter-label"
            label="Modul"
            value={filter.modulId}
            onChange={(e) => setFilter((f) => ({ ...f, modulId: e.target.value }))}
          >
            <MenuItem value="">Všetky</MenuItem>
            {subjectModuls.map((m) => (
              <MenuItem key={m._id} value={m._id}>
                {m.title || m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Dátum"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filter.date}
          onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
        />
      </Box>

      {/* Debug controls */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: 'warning.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'warning.200'
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Debug: Manuálne prepnutie týždňa
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button
            onClick={() => setDebugWeekOverride(1)}
            color={debugWeekOverride === 1 ? 'primary' : 'inherit'}
          >
            Týždeň 1
          </Button>
          <Button
            onClick={() => setDebugWeekOverride(2)}
            color={debugWeekOverride === 2 ? 'primary' : 'inherit'}
          >
            Týždeň 2
          </Button>
          <Button
            onClick={() => setDebugWeekOverride(3)}
            color={debugWeekOverride === 3 ? 'primary' : 'inherit'}
          >
            Týždeň 3
          </Button>
          <Button
            onClick={() => setDebugWeekOverride(4)}
            color={debugWeekOverride === 4 ? 'primary' : 'inherit'}
          >
            Dokončené
          </Button>
          <Button onClick={() => setDebugWeekOverride(null)}>Reset</Button>
        </ButtonGroup>
        {debugWeekOverride && (
          <Chip
            label={`Aktívny: ${debugWeekOverride === 4 ? 'Dokončené' : `Týždeň ${debugWeekOverride}`}`}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      {/* Questions grouped by module */}
      {Object.entries(questionsByModule).map(([modulId, moduleQuestions], index) => {
        const modul = subjectModuls.find((m) => m._id === modulId);
        const currentWeek = getCurrentWeek(modul);
        const weekStatus =
          currentWeek === 0 ? 'Nezačalo' : currentWeek >= 4 ? 'Dokončené' : `Týždeň ${currentWeek}`;

        const validatedQuestions = getValidatedQuestionsForModule(modulId);

        return (
          <Box key={modulId}>
            {index > 0 && <Divider sx={{ my: 4 }} />}

            {/* Module header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {getModulName(modulId)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {weekStatus} • {moduleQuestions.length} otázok
                {currentWeek >= 2 &&
                  validatedQuestions.length > 0 &&
                  ` • ${validatedQuestions.length} validovaných`}
              </Typography>
            </Box>

            {/* Week 1: User's own questions */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Moje otázky
              </Typography>

              {/* Questions in 2-column grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: 2,
                  mb: 2
                }}
              >
                {moduleQuestions.map((question) => renderQuestion(question, currentWeek, false))}
              </Box>

              {moduleQuestions.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Žiadne otázky v tomto module
                </Typography>
              )}
            </Box>

            {/* Week 2: Questions validated by user (only show if week >= 2) */}
            {currentWeek >= 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                  Otázky, ktoré som validoval/a
                </Typography>

                {/* Always show 2 question slots (same as Week2.jsx) */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: 2
                  }}
                >
                  {[0, 1].map((i) => {
                    const q = validatedQuestions[i];
                    if (q) {
                      return renderQuestion(q, currentWeek, true);
                    } else {
                      return (
                        <Box
                          key={`empty-${i}`}
                          sx={{
                            p: 2,
                            border: '1px dashed',
                            borderColor: 'grey.200',
                            borderRadius: 1,
                            color: 'text.disabled',
                            height: 'fit-content'
                          }}
                        >
                          <Typography>Žiadna otázka na validáciu</Typography>
                        </Box>
                      );
                    }
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default MyQuestions;

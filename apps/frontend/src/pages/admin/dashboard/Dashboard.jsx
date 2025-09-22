import * as authService from '@app/pages/auth/authService';
import {
  useGetQuestionsByModulQuery,
  useLazyGetModulsBySubjectQuery,
  useRespondToValidationMutation,
  useValidateQuestionMutation
} from '@app/redux/api';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import RespondToValidationModal from '../components/RespondToValidationModal';
import ValidateQuestionModal from '../components/ValidateQuestionModal';
import DefaultWeek from './weeks/DefaultWeek';
import Week1 from './weeks/Week1';
import Week2 from './weeks/Week2';
import Week3 from './weeks/Week3';
import WeekSelector from './weeks/WeekSelector';

const Dashboard = () => {
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  const [selectedModulId, setSelectedModulId] = useState('');
  const [trigger, { data: moduls = [], isFetching }] = useLazyGetModulsBySubjectQuery();
  const [selectedModul, setSelectedModul] = useState(null);

  // RTK Query mutations for validation and responses
  const [validateQuestion] = useValidateQuestionMutation();
  const [respondToValidation] = useRespondToValidationMutation();

  // localCreated stores newly created questions client-side until server returns them
  const [localCreated, setLocalCreated] = useState({}); // { modulId: { weekNumber: [questions] } }

  const auth = authService.getUserFromStorage();
  const userId = auth?.id || auth?._id || auth?.userId || null;

  // Fetch questions for selected module (all users) then filter to current user
  const { data: modulQuestions = [] } = useGetQuestionsByModulQuery(selectedModulId, {
    skip: !selectedModulId
  });

  // (removed unused helper)

  // (removed unused currentWeekIndex) compute current week inline where needed

  // Build merged questions per week (server + localCreated) for this user
  const questionsByWeekMerged = useMemo(() => {
    const mapping = {};
    if (!selectedModulId) return mapping;
    mapping[selectedModulId] = {};

    // local helper captured here so lint doesn't complain about changing identity
    const getWeekNumberFromDate = (createdAt) => {
      try {
        if (!selectedModul || !selectedModul.date_start || !createdAt) return 1;
        const start = new Date(selectedModul.date_start);
        const created = new Date(createdAt);
        const diffDays = Math.floor((created - start) / (1000 * 60 * 60 * 24));
        const wn = Math.floor(diffDays / 7) + 1;
        return wn < 1 ? 1 : wn;
      } catch {
        return 1;
      }
    };

    // server-side questions
    modulQuestions.forEach((q) => {
      const creator = q.createdBy ?? q.created_by;
      if (!creator || String(creator) !== String(userId)) return;
      const wn = getWeekNumberFromDate(q.createdAt);
      if (!mapping[selectedModulId][wn]) mapping[selectedModulId][wn] = [];
      mapping[selectedModulId][wn].push(q);
    });

    // local-created questions
    const local = localCreated[selectedModulId] || {};
    Object.keys(local).forEach((k) => {
      const wn = Number(k);
      const arr = local[wn] || [];
      if (!mapping[selectedModulId][wn]) mapping[selectedModulId][wn] = [];
      arr.forEach((q) => {
        // avoid duplicates by _id
        if (q._id && mapping[selectedModulId][wn].some((s) => s._id === q._id)) return;
        mapping[selectedModulId][wn].push(q);
      });
    });

    return mapping;
  }, [modulQuestions, localCreated, selectedModulId, userId, selectedModul]);

  // We maintain localCreated for optimistic UI; server questions are mapped via questionsByWeekMerged.
  // No effect needed to copy modulQuestions into component state.

  // Listen for subject changes from TeamSwitcher
  useEffect(() => {
    const updateSubject = () => {
      const id = localStorage.getItem('currentSubjectId');
      setCurrentSubjectId(id);
    };
    updateSubject();
    window.addEventListener('subjectChanged', updateSubject);
    return () => window.removeEventListener('subjectChanged', updateSubject);
  }, []);

  // Fetch modules when subject changes
  useEffect(() => {
    if (currentSubjectId) {
      trigger(currentSubjectId);
      setSelectedModulId('');
    }
  }, [currentSubjectId, trigger]);

  // Keep selected module object in state
  useEffect(() => {
    const mod = moduls.find((m) => m._id === selectedModulId) || null;
    setSelectedModul(mod);
  }, [selectedModulId, moduls]);

  const handleModulChange = (event) => {
    setSelectedModulId(event.target.value);
  };
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(1);
  const [validateOpen, setValidateOpen] = useState(false);
  const [questionToValidate, setQuestionToValidate] = useState(null);
  const [respondOpen, setRespondOpen] = useState(false);
  const [questionToRespond, setQuestionToRespond] = useState(null);

  // Debug: manual week override
  const [debugWeekOverride, setDebugWeekOverride] = useState(null);

  // When selected module changes, reset selectedWeekNumber to the current week (or 1)
  useEffect(() => {
    if (!selectedModul) return;
    const weeks = buildWeeks(selectedModul);
    const now = new Date();
    const currentWeek = weeks.find((w) => isDateInRange(now, w.start, w.end)) || weeks[0] || null;
    setSelectedWeekNumber(
      currentWeek ? currentWeek.weekNumber : (weeks[0] && weeks[0].weekNumber) || 1
    );
  }, [selectedModul]);

  // Helper: build week ranges from module dates or fallback to week_number
  const buildWeeks = (modul) => {
    if (!modul) return [];

    // Prefer date range if available
    const weeks = [];
    try {
      const start = modul.date_start ? new Date(modul.date_start) : null;
      const end = modul.date_end ? new Date(modul.date_end) : null;

      if (start && end && end > start) {
        // compute number of weeks by ceil of days/7
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const count = Math.max(1, Math.ceil(days / 7));
        for (let i = 0; i < count; i++) {
          const s = new Date(start);
          s.setDate(start.getDate() + i * 7);
          const e = new Date(s);
          e.setDate(s.getDate() + 6);
          weeks.push({ weekNumber: i + 1, start: s, end: e });
        }
        return weeks;
      }
    } catch {
      // fall back to week_number field below
    }

    // Fallback: use modul.week_number (number of weeks) or 3 weeks default
    const count = modul.week_number || 3;
    const now = new Date();
    for (let i = 0; i < count; i++) {
      // Rough ranges: consecutive 7-day buckets from today
      const s = new Date(now);
      s.setDate(now.getDate() + i * 7);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      weeks.push({ weekNumber: i + 1, start: s, end: e });
    }
    return weeks;
  };

  const isDateInRange = (date, start, end) => {
    const d = new Date(date).setHours(0, 0, 0, 0);
    return d >= new Date(start).setHours(0, 0, 0, 0) && d <= new Date(end).setHours(0, 0, 0, 0);
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return '';
    }
  };

  // State management helpers
  const getWeekStorageKey = (moduleId, weekNum, type) =>
    `module-${moduleId}-week-${weekNum}-${type}`;

  const saveWeekState = (moduleId, weekNum, type, data) => {
    try {
      localStorage.setItem(getWeekStorageKey(moduleId, weekNum, type), JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  };

  const getWeekState = (moduleId, weekNum, type) => {
    try {
      const raw = localStorage.getItem(getWeekStorageKey(moduleId, weekNum, type));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Get effective current week (considering debug override)
  const getEffectiveCurrentWeek = (weeks, now) => {
    if (debugWeekOverride !== null && weeks[debugWeekOverride - 1]) {
      return weeks[debugWeekOverride - 1];
    }
    return weeks.find((w) => isDateInRange(now, w.start, w.end)) || weeks[0] || null;
  };

  return (
    <Box sx={{ pt: 2 }}>
      {isFetching ? (
        <CircularProgress />
      ) : moduls && moduls.length > 0 ? (
        <>
          <FormControl fullWidth sx={{ maxWidth: 400, mb: 3 }}>
            <InputLabel id="modul-select-label">Modul</InputLabel>
            <Select
              labelId="modul-select-label"
              value={selectedModulId}
              label="Modul"
              onChange={handleModulChange}
            >
              {moduls.map((modul) => (
                <MenuItem key={modul._id} value={modul._id}>
                  {modul.name || modul.title || modul._id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
              <Button onClick={() => setDebugWeekOverride(null)}>Reset</Button>
            </ButtonGroup>
            {debugWeekOverride && (
              <Chip label={`Aktívny: Týždeň ${debugWeekOverride}`} size="small" sx={{ ml: 1 }} />
            )}
          </Box>
        </>
      ) : (
        <Typography color="text.secondary">Pre tento predmet nie sú žiadne moduly.</Typography>
      )}

      {/* Week columns for selected module: left = actual current week, right = week selector + chosen week */}
      {selectedModul
        ? (() => {
            const weeks = buildWeeks(selectedModul);
            const now = new Date();
            const currentWeek = getEffectiveCurrentWeek(weeks, now);

            const renderWeek = (w, isCurrent) => {
              const status = isCurrent
                ? 'Aktuálny týždeň'
                : now < w.start
                  ? 'Coming soon'
                  : 'Completed';

              const commonProps = {
                week: w,
                isCurrent,
                status,
                formatDate
              };

              // Week 1: Add questions
              if (w.weekNumber === 1) {
                return (
                  <Week1
                    {...commonProps}
                    questionsByWeekMerged={questionsByWeekMerged}
                    selectedModul={selectedModul}
                    getWeekState={getWeekState}
                    saveWeekState={saveWeekState}
                    setLocalCreated={setLocalCreated}
                  />
                );
              }

              // Week 2: Validate external questions
              if (w.weekNumber === 2) {
                return (
                  <Week2
                    {...commonProps}
                    modulQuestions={modulQuestions}
                    userId={userId}
                    selectedModul={selectedModul}
                    getWeekState={getWeekState}
                    saveWeekState={saveWeekState}
                    setQuestionToValidate={setQuestionToValidate}
                    setValidateOpen={setValidateOpen}
                  />
                );
              }

              // Week 3: Respond to validations
              if (w.weekNumber === 3) {
                return (
                  <Week3
                    {...commonProps}
                    modulQuestions={modulQuestions}
                    userId={userId}
                    setQuestionToRespond={setQuestionToRespond}
                    setRespondOpen={setRespondOpen}
                  />
                );
              }

              // Default for other weeks
              return <DefaultWeek {...commonProps} />;
            };

            return (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'stretch' }}>
                {/* Left column - 50% width */}
                <Box sx={{ width: '50%', pr: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Aktuálny týždeň
                  </Typography>
                  {currentWeek ? (
                    renderWeek(currentWeek, true)
                  ) : (
                    <Typography>Žiadny aktuálny týždeň</Typography>
                  )}
                </Box>

                {/* Center separator */}
                <Box
                  sx={{
                    width: '1px',
                    backgroundColor: 'divider',
                    mx: 1,
                    alignSelf: 'stretch'
                  }}
                />

                {/* Right column - Week Selector Component */}
                <WeekSelector
                  selectedModul={selectedModul}
                  weeks={weeks}
                  selectedWeekNumber={selectedWeekNumber}
                  setSelectedWeekNumber={setSelectedWeekNumber}
                  formatDate={formatDate}
                  questionsByWeekMerged={questionsByWeekMerged}
                  modulQuestions={modulQuestions}
                  userId={userId}
                  getWeekState={getWeekState}
                  saveWeekState={saveWeekState}
                  setLocalCreated={setLocalCreated}
                  setQuestionToValidate={setQuestionToValidate}
                  setValidateOpen={setValidateOpen}
                  setQuestionToRespond={setQuestionToRespond}
                  setRespondOpen={setRespondOpen}
                  currentWeekNumber={getEffectiveCurrentWeek(weeks, now)?.weekNumber || 1}
                />
              </Box>
            );
          })()
        : null}

      {/* Validation modal for external questions */}
      <ValidateQuestionModal
        open={validateOpen}
        question={questionToValidate}
        onClose={() => setValidateOpen(false)}
        onSubmit={async (questionId, payload) => {
          try {
            // Submit validation using RTK Query - this will save to database
            await validateQuestion({
              questionId,
              valid: payload.valid,
              comment: payload.comment
            }).unwrap();

            // The RTK Query will automatically invalidate cache and refresh data
            console.log('Validation submitted successfully');
          } catch (error) {
            console.error('Error submitting validation:', error);
            // In future: show toast / update UI
          }
        }}
      />

      {/* Response modal for week 3 */}
      <RespondToValidationModal
        open={respondOpen}
        question={questionToRespond}
        onClose={() => setRespondOpen(false)}
        onSubmit={async (questionId, payload) => {
          try {
            // Submit response using RTK Query - this will save to database
            await respondToValidation({
              questionId,
              agreed: payload.agreed,
              comment: payload.comment
            }).unwrap();

            // The RTK Query will automatically invalidate cache and refresh data
            console.log('Response submitted successfully');
          } catch (error) {
            console.error('Error submitting response:', error);
          }
        }}
      />
    </Box>
  );
};

export default Dashboard;

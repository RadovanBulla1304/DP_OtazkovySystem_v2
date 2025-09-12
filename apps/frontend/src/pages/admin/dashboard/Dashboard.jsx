import * as authService from '@app/pages/auth/authService';
import { useGetQuestionsByModulQuery, useLazyGetModulsBySubjectQuery } from '@app/redux/api';
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import AddQuestionModal from '../components/AddQuestionModal';
import ValidateQuestionModal from '../components/ValidateQuestionModal';

const Dashboard = () => {
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  const [selectedModulId, setSelectedModulId] = useState('');
  const [trigger, { data: moduls = [], isFetching }] = useLazyGetModulsBySubjectQuery();
  const [selectedModul, setSelectedModul] = useState(null);
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
        </>
      ) : (
        <Typography color="text.secondary">Pre tento predmet nie sú žiadne moduly.</Typography>
      )}

      {/* Week columns for selected module: left = actual current week, right = week selector + chosen week */}
      {selectedModul
        ? (() => {
            const weeks = buildWeeks(selectedModul);
            const now = new Date();
            const currentWeek =
              weeks.find((w) => isDateInRange(now, w.start, w.end)) || weeks[0] || null;

            const renderWeek = (w, isCurrent) => {
              const status = isCurrent
                ? 'Aktuálny týždeň'
                : now < w.start
                  ? 'Coming soon'
                  : 'Completed';
              // default questions for this week (server + local)
              let questions =
                (questionsByWeekMerged[selectedModul._id] &&
                  questionsByWeekMerged[selectedModul._id][w.weekNumber]) ||
                [];

              // If this is week 2, instead show two random questions from the module
              // where the owner is NOT the current user.
              let externalSelection = [];
              if (w.weekNumber === 2) {
                try {
                  const pool = (modulQuestions || []).filter(
                    (q) => String(q.createdBy ?? q.created_by) !== String(userId)
                  );

                  const storageKey = `module-${selectedModul._id}-week-2-selection`;
                  const stored = (() => {
                    try {
                      const raw = localStorage.getItem(storageKey);
                      return raw ? JSON.parse(raw) : null;
                    } catch {
                      return null;
                    }
                  })();

                  if (stored && Array.isArray(stored) && stored.length > 0) {
                    // restore from stored ids if they still exist in pool
                    const restored = stored
                      .map((id) => pool.find((p) => String(p._id) === String(id)))
                      .filter(Boolean)
                      .slice(0, 2);
                    if (restored.length === stored.length && restored.length > 0) {
                      externalSelection = restored;
                    } else {
                      // stored ids missing or invalid -> choose new and persist
                      for (let i = pool.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [pool[i], pool[j]] = [pool[j], pool[i]];
                      }
                      externalSelection = pool.slice(0, 2);
                      try {
                        localStorage.setItem(
                          storageKey,
                          JSON.stringify(externalSelection.map((q) => q._id))
                        );
                      } catch {
                        // ignore storage errors
                      }
                    }
                  } else {
                    // no stored selection -> pick and persist
                    for (let i = pool.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [pool[i], pool[j]] = [pool[j], pool[i]];
                    }
                    externalSelection = pool.slice(0, 2);
                    try {
                      localStorage.setItem(
                        storageKey,
                        JSON.stringify(externalSelection.map((q) => q._id))
                      );
                    } catch {
                      // ignore storage errors
                    }
                  }
                } catch {
                  externalSelection = [];
                }
                // use externalSelection for rendering slots below
                questions = externalSelection;
              }
              return (
                <Box
                  key={w.weekNumber}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    border: 1,
                    borderColor: isCurrent ? 'primary.main' : 'grey.300',
                    backgroundColor: isCurrent ? 'rgba(25,118,210,0.08)' : 'transparent'
                  }}
                >
                  <Typography variant="h6">
                    Týždeň {w.weekNumber} ({formatDate(w.start)} - {formatDate(w.end)})
                  </Typography>
                  <Typography color="text.secondary">{status}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(() => {
                      const slots = [];
                      for (let i = 0; i < 2; i++) {
                        // For week 2, use externalSelection (already set on questions variable) which comes from modulQuestions
                        const q = questions[i];
                        // If this is week 2 and question belongs to another user, render as clickable validation card
                        if (
                          w.weekNumber === 2 &&
                          q &&
                          String(q.createdBy ?? q.created_by) !== String(userId)
                        ) {
                          slots.push(
                            <Box
                              key={`ext-${i}`}
                              sx={{
                                p: 1,
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'grey.50' }
                              }}
                              onClick={() => {
                                setQuestionToValidate(q);
                                setValidateOpen(true);
                              }}
                            >
                              <Typography sx={{ fontWeight: 600 }}>{q.text}</Typography>
                              <Typography color="text.secondary">Odpoveď: {q.correct}</Typography>
                            </Box>
                          );
                        } else if (q) {
                          slots.push(
                            <Box
                              key={i}
                              sx={{
                                p: 1,
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 1
                              }}
                            >
                              <Typography sx={{ fontWeight: 600 }}>{q.text}</Typography>
                              <Typography color="text.secondary">Odpoveď: {q.correct}</Typography>
                            </Box>
                          );
                        } else {
                          if (w.weekNumber === 2) {
                            // For week 2 we intentionally do not render AddQuestionModal rows.
                            // If there is no question (e.g. not enough external questions), show an empty placeholder.
                            slots.push(
                              <Box
                                key={`empty-${i}`}
                                sx={{
                                  p: 2,
                                  border: '1px dashed',
                                  borderColor: 'grey.200',
                                  borderRadius: 1,
                                  color: 'text.disabled'
                                }}
                              >
                                <Typography>Žiadna otázka</Typography>
                              </Box>
                            );
                          } else {
                            slots.push(
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                                <AddQuestionModal
                                  modulId={selectedModul._id}
                                  disabled={!isCurrent}
                                  onCreated={(created) => {
                                    setLocalCreated((prev) => {
                                      const next = { ...prev };
                                      if (!next[selectedModul._id]) next[selectedModul._id] = {};
                                      if (!next[selectedModul._id][w.weekNumber])
                                        next[selectedModul._id][w.weekNumber] = [];
                                      next[selectedModul._id][w.weekNumber].push(created);
                                      return next;
                                    });
                                  }}
                                />
                                <Typography color="text.secondary" sx={{ ml: 1 }}>
                                  Pridať otázku
                                </Typography>
                              </Box>
                            );
                          }
                        }
                      }
                      return slots;
                    })()}
                  </Box>
                </Box>
              );
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

                {/* Right column - 50% width */}
                <Box sx={{ width: '50%', pl: 2 }}>
                  {/* Spinner + date range at top of right column */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {selectedModul && (
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {selectedModul.name || selectedModul.title || ''}
                        </Typography>
                        <Typography color="text.secondary">
                          {selectedModul.date_start ? formatDate(selectedModul.date_start) : '-'} —{' '}
                          {selectedModul.date_end ? formatDate(selectedModul.date_end) : '-'}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="week-select-label">Týždeň</InputLabel>
                    <Select
                      labelId="week-select-label"
                      value={selectedWeekNumber}
                      label="Týždeň"
                      onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                    >
                      {weeks.map((w) => (
                        <MenuItem key={w.weekNumber} value={w.weekNumber}>
                          Týždeň {w.weekNumber} ({formatDate(w.start)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {(() => {
                    const chosen =
                      weeks.find((x) => x.weekNumber === selectedWeekNumber) || weeks[0] || null;
                    const isChosenCurrent = chosen
                      ? isDateInRange(now, chosen.start, chosen.end)
                      : false;
                    return chosen ? (
                      renderWeek(chosen, isChosenCurrent)
                    ) : (
                      <Typography>Vyberte týždeň</Typography>
                    );
                  })()}
                </Box>
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
            // submit validation to backend - endpoint may not exist, so ignore errors
            await fetch(`/api/questions/${questionId}/validate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch {
            // swallow - backend may not support this yet
            // In future: show toast / update UI
          }
        }}
      />
    </Box>
  );
};

export default Dashboard;

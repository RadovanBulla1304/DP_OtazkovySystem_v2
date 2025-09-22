import { Box, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const Week2 = ({
  week,
  isCurrent,
  status,
  formatDate,
  modulQuestions,
  userId,
  selectedModul,
  getWeekState,
  saveWeekState,
  setQuestionToValidate,
  setValidateOpen
}) => {
  // Check validation completion by counting questions validated by current user
  const questionsValidatedByUser = (modulQuestions || []).filter(
    (q) => q.validated_by && String(q.validated_by) === String(userId)
  ).length;
  const isCompleted = questionsValidatedByUser >= 2;

  // Always get/generate questions for validation (don't switch based on completion)
  let questions = [];
  const stored = getWeekState(selectedModul._id, 2, 'selection');

  const pool = (modulQuestions || []).filter(
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
      saveWeekState(selectedModul._id, 2, 'selection', newStoredIds);
    }

    // Filter out any null/undefined entries and ensure we have up to 2 questions
    questions = questions.filter(Boolean).slice(0, 2);
  } else {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    questions = pool.slice(0, 2);
    saveWeekState(
      selectedModul._id,
      2,
      'selection',
      questions.map((q) => q._id)
    );
  }

  return (
    <Box
      key={week.weekNumber}
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
        Týždeň {week.weekNumber} ({formatDate(week.start)} - {formatDate(week.end)})
      </Typography>
      <Typography color="text.secondary">{status}</Typography>
      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
        Validuj 2 otázky od iných študentov
      </Typography>
      {isCompleted && (
        <Chip label="Validácia dokončená" color="success" size="small" sx={{ mt: 1 }} />
      )}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[0, 1].map((i) => {
          const q = questions[i];
          if (q) {
            // Check if current user has validated this question
            const validated = q.validated_by && String(q.validated_by) === String(userId);
            return (
              <Box
                key={`ext-${i}`}
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: validated ? 'success.main' : 'grey.300',
                  borderRadius: 1,
                  cursor: validated ? 'default' : 'pointer',
                  bgcolor: validated ? 'success.50' : 'transparent',
                  '&:hover': validated ? {} : { backgroundColor: 'grey.50' }
                }}
                onClick={() => {
                  if (!validated) {
                    setQuestionToValidate(q);
                    setValidateOpen(true);
                  }
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{q.text}</Typography>
                <Box sx={{ mt: 1 }}>
                  {q.options &&
                    Object.entries(q.options).map(([key, value]) => (
                      <Typography
                        key={key}
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          ml: 1
                        }}
                      >
                        {key.toUpperCase()}) {value}
                      </Typography>
                    ))}
                </Box>
                {validated && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={q.validated ? 'Validná' : 'Nevalidná'}
                      color={q.validated ? 'success' : 'error'}
                      size="small"
                    />
                    {q.validation_comment && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                      >
                        Komentár: {q.validation_comment}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            );
          } else {
            return (
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
                <Typography>Žiadna otázka na validáciu</Typography>
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
};

Week2.propTypes = {
  week: PropTypes.shape({
    weekNumber: PropTypes.number.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired
  }).isRequired,
  isCurrent: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  formatDate: PropTypes.func.isRequired,
  modulQuestions: PropTypes.array,
  userId: PropTypes.string.isRequired,
  selectedModul: PropTypes.shape({
    _id: PropTypes.string.isRequired
  }).isRequired,
  getWeekState: PropTypes.func.isRequired,
  saveWeekState: PropTypes.func.isRequired,
  setQuestionToValidate: PropTypes.func.isRequired,
  setValidateOpen: PropTypes.func.isRequired
};

export default Week2;

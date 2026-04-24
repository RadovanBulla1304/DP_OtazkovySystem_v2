import { useGetQuestionAssignmentsQuery } from '@app/redux/api';
import { Box, Chip, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const Week2 = ({
  week,
  isCurrent,
  status,
  formatDate,
  userId,
  setQuestionToValidate,
  setValidateOpen,
  selectedModul
}) => {
  // Get question assignments for this user in this module
  const { data: assignmentsData, isLoading: assignmentsLoading } = useGetQuestionAssignmentsQuery(
    { userId, modulId: selectedModul?._id },
    { skip: !userId || !selectedModul?._id }
  );

  const assignments = assignmentsData?.data || [];
  const automaticPoints = assignmentsData?.automaticPoints || 0;

  // Per-student validation status now lives on the assignment, not on q.validated_by
  const questionsValidatedByUser = assignments.filter((a) => a.validated).length;

  // Week 2 points are module-specific: 1 point per validated assigned question (max 2)
  const earnedPoints = questionsValidatedByUser;
  const maxPoints = 2;
  const isCompleted = questionsValidatedByUser >= 2;

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
      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
        {isCompleted && <Chip label="Validácia dokončená" color="success" size="small" />}
        <Chip
          label={`${earnedPoints}/${maxPoints} bodov`}
          color={earnedPoints > 0 ? (earnedPoints >= maxPoints ? 'success' : 'warning') : 'default'}
          size="small"
          variant="outlined"
        />
        {earnedPoints >= maxPoints && (
          <Chip label="Všetky body získané" color="success" size="small" />
        )}
      </Stack>
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[0, 1].map((i) => {
          const assignment = assignments[i];
          const q = assignment?.question;
          if (q && q._id) {
            // Use assignment-level validation data (per-student, never overwritten by other students)
            const validated = assignment.validated;
            const validationResult = assignment.validation_result;
            const validationComment = assignment.validation_comment;
            const canValidateInWeek2 = isCurrent;
            return (
              <Box
                key={`ext-${i}`}
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: validated ? 'success.main' : 'grey.300',
                  borderRadius: 1,
                  cursor: canValidateInWeek2 ? 'pointer' : 'default',
                  bgcolor: validated ? 'success.50' : 'transparent',
                  '&:hover': !canValidateInWeek2
                    ? {}
                    : {
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'action.hover'
                      }
                }}
                onClick={() => {
                  if (canValidateInWeek2) {
                    setQuestionToValidate({ question: q, assignment });
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
                      label={validationResult ? 'Validná' : 'Nevalidná'}
                      color={validationResult ? 'success' : 'error'}
                      size="small"
                    />
                    {validationComment && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                      >
                        Komentár: {validationComment}
                      </Typography>
                    )}
                  </Box>
                )}
                {canValidateInWeek2 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {validated ? 'Kliknite pre zmenu validácie' : 'Kliknite pre validáciu'}
                  </Typography>
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
                <Typography>
                  {assignmentsLoading
                    ? 'Načítavanie...'
                    : automaticPoints > 0
                      ? `Automatický bod udelený (nedostatok otázok)`
                      : 'Žiadna otázka na validáciu'}
                </Typography>
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
  userId: PropTypes.string.isRequired,
  setQuestionToValidate: PropTypes.func.isRequired,
  setValidateOpen: PropTypes.func.isRequired,
  selectedModul: PropTypes.shape({
    _id: PropTypes.string.isRequired
  })
};

export default Week2;

import { useGetQuestionAssignmentsQuery, useGetUserPointsQuery } from '@app/redux/api';
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
  // Get points data for the current user
  const { data: pointsData } = useGetUserPointsQuery(userId, {
    skip: !userId
  });

  // Get question assignments for this user in this module
  const { data: assignmentsData, isLoading: assignmentsLoading } = useGetQuestionAssignmentsQuery(
    { userId, modulId: selectedModul?._id },
    { skip: !userId || !selectedModul?._id }
  );

  const assignments = assignmentsData?.data || [];
  const automaticPoints = assignmentsData?.automaticPoints || 0;

  // Calculate points for Week 2 - validation (1 point per validation, max 2)
  const validationPoints =
    pointsData?.data?.filter((point) => point.category === 'question_validation') || [];

  const earnedPoints = validationPoints.length;
  const maxPoints = 2;

  // Get the assigned questions
  const assignedQuestions = assignments.map((assignment) => assignment.question);

  // Check which questions have been validated by the current user
  const questionsValidatedByUser = assignedQuestions.filter(
    (q) => q.validated_by && String(q.validated_by) === String(userId)
  ).length;
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
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
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
          const q = assignedQuestions[i];
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

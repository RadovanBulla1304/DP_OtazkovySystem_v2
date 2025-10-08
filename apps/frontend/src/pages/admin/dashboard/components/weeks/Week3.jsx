import { useGetUserPointsQuery, useUpdateQuestionMutation } from '@app/redux/api';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import EditQuestionModal from '../../../subjects/components/EditQuestionModal';

const Week3 = ({
  week,
  isCurrent,
  status,
  formatDate,
  modulQuestions,
  userId,
  setQuestionToRespond,
  setRespondOpen
}) => {
  // Get points data for the current user
  const { data: pointsData } = useGetUserPointsQuery(userId, {
    skip: !userId
  });

  // Mutation for updating questions (only available during Week 3)
  const [updateQuestion] = useUpdateQuestionMutation();

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  // Get user's questions that should have been validated
  const userQuestions = (modulQuestions || []).filter(
    (q) => String(q.createdBy ?? q.created_by) === String(userId)
  );

  // Use the database fields directly - no localStorage needed
  const questionsWithValidations = userQuestions.map((q) => {
    return {
      ...q,
      // Use database fields directly
      validated: q.validated,
      validation_comment: q.validation_comment,
      validated_at: q.validated_at,
      validated_by: q.validated_by,
      user_agreement: q.user_agreement
    };
  });

  // Count how many questions have responses
  const questionsWithResponses = questionsWithValidations.filter((q) => q.user_agreement).length;
  const isCompleted = questionsWithResponses >= 2;

  // Calculate points for Week 3 - reparation (1 point per response, max 2)
  const reparationPoints =
    pointsData?.data?.filter((point) => point.category === 'question_reparation') || [];

  const earnedPoints = reparationPoints.length;
  const maxPoints = 2;

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
        Reaguj na validácie tvojích otázok {isCurrent && '• Môžeš upraviť svoje otázky'}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {isCompleted && <Chip label="Odpovede dokončené" color="success" size="small" />}
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
        {questionsWithValidations.slice(0, 2).map((q, i) => {
          const responded = q.user_agreement; // Use database field instead of localStorage
          // Check if the question has actually been validated by someone
          const hasValidation = q.validated_by !== undefined && q.validated_by !== null;

          return (
            <Box
              key={i}
              sx={{
                p: 1,
                border: '1px solid',
                borderColor: responded
                  ? 'success.main'
                  : hasValidation
                    ? 'warning.main'
                    : '#000000', // Black border for unvalidated questions
                borderRadius: 1,
                cursor: responded || !hasValidation ? 'default' : 'pointer',
                bgcolor: responded ? 'success.50' : hasValidation ? 'warning.50' : 'transparent',
                '&:hover': responded || !hasValidation ? {} : { backgroundColor: 'grey.50' }
              }}
              onClick={() => {
                if (!responded && hasValidation) {
                  console.log('Opening respond modal with question:', q); // Debug log
                  setQuestionToRespond(q);
                  setRespondOpen(true);
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
                        color: key === q.correct ? 'success.dark' : 'text.secondary',
                        fontWeight: key === q.correct ? 600 : 400,
                        ml: 1
                      }}
                    >
                      {key.toUpperCase()}) {value} {key === q.correct && '✓'}
                    </Typography>
                  ))}
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {hasValidation ? (
                  <Chip
                    label={q.validated ? 'Validná' : 'Nevalidná'}
                    color={q.validated ? 'success' : 'error'}
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Nevalidovaná"
                    size="small"
                    sx={{
                      backgroundColor: '#000000',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#333333'
                      }
                    }}
                  />
                )}
                {responded && (
                  <Chip
                    label={responded.agreed ? 'Súhlasím' : 'Nesúhlasím'}
                    color={responded.agreed ? 'success' : 'warning'}
                    size="small"
                  />
                )}

                {/* Edit button - only show during Week 3 (current week) */}
                {isCurrent && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the respond modal
                      setQuestionToEdit(q);
                      setEditModalOpen(true);
                    }}
                    sx={{ ml: 'auto' }}
                  >
                    Upraviť
                  </Button>
                )}
              </Box>
              {q.validation_comment && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                >
                  Validačný komentár: {q.validation_comment}
                </Typography>
              )}
              {responded && responded.comment && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.primary' }}
                >
                  Tvoja odpoveď: {responded.comment}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Edit Question Modal - only available during Week 3 */}
      <EditQuestionModal
        open={editModalOpen}
        question={questionToEdit}
        onClose={() => {
          setEditModalOpen(false);
          setQuestionToEdit(null);
        }}
        onSubmit={async (questionId, updatedData) => {
          try {
            await updateQuestion({ questionId, ...updatedData }).unwrap();
            console.log('Question updated successfully');
            // The RTK Query will automatically invalidate cache and refresh data
          } catch (error) {
            console.error('Error updating question:', error);
            throw error; // Re-throw so the modal can handle it
          }
        }}
      />
    </Box>
  );
};

Week3.propTypes = {
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
  setQuestionToRespond: PropTypes.func.isRequired,
  setRespondOpen: PropTypes.func.isRequired
};

export default Week3;

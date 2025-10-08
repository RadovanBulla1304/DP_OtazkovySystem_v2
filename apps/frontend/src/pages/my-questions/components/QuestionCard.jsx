import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const QuestionCard = ({ question, currentWeek, isValidatedByUser = false, userId }) => {
  const isInWeek3OrLater = currentWeek >= 3;

  // For Week 2 validation questions, use different styling and behavior
  if (isValidatedByUser) {
    const validated = question.validated_by && String(question.validated_by) === String(userId);

    return (
      <Card
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
    <Card sx={{ borderRadius: 2, height: 'fit-content' }}>
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

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    correct: PropTypes.string,
    validated_by: PropTypes.string,
    validated: PropTypes.bool,
    validation_comment: PropTypes.string,
    user_agreement: PropTypes.shape({
      agreed: PropTypes.bool,
      comment: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  currentWeek: PropTypes.number.isRequired,
  isValidatedByUser: PropTypes.bool,
  userId: PropTypes.string.isRequired
};

export default QuestionCard;

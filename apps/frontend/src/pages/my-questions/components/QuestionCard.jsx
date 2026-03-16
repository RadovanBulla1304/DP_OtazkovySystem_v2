import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const QuestionCard = ({
  question,
  currentWeek,
  isValidatedByUser = false,
  userId,
  onValidate,
  onRespond,
  onEdit
}) => {
  const isInWeek3OrLater = currentWeek >= 3;
  const isWeek3 = currentWeek === 3;

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
          '&:hover': validated
            ? {}
            : {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'action.hover'
              }
        }}
        onClick={() => {
          if (!validated && onValidate) {
            onValidate(question);
          }
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
            {!validated && onValidate && <span> • Kliknite pre validáciu</span>}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Original rendering for user's own questions
  const responded = question.user_agreement;
  const hasValidation = question.validated_by !== undefined && question.validated_by !== null;
  const canRespondInWeek3 = isWeek3 && !responded && hasValidation && !!onRespond;

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: 'fit-content',
        border: isWeek3 ? '1px solid' : undefined,
        borderColor: isWeek3
          ? responded
            ? 'success.main'
            : hasValidation
              ? 'warning.main'
              : '#000000'
          : undefined,
        bgcolor: isWeek3 ? (responded ? 'success.50' : hasValidation ? 'warning.50' : 'transparent') : undefined,
        cursor: canRespondInWeek3 ? 'pointer' : 'default',
        '&:hover': canRespondInWeek3
          ? {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'action.hover'
            }
          : {}
      }}
      onClick={() => {
        if (canRespondInWeek3 && onRespond) {
          onRespond(question);
        }
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
              {hasValidation ? (
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
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#333333'
                    }
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

              {isWeek3 && onEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(question);
                  }}
                  sx={{ ml: 'auto' }}
                >
                  Upraviť
                </Button>
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
  userId: PropTypes.string.isRequired,
  onValidate: PropTypes.func,
  onRespond: PropTypes.func,
  onEdit: PropTypes.func
};

export default QuestionCard;

import { Box, Divider, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import QuestionCard from './QuestionCard';

const ModuleQuestionsSection = ({
  modulName,
  weekStatus,
  moduleQuestions,
  validatedQuestions,
  currentWeek,
  userId,
  showDivider = false
}) => {
  return (
    <Box>
      {showDivider && <Divider sx={{ my: 4 }} />}

      {/* Module header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {modulName}
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
          {moduleQuestions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              currentWeek={currentWeek}
              isValidatedByUser={false}
              userId={userId}
            />
          ))}
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
                return (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    currentWeek={currentWeek}
                    isValidatedByUser={true}
                    userId={userId}
                  />
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
};

ModuleQuestionsSection.propTypes = {
  modulName: PropTypes.string.isRequired,
  weekStatus: PropTypes.string.isRequired,
  moduleQuestions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired
    })
  ).isRequired,
  validatedQuestions: PropTypes.array.isRequired,
  currentWeek: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  showDivider: PropTypes.bool
};

export default ModuleQuestionsSection;

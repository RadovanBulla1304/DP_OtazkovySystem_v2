import { useGetUserPointsQuery } from '@app/redux/api';
import { Box, Chip, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import AddQuestionModal from '../../../subjects/components/AddQuestionModal';

const Week1 = ({
  week,
  isCurrent,
  status,
  formatDate,
  questionsByWeekMerged,
  selectedModul,
  setLocalCreated,
  userId
}) => {
  // Get points data for the current user
  const { data: pointsData } = useGetUserPointsQuery(userId, {
    skip: !userId
  });

  const userQuestions =
    (questionsByWeekMerged[selectedModul._id] &&
      questionsByWeekMerged[selectedModul._id][week.weekNumber]) ||
    [];

  // Only use database questions, no localStorage
  const allQuestions = userQuestions;

  // Calculate points for Week 1 - question creation (1 point per question, max 2)
  const creationPoints =
    pointsData?.data?.filter(
      (point) =>
        point.category === 'question_creation' &&
        point.related_entity?.entity_type === 'Question' &&
        allQuestions.some((q) => q._id === point.related_entity?.entity_id)
    ) || [];

  const earnedPoints = creationPoints.length;
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
        Pridaj 2 otázky pre tento týždeň
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
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
          const q = allQuestions[i];
          if (q) {
            return (
              <Box
                key={i}
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  bgcolor: 'success.50'
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
              </Box>
            );
          } else {
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                <AddQuestionModal
                  modulId={selectedModul._id}
                  disabled={!isCurrent}
                  onCreated={(created) => {
                    setLocalCreated((prev) => {
                      const next = { ...prev };
                      if (!next[selectedModul._id]) next[selectedModul._id] = {};
                      if (!next[selectedModul._id][week.weekNumber])
                        next[selectedModul._id][week.weekNumber] = [];
                      next[selectedModul._id][week.weekNumber].push(created);
                      return next;
                    });
                    // No need to save to localStorage anymore - data comes from DB
                  }}
                />
                <Typography color="text.secondary" sx={{ ml: 1 }}>
                  Pridať otázku
                </Typography>
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
};

Week1.propTypes = {
  week: PropTypes.shape({
    weekNumber: PropTypes.number.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired
  }).isRequired,
  isCurrent: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  formatDate: PropTypes.func.isRequired,
  questionsByWeekMerged: PropTypes.object.isRequired,
  selectedModul: PropTypes.shape({
    _id: PropTypes.string.isRequired
  }).isRequired,
  setLocalCreated: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired
};

export default Week1;

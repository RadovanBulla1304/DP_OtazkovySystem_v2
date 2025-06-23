import * as authService from '@app/pages/auth/authService';
import { useGetRatingsByQuestionIdQuery } from '@app/redux/api';
import ListIcon from '@mui/icons-material/List';
import StarIcon from '@mui/icons-material/Star';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Rating,
  Tooltip,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import RateQuestionModal from '../admin/components/RateQuestionModal';

const answerLetterToLabel = { a: 'A', b: 'B', c: 'C', d: 'D' };

const getRatingBreakdown = (ratings) => {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    const rounded = Math.round(r.rating);
    if (breakdown[rounded] !== undefined) breakdown[rounded] += 1;
  });
  return breakdown;
};

const QuestionCard = ({ question, subjectModuls, onOpenList }) => {
  const { data: ratings = [], isLoading: loadingRatings } = useGetRatingsByQuestionIdQuery(
    question._id
  );

  const isAuth = authService.getUserFromStorage();
  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

  const ratingBreakdown = getRatingBreakdown(ratings);
  const tooltipContent = Object.entries(ratingBreakdown)
    .map(([stars, count]) => `${stars} ★: ${count}`)
    .join('\n');

  // Show list icon only on hover
  // const [hovered, setHovered] = React.useState(false);

  return (
    <Card
      elevation={3}
      sx={{ borderRadius: 3 }}
      // onMouseEnter={() => setHovered(true)}
      // onMouseLeave={() => setHovered(false)}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {question.text}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Modul: {subjectModuls.find((m) => m._id === question.modul)?.title || question.modul}
          </Typography>
        }
      />
      <CardContent>
        {Object.entries(question.options).map(([key, value]) => (
          <Box
            key={key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <Chip label={answerLetterToLabel[key]} color="default" size="small" sx={{ mr: 1 }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                color: 'text.primary'
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={<pre>{tooltipContent}</pre>} arrow placement="top">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating
                  value={averageRating}
                  precision={0.1}
                  readOnly
                  size="small"
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
              </Box>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
              {loadingRatings
                ? 'Načítavam hodnotenia...'
                : `${averageRating.toFixed(1)} (${ratings.length})`}
            </Typography>
          </Box>
          <Box>
            <RateQuestionModal questionId={question._id} questionCreatorId={question.createdBy} />
            {isAuth.isAdmin && (
              <Tooltip title="Zoznam hodnotení">
                <IconButton
                  onClick={() => onOpenList(question._id)}
                  color="secondary"
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    correct: PropTypes.string,
    modul: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdBy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdAt: PropTypes.string
  }).isRequired,
  subjectModuls: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string
    })
  ).isRequired,
  onOpenList: PropTypes.func.isRequired
};

export default QuestionCard;

import { useGetUserTestAttemptsQuery } from '@app/redux/api';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Assessment as StatisticsIcon,
  UnpublishedOutlined as UnpublishIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import UserAttemptStatus from './UserAttemptStatus';

const TestCard = ({
  test,
  status,
  isTestActive,
  isTeacher,
  updating,
  deleting,
  onEdit,
  onDelete,
  onTogglePublication,
  onStartTest,
  onShowStats
}) => {
  // Fetch user attempts directly in the card component
  const { data: attemptsData } = useGetUserTestAttemptsQuery(test._id, {
    skip: isTeacher, // Don't fetch if user is a teacher
    refetchOnMountOrArgChange: true // Always refetch when component mounts or testId changes
  });
  const userAttempts = attemptsData?.data || [];

  // Check if user has reached max attempts or already completed
  const hasReachedMaxAttempts = userAttempts.length >= test.max_attempts;
  const canTakeTest = !isTeacher && isTestActive && !hasReachedMaxAttempts;

  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons inside the card
    if (e.target.closest('button') || e.target.closest('a')) return;

    if (canTakeTest) {
      onStartTest(test);
    }
  };

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: canTakeTest ? 'pointer' : 'default',
          opacity: hasReachedMaxAttempts && !isTeacher ? 0.7 : 1,
          '&:hover': canTakeTest
            ? {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            : {}
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {test.title}
            </Typography>
            <Chip label={status.label} color={status.color} size="small" icon={status.icon} />
          </Box>

          {test.description && (
            <Typography color="textSecondary" gutterBottom>
              {test.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" gutterBottom>
            <strong>Počet otázok:</strong> {test.total_questions}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Časový limit:</strong> {test.time_limit} minút
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Minimálny potrebný počet bodov:</strong> {test.passing_score}%
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Maximálny počet bodov:</strong> {test.max_points}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Maximálny počet pokusov:</strong> {test.max_attempts}
          </Typography>

          <Box mt={1}>
            <Typography variant="body2" color="textSecondary">
              <strong>Od:</strong> {format(new Date(test.date_start), 'PPp')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Do:</strong> {format(new Date(test.date_end), 'PPp')}
            </Typography>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              <strong>Moduly:</strong>
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {test.selected_modules.map((module) => (
                <Chip
                  key={module._id}
                  label={module.title || module.name || 'Modul'}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Show user's attempt status if not a teacher */}
          {!isTeacher && <UserAttemptStatus testId={test._id} maxPoints={test.max_points} />}

          {/* Show message if max attempts reached */}
          {!isTeacher && hasReachedMaxAttempts && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Maximálny počet pokusov dosiahnutý ({userAttempts.length}/{test.max_attempts})
            </Alert>
          )}
        </CardContent>

        {isTeacher && (
          <Box p={2} pt={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Tooltip title="Zobraziť Štatistiky">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowStats(test._id);
                    }}
                  >
                    <StatisticsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Upraviť Test">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(test);
                    }}
                    disabled={updating || deleting}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Odstrániť Test">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(test._id);
                    }}
                    disabled={updating || deleting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Tooltip title={test.is_published ? 'Skryť Test' : 'Zverejniť Test'}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePublication(test);
                  }}
                  color={test.is_published ? 'success' : 'default'}
                >
                  {test.is_published ? <PublishIcon /> : <UnpublishIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Card>
    </Grid>
  );
};

TestCard.propTypes = {
  test: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
  isTestActive: PropTypes.bool.isRequired,
  isTeacher: PropTypes.bool.isRequired,
  updating: PropTypes.bool.isRequired,
  deleting: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTogglePublication: PropTypes.func.isRequired,
  onStartTest: PropTypes.func.isRequired,
  onShowStats: PropTypes.func.isRequired
};

export default TestCard;

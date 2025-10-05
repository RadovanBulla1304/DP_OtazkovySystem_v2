import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetModulsBySubjectQuery,
  useGetTeacherMeQuery,
  useGetTestsBySubjectQuery,
  useGetTestStatisticsQuery,
  useGetUserTestAttemptsQuery,
  useGetValidatedQuestionsByModulesQuery,
  useGetValidatedQuestionsCountQuery,
  useToggleTestPublicationMutation,
  useUpdateTestMutation
} from '@app/redux/api';
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
  Assessment as StatisticsIcon,
  UnpublishedOutlined as UnpublishIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateQuestionModal from './components/CreateQuestionModal';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

// Component to show user's attempt status
const UserAttemptStatus = ({ testId }) => {
  const { data: attemptsData, isLoading } = useGetUserTestAttemptsQuery(testId);
  const attempts = attemptsData?.data || [];

  if (isLoading) {
    return (
      <Box mt={2} p={2} textAlign="center">
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (attempts.length === 0) return null;

  const latestAttempt = attempts[0]; // Sorted by submittedAt desc

  return (
    <Box
      mt={2}
      p={2}
      bgcolor={latestAttempt.passed ? 'success.main' : 'error.main'}
      borderRadius={1}
      sx={{ color: 'white' }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" fontWeight="bold" color="inherit">
            {latestAttempt.score}%
          </Typography>
          <Typography variant="body2" color="inherit">
            {latestAttempt.passed ? '✓ PASSED' : '✗ FAILED'}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="caption" color="inherit" display="block">
            Attempts: {attempts.length}
          </Typography>
          <Typography variant="caption" color="inherit" display="block">
            {format(new Date(latestAttempt.submittedAt), 'PPp')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

UserAttemptStatus.propTypes = {
  testId: PropTypes.string.isRequired
};

// Component to show test statistics modal
const TestStatisticsModal = ({ testId, open, onClose }) => {
  const {
    data: statsData,
    isLoading,
    error
  } = useGetTestStatisticsQuery(testId, {
    skip: !open || !testId
  });

  const stats = statsData?.data;

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Test Statistics</Typography>
          <IconButton onClick={onClose} size="small">
            <CancelIcon />
          </IconButton>
        </Box>
        {stats?.test && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {stats.test.title}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load statistics. Please try again.</Alert>
        ) : !stats ? (
          <Alert severity="info">No statistics available.</Alert>
        ) : (
          <Box>
            {/* Summary Statistics */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Summary
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total Attempts
                    </Typography>
                    <Typography variant="h4">{stats.summary.totalAttempts}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {stats.summary.uniqueUsers} user
                      {stats.summary.uniqueUsers !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                    <Typography variant="h4">{stats.summary.averageScore}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Pass Rate
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.summary.passRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.summary.passedCount} passed / {stats.summary.failedCount} failed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Time
                    </Typography>
                    <Typography variant="h4">
                      {Math.floor(stats.summary.averageTime / 60)}m
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.summary.averageTime % 60}s
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Most Wrong Questions */}
            {stats.mostWrongQuestions.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Most Frequently Wrong Questions
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Question</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Total Attempts</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Wrong Attempts</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Wrong Rate</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.mostWrongQuestions.map((q, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2">
                              {q.question?.text || q.question?.question_text || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{q.totalAttempts}</TableCell>
                          <TableCell align="center">{q.wrongAttempts}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${Math.round(q.wrongRate)}%`}
                              color={
                                q.wrongRate > 70
                                  ? 'error'
                                  : q.wrongRate > 40
                                    ? 'warning'
                                    : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* User Attempts Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              User Attempts
            </Typography>
            {stats.userAttempts.length === 0 ? (
              <Alert severity="info">No completed attempts yet.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>User</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Score</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Correct Answers</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Time Spent</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Submitted At</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.userAttempts.map((attempt) => (
                      <TableRow key={attempt._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{attempt.user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {attempt.user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="h6"
                            color={attempt.passed ? 'success.main' : 'error.main'}
                          >
                            {attempt.score}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={attempt.passed ? 'PASSED' : 'FAILED'}
                            color={attempt.passed ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {Math.floor((attempt.totalTime_spent || 0) / 60)}m{' '}
                          {(attempt.totalTime_spent || 0) % 60}s
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {format(new Date(attempt.submittedAt), 'PPp')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

TestStatisticsModal.propTypes = {
  testId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

// Individual Test Card Component
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
            <strong>Questions:</strong> {test.total_questions}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Time Limit:</strong> {test.time_limit} minutes
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Passing Score:</strong> {test.passing_score}%
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Max Attempts:</strong> {test.max_attempts}
          </Typography>

          <Box mt={1}>
            <Typography variant="body2" color="textSecondary">
              <strong>Start:</strong> {format(new Date(test.date_start), 'PPp')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>End:</strong> {format(new Date(test.date_end), 'PPp')}
            </Typography>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              <strong>Modules:</strong>
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
          {!isTeacher && <UserAttemptStatus testId={test._id} />}

          {/* Show message if max attempts reached */}
          {!isTeacher && hasReachedMaxAttempts && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Maximum attempts reached ({userAttempts.length}/{test.max_attempts})
            </Alert>
          )}
        </CardContent>

        {isTeacher && (
          <Box p={2} pt={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Tooltip title="Edit Test">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(test);
                    }}
                    disabled={updating || deleting}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Test">
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
                <Tooltip title="View Statistics">
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
              </Box>

              <Tooltip title={test.is_published ? 'Unpublish Test' : 'Publish Test'}>
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

const Tests = () => {
  const subjectId = useCurrentSubjectId();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [showStatsTestId, setShowStatsTestId] = useState(null);
  const [confirmTestModal, setConfirmTestModal] = useState(null);

  // Check if user is a teacher
  const { data: teacher } = useGetTeacherMeQuery();
  const isTeacher = !!teacher;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_questions: 10,
    date_start: new Date(),
    date_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time_limit: 30,
    selected_modules: [],
    max_attempts: 1,
    passing_score: 60
  });

  // State for creating new questions
  const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState(false);

  // API hooks
  const [createTest, { isLoading: creating }] = useCreateTestMutation();
  const [updateTest, { isLoading: updating }] = useUpdateTestMutation();
  const [deleteTest, { isLoading: deleting }] = useDeleteTestMutation();
  const [togglePublication] = useToggleTestPublicationMutation();

  const {
    data,
    isLoading: testsLoading,
    refetch
  } = useGetTestsBySubjectQuery(
    {
      subjectId,
      is_published: isTeacher ? undefined : 'true' // Users only see published tests
    },
    {
      skip: !subjectId
    }
  );

  // Extract tests from response (backend returns { tests: [...] })
  const tests = data?.tests || [];

  const { data: modules = [] } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch validated questions based on selected modules
  const moduleIdsString = formData.selected_modules.join(',');
  const { data: validatedQuestionsData, isLoading: validatedQuestionsLoading } =
    useGetValidatedQuestionsByModulesQuery(moduleIdsString, {
      skip: !formData.selected_modules.length
    });
  const validatedQuestions = validatedQuestionsData?.data || [];

  const { data: questionsCountData } = useGetValidatedQuestionsCountQuery(moduleIdsString, {
    skip: !formData.selected_modules.length
  });
  const availableQuestionsCount = questionsCountData?.count || 0;

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      total_questions: 10,
      date_start: new Date(),
      date_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time_limit: 30,
      selected_modules: [],
      max_attempts: 1,
      passing_score: 60
    });
    setEditingTest(null);
  }, []);

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (test) => {
    setFormData({
      title: test.title,
      description: test.description || '',
      total_questions: test.total_questions,
      date_start: new Date(test.date_start),
      date_end: new Date(test.date_end),
      time_limit: test.time_limit,
      selected_modules: test.selected_modules.map((m) => m._id),
      max_attempts: test.max_attempts,
      passing_score: test.passing_score
    });
    setEditingTest(test);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate that we have enough questions available
      if (availableQuestionsCount < formData.total_questions) {
        if (
          !window.confirm(
            `Nie je dosť validovaných otázok. Požadované: ${formData.total_questions}, Dostupné: ${availableQuestionsCount}. Chcete pokračovať?`
          )
        ) {
          return;
        }
      }

      const testData = {
        title: formData.title,
        description: formData.description,
        total_questions: formData.total_questions,
        date_start: formData.date_start.toISOString(),
        date_end: formData.date_end.toISOString(),
        time_limit: formData.time_limit,
        subject: subjectId,
        selected_modules: formData.selected_modules,
        max_attempts: formData.max_attempts,
        passing_score: formData.passing_score
      };

      if (editingTest) {
        await updateTest({ id: editingTest._id, ...testData }).unwrap();
      } else {
        await createTest(testData).unwrap();
      }

      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error('Error saving test:', error);
      alert('An error occurred while saving the test.');
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest(testId).unwrap();
        refetch();
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  const handleTogglePublication = async (test) => {
    try {
      await togglePublication({
        id: test._id,
        is_published: !test.is_published
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Error toggling publication:', error);
    }
  };

  const getTestStatus = (test) => {
    const now = new Date();
    const startDate = new Date(test.date_start);
    const endDate = new Date(test.date_end);

    if (!test.is_published)
      return { label: 'Unpublished', color: 'default', icon: <UnpublishIcon /> };
    if (now < startDate) return { label: 'Scheduled', color: 'info', icon: <ScheduleIcon /> };
    if (now > endDate) return { label: 'Ended', color: 'error', icon: <CancelIcon /> };
    return { label: 'Active', color: 'success', icon: <CheckCircleIcon /> };
  };

  if (!subjectId) {
    return (
      <Box p={3}>
        <Alert severity="warning">Please select a subject to manage tests.</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Testy
          </Typography>
          {isTeacher && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              disabled={!modules.length}
            >
              Create New Test
            </Button>
          )}
        </Box>

        {!modules.length && isTeacher && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No modules found for this subject. Please create modules first to be able to create
            tests.
          </Alert>
        )}

        {testsLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {tests.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" align="center">
                      No tests created yet.
                    </Typography>
                    <Typography color="textSecondary" align="center" sx={{ mt: 1 }}>
                      Click `Create New Test` to get started.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              tests.map((test) => {
                const status = getTestStatus(test);
                const isTestActive = status.label === 'Active';

                return (
                  <TestCard
                    key={test._id}
                    test={test}
                    status={status}
                    isTestActive={isTestActive}
                    isTeacher={isTeacher}
                    updating={updating}
                    deleting={deleting}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onTogglePublication={handleTogglePublication}
                    onStartTest={setConfirmTestModal}
                    onShowStats={setShowStatsTestId}
                  />
                );
              })
            )}
          </Grid>
        )}

        {/* Create/Edit Test Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingTest ? 'Edit Test' : 'Create New Test'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Test Title"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Celkový počet otázok"
                  type="number"
                  fullWidth
                  value={formData.total_questions}
                  onChange={(e) => handleInputChange('total_questions', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Časový limit (minúty)"
                  type="number"
                  fullWidth
                  value={formData.time_limit}
                  onChange={(e) => handleInputChange('time_limit', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <DateTimePicker
                  label="Dátum a čas začiatku"
                  value={formData.date_start}
                  onChange={(value) => handleInputChange('date_start', value)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>

              <Grid item xs={6}>
                <DateTimePicker
                  label="Dátum a čas konca"
                  value={formData.date_end}
                  onChange={(value) => handleInputChange('date_end', value)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Maximálny počet pokusov"
                  type="number"
                  fullWidth
                  value={formData.max_attempts}
                  onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Hranica úspešnosti (%)"
                  type="number"
                  fullWidth
                  value={formData.passing_score}
                  onChange={(e) => handleInputChange('passing_score', parseInt(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Vyberte moduly</InputLabel>
                  <Select
                    multiple
                    value={formData.selected_modules}
                    onChange={(e) => handleInputChange('selected_modules', e.target.value)}
                    input={<OutlinedInput label="Vyberte moduly" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const module = modules.find((m) => m._id === value || m.id === value);
                          return (
                            <Chip
                              key={value}
                              label={
                                module
                                  ? module.name || module.title || 'Modul bez názvu'
                                  : 'Neznámy modul'
                              }
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {modules.map((module) => (
                      <MenuItem key={module._id} value={module._id}>
                        {module.name || module.title || 'Modul bez názvu'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {/* Show count of available questions */}
                {formData.selected_modules.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {validatedQuestionsLoading
                        ? 'Načítavam otázky...'
                        : `Dostupných validovaných otázok: ${availableQuestionsCount}`}
                    </Typography>
                    {availableQuestionsCount < formData.total_questions &&
                      availableQuestionsCount > 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Nie je dosť validovaných otázok pre tento test. Požadované:{' '}
                          {formData.total_questions}, Dostupné: {availableQuestionsCount}
                        </Alert>
                      )}
                    {availableQuestionsCount === 0 && !validatedQuestionsLoading && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        Žiadne validované otázky v vybraných moduloch!
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Show list of validated questions from selected modules */}
                {formData.selected_modules.length > 0 && validatedQuestions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Validované otázky z vybraných modulov ({validatedQuestions.length}):
                    </Typography>
                    <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                      <List dense>
                        {validatedQuestions.slice(0, 10).map((q) => (
                          <ListItem key={q._id}>
                            <ListItemText
                              primary={q.text || q.question_text}
                              secondary={`Modul: ${q.modul?.name || q.modul?.title || 'N/A'}`}
                            />
                          </ListItem>
                        ))}
                        {validatedQuestions.length > 10 && (
                          <ListItem>
                            <ListItemText
                              secondary={`... a ${validatedQuestions.length - 10} ďalších otázok`}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      Pri spustení testu bude každému študentovi náhodne vybraných{' '}
                      {formData.total_questions} otázok z týchto validovaných otázok.
                    </Typography>
                  </Box>
                )}

                {/* Button to create new question (optional) */}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateQuestionModalOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Vytvoriť novú otázku
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                creating || updating || !formData.title || !formData.selected_modules.length
              }
            >
              {creating || updating ? 'Saving...' : editingTest ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal for creating new questions */}
        <CreateQuestionModal
          open={isCreateQuestionModalOpen}
          onClose={() => setIsCreateQuestionModalOpen(false)}
          modules={modules}
          onQuestionCreated={() => {
            // Question created successfully
            // The question will be available in the validated questions pool
            setIsCreateQuestionModalOpen(false);
          }}
        />

        {/* Confirmation Modal for Starting Test */}
        <Dialog
          open={!!confirmTestModal}
          onClose={() => setConfirmTestModal(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Start Test?</DialogTitle>
          <DialogContent>
            {confirmTestModal && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {confirmTestModal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {confirmTestModal.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Total Questions:</strong> {confirmTestModal.total_questions}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time Limit:</strong> {confirmTestModal.time_limit} minutes
                  </Typography>
                  <Typography variant="body2">
                    <strong>Passing Score:</strong> {confirmTestModal.passing_score}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Max Attempts:</strong> {confirmTestModal.max_attempts}
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Once you start the test, the timer will begin immediately. Make sure you have a
                  stable internet connection and enough time to complete the test.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmTestModal(null)}>Cancel</Button>
            <Button
              onClick={() => {
                navigate(`/test/${confirmTestModal._id}/take`);
                setConfirmTestModal(null);
              }}
              variant="contained"
              color="primary"
            >
              Start Test
            </Button>
          </DialogActions>
        </Dialog>

        {/* Test Statistics Modal */}
        <TestStatisticsModal
          testId={showStatsTestId}
          open={!!showStatsTestId}
          onClose={() => setShowStatsTestId(null)}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Tests;

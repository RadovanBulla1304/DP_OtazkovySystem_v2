import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetModulsBySubjectQuery,
  useGetTeacherMeQuery,
  useGetTestsBySubjectQuery,
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
  const { data: attemptsData } = useGetUserTestAttemptsQuery(testId);
  const attempts = attemptsData?.data || [];

  if (attempts.length === 0) return null;

  const latestAttempt = attempts[0]; // Sorted by submittedAt desc

  return (
    <Box
      mt={2}
      p={1.5}
      bgcolor={latestAttempt.passed ? 'success.light' : 'error.light'}
      borderRadius={1}
    >
      <Typography variant="body2" fontWeight="bold">
        Latest Attempt: {latestAttempt.score}%
      </Typography>
      <Typography variant="caption">
        {latestAttempt.passed ? '✓ Passed' : '✗ Failed'} -{' '}
        {format(new Date(latestAttempt.submittedAt), 'PPp')}
      </Typography>
      <Typography variant="caption" display="block" mt={0.5}>
        Attempts: {attempts.length}
      </Typography>
    </Box>
  );
};

UserAttemptStatus.propTypes = {
  testId: PropTypes.string.isRequired
};

const Tests = () => {
  const subjectId = useCurrentSubjectId();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [setShowStats] = useState(null);
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
            Tests Management
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
                const canTakeTest = !isTeacher && isTestActive;

                return (
                  <Grid item xs={12} md={6} lg={4} key={test._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: canTakeTest ? 'pointer' : 'default',
                        '&:hover': canTakeTest
                          ? {
                              boxShadow: 6,
                              transform: 'translateY(-4px)',
                              transition: 'all 0.3s'
                            }
                          : {}
                      }}
                      onClick={() => canTakeTest && setConfirmTestModal(test)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                            {test.title}
                          </Typography>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            icon={status.icon}
                          />
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
                      </CardContent>

                      {isTeacher && (
                        <Box p={2} pt={0}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Tooltip title="Edit Test">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(test)}
                                  disabled={updating || deleting}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Test">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(test._id)}
                                  disabled={updating || deleting}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Statistics">
                                <IconButton size="small" onClick={() => setShowStats(test._id)}>
                                  <StatisticsIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Tooltip title={test.is_published ? 'Unpublish Test' : 'Publish Test'}>
                              <IconButton
                                onClick={() => handleTogglePublication(test)}
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
      </Box>
    </LocalizationProvider>
  );
};

export default Tests;

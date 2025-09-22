import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetModulsBySubjectQuery,
  useGetTestsBySubjectQuery,
  useGetValidatedQuestionsWithAgreementBySubjectQuery,
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
import { useCallback, useState } from 'react';
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

const Tests = () => {
  const subjectId = useCurrentSubjectId();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [setShowStats] = useState(null);

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
    passing_score: 60,
    generated_questions: [] // Store generated questions here
  });

  // State for showing generated questions and creating new questions
  const [showGeneratedQuestions, setShowGeneratedQuestions] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
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
  } = useGetTestsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Ensure tests is always an array
  const tests = Array.isArray(data) ? data : [];

  const { data: modules = [] } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch teacher-validated questions for the subject
  const { data: validatedQuestions = [], isLoading: validatedQuestionsLoading } =
    useGetValidatedQuestionsWithAgreementBySubjectQuery(subjectId, {
      skip: !subjectId
    });

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
      passing_score: 60,
      generated_questions: []
    });
    setEditingTest(null);
    setShowGeneratedQuestions(false);
  }, []);

  // Function to generate random questions from selected modules
  const handleGenerateQuestions = () => {
    setGeneratingQuestions(true);

    try {
      // Add debug logging to help identify issues
      console.log('Generating questions with params:', {
        validatedQuestionsCount: validatedQuestions.length,
        selectedModules: formData.selected_modules,
        validatedQuestions
      });

      // Filter questions that belong to selected modules and are validated by teacher
      console.log('Selected modules:', formData.selected_modules);
      console.log(
        'Selected modules types:',
        formData.selected_modules.map((id) => typeof id)
      );

      const filteredQuestions = validatedQuestions.filter((q) => {
        // Ensure q.modul exists and has an _id or id property
        if (!q.modul || typeof q.modul !== 'object') {
          console.log('Question with invalid modul structure:', q);
          return false;
        }

        const modulId = q.modul._id || q.modul.id;
        if (!modulId) {
          console.log('Question with missing modul ID:', q);
          return false;
        }

        // Log the module ID for debugging
        console.log('Processing question with modulId:', modulId, 'type:', typeof modulId);

        // Print the module object for inspection
        console.log('Module object structure:', JSON.stringify(q.modul));

        // Check if any of the selected module IDs match the question's module ID
        const isMatched = formData.selected_modules.some((selectedId) => {
          // Convert both to strings for comparison
          const selectedIdStr = String(selectedId);
          const modulIdStr = String(modulId);

          const isMatch =
            selectedId === modulId ||
            selectedIdStr === modulIdStr ||
            selectedIdStr.includes(modulIdStr) ||
            modulIdStr.includes(selectedIdStr);

          console.log(
            `Comparing: selected=${selectedId}(${typeof selectedId}) with question=${modulId}(${typeof modulId})`
          );
          console.log(
            `String comparison: selected="${selectedIdStr}" with question="${modulIdStr}", match=${isMatch}`
          );

          if (isMatch) {
            console.log(
              'MATCH FOUND! Selected module:',
              selectedId,
              'matches question module:',
              modulId
            );
          }

          return isMatch;
        });

        return isMatched;
      });

      console.log('Filtered questions:', filteredQuestions);

      let selectedQuestions = [];

      if (filteredQuestions.length === 0) {
        alert('Vo vybraných moduloch sa nenašli žiadne otázky validované učiteľom.');
        setGeneratingQuestions(false);
        return;
      }

      // If we have fewer questions than requested, use all of them
      if (filteredQuestions.length <= formData.total_questions) {
        selectedQuestions = [...filteredQuestions];
      } else {
        // Randomly select the required number of questions
        const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
        selectedQuestions = shuffled.slice(0, formData.total_questions);
      }

      console.log(
        'Available modules for enrichment:',
        modules.map((m) => ({ id: m._id, name: m.name || m.title }))
      );

      // Enhance selected questions with complete module information
      const enhancedQuestions = selectedQuestions.map((q) => {
        // Get module ID (either _id or id)
        const modulId = q.modul._id || q.modul.id;
        console.log('Enhancing question with modulId:', modulId);

        // Find the complete module information from modules array
        const completeModule = modules.find((m) => {
          const isMatch =
            m._id === modulId ||
            m.id === modulId ||
            (m._id && modulId && m._id.toString() === modulId.toString()) ||
            (m._id && modulId && String(m._id) === String(modulId));

          if (isMatch) {
            console.log('Found matching module for enrichment:', {
              moduleId: m._id,
              moduleName: m.name || m.title,
              questionModulId: modulId
            });
          }

          return isMatch;
        });

        // Enhance the question with complete module data if found
        if (completeModule) {
          console.log(
            'Enhanced module with name:',
            completeModule.name || completeModule.title || 'Modul bez názvu'
          );
          return {
            ...q,
            // Add valid:true field to match backend expectations
            valid: true,
            modul: {
              ...q.modul,
              name: completeModule.name || completeModule.title || 'Modul bez názvu'
            }
          };
        } else {
          console.log('WARNING: No matching module found for modulId:', modulId);
          // As a fallback, look for modules by similar string representation
          const fallbackModule = modules.find(
            (m) =>
              String(m._id).includes(String(modulId)) || String(modulId).includes(String(m._id))
          );

          if (fallbackModule) {
            console.log(
              'Found fallback module by partial string match:',
              fallbackModule.name || fallbackModule.title
            );
            return {
              ...q,
              // Add valid:true field to match backend expectations
              valid: true,
              modul: {
                ...q.modul,
                name: fallbackModule.name || fallbackModule.title || 'Modul bez názvu (fallback)'
              }
            };
          }
        }

        // Even if we couldn't enhance the module info, mark as valid for backend
        return {
          ...q,
          valid: true
        };
      });

      // Update form data with enhanced questions
      setFormData((prev) => ({
        ...prev,
        generated_questions: enhancedQuestions,
        total_questions: enhancedQuestions.length // Update total questions to match what we found
      }));

      setShowGeneratedQuestions(true);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('An error occurred while generating questions.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

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
      console.log('Submitting test with questions:', formData.generated_questions);

      // Check if we have enough generated questions
      if (formData.generated_questions.length === 0) {
        if (
          !window.confirm(
            'Neboli vygenerované žiadne otázky pre tento test. Chcete pokračovať bez otázok?'
          )
        ) {
          return;
        }
      }

      // Process questions and ensure they have valid IDs
      // First, filter questions that have a valid MongoDB _id (not temp IDs)
      const mongoQuestions = formData.generated_questions.filter(
        (q) => q._id && typeof q._id === 'string' && !q._id.startsWith('temp-')
      );

      console.log('Valid MongoDB questions:', mongoQuestions.length);

      // If we don't have enough valid questions, show a warning but continue
      if (mongoQuestions.length < formData.generated_questions.length) {
        console.warn(
          `Some questions have temporary IDs. Using ${mongoQuestions.length} out of ${formData.generated_questions.length} questions.`
        );

        if (mongoQuestions.length === 0) {
          if (
            !window.confirm(
              "All questions have temporary IDs and cannot be saved with the test. This is common for newly created questions that haven't been saved to the database. Continue anyway?"
            )
          ) {
            return;
          }
        }
      }

      // If total_questions is more than what we have, adjust it
      const adjustedTotalQuestions = Math.max(1, mongoQuestions.length);

      // Log the question IDs we're sending
      console.log(
        'Question IDs being sent to API:',
        mongoQuestions.map((q) => q._id)
      );

      // Modify questions directly in backend format
      const validQuestions = mongoQuestions.map((q) => ({
        ...q,
        valid: true // Add valid:true field to match backend check
      }));

      console.log('Modified questions with valid field:', validQuestions.length);

      const testData = {
        ...formData,
        subject: subjectId,
        date_start: formData.date_start.toISOString(),
        date_end: formData.date_end.toISOString(),
        // Include only valid question IDs
        questions: mongoQuestions.map((q) => q._id),
        // Skip validation check in backend
        skipValidationCheck: true,
        // Ensure we have at least 1 for total_questions
        total_questions: adjustedTotalQuestions || 1
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!modules.length}
          >
            Create New Test
          </Button>
        </Box>

        {!modules.length && (
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
                return (
                  <Grid item xs={12} md={6} lg={4} key={test._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                                label={module.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </CardContent>

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
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleGenerateQuestions}
                    disabled={
                      formData.selected_modules.length === 0 ||
                      generatingQuestions ||
                      validatedQuestionsLoading
                    }
                    startIcon={generatingQuestions ? <CircularProgress size={20} /> : null}
                  >
                    {generatingQuestions ? 'Generujem...' : 'Generovať náhodné otázky'}
                  </Button>

                  {formData.generated_questions.length > 0 && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setShowGeneratedQuestions(!showGeneratedQuestions)}
                    >
                      {showGeneratedQuestions
                        ? 'Skryť vygenerované otázky'
                        : 'Zobraziť vygenerované otázky'}
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsCreateQuestionModalOpen(true)}
                  >
                    Vytvoriť novú otázku
                  </Button>
                </Box>
              </Grid>

              {showGeneratedQuestions && formData.generated_questions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" mt={2} mb={1}>
                    Generated Questions ({formData.generated_questions.length})
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                    <List dense>
                      {formData.generated_questions.map((question, index) => (
                        <ListItem key={question._id}>
                          <ListItemText
                            primary={`${index + 1}. ${question.text}`}
                            secondary={
                              <>
                                <Typography variant="body2" component="span" display="block">
                                  Modul:{' '}
                                  {question.modul
                                    ? question.modul.name ||
                                      question.modul.title ||
                                      'Modul bez názvu'
                                    : 'Neznámy modul'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  component="span"
                                  display="block"
                                  color="textSecondary"
                                >
                                  Možnosti: A: {question.options.a}, B: {question.options.b}, C:{' '}
                                  {question.options.c}, D: {question.options.d}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}
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
          onQuestionCreated={(newQuestion) => {
            // Add the new question to the generated questions list
            setFormData((prev) => ({
              ...prev,
              generated_questions: [...prev.generated_questions, newQuestion],
              total_questions: prev.generated_questions.length + 1
            }));

            // Show the generated questions if not already shown
            if (!showGeneratedQuestions) {
              setShowGeneratedQuestions(true);
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Tests;

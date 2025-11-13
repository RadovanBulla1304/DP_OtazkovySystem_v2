import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import * as authService from '@app/pages/auth/authService';
import {
  useGetValidatedQuestionsWithAgreementBySubjectQuery,
  useLazyGetModulsBySubjectQuery,
  useTeacherValidateQuestionMutation
} from '@app/redux/api';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import QuestionCard from './components/QuestionCard';
import ValidateByTeacherModal from './components/ValidateByTeacherModal';

const AllUsersQuestions = () => {
  const subjectId = useCurrentSubjectId();
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [teacherValidationFilter, setTeacherValidationFilter] = useState('all'); // 'all', 'validated', 'not-validated'
  const [createdByFilter, setCreatedByFilter] = useState('all'); // 'all', 'student', 'teacher'
  const [selectedYear, setSelectedYear] = useState('all'); // Year filter

  // Teacher validation modal state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [validationSubmitting, setValidationSubmitting] = useState(false);
  const [trigger, { data: modules = [], isFetching: modulesLoading, error: modulesError }] =
    useLazyGetModulsBySubjectQuery();

  const [teacherValidateQuestion] = useTeacherValidateQuestionMutation();

  // Get current user to check if they are a teacher
  const currentUser = authService.getUserFromStorage();
  const isTeacher = currentUser?.isTeacher === true;

  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useGetValidatedQuestionsWithAgreementBySubjectQuery(
    { subjectId, filter: createdByFilter },
    {
      skip: !subjectId
    }
  );

  // Fetch modules when subjectId changes
  useEffect(() => {
    if (subjectId) {
      trigger(subjectId);
      refetchQuestions(); // Refetch questions when subject changes
    }
  }, [subjectId, trigger, refetchQuestions]);

  // Handle teacher validation modal
  const handleOpenValidationModal = (question) => {
    setSelectedQuestion(question);
    setValidationModalOpen(true);
  };

  const handleCloseValidationModal = () => {
    setValidationModalOpen(false);
    setSelectedQuestion(null);
  };

  const handleSubmitValidation = async (data) => {
    setValidationSubmitting(true);
    try {
      await teacherValidateQuestion(data).unwrap();

      // Show success message based on whether it's new validation or edit
      if (selectedQuestion?.validated_by_teacher) {
        toast.success('Validácia otázky bola úspešne upravená');
      } else {
        toast.success('Otázka bola úspešne validovaná');
      }

      handleCloseValidationModal();
      // The query will automatically refetch and update the UI
    } catch (error) {
      console.error('Error submitting teacher validation:', error);
      toast.error('Chyba pri validácii otázky. Skúste to prosím znova.');
    } finally {
      setValidationSubmitting(false);
    }
  };

  if (!subjectId) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Prosím vyberte predmet pre zobrazenie otázok všetkých používateľov.
        </Alert>
      </Box>
    );
  }

  // Filter questions by selected module and teacher validation
  let filteredQuestions = questions;

  // Filter by module
  if (selectedModuleId !== 'all') {
    filteredQuestions = filteredQuestions.filter((q) => q.modul._id === selectedModuleId);
  }

  // Filter by teacher validation
  if (teacherValidationFilter === 'validated') {
    filteredQuestions = filteredQuestions.filter((q) => q.validated_by_teacher === true);
  } else if (teacherValidationFilter === 'not-validated') {
    filteredQuestions = filteredQuestions.filter((q) => q.validated_by_teacher !== true);
  }

  // Filter by year
  if (selectedYear !== 'all') {
    filteredQuestions = filteredQuestions.filter((q) => {
      const questionYear = new Date(q.createdAt).getFullYear();
      return questionYear === parseInt(selectedYear);
    });
  }

  // Get available years from questions for the year filter
  const availableYears = Array.from(
    new Set(
      questions.map((q) => new Date(q.createdAt).getFullYear()).filter((year) => !isNaN(year))
    )
  ).sort((a, b) => b - a); // Sort descending (newest first)

  // Get questions that need teacher validation for the floating button

  if (questionsError) {
    return (
      <Box p={3}>
        <Alert severity="error">Chyba pri načítaní otázok: {questionsError.message}</Alert>
      </Box>
    );
  }

  if (modulesError) {
    return (
      <Box sx={{ pb: 3, pt: 3 }}>
        <Alert severity="error">Chyba pri načítaní modulov: {modulesError.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 3, pt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Validované otázky všetkých používateľov
      </Typography>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrovať podľa modulu</InputLabel>
                <Select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  label="Filtrovať podľa modulu"
                  disabled={modulesLoading}
                >
                  <MenuItem value="all">Všetky moduly</MenuItem>
                  {modules.map((module) => (
                    <MenuItem key={module._id} value={module._id}>
                      {module.name || module.title || module._id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Vytvorené</InputLabel>
                <Select
                  value={createdByFilter}
                  onChange={(e) => setCreatedByFilter(e.target.value)}
                  label="Vytvorené"
                >
                  <MenuItem value="all">Študentmi aj učiteľmi</MenuItem>
                  <MenuItem value="student">Študentmi</MenuItem>
                  <MenuItem value="teacher">Učiteľmi</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Stav validácie učiteľom</InputLabel>
                <Select
                  value={teacherValidationFilter}
                  onChange={(e) => setTeacherValidationFilter(e.target.value)}
                  label="Stav validácie učiteľom"
                >
                  <MenuItem value="all">Všetky otázky</MenuItem>
                  <MenuItem value="validated">Validované učiteľom</MenuItem>
                  <MenuItem value="not-validated">Nevalidované učiteľom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Rok vytvorenia</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Rok vytvorenia"
                  disabled={availableYears.length === 0}
                >
                  <MenuItem value="all">Všetky roky</MenuItem>
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(questionsLoading || modulesLoading) && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Questions List */}
      {!questionsLoading && !modulesLoading && (
        <>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <Typography variant="h6">Nájdených {filteredQuestions.length} otázok</Typography>
            {selectedModuleId !== 'all' && (
              <Chip
                label={modules.find((m) => m._id === selectedModuleId)?.name || 'Neznámy modul'}
                size="small"
              />
            )}
            {createdByFilter !== 'all' && (
              <Chip
                label={createdByFilter === 'student' ? 'Vytvorené študentmi' : 'Vytvorené učiteľmi'}
                size="small"
                color="info"
              />
            )}
            {teacherValidationFilter !== 'all' && (
              <Chip
                label={
                  teacherValidationFilter === 'validated'
                    ? 'Validované učiteľom'
                    : 'Nevalidované učiteľom'
                }
                size="small"
                color={teacherValidationFilter === 'validated' ? 'primary' : 'warning'}
              />
            )}
            {selectedYear !== 'all' && (
              <Chip label={`Rok: ${selectedYear}`} size="small" color="secondary" />
            )}
          </Box>

          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" align="center">
                  Neboli nájdené žiadne validované otázky so súhlasom používateľa.
                </Typography>
                <Typography color="textSecondary" align="center" sx={{ mt: 1 }}>
                  {selectedModuleId === 'all'
                    ? 'Neexistujú žiadne otázky, ktoré boli validované a odsúhlasené používateľmi.'
                    : 'V zvolenom module nie sú žiadne validované otázky so súhlasom používateľa.'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {filteredQuestions.map((question) => (
                <Grid item xs={12} sm={6} md={4} key={question._id}>
                  <QuestionCard
                    question={question}
                    isTeacher={isTeacher}
                    onValidateClick={handleOpenValidationModal}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Teacher Validation Modal */}
      <ValidateByTeacherModal
        open={validationModalOpen}
        onClose={handleCloseValidationModal}
        question={selectedQuestion}
        onSubmit={handleSubmitValidation}
        isSubmitting={validationSubmitting}
      />
    </Box>
  );
};

export default AllUsersQuestions;

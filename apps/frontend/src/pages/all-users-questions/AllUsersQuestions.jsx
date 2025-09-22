import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import * as authService from '@app/pages/auth/authService';
import {
  useGetValidatedQuestionsWithAgreementBySubjectQuery,
  useLazyGetModulsBySubjectQuery,
  useTeacherValidateQuestionMutation
} from '@app/redux/api';
import { CheckCircle } from '@mui/icons-material';
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
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import TeacherValidationModal from './components/TeacherValidationModal';

const AllUsersQuestions = () => {
  const subjectId = useCurrentSubjectId();
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [teacherValidationFilter, setTeacherValidationFilter] = useState('all'); // 'all', 'validated', 'not-validated'

  // Teacher validation modal state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [validationComment, setValidationComment] = useState('');
  const [validationSubmitting, setValidationSubmitting] = useState(false);

  // Floating validation modal state
  const [floatingModalOpen, setFloatingModalOpen] = useState(false);
  const [currentValidationIndex, setCurrentValidationIndex] = useState(0);

  const [trigger, { data: modules = [], isFetching: modulesLoading, error: modulesError }] =
    useLazyGetModulsBySubjectQuery();

  const [teacherValidateQuestion] = useTeacherValidateQuestionMutation();

  // Get current user to check if they are a teacher
  const currentUser = authService.getUserFromStorage();
  const isTeacher = currentUser?.isTeacher === true;

  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError
  } = useGetValidatedQuestionsWithAgreementBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch modules when subjectId changes
  useEffect(() => {
    if (subjectId) {
      trigger(subjectId);
    }
  }, [subjectId, trigger]);

  // Handle teacher validation modal
  const handleOpenValidationModal = (question) => {
    setSelectedQuestion(question);
    setIsValidated(question.validated_by_teacher || false);
    setValidationComment(question.validated_by_teacher_comment || '');
    setValidationModalOpen(true);
  };

  const handleCloseValidationModal = () => {
    setValidationModalOpen(false);
    setSelectedQuestion(null);
    setIsValidated(false);
    setValidationComment('');
  };

  const handleSubmitValidation = async () => {
    if (!selectedQuestion || !validationComment.trim()) {
      return;
    }

    setValidationSubmitting(true);
    try {
      await teacherValidateQuestion({
        questionId: selectedQuestion._id,
        validated_by_teacher: isValidated,
        validated_by_teacher_comment: validationComment.trim()
      }).unwrap();

      handleCloseValidationModal();
      // The query will automatically refetch and update the UI
    } catch (error) {
      console.error('Error submitting teacher validation:', error);
      // You might want to show a toast notification here
    } finally {
      setValidationSubmitting(false);
    }
  };

  // Debug logging - remove this after debugging
  console.log('Debug Info:', {
    subjectId,
    modules,
    modulesCount: modules?.length,
    modulesLoading,
    modulesError,
    firstModule: modules?.[0],
    questions,
    questionsLoading,
    questionsError
  });

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

  // Get questions that need teacher validation for the floating button
  const questionsNeedingValidation = questions.filter((q) => !q.validated_by_teacher);

  // Handlers for floating validation modal
  const handleOpenFloatingModal = () => {
    if (questionsNeedingValidation.length > 0) {
      setCurrentValidationIndex(0);
      setFloatingModalOpen(true);
    } else {
      // If no questions need validation, show the regular validation modal with the first question
      if (questions.length > 0) {
        handleOpenValidationModal(questions[0]);
      } else {
        // Handle case when there are no questions at all
        alert('Nie sú dostupné žiadne otázky na validáciu.');
      }
    }
  };

  const handleCloseFloatingModal = () => {
    setFloatingModalOpen(false);
    setCurrentValidationIndex(0);
  };

  const handleFloatingValidationSubmit = async (data) => {
    setValidationSubmitting(true);
    try {
      await teacherValidateQuestion(data).unwrap();

      // Move to next question or close modal if this was the last one
      const nextIndex = currentValidationIndex + 1;
      const remainingQuestions = questionsNeedingValidation.filter((q) => !q.validated_by_teacher);

      if (nextIndex < remainingQuestions.length) {
        setCurrentValidationIndex(nextIndex);
      } else {
        handleCloseFloatingModal();
      }
    } catch (error) {
      console.error('Error submitting teacher validation:', error);
    } finally {
      setValidationSubmitting(false);
    }
  };

  if (questionsError) {
    return (
      <Box p={3}>
        <Alert severity="error">Chyba pri načítaní otázok: {questionsError.message}</Alert>
      </Box>
    );
  }

  if (modulesError) {
    return (
      <Box p={3}>
        <Alert severity="error">Chyba pri načítaní modulov: {modulesError.message}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Validované otázky všetkých používateľov
      </Typography>

      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Zobrazenie validovaných otázok, s ktorými používatelia súhlasili.
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filtrovať podľa modulu</InputLabel>
                <Select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  label="Filtrovať podľa modulu"
                  disabled={modulesLoading}
                >
                  <MenuItem value="all">Všetky moduly ({modules.length} celkom)</MenuItem>
                  {modules.map((module) => (
                    <MenuItem key={module._id} value={module._id}>
                      {module.name || module.title || module._id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
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
            <Typography variant="h6">
              Nájdených {filteredQuestions.length} validovaných otázok
            </Typography>
            {selectedModuleId !== 'all' && (
              <Chip
                label={modules.find((m) => m._id === selectedModuleId)?.name || 'Neznámy modul'}
                size="small"
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
            <Grid container spacing={3}>
              {filteredQuestions.map((question) => (
                <Grid item xs={12} key={question._id}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                          {question.text}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Možnosti odpovedí:
                          </Typography>
                          <List dense>
                            {Object.entries(question.options).map(([key, value]) => (
                              <ListItem key={key} sx={{ py: 0.5 }}>
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center">
                                      <Chip
                                        label={key.toUpperCase()}
                                        size="small"
                                        color={question.correct === key ? 'success' : 'default'}
                                        sx={{ mr: 1, minWidth: 32 }}
                                      />
                                      <Typography
                                        sx={{
                                          fontWeight: question.correct === key ? 'bold' : 'normal'
                                        }}
                                      >
                                        {value}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Detaily validácie:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Validované kým:</strong>{' '}
                            {question.validated_by
                              ? `${question.validated_by.firstName} ${question.validated_by.lastName}`
                              : 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Validované kedy:</strong>{' '}
                            {question.validated_at
                              ? format(new Date(question.validated_at), 'PPp')
                              : 'N/A'}
                          </Typography>
                          {question.validation_comment && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              <strong>Komentár k validácii:</strong> {question.validation_comment}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Validácia učiteľom:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Validované učiteľom:</strong>{' '}
                            <Chip
                              label={question.validated_by_teacher ? 'Áno' : 'Nie'}
                              color={question.validated_by_teacher ? 'success' : 'warning'}
                              size="small"
                            />
                          </Typography>
                          {question.validated_by_teacher && question.validated_by_teacher_at && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Validované učiteľom kedy:</strong>{' '}
                              {format(new Date(question.validated_by_teacher_at), 'PPp')}
                            </Typography>
                          )}
                          {question.validated_by_teacher_comment && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              <strong>Komentár učiteľa k validácii:</strong>{' '}
                              {question.validated_by_teacher_comment}
                            </Typography>
                          )}

                          {/* Quick validation button for non-validated questions */}
                          {isTeacher && !question.validated_by_teacher && (
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                onClick={() => handleOpenValidationModal(question)}
                                startIcon={<Typography>⚠️</Typography>}
                              >
                                Potrebuje validáciu učiteľom
                              </Button>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Odpoveď používateľa:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Používateľ súhlasil:</strong>{' '}
                            <Chip
                              label={question.user_agreement.agreed ? 'Áno' : 'Nie'}
                              color={question.user_agreement.agreed ? 'success' : 'error'}
                              size="small"
                            />
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Odpoveď odoslaná:</strong>{' '}
                            {question.user_agreement.responded_at
                              ? format(new Date(question.user_agreement.responded_at), 'PPp')
                              : 'N/A'}
                          </Typography>
                          {question.user_agreement.comment && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              <strong>Komentár používateľa:</strong>{' '}
                              {question.user_agreement.comment}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            height: 'fit-content'
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Detaily otázky
                          </Typography>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Modul:</strong> {question.modul.name}
                          </Typography>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Vytvoril:</strong>{' '}
                            {question.createdBy
                              ? `${question.createdBy.name} ${question.createdBy.surname}`
                              : 'N/A'}
                          </Typography>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Vytvorené:</strong>{' '}
                            {format(new Date(question.createdAt), 'PPp')}
                          </Typography>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Hodnotenie:</strong>{' '}
                            {question.rating_stats.total_ratings > 0
                              ? `${question.rating_stats.average_rating.toFixed(1)} (${
                                  question.rating_stats.total_ratings
                                } hodnotení)`
                              : 'Zatiaľ žiadne hodnotenia'}
                          </Typography>

                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label="Validované a odsúhlasené"
                              color="success"
                              size="small"
                              sx={{ mb: 1, mr: 1 }}
                            />
                            {question.validated_by_teacher && (
                              <Chip
                                label="Validované učiteľom"
                                color="primary"
                                size="small"
                                sx={{ mb: 1, mr: 1 }}
                              />
                            )}
                            {question.is_active && (
                              <Chip label="Aktívne" color="info" size="small" sx={{ mb: 1 }} />
                            )}
                          </Box>

                          {/* Teacher validation button */}
                          {isTeacher && (
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant={question.validated_by_teacher ? 'outlined' : 'contained'}
                                color={question.validated_by_teacher ? 'info' : 'primary'}
                                size="small"
                                onClick={() => handleOpenValidationModal(question)}
                                fullWidth
                              >
                                {question.validated_by_teacher
                                  ? 'Upraviť validáciu'
                                  : 'Validovať otázku'}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Teacher Validation Modal */}
      <Dialog
        open={validationModalOpen}
        onClose={handleCloseValidationModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Validácia otázky učiteľom</Typography>
            {selectedQuestion?.validated_by_teacher && (
              <Chip label="Už validované" color="success" size="small" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Otázka:
              </Typography>
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="body1">{selectedQuestion.text}</Typography>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Možnosti odpovedí:
                </Typography>
                <List dense>
                  {Object.entries(selectedQuestion.options).map(([key, value]) => (
                    <ListItem key={key} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={key.toUpperCase()}
                              size="small"
                              color={selectedQuestion.correct === key ? 'success' : 'default'}
                              sx={{ mr: 1, minWidth: 32 }}
                            />
                            <Typography
                              sx={{
                                fontWeight: selectedQuestion.correct === key ? 'bold' : 'normal'
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  <strong>Správna odpoveď:</strong> {selectedQuestion.correct.toUpperCase()}
                </Typography>
              </Paper>

              {/* Current validation status */}
              {selectedQuestion.validated_by_teacher && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Aktuálny stav:</strong> Otázka je už validovaná učiteľom
                    {selectedQuestion.validated_by_teacher_at && (
                      <> dňa {format(new Date(selectedQuestion.validated_by_teacher_at), 'PPp')}</>
                    )}
                  </Typography>
                  {selectedQuestion.validated_by_teacher_comment && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Aktuálny komentár:</strong>{' '}
                      {selectedQuestion.validated_by_teacher_comment}
                    </Typography>
                  )}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isValidated}
                      onChange={(e) => setIsValidated(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {isValidated ? 'Otázka je validná' : 'Otázka nie je validná'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {isValidated
                          ? 'Otázka spĺňa kvalitatívne štandardy a môže byť použitá v testoch'
                          : 'Otázka má nedostatky a potrebuje úpravu pred použitím'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Komentár k validácii (povinný)"
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                required
                error={!validationComment.trim()}
                helperText={
                  !validationComment.trim()
                    ? 'Prosím, zadajte komentár vysvetľujúci vašu validáciu'
                    : 'Vysvetlite, prečo je otázka validná/nevalidná, alebo navrhnite úpravy'
                }
                placeholder={
                  isValidated
                    ? 'Napríklad: Otázka je jasne formulovaná, správna odpoveď je jednoznačná...'
                    : 'Napríklad: Otázka je nejasná, možnosti odpovedí sú mätúce, správna odpoveď je sporná...'
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseValidationModal}
            color="inherit"
            disabled={validationSubmitting}
          >
            Zrušiť
          </Button>
          <Button
            onClick={handleSubmitValidation}
            variant="contained"
            disabled={!validationComment.trim() || validationSubmitting}
            color={isValidated ? 'success' : 'warning'}
          >
            {validationSubmitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Ukladám...
              </>
            ) : (
              `${isValidated ? 'Validovať' : 'Označiť ako nevalidnú'} otázku`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Teacher Validation */}
      {isTeacher && (
        <Fab
          color="warning"
          aria-label="validate questions"
          onClick={handleOpenFloatingModal}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <CheckCircle />
          <Typography variant="caption" sx={{ fontSize: '0.6rem', textAlign: 'center', mt: 0.5 }}>
            Validate by teacher
          </Typography>
        </Fab>
      )}

      {/* Floating Teacher Validation Modal */}
      <TeacherValidationModal
        open={floatingModalOpen}
        onClose={handleCloseFloatingModal}
        question={questionsNeedingValidation[currentValidationIndex]}
        onSubmit={handleFloatingValidationSubmit}
        isSubmitting={validationSubmitting}
      />
    </Box>
  );
};

export default AllUsersQuestions;

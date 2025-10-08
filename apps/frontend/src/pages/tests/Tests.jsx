import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import { createTestSchema, updateTestSchema } from '@app/pages/admin/schemas/test.schema';
import {
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetModulsBySubjectQuery,
  useGetTeacherMeQuery,
  useGetTestsBySubjectQuery,
  useToggleTestPublicationMutation,
  useUpdateTestMutation
} from '@app/redux/api';
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  UnpublishedOutlined as UnpublishIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateQuestionModal from './components/CreateQuestionModal';
import StartTestConfirmationModal from './components/StartTestConfirmationModal';
import TestCard from './components/TestCard';
import TestFormDialog from './components/TestFormDialog';
import TestStatisticsModal from './components/TestStatisticsModal';

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

      // Validate with appropriate schema
      const schema = editingTest ? updateTestSchema : createTestSchema;
      const { error } = schema.validate(testData, { abortEarly: false });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message).join(', ');
        toast.error(errorMessages);
        return;
      }

      if (editingTest) {
        await updateTest({ id: editingTest._id, ...testData }).unwrap();
        toast.success('Test bol úspešne aktualizovaný');
      } else {
        await createTest(testData).unwrap();
        toast.success('Test bol úspešne vytvorený');
      }

      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(error?.data?.message || 'Vyskytla sa chyba pri ukladaní testu');
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
      return { label: 'Nezverejnený', color: 'default', icon: <UnpublishIcon /> };
    if (now < startDate) return { label: 'Nadchádzajúci', color: 'info', icon: <ScheduleIcon /> };
    if (now > endDate) return { label: 'Ukončený', color: 'error', icon: <CancelIcon /> };
    return { label: 'Aktívny', color: 'success', icon: <CheckCircleIcon /> };
  };

  if (!subjectId) {
    return (
      <Box p={3}>
        <Alert severity="warning">Prosím zvoľte predmet na manažovanie testov</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ pt: 3, pb: 3 }}>
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
              Nový test
            </Button>
          )}
        </Box>

        {!modules.length && isTeacher && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Neboli nájdené žiadne moduly pre tento predmet. Prosím najprv vytvorte moduly aby ste
            mohli vytvárať testy.
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
                      Žiadne vytvorené testy.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              tests.map((test) => {
                const status = getTestStatus(test);
                const isTestActive = status.label === 'Aktívny';

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
        <TestFormDialog
          open={openDialog}
          onClose={handleCloseDialog}
          editingTest={editingTest}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          creating={creating}
          updating={updating}
          modules={modules}
          onOpenCreateQuestion={() => setIsCreateQuestionModalOpen(true)}
        />

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
        <StartTestConfirmationModal
          test={confirmTestModal}
          open={!!confirmTestModal}
          onClose={() => setConfirmTestModal(null)}
          onConfirm={() => {
            navigate(`/test/${confirmTestModal._id}/take`);
            setConfirmTestModal(null);
          }}
        />

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

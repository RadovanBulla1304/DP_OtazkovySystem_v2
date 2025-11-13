import {
  useDeleteAllModulsBySubjectMutation,
  useDeleteSubjectMutation,
  useGetAllSubjectsQuery,
  useGetTeacherMeQuery,
  useGetTeacherSubjectsQuery,
  useGetUserMeQuery,
  useTriggerYearlyUnassignmentMutation
} from '@app/redux/api';
import { Add, Assignment, PersonRemove } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddModulModal from './components/AddModulModal';
import AddSubjectModal from './components/AddSubjectModal';
import AssignTeachersToSubject from './components/AssignTeachersToSubject';
import BulkAssignTeachers from './components/BulkAssignTeachers';
import DeleteSubjectDialog from './components/DeleteSubjectDialog';
import SubjectCard from './components/SubjectCard';

const Subjects = () => {
  // Fetch user and teacher data to determine role
  const { data: userData, isLoading: isUserLoading } = useGetUserMeQuery();
  const { data: teacherData, isLoading: isTeacherLoading } = useGetTeacherMeQuery(undefined, {
    skip: !!userData || isUserLoading
  });

  const isAdmin = teacherData?.isAdmin || userData?.isAdmin;
  const isTeacher = !!teacherData && !teacherData.isAdmin;

  // Conditionally fetch subjects based on role
  const {
    data: allSubjects = [],
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAll
  } = useGetAllSubjectsQuery(undefined, {
    skip: !isAdmin,
    refetchOnMountOrArgChange: true
  });

  const {
    data: teacherSubjects = [],
    isLoading: isLoadingTeacher,
    isError: isErrorTeacher,
    refetch: refetchTeacher
  } = useGetTeacherSubjectsQuery(undefined, {
    skip: !isTeacher,
    refetchOnMountOrArgChange: true
  });

  const subjects = isAdmin ? allSubjects : teacherSubjects;
  const isLoading =
    isUserLoading || isTeacherLoading || (isAdmin ? isLoadingAll : isLoadingTeacher);
  const isError = isAdmin ? isErrorAll : isErrorTeacher;
  const refetch = isAdmin ? refetchAll : refetchTeacher;

  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteAllModulsBySubject] = useDeleteAllModulsBySubjectMutation();
  const [triggerYearlyUnassignment, { isLoading: isTriggeringUnassignment }] =
    useTriggerYearlyUnassignmentMutation();

  const location = useLocation();
  const navigate = useNavigate();

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isModulModalOpen, setIsModulModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isManageTeachersOpen, setIsManageTeachersOpen] = useState(false);
  const [subjectForTeachers, setSubjectForTeachers] = useState(null);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  // Check if we need to refresh the data (e.g., coming back from subject detail after deletion)
  useEffect(() => {
    if (location.state?.refresh) {
      refetch();
      // Clear the state to avoid repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refetch, navigate, location.pathname]);

  const handleOpenSubjectModal = () => setIsSubjectModalOpen(true);
  const handleCloseSubjectModal = () => setIsSubjectModalOpen(false);

  // const handleOpenModulModal = (e, subjectId) => {
  //   e.stopPropagation();
  //   setSelectedSubjectId(subjectId);
  //   setIsModulModalOpen(true);
  // };

  const handleCloseModulModal = () => {
    setIsModulModalOpen(false);
    setSelectedSubjectId(null);
  };

  const handleSubjectCreated = async () => {
    try {
      await refetch();
      handleCloseSubjectModal();
    } catch (error) {
      console.error('Error handling subject creation:', error);
    }
  };

  const handleModulCreated = async () => {
    try {
      await refetch();
      handleCloseModulModal();
    } catch (error) {
      console.error('Error handling modul creation:', error);
    }
  };

  const handleCardClick = (subjectId) => {
    navigate(`/subjects/${subjectId}`);
  };

  const handleManageTeachers = (subject) => {
    setSubjectForTeachers(subject);
    setIsManageTeachersOpen(true);
  };

  const handleCloseManageTeachers = () => {
    setIsManageTeachersOpen(false);
    setSubjectForTeachers(null);
  };

  // const handleEdit = (e, subjectId) => {
  //   e.stopPropagation();
  //   navigate(`/subjects/${subjectId}/edit`);
  // };

  const confirmDelete = async (subject) => {
    try {
      setIsDeleting(true);

      // First delete all modules associated with the subject
      const modulesResponse = await deleteAllModulsBySubject(subject._id);

      if (modulesResponse.error) {
        toast.error('Chyba pri odstraňovaní modulov: ' + modulesResponse.error?.data?.message);
        setIsDeleting(false);
        return;
      }

      // Then delete the subject itself
      const subjectResponse = await deleteSubject(subject._id);

      if (subjectResponse.error) {
        toast.error('Chyba pri odstraňovaní predmetu: ' + subjectResponse.error?.data?.message);
      } else {
        toast.success('Predmet a všetky jeho moduly boli úspešne odstránené');
        // Force refetch to update the UI immediately
        await refetch();
      }
    } catch (error) {
      console.error('Error during deletion process:', error);
      toast.error('Chyba pri odstraňovaní predmetu a modulov');
    } finally {
      setIsDeleting(false);
      // Clear the subject to delete after the operation
      setSubjectToDelete(null);
    }
  };

  // Yearly unassignment handler
  const handleTriggerYearlyUnassignment = async () => {
    if (
      window.confirm(
        'Naozaj chcete odstrániť VŠETKÝCH používateľov zo VŠETKÝCH predmetov? Táto akcia sa nedá vrátiť späť!'
      )
    ) {
      try {
        const result = await triggerYearlyUnassignment().unwrap();
        toast.success(
          `Odobratie používateľov úspešné! Predmety: ${result.result.subjectsModified}, Používatelia: ${result.result.usersModified}`
        );
        await refetch();
      } catch (error) {
        toast.error('Chyba pri odoberaní používateľov: ' + (error?.data?.message || error.message));
      }
    }
  };

  if (isLoading || isDeleting) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">Chyba načítavania predmetov</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 3, pb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Predmety</Typography>
        <Box display="flex" gap={2} alignItems="center">
          {isAdmin && (
            <>
              <Tooltip title="Odstrániť priradenie všetkých používateľov (DEBUG)">
                <IconButton
                  color="error"
                  disabled={isTriggeringUnassignment}
                  onClick={handleTriggerYearlyUnassignment}
                  size="large"
                >
                  <PersonRemove />
                </IconButton>
              </Tooltip>
              <Button
                startIcon={<Assignment />}
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => setIsBulkAssignOpen(true)}
                disabled={!subjects || subjects.length === 0}
              >
                Priradenie učiteľov
              </Button>
            </>
          )}
          <Button
            startIcon={<Add />}
            size="medium"
            variant="contained"
            color="primary"
            onClick={handleOpenSubjectModal}
          >
            Nový predmet
          </Button>
        </Box>
      </Box>

      <AddSubjectModal
        open={isSubjectModalOpen}
        onClose={handleCloseSubjectModal}
        onSuccess={handleSubjectCreated}
      />

      <AddModulModal
        open={isModulModalOpen}
        onClose={handleCloseModulModal}
        subjectId={selectedSubjectId}
        onSuccess={handleModulCreated}
      />

      <Grid container spacing={3}>
        {subjects?.map((subject) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={subject._id}>
            <SubjectCard
              subject={subject}
              onCardClick={handleCardClick}
              onDeleteClick={(subject) => {
                setSubjectToDelete(subject);
              }}
              onManageTeachersClick={handleManageTeachers}
              isDeleting={isDeleting}
            />
          </Grid>
        ))}
      </Grid>

      {/* Manage Teachers Modal */}
      {subjectForTeachers && (
        <AssignTeachersToSubject
          open={isManageTeachersOpen}
          onClose={handleCloseManageTeachers}
          subject={subjectForTeachers}
        />
      )}

      {/* Bulk Assign Teachers Modal */}
      {isAdmin && (
        <BulkAssignTeachers
          open={isBulkAssignOpen}
          onClose={() => setIsBulkAssignOpen(false)}
          subjects={subjects || []}
        />
      )}

      {/* Confirmation Dialog for Delete Subject */}
      <DeleteSubjectDialog
        open={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          confirmDelete(subjectToDelete);
        }}
        subject={subjectToDelete}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default Subjects;

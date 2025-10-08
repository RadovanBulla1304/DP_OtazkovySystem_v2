import {
  useDeleteAllModulsBySubjectMutation,
  useDeleteSubjectMutation,
  useGetAllSubjectsQuery
} from '@app/redux/api';
import { Add, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddModulModal from '../admin/components/AddModulModal';
import AddSubjectModal from '../admin/components/AddSubjectModal';

const Subjects = () => {
  const { data: subjects, isLoading, isError, refetch } = useGetAllSubjectsQuery();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteAllModulsBySubject] = useDeleteAllModulsBySubjectMutation();

  const location = useLocation();
  const navigate = useNavigate();

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isModulModalOpen, setIsModulModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if we need to refresh the data (e.g., coming back from subject detail after deletion)
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('Refreshing subjects data after navigation...');
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

  // const handleEdit = (e, subjectId) => {
  //   e.stopPropagation();
  //   navigate(`/subjects/${subjectId}/edit`);
  // };

  const confirmDelete = async (subject) => {
    try {
      setIsDeleting(true);
      console.log('Deleting all modules for subject:', subject._id);

      // First delete all modules associated with the subject
      const modulesResponse = await deleteAllModulsBySubject(subject._id);

      if (modulesResponse.error) {
        toast.error('Chyba pri odstraňovaní modulov: ' + modulesResponse.error?.data?.message);
        setIsDeleting(false);
        return;
      }

      console.log('Modules deleted, now deleting subject:', subject._id);

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
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => handleCardClick(subject._id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {subject.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {subject._id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vytvorené: {new Date(subject.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <Box p={2} pt={0}>
                <Box display="flex" justifyContent="end" alignItems="center">
                  <Box>
                    <Tooltip title="Odstrániť predmet">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete button clicked for subject:', subject.name);
                          setSubjectToDelete(subject);
                        }}
                        disabled={isDeleting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog for Delete Subject */}
      {subjectToDelete && (
        <Dialog
          open={!!subjectToDelete}
          onClose={() => setSubjectToDelete(null)}
          aria-labelledby="delete-subject-dialog-title"
          aria-describedby="delete-subject-dialog-description"
        >
          <DialogTitle id="delete-subject-dialog-title">Vymazať predmet?</DialogTitle>
          <DialogContent>
            <Typography id="delete-subject-dialog-description">
              Naozaj chcete odstrániť predmet <strong>{subjectToDelete.name}</strong> a všetky jeho
              moduly? Táto akcia je nevratná.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSubjectToDelete(null)}
              variant="outlined"
              disabled={isDeleting}
            >
              Zrušiť
            </Button>
            <Button
              onClick={() => {
                console.log('Delete confirmed for subject:', subjectToDelete._id);
                confirmDelete(subjectToDelete);
              }}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? 'Mazanie...' : 'Vymazať'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Subjects;

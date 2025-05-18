import ConfirmationDialog from '@app/components/ConfirmationDialog';
import {
  useDeleteAllModulsBySubjectMutation,
  useDeleteSubjectMutation,
  useGetAllSubjectsQuery
} from '@app/redux/api';
import { Box, Button, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddModulModal from '../admin/components/AddModulModal';
import AddSubjectModal from '../admin/components/AddSubjectModal';

const Subjects = () => {
  const { data: subjects, isLoading, isError, refetch } = useGetAllSubjectsQuery();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteAllModulsBySubject] = useDeleteAllModulsBySubjectMutation();

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isModulModalOpen, setIsModulModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

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
        await refetch();
      }
    } catch (error) {
      console.error('Error during deletion process:', error);
      toast.error('Chyba pri odstraňovaní predmetu a modulov');
    } finally {
      setIsDeleting(false);
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
    <div style={{ padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Predmety</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenSubjectModal}>
          Pridať predmet
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
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1
                }}
              ></Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Use ConfirmationDialog as a wrapper with children */}
      {subjectToDelete && (
        <ConfirmationDialog
          title={`Naozaj chcete odstrániť predmet ${subjectToDelete.name} a všetky jeho moduly?`}
          onAccept={() => {
            console.log('Delete confirmed for subject:', subjectToDelete._id);
            confirmDelete(subjectToDelete);
            setSubjectToDelete(null);
          }}
        >
          <div style={{ display: 'none' }} />
        </ConfirmationDialog>
      )}
    </div>
  );
};

export default Subjects;

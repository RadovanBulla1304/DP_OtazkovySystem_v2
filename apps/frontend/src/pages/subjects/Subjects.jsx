import { useDeleteSubjectMutation, useGetAllSubjectsQuery } from '@app/redux/api'; // Import the mutation hook
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Typography
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddModulModal from '../admin/components/AddModulModal'; // Import the new component
import AddSubjectModal from '../admin/components/AddSubjectModal';

const Subjects = () => {
  const { data: subjects, isLoading, isError, refetch } = useGetAllSubjectsQuery();
  const [deleteModul] = useDeleteSubjectMutation(); // Use the mutation hook
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isModulModalOpen, setIsModulModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const navigate = useNavigate();

  const handleOpenSubjectModal = () => setIsSubjectModalOpen(true);
  const handleCloseSubjectModal = () => setIsSubjectModalOpen(false);

  const handleOpenModulModal = (e, subjectId) => {
    e.stopPropagation(); // Prevent card click
    setSelectedSubjectId(subjectId);
    setIsModulModalOpen(true);
  };

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

  const handleEdit = (e, subjectId) => {
    e.stopPropagation();
    navigate(`/subjects/${subjectId}/edit`);
  };

  const handleDelete = async (e, subjectId) => {
    e.stopPropagation();
    try {
      await deleteModul(subjectId); // Call the delete API
      await refetch(); // Refetch the subjects after deletion
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">Error načítavania predmetov</Typography>
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
              >
                <Tooltip title="Pridať modul">
                  <IconButton
                    aria-label="add"
                    onClick={(e) => handleOpenModulModal(e, subject._id)}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Upraviť predmet">
                  <IconButton
                    aria-label="edit"
                    onClick={(e) => handleEdit(e, subject._id)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vymazať predmet">
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => handleDelete(e, subject._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Subjects;

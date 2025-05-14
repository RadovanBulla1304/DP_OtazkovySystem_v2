import React, { useState } from 'react';
import { useGetAllSubjectsQuery, useDeleteModulMutation } from '@app/redux/api'; // Import the mutation hook
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Box,
  Button,
  IconButton
} from '@mui/material';
import AddSubjectModal from '../admin/components/AddSubjectModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Subjects = () => {
  const { data: subjects, isLoading, isError, refetch } = useGetAllSubjectsQuery();
  const [deleteModul] = useDeleteModulMutation(); // Use the mutation hook
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubjectCreated = async (newSubject) => {
    try {
      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error('Error handling subject creation:', error);
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
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleOpenModal}
        >
          Pridať predmet
        </Button>
      </Box>

      <AddSubjectModal 
        open={isModalOpen} 
        onClose={handleCloseModal}
        onSuccess={handleSubjectCreated}
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
                  boxShadow: 3,
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
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: 1
              }}>
                <IconButton 
                  aria-label="edit"
                  onClick={(e) => handleEdit(e, subject._id)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  aria-label="delete"
                  onClick={(e) => handleDelete(e, subject._id)} // Call handleDelete
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Subjects;
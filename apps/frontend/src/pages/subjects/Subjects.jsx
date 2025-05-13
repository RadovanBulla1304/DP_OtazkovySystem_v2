import React, { useState } from 'react';
import { useGetAllSubjectsQuery } from '@app/redux/api';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Box,
  Button
} from '@mui/material';
import AddSubjectModal from '../admin/components/AddSubjectModal';

const Subjects = () => {
  const { data: subjects, isLoading, isError, refetch } = useGetAllSubjectsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubjectCreated = async (newSubject) => {
    try {
      await refetch(); // Refresh the subjects list
      handleCloseModal();
    } catch (error) {
      console.error('Error handling subject creation:', error);
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
        onSuccess={handleSubjectCreated}  // Changed from onCreate to onSuccess
      />

      <Grid container spacing={3}>
        {subjects?.map((subject) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={subject._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  component={Link}
                  to={`/subjects/${subject._id}`}
                >
                  Zobraziť podrobnosti
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Subjects;
import { useAwardCustomPointsMutation } from '@app/redux/api';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AssignPointsToProject = ({ open, onClose, project, onSuccess }) => {
  const [points, setPoints] = useState('');
  const [awardPoints, { isLoading }] = useAwardCustomPointsMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pointsValue = parseInt(points);

    if (!pointsValue || pointsValue <= 0) {
      toast.error('Zadajte platné kladné číslo bodov');
      return;
    }

    if (!project?.assigned_users || project.assigned_users.length === 0) {
      toast.error('K tomuto projektu nie sú priradení žiadni používatelia');
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      // Award points to each user in the project
      for (const user of project.assigned_users) {
        try {
          await awardPoints({
            studentId: user._id,
            points: pointsValue,
            reason: `Projektová práca: ${project.name}`,
            category: 'project_work'
          }).unwrap();
          successCount++;
        } catch (err) {
          console.error(`Error awarding points to user ${user._id}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `Úspešne pridelených ${pointsValue} bodov pre ${successCount} používateľ(ov) za projekt "${project.name}"`
        );
        setPoints('');
        if (onSuccess) onSuccess();
        onClose();
      }

      if (errorCount > 0) {
        toast.warn(`Nepodarilo sa prideliť body pre ${errorCount} používateľ(ov)`);
      }
    } catch (err) {
      toast.error('Chyba pri prideľovaní bodov');
      console.error('Error awarding points:', err);
    }
  };

  const handleCancel = () => {
    setPoints('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Priradiť body za projekt</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {project && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priradení používatelia: {project.assigned_users?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Všetci {project.assigned_users?.length || 0} používateľ(ia) dostanú rovnaký počet
                bodov za tento projekt.
              </Typography>
            </Box>
          )}

          <TextField
            label="Body"
            type="number"
            fullWidth
            required
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            disabled={isLoading}
            helperText="Zadajte počet bodov, ktoré chcete prideliť každému používateľovi"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isLoading} variant="outlined">
          Zrušiť
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Priradiť body'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AssignPointsToProject.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.object,
  onSuccess: PropTypes.func
};

export default AssignPointsToProject;

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
      toast.error('Please enter a valid positive number of points');
      return;
    }

    if (!project?.assigned_users || project.assigned_users.length === 0) {
      toast.error('No users assigned to this project');
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
            reason: `Project work: ${project.name}`,
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
          `Successfully awarded ${pointsValue} points to ${successCount} user(s) for project "${project.name}"`
        );
        setPoints('');
        if (onSuccess) onSuccess();
        onClose();
      }

      if (errorCount > 0) {
        toast.warn(`Failed to award points to ${errorCount} user(s)`);
      }
    } catch (err) {
      toast.error('Error awarding points');
      console.error('Error awarding points:', err);
    }
  };

  const handleCancel = () => {
    setPoints('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Points for Project</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {project && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned users: {project.assigned_users?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All {project.assigned_users?.length || 0} user(s) will receive the same number of
                points for this project.
              </Typography>
            </Box>
          )}

          <TextField
            label="Points"
            type="number"
            fullWidth
            required
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            disabled={isLoading}
            helperText="Enter the number of points to award each user"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Assign Points'}
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

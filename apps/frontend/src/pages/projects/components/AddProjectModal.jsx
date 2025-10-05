import { useCreateProjectMutation, useGetAllSubjectsQuery } from '@app/redux/api';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import AssignUsersToProject from './AssignUsersToProject';

const AddProjectModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_members: 5,
    subject: ''
  });
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [showAssignUsers, setShowAssignUsers] = useState(false);

  const { data: subjects = [], isLoading: isSubjectsLoading } = useGetAllSubjectsQuery();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        max_members: formData.max_members || 5,
        subject: formData.subject || null
      };

      const result = await createProject(projectData).unwrap();
      toast.success('Project created successfully');
      setCreatedProjectId(result.data._id);
      setFormData({ name: '', description: '', max_members: 5, subject: '' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Error creating project');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', max_members: 5, subject: '' });
    setCreatedProjectId(null);
    onClose();
  };

  const handleOpenAssignUsers = () => {
    setShowAssignUsers(true);
  };

  const handleCloseAssignUsers = () => {
    setShowAssignUsers(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                label="Project Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isLoading}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={isLoading}
              />

              <TextField
                label="Maximum Members"
                type="number"
                fullWidth
                value={formData.max_members}
                onChange={(e) => handleChange('max_members', parseInt(e.target.value) || 5)}
                inputProps={{ min: 1 }}
                disabled={isLoading}
              />

              <FormControl fullWidth>
                <InputLabel id="select-subject-label">Subject (Optional)</InputLabel>
                <Select
                  labelId="select-subject-label"
                  label="Subject (Optional)"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  disabled={isSubjectsLoading || isLoading}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You can assign users to this project after creation
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleOpenAssignUsers}
                  disabled={!createdProjectId}
                  sx={{ mt: 1 }}
                >
                  Assign Users (Create project first)
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Users Modal */}
      {createdProjectId && (
        <AssignUsersToProject
          open={showAssignUsers}
          onClose={handleCloseAssignUsers}
          projectId={createdProjectId}
          onSuccess={() => {
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </>
  );
};

AddProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default AddProjectModal;

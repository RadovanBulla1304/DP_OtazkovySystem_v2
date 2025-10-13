import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import { createProjectSchema } from '@app/pages/admin/schemas/project.schema';
import { useCreateProjectMutation } from '@app/redux/api';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import AssignUsersToProject from './AssignUsersToProject';

const AddProjectModal = ({ open, onClose, onSuccess }) => {
  const currentSubjectId = useCurrentSubjectId();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_members: 5
  });
  const [errors, setErrors] = useState({});
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [showAssignUsers, setShowAssignUsers] = useState(false);

  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    // Add subject to validation data
    const validationData = {
      ...formData,
      subject: currentSubjectId
    };

    const { error } = createProjectSchema.validate(validationData, { abortEarly: false });

    if (error) {
      const newErrors = {};
      error.details.forEach((detail) => {
        newErrors[detail.path[0]] = detail.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    if (!currentSubjectId) return false;
    if (!formData.name.trim()) return false;
    if (!formData.max_members || formData.max_members < 1) return false;

    // Validate with schema without setting errors
    const validationData = {
      ...formData,
      subject: currentSubjectId
    };
    const { error } = createProjectSchema.validate(validationData, { abortEarly: false });
    return !error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentSubjectId) {
      toast.error('Vyberte predmet v prepínači predmetov');
      return;
    }

    if (!validateForm()) {
      toast.error('Vyplňte všetky povinné polia správne');
      return;
    }

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        max_members: formData.max_members || 5,
        subject: currentSubjectId
      };

      const result = await createProject(projectData).unwrap();
      toast.success('Projekt bol úspešne vytvorený');
      setCreatedProjectId(result.data._id);
      setFormData({ name: '', description: '', max_members: 5 });
      setErrors({});
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Chyba pri vytváraní projektu');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', max_members: 5 });
    setErrors({});
    setCreatedProjectId(null);
    onClose();
  };

  const handleCloseAssignUsers = () => {
    setShowAssignUsers(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Pridať nový projekt</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                label="Názov projektu"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isLoading}
              />

              <TextField
                label="Popis"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                disabled={isLoading}
              />

              <TextField
                label="Maximálny počet členov"
                type="number"
                fullWidth
                value={formData.max_members}
                onChange={(e) => handleChange('max_members', parseInt(e.target.value) || 5)}
                error={!!errors.max_members}
                helperText={errors.max_members}
                inputProps={{ min: 1 }}
                disabled={isLoading}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isLoading} variant="outlined" color="error">
            Zrušiť
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Pridať'}
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

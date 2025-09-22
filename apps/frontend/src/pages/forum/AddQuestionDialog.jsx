import { useCreateForumQuestionMutation, useGetModulsBySubjectQuery } from '@app/redux/api';
import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import { Add, Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AddQuestionDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    header: '',
    description: '',
    modul: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const currentSubjectId = useCurrentSubjectId();
  const { data: modulesData = [], isLoading: modulesLoading } = useGetModulsBySubjectQuery(currentSubjectId, {
    skip: !currentSubjectId
  });
  const [createQuestion, { isLoading, error }] = useCreateForumQuestionMutation();

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.header.trim()) {
      newErrors.header = 'Nadpis je povinný';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Popis je povinný';
    }

    if (!formData.modul) {
      newErrors.modul = 'Modul je povinný';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createQuestion({
        header: formData.header.trim(),
        description: formData.description.trim(),
        modul: formData.modul,
        tags: formData.tags
      }).unwrap();

      // Reset form and close dialog
      setFormData({
        header: '',
        description: '',
        modul: '',
        tags: []
      });
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Error creating forum question:', err);
    }
  };

  const handleClose = () => {
    setFormData({
      header: '',
      description: '',
      modul: '',
      tags: []
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Pridať novú otázku do fóra</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {error && (
            <Alert severity="error">
              {error?.data?.message || 'Nastala chyba pri vytváraní otázky'}
            </Alert>
          )}

          <TextField
            label="Nadpis otázky"
            value={formData.header}
            onChange={handleInputChange('header')}
            error={!!errors.header}
            helperText={errors.header}
            fullWidth
            required
            placeholder="Stručný a výstižný nadpis otázky"
          />

          <TextField
            label="Popis otázky"
            value={formData.description}
            onChange={handleInputChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Detailný popis problému alebo otázky"
          />

          <FormControl fullWidth required error={!!errors.modul}>
            <InputLabel>Modul</InputLabel>
            <Select
              value={formData.modul}
              onChange={handleInputChange('modul')}
              label="Modul"
              disabled={modulesLoading}
            >
              {modulesData?.map((module) => (
                <MenuItem key={module._id} value={module._id}>
                  {module.title}
                </MenuItem>
              ))}
            </Select>
            {errors.modul && <FormHelperText>{errors.modul}</FormHelperText>}
          </FormControl>

          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Tagy"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Pridajte tag a stlačte Enter"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button
                onClick={handleAddTag}
                variant="outlined"
                size="small"
                startIcon={<Add />}
                disabled={!tagInput.trim()}
              >
                Pridať
              </Button>
            </Box>

            {formData.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    deleteIcon={<Close />}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Zrušiť
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Pridávam...' : 'Pridať otázku'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddQuestionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddQuestionDialog;

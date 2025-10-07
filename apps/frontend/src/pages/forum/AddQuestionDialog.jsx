import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useCreateForumQuestionMutation,
  useGetForumTagsQuery,
  useGetModulsBySubjectQuery
} from '@app/redux/api';
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
  TextField,
  Typography
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
  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const currentSubjectId = useCurrentSubjectId();
  const { data: modulesData = [], isLoading: modulesLoading } = useGetModulsBySubjectQuery(
    currentSubjectId,
    {
      skip: !currentSubjectId
    }
  );
  const { data: tagsData = [] } = useGetForumTagsQuery(currentSubjectId, {
    skip: !currentSubjectId
  });
  const [createQuestion, { isLoading, error }] = useCreateForumQuestionMutation();

  const availableTags = Array.isArray(tagsData?.data)
    ? tagsData.data
    : Array.isArray(tagsData)
      ? tagsData
      : [];

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

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter((t) => t !== tag)
        };
      }

      return {
        ...prev,
        tags: [...prev.tags, tag]
      };
    });
  };

  const handleAddNewTag = () => {
    const tag = newTagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTagInput('');
  };

  const handleNewTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddNewTag();
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
      setNewTagInput('');
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
    setNewTagInput('');
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

          {/* Tags Section */}
          <Box>
            <InputLabel sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>Tagy</InputLabel>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Dostupné tagy
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {availableTags.length > 0 ? (
                    availableTags.map((tagItem) => (
                      <Chip
                        key={tagItem.tag}
                        label={`${tagItem.tag} (${tagItem.count})`}
                        variant={formData.tags.includes(tagItem.tag) ? 'filled' : 'outlined'}
                        color={formData.tags.includes(tagItem.tag) ? 'primary' : 'default'}
                        onClick={() => handleTagToggle(tagItem.tag)}
                        clickable
                        size="small"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Žiadne dostupné tagy
                    </Typography>
                  )}
                </Box>
              </Box>

              {formData.tags.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Vybrané tagy
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={`${tag}-${index}`}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="filled"
                        onDelete={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((t) => t !== tag)
                          }))
                        }
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Pridať nový tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleNewTagKeyDown}
                  placeholder="Napíšte nový tag"
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  onClick={handleAddNewTag}
                  variant="outlined"
                  size="small"
                  disabled={!newTagInput.trim()}
                >
                  Pridať
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined">
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

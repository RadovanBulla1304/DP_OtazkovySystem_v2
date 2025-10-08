import { useCreateQuestionMutation, useGetTeacherMeQuery } from '@app/redux/api';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

const CreateQuestionModal = ({ open, onClose, modules, onQuestionCreated }) => {
  const [formData, setFormData] = useState({
    text: '',
    options: {
      a: '',
      b: '',
      c: '',
      d: ''
    },
    correct: 'a',
    modul: ''
  });

  // Fetch the current teacher's data
  const { data: teacherData, isLoading: isLoadingTeacher } = useGetTeacherMeQuery();
  const [createQuestion, { isLoading }] = useCreateQuestionMutation();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combined loading state
  const isLoadingData = isLoading || isLoadingTeacher;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (option, value) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Make sure we have teacher data
      if (!teacherData || !teacherData._id) {
        throw new Error('Teacher data not available. Please try again.');
      }

      const selectedModule = modules.find((m) => m._id === formData.modul);

      if (!selectedModule) {
        throw new Error('Selected module not found');
      }

      // Prepare question data for API
      const questionData = {
        text: formData.text,
        options: formData.options,
        correct: formData.correct,
        modul: formData.modul,
        createdBy: teacherData?._id, // Add the teacher ID as creator
        validated_by_teacher: true,
        validated_by_teacher_at: new Date().toISOString(),
        validated_by_teacher_comment: 'Vytvorené priamo učiteľom',
        valid: true, // Add valid flag for backend compatibility
        validated: true // Add validated flag for frontend compatibility
      };

      // Try to create the question using the API
      try {
        const response = await createQuestion(questionData).unwrap();
        console.log('Created question:', response);

        // Pass the created question (with real _id from the server) to parent component
        onQuestionCreated(response);
        handleClose();
      } catch (apiError) {
        console.error('API error creating question:', apiError);

        // Fall back to local creation if API fails
        console.warn('Falling back to local question creation');

        const mockCreatedQuestion = {
          _id: `temp-${Date.now()}`,
          ...formData,
          modul: {
            _id: selectedModule._id,
            id: selectedModule._id, // Include both for compatibility
            name: selectedModule.name || selectedModule.title || 'Modul bez názvu'
          },
          createdBy: teacherData?._id, // Add the teacher ID as creator
          validated_by_teacher: true,
          validated_by_teacher_at: new Date().toISOString(),
          validated_by_teacher_comment: 'Vytvorené priamo učiteľom',
          validated: true, // Ensure it's marked as validated for consistency
          valid: true, // Add valid flag for backend compatibility
          user_agreement: { agreed: true } // Add user agreement for consistency with API expectations
        };

        setError('Could not save to API. Using temporary question instead.');
        onQuestionCreated(mockCreatedQuestion);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating question:', error);
      setError('Failed to create question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      text: '',
      options: {
        a: '',
        b: '',
        c: '',
        d: ''
      },
      correct: 'a',
      modul: ''
    });
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.text.trim() !== '' &&
      formData.options.a.trim() !== '' &&
      formData.options.b.trim() !== '' &&
      formData.options.c.trim() !== '' &&
      formData.options.d.trim() !== '' &&
      formData.modul !== ''
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Vytvoriť novú otázku</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Text otázky"
              fullWidth
              multiline
              rows={3}
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Možnosti odpovede
            </Typography>
          </Grid>{' '}
          {['a', 'b', 'c', 'd'].map((option) => (
            <Grid item xs={12} sm={6} key={option}>
              <TextField
                label={`Možnosť ${option.toUpperCase()}`}
                fullWidth
                value={formData.options[option]}
                onChange={(e) => handleOptionChange(option, e.target.value)}
                required
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Správna odpoveď</InputLabel>
              <Select
                value={formData.correct}
                onChange={(e) => handleInputChange('correct', e.target.value)}
                label="Správna odpoveď"
              >
                <MenuItem value="a">Možnosť A</MenuItem>
                <MenuItem value="b">Možnosť B</MenuItem>
                <MenuItem value="c">Možnosť C</MenuItem>
                <MenuItem value="d">Možnosť D</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Modul</InputLabel>
              <Select
                value={formData.modul}
                onChange={(e) => handleInputChange('modul', e.target.value)}
                label="Modul"
              >
                {modules.map((module) => (
                  <MenuItem key={module._id} value={module._id}>
                    {module.name || module.title || 'Modul bez názvu'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      {error && (
        <Alert severity="warning" sx={{ mx: 3, mb: 2 }}>
          {error}
        </Alert>
      )}
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Zrušiť
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !isFormValid() || isLoadingData}
          startIcon={isSubmitting || isLoadingData ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting || isLoadingData ? 'Vytváram...' : 'Vytvoriť otázku'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CreateQuestionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  modules: PropTypes.array.isRequired,
  onQuestionCreated: PropTypes.func.isRequired
};

export default CreateQuestionModal;

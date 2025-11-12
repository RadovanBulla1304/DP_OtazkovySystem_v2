import { useCreateSubjectMutation, useGetTeacherMeQuery } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createSubjectSchema } from '../../schemas/subject.schema';

const AddSubjectModal = ({ open, onClose, onSuccess }) => {
  const [createSubject, { isLoading, error }] = useCreateSubjectMutation();
  const { data: currentTeacher } = useGetTeacherMeQuery();
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted, isValid },
    reset,
    watch
  } = useForm({
    resolver: joiResolver(createSubjectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      code: '',
      description: '',
      is_active: true
    }
  });

  // Watch form values to check if required fields are filled
  const name = watch('name');
  const code = watch('code');
  const isFormValid = name?.trim() && code?.trim() && isValid;

  const handleFormSubmit = async (data) => {
    setSubmitAttempted(true);
    try {
      const payload = {
        name: data.name.trim(),
        code: data.code.trim(),
        description: data.description.trim(),
        is_active: data.is_active,
        createdBy: currentTeacher?._id
      };
      const result = await createSubject(payload).unwrap();
      toast.success('Predmet bol úspešne vytvorený');
      reset();
      setSubmitAttempted(false);
      onSuccess?.(result);
    } catch (err) {
      console.error('Failed to create subject:', err);
      toast.error('Chyba pri vytváraní predmetu');
    }
  };

  const handleClose = () => {
    reset();
    setSubmitAttempted(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Vytvoriť nový predmet</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Chyba pri vytváraní predmetu
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  label="Názov predmetu"
                  required
                  error={(submitAttempted || isSubmitted) && !!errors.name}
                  helperText={(submitAttempted || isSubmitted) && errors.name?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Kód predmetu"
                  required
                  error={(submitAttempted || isSubmitted) && !!errors.code}
                  helperText={(submitAttempted || isSubmitted) && errors.code?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Popis"
                  multiline
                  rows={3}
                  error={(submitAttempted || isSubmitted) && !!errors.description}
                  helperText={(submitAttempted || isSubmitted) && errors.description?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined" color="error">
          Zrušiť
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Pridať'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddSubjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default AddSubjectModal;

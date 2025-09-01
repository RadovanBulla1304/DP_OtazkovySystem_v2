import { useCreateSubjectMutation } from '@app/redux/api';
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
import { createSubjectSchema } from '../schemas/subject.schema';

const AddSubjectModal = ({ open, onClose, onSuccess }) => {
  const [createSubject, { isLoading, error }] = useCreateSubjectMutation();
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset
  } = useForm({
    resolver: joiResolver(createSubjectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      is_active: true
    }
  });

  const handleFormSubmit = async (data) => {
    setSubmitAttempted(true);
    try {
      const payload = {
        name: data.name.trim(),
        code: data.code.trim(),
        description: data.description.trim(),
        is_active: data.is_active
      };
      const result = await createSubject(payload).unwrap();
      reset();
      setSubmitAttempted(false);
      onSuccess?.(result);
    } catch (err) {
      console.error('Failed to create subject:', err);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitAttempted(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Vytvoriť nový predmet</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Chyba pri vytváraní predmetu
          </Alert>
        )}
        <Grid container spacing={2} columns={12}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  label="Názov predmetu"
                  error={(submitAttempted || isSubmitted) && !!errors.name}
                  helperText={(submitAttempted || isSubmitted) && errors.name?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Kód predmetu"
                  error={(submitAttempted || isSubmitted) && !!errors.code}
                  helperText={(submitAttempted || isSubmitted) && errors.code?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Popis"
                  multiline
                  minRows={2}
                  error={(submitAttempted || isSubmitted) && !!errors.description}
                  helperText={(submitAttempted || isSubmitted) && errors.description?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Aktívny (true/false)"
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  error={(submitAttempted || isSubmitted) && !!errors.is_active}
                  helperText={(submitAttempted || isSubmitted) && errors.is_active?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Zrušiť
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isLoading}>
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

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
      name: ''
    }
  });

  const handleFormSubmit = async (data) => {
    setSubmitAttempted(true);
    try {
      const result = await createSubject({ name: data.name.trim() }).unwrap();
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Zadaj názov predmetu</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Chyba pri vytváraní predmetu
          </Alert>
        )}
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

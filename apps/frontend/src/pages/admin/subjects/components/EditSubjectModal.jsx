import { useEditSubjectMutation } from '@app/redux/api';
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
import { createSubjectSchema } from '../../schemas/subject.schema';

const EditSubjectModal = ({ open, onClose, onSuccess, subject }) => {
  const [editSubject, { isLoading, error }] = useEditSubjectMutation();
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
    setValue
  } = useForm({
    resolver: joiResolver(createSubjectSchema),
    defaultValues: {
      name: subject?.name || ''
    }
  });

  // Update form values when subject changes
  React.useEffect(() => {
    setValue('name', subject?.name || '');
    reset({ name: subject?.name || '' });
    setSubmitAttempted(false);
  }, [subject, open, setValue, reset]);

  const handleFormSubmit = async (data) => {
    setSubmitAttempted(true);
    try {
      const result = await editSubject({
        subjectId: subject._id,
        data: { name: data.name.trim() }
      }).unwrap();
      reset();
      setSubmitAttempted(false);
      onSuccess?.(result);
    } catch (err) {
      console.error('Failed to edit subject:', err);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitAttempted(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { minWidth: 500 }
      }}
    >
      <DialogTitle>Upraviť názov predmetu</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', pb: 2, px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Chyba pri úprave predmetu
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
        <Button onClick={handleClose} disabled={isLoading} variant="outlined" color="error">
          Zrušiť
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Uložiť'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditSubjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  subject: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })
};

export default EditSubjectModal;

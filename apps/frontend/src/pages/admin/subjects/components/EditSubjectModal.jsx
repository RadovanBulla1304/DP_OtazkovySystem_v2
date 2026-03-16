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
import Joi from 'joi';
import PropTypes from 'prop-types';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Simple schema just for editing name
const editSubjectSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Názov predmetu je povinný',
    'any.required': 'Názov predmetu je povinný'
  })
});

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
    resolver: joiResolver(editSubjectSchema),
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
      const payload = {
        subjectId: subject._id,
        data: { name: data.name.trim() }
      };
      const result = await editSubject(payload).unwrap();
      toast.success('Predmet bol úspešne upravený');
      reset();
      setSubmitAttempted(false);
      onSuccess?.(result);
    } catch (err) {
      console.error('Failed to edit subject:', err);
      toast.error('Chyba pri úprave predmetu: ' + (err?.data?.message || err.message));
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
        sx: {
          minWidth: { xs: 'auto', sm: 500 },
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Upraviť názov predmetu</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', pb: 2, px: { xs: 2, sm: 3 } }}>
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
      <DialogActions
        disableSpacing
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: { xs: 'stretch', sm: 'flex-end' }
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
          color="error"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Zrušiť
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(handleFormSubmit)(e);
          }}
          variant="contained"
          disabled={isLoading}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
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
